import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scoreLeadIntent } from "@/lib/openai";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "jawab_verify";

// GET — Meta verification
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === VERIFY_TOKEN) return new NextResponse(challenge, { status: 200 });
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST — inbound WhatsApp messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry = body?.entry?.[0]?.changes?.[0]?.value;
    if (!entry?.messages?.length) return NextResponse.json({ ok: true });
    const msg = entry.messages[0];
    const from: string = msg.from || entry.contacts?.[0]?.wa_id || "unknown";
    const text: string = msg.text?.body || msg.button?.text || "";
    if (!text) return NextResponse.json({ ok: true });

    // Find chatbot by phone_number_id or fallback to first active
    const phoneId = entry.metadata?.phone_number_id;
    let chatbot = null as any;
    if (phoneId) chatbot = await (db as any).chatbot.findFirst({ where: { brandingJson: { contains: phoneId } } });
    if (!chatbot) chatbot = await (db as any).chatbot.findFirst({ where: { isActive: true }, orderBy: { createdAt: "asc" } });
    if (!chatbot) return NextResponse.json({ ok: true });

    // Upsert thread by WhatsApp visitor
    let thread = await (db as any).thread.findFirst({ where: { chatbotId: chatbot.id, visitorId: from, channel: "WHATSAPP" }, orderBy: { updatedAt: "desc" } });
    if (!thread) {
      thread = await (db as any).thread.create({
        data: { chatbotId: chatbot.id, visitorId: from, visitorPhone: from, channel: "WHATSAPP", status: "OPEN", visitorName: entry.contacts?.[0]?.profile?.name },
      });
    }

    const { score, label } = scoreLeadIntent(text);
    await (db as any).thread.update({ where: { id: thread.id }, data: { leadScore: score, leadScoreLabel: label } }).catch(() => {});
    await (db as any).message.create({ data: { threadId: thread.id, role: "USER", content: text } });

    // Auto-escalate HOT leads
    if (label === "HOT" && !thread.isHandedOff) {
      await (db as any).thread.update({ where: { id: thread.id }, data: { status: "ESCALATED", isHandedOff: true, handedOffAt: new Date() } }).catch(() => {});
    }

    // Generate reply via RAG — fire and forget, then send via WhatsApp if configured
    try {
      const { generateEmbedding, findRelevantChunks, generateChatResponse } = await import("@/lib/openai");
      const qEmb = await generateEmbedding(text);
      const chunks = await findRelevantChunks({ chatbotId: chatbot.id, queryEmbedding: qEmb, topK: 5 });
      const context = chunks.map((c: any) => c.text).join("\n\n");
      // @ts-ignore - dynamic import typing
      const reply = await generateChatResponse([{ role: "user", content: text }], context, chatbot.systemPrompt || undefined);
      await (db as any).message.create({ data: { threadId: thread.id, role: "ASSISTANT", content: reply } });

      const token = process.env.WHATSAPP_TOKEN;
      if (token && phoneId) {
        await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ messaging_product: "whatsapp", to: from, text: { body: reply } }),
        }).catch(() => {});
      }
    } catch {}

    // Optionally trigger lead webhook
    try {
      const { enqueueWebhook } = await import("@/lib/webhooks");
      if (label === "HOT") await enqueueWebhook({ chatbotId: chatbot.id, event: "lead.captured", payload: { phone: from, message: text, score, label, channel: "WHATSAPP" } });
    } catch {}

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 200 });
  }
}
