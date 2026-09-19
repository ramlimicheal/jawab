import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createIngestJob, processJobs } from "@/lib/jobs";
import { z } from "zod";

const scrapeSchema = z.object({
  url: z.string().url(),
  chatbotId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { url, chatbotId } = scrapeSchema.parse(body);

    // Find chatbot
    let targetChatbotId = chatbotId;
    if (!targetChatbotId) {
      const firstBot = await db.chatbot.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      });
      if (!firstBot) {
        return NextResponse.json({ error: "No chatbot found. Create one first." }, { status: 400 });
      }
      targetChatbotId = firstBot.id;
    }

    // Verify ownership
    const chatbot = await db.chatbot.findFirst({
      where: { id: targetChatbotId, userId: session.user.id },
    });
    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    const sync = new URL(req.url).searchParams.get("sync") === "1";
    if (sync) {
      const { scrapePage } = await import("@/lib/scraper");
      const { chunkText } = await import("@/lib/scraper");
      const { generateEmbeddings } = await import("@/lib/openai");
      const result = await scrapePage(url);
      if (!result) return NextResponse.json({ error: "Failed to scrape page" }, { status: 400 });
      const content = await db.content.create({ data: { chatbotId: targetChatbotId, type: "WEBSITE", title: result.title || url, sourceUrl: url, textContent: result.content, status: "PROCESSING" } });
      const chunks = chunkText(result.content);
      try {
        const embeddings = await generateEmbeddings(chunks);
        for (let i = 0; i < chunks.length; i++) await db.contentChunk.create({ data: { contentId: content.id, text: chunks[i], embedding: JSON.stringify(embeddings[i] || []), chunkIndex: i } });
        await db.content.update({ where: { id: content.id }, data: { status: "READY", chunkCount: chunks.length } });
      } catch {
        await db.contentChunk.deleteMany({ where: { contentId: content.id } });
        for (let i = 0; i < chunks.length; i++) await db.contentChunk.create({ data: { contentId: content.id, text: chunks[i], embedding: null, chunkIndex: i } });
        await db.content.update({ where: { id: content.id }, data: { status: "READY" } });
      }
      return NextResponse.json({ content: { id: content.id, title: content.title, chunksCount: chunks.length } }, { status: 201 });
    }

    const job = await createIngestJob({ chatbotId: targetChatbotId, type: "SCRAPE", payload: { url } });
    // fire-and-forget tick (Lovable/Vercel: use CRON_SECRET + /api/ingest-jobs tick for production queue)
    setTimeout(() => { processJobs(3).catch(() => {}); }, 50);
    return NextResponse.json({ jobId: job.id, status: job.status, message: "Scrape queued. Poll GET /api/ingest-jobs?chatbotId=" + targetChatbotId }, { status: 202 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Scrape error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
