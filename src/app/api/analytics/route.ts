import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const chatbotId = searchParams.get("chatbotId");
  const days = Number(searchParams.get("days") || "7");
  const since = new Date(Date.now() - days * 24 * 3600 * 1000);
  const where: any = { createdAt: { gte: since } };
  if (chatbotId) where.chatbotId = chatbotId;
  const snapshot = await (db as any).analyticsSnapshot.findMany({ where: chatbotId ? { chatbotId } : {}, orderBy: { date: "desc" }, take: 30 }).catch(() => []);
  const threads = await (db as any).thread.count({ where: { createdAt: { gte: since }, ...(chatbotId ? { chatbotId } : {}) } }).catch(() => 0);
  const leads = await (db as any).lead?.count({ where: { createdAt: { gte: since }, ...(chatbotId ? { chatbotId } : {}) } }).catch(() => 0);
  const byStatus = await (db as any).thread.groupBy?.({ by: ["status"], where: { createdAt: { gte: since }, ...(chatbotId ? { chatbotId } : {}) }, _count: true }).catch(() => []);
  return NextResponse.json({ threads, leads, byStatus, snapshots: snapshot, since: since.toISOString() });
}
