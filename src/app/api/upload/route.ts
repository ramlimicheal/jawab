import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createIngestJob, processJobs } from "@/lib/jobs";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const chatbotId = formData.get("chatbotId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!chatbotId) {
      return NextResponse.json({ error: "chatbotId is required" }, { status: 400 });
    }

    // Verify ownership
    const chatbot = await db.chatbot.findFirst({
      where: { id: chatbotId, userId: session.user.id },
    });
    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    // Read file content
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";
    let fileType: "PDF" | "DOCX" | "TXT" = "TXT";

    if (file.name.endsWith(".pdf")) {
      fileType = "PDF";
      const pdfParse = (await import("pdf-parse")).default;
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    } else if (file.name.endsWith(".docx")) {
      fileType = "DOCX";
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      fileType = "TXT";
      text = buffer.toString("utf-8");
    }

    if (!text.trim()) {
      return NextResponse.json({ error: "No text content found in file" }, { status: 400 });
    }

    const sync = new URL(req.url).searchParams.get("sync") === "1";
    const content = await db.content.create({
      data: { chatbotId, type: fileType, title: file.name, textContent: text, status: "PENDING" },
    });
    if (sync) {
      const { chunkText } = await import("@/lib/scraper");
      const { generateEmbeddings } = await import("@/lib/openai");
      const chunks = chunkText(text);
      try {
        const embeddings = await generateEmbeddings(chunks);
        for (let i = 0; i < chunks.length; i++) await db.contentChunk.create({ data: { contentId: content.id, text: chunks[i], embedding: JSON.stringify(embeddings[i] || []), chunkIndex: i } });
      } catch {
        await db.contentChunk.deleteMany({ where: { contentId: content.id } });
        for (let i = 0; i < chunks.length; i++) await db.contentChunk.create({ data: { contentId: content.id, text: chunks[i], embedding: null, chunkIndex: i } });
      }
      await db.content.update({ where: { id: content.id }, data: { status: "READY", chunkCount: chunks.length } });
      return NextResponse.json({ content: { id: content.id, title: content.title, chunksCount: chunks.length } }, { status: 201 });
    }
    const job = await createIngestJob({ chatbotId, type: fileType as any, payload: { contentId: content.id }, contentId: content.id });
    await db.content.update({ where: { id: content.id }, data: { status: "PROCESSING" } });
    // embed in background: chunk + embed from stored textContent
    setTimeout(async () => {
      try {
        const { chunkText } = await import("@/lib/scraper");
        const { generateEmbeddings } = await import("@/lib/openai");
        const chunks = chunkText(text);
        const embeddings = await generateEmbeddings(chunks);
        for (let i = 0; i < chunks.length; i++) await (db as any).contentChunk.create({ data: { contentId: content.id, text: chunks[i], embedding: JSON.stringify(embeddings[i] || []), chunkIndex: i } });
        await db.content.update({ where: { id: content.id }, data: { status: "READY", chunkCount: chunks.length } });
        await (db as any).ingestJob.update({ where: { id: job.id }, data: { status: "READY" } });
      } catch (e: any) {
        await db.content.update({ where: { id: content.id }, data: { status: "FAILED" } }).catch(()=>{});
        await (db as any).ingestJob.update({ where: { id: job.id }, data: { status: "FAILED", error: String(e?.message || e).slice(0,2000) } }).catch(()=>{});
      }
    }, 50);
    // also tick generic jobs
    setTimeout(()=>{ processJobs(3).catch(()=>{}); }, 100);
    return NextResponse.json({ jobId: job.id, contentId: content.id, status: "PROCESSING", message: "Upload queued. Poll GET /api/ingest-jobs?chatbotId="+chatbotId }, { status: 202 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
