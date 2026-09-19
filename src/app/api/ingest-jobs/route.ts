import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createIngestJob, processJobs } from "@/lib/jobs";

// Fire-and-forget background tick (works on Lovable/Vercel without external queue)
// For production, replace with Trigger.dev or a cron hitting POST /api/ingest-jobs/tick
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    // Allow session-authenticated manual tick as fallback
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const n = await processJobs(5);
  return NextResponse.json({ processed: n });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const chatbotId = new URL(req.url).searchParams.get("chatbotId");
  const where: any = {};
  if (chatbotId) {
    const owned = await db.chatbot.findFirst({ where: { id: chatbotId, userId: session.user.id } });
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
    where.chatbotId = chatbotId;
  } else {
    const bots = await db.chatbot.findMany({ where: { userId: session.user.id }, select: { id: true } });
    where.chatbotId = { in: bots.map(b => b.id) };
  }
  const jobs = await (db as any).ingestJob.findMany({ where, orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ jobs });
}
