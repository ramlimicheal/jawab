import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enqueueWebhook } from "@/lib/webhooks";
import { validateApiKey } from "@/lib/apikey";

export async function GET(req: NextRequest) {
  const auth = await validateApiKey(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized — missing or invalid API key" }, { status: 401 });
  const chatbotId = new URL(req.url).searchParams.get("chatbotId");
  const where: any = chatbotId ? { chatbotId } : { chatbot: { userId: auth.userId } };
  const leads = await db.lead.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ leads });
}

export async function POST(req: NextRequest) {
  const auth = await validateApiKey(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized — missing or invalid API key" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.chatbotId) return NextResponse.json({ error: "chatbotId required" }, { status: 400 });
  const chatbot = await db.chatbot.findUnique({ where: { id: body.chatbotId } });
  if (!chatbot) return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  // ownership check: api key owner must own chatbot
  if (chatbot.userId !== auth.userId) return NextResponse.json({ error: "Forbidden for this chatbot" }, { status: 403 });
  const lead = await db.lead.create({
    data: {
      chatbotId: body.chatbotId,
      threadId: body.threadId || null,
      name: body.name || null,
      email: body.email || null,
      phone: body.phone || null,
      whatsapp: body.whatsapp || null,
      message: body.message || null,
      source: body.source || "API",
      status: "NEW",
    },
  });
  // fire-and-forget webhook
  enqueueWebhook({ chatbotId: body.chatbotId, event: "lead.captured", payload: { lead } as any }).catch(() => {});
  return NextResponse.json({ lead }, { status: 201 });
}
