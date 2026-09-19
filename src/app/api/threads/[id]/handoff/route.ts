import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { action, note } = await req.json().catch(() => ({}));
  const thread = await (db as any).thread.findUnique({ where: { id: params.id } });
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (action === "resolve") {
    await (db as any).thread.update({ where: { id: params.id }, data: { status: "RESOLVED", isHandedOff: false } });
  } else if (action === "reopen") {
    await (db as any).thread.update({ where: { id: params.id }, data: { status: "OPEN" } });
  } else {
    await (db as any).thread.update({ where: { id: params.id }, data: { status: "ESCALATED", isHandedOff: true, handedOffAt: new Date(), handoffNote: note || null } });
  }
  return NextResponse.json({ ok: true });
}
