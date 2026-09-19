import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const hdr = req.headers.get("x-cron-secret") || req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret && hdr !== secret) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const chatbots: any[] = await (db as any).chatbot.findMany({ where: { isActive: true }, take: 100 }).catch(() => []);
  let digests = 0;
  for (const bot of chatbots) {
    const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const threads = await (db as any).thread.count({ where: { chatbotId: bot.id, createdAt: { gte: since } } }).catch(() => 0);
    const leads = await (db as any).lead?.count({ where: { chatbotId: bot.id, createdAt: { gte: since } } }).catch(() => 0);
    await (db as any).analyticsSnapshot.create({ data: { chatbotId: bot.id, date: new Date(), threads, leads, payload: JSON.stringify({ threads, leads }) } }).catch(() => {});
    digests++;
  }
  // deliver pending webhooks as part of cron
  try { const { deliverPending } = await import("@/lib/webhooks"); await deliverPending(); } catch {}
  return NextResponse.json({ ok: true, digests });
}

export async function GET(req: NextRequest) { return POST(req); }
