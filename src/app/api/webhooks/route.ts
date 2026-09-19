import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const chatbotId = new URL(req.url).searchParams.get("chatbotId");
  if (!chatbotId) return NextResponse.json({ error: "chatbotId required" }, { status: 400 });
  const owned = await db.chatbot.findFirst({ where: { id: chatbotId, userId: session.user.id } });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const hooks = await (db as any).webhook.findMany({ where: { chatbotId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ webhooks: hooks });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.chatbotId || !body?.url) return NextResponse.json({ error: "chatbotId and url required" }, { status: 400 });
  const owned = await db.chatbot.findFirst({ where: { id: body.chatbotId, userId: session.user.id } });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try { new URL(body.url); } catch { return NextResponse.json({ error: "Invalid url" }, { status: 400 }); }
  const secret = body.secret || crypto.randomBytes(24).toString("hex");
  const hook = await (db as any).webhook.create({ data: { chatbotId: body.chatbotId, url: body.url, secret, events: body.events || "lead.captured", active: body.active !== false } });
  return NextResponse.json({ webhook: hook }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const hook = await (db as any).webhook.findUnique({ where: { id } });
  if (!hook) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const owned = await db.chatbot.findFirst({ where: { id: hook.chatbotId, userId: session.user.id } });
  if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await (db as any).webhook.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
