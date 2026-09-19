import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateApiKey } from "@/lib/apikey";

export async function GET(req: NextRequest) {
  const auth = await validateApiKey(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized — missing or invalid API key" }, { status: 401 });
  const chatbotId = new URL(req.url).searchParams.get("chatbotId");
  const where: any = chatbotId ? { chatbotId } : { chatbot: { userId: auth.userId } };
  const threads = await db.thread.findMany({ where, orderBy: { updatedAt: "desc" }, take: 100, include: { messages: { take: 1, orderBy: { createdAt: "desc" } } } });
  return NextResponse.json({ threads });
}
