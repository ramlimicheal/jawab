import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateChatResponse, generateEmbedding, cosineSimilarity } from "@/lib/openai";
import { detectLanguage } from "@/lib/utils";
import { z } from "zod";

const chatSchema = z.object({
  chatbotId: z.string(),
  message: z.string().min(1),
  threadId: z.string().nullish(),
  visitorId: z.string().nullish(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chatbotId, message, threadId, visitorId } = chatSchema.parse(body);

    const chatbot = await db.chatbot.findUnique({
      where: { id: chatbotId },
    });

    if (!chatbot || !chatbot.isActive) {
      return NextResponse.json({ error: "Chatbot not found or inactive" }, { status: 404 });
    }

    // Get or create thread
    let thread;
    if (threadId) {
      thread = await db.thread.findFirst({ where: { id: threadId, chatbotId } });
    }
    if (!thread) {
      const detectedLang = detectLanguage(message);
      thread = await db.thread.create({
        data: {
          chatbotId,
          visitorId: visitorId || `visitor_${Date.now()}`,
          language: detectedLang,
          status: "OPEN",
        },
      });
    }

    // Save user message
    await db.message.create({
      data: {
        threadId: thread.id,
        role: "USER",
        content: message,
      },
    });

    // Get relevant context via RAG
    let context = "";
    try {
      const queryEmbedding = await generateEmbedding(message);
      const chunks = await db.contentChunk.findMany({
        where: {
          content: { chatbotId },
        },
        select: { text: true, embedding: true },
        take: 100,
      });

      // Calculate similarity and get top chunks
      const scored: { text: string; score: number }[] = [];
      for (const chunk of chunks) {
        const embStr = chunk.embedding;
        if (embStr && typeof embStr === "string") {
          try {
            const emb = JSON.parse(embStr) as number[];
            if (Array.isArray(emb) && emb.length > 0) {
              scored.push({
                text: chunk.text,
                score: cosineSimilarity(queryEmbedding, emb),
              });
            }
          } catch {
            // Skip chunks with invalid embeddings
          }
        }
      }
      scored.sort((a, b) => b.score - a.score);
      context = scored.slice(0, 5).map((c) => c.text).join("\n\n");
    } catch {
      // If embedding fails, continue without context
    }

    // Get conversation history
    const history = await db.message.findMany({
      where: { threadId: thread.id },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const messages = (history as { role: string; content: string }[]).map((m) => ({
      role: m.role.toLowerCase() as "user" | "assistant",
      content: m.content,
    }));

    // Generate AI response
    const aiResponse = await generateChatResponse(messages, context, chatbot.systemPrompt || undefined);

    // Save assistant message
    const assistantMessage = await db.message.create({
      data: {
        threadId: thread.id,
        role: "ASSISTANT",
        content: aiResponse,
      },
    });

    return NextResponse.json({
      message: aiResponse,
      threadId: thread.id,
      messageId: assistantMessage.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
