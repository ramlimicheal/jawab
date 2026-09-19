import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const checks: Record<string, string> = {};
  let ok = true;
  try {
    await db.$queryRaw`SELECT 1`;
    checks.db = "ok";
  } catch (e: any) {
    checks.db = "error: " + (e?.message || String(e));
    ok = false;
  }
  try {
    const r: any = await db.$queryRaw`SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname='vector') as has_vector`;
    const has = r?.[0]?.has_vector;
    checks.pgvector = has ? "ok" : "not_installed (fallback active)";
  } catch {
    checks.pgvector = "unknown";
  }
  return NextResponse.json({ status: ok ? "ready" : "degraded", checks, ts: new Date().toISOString() }, { status: ok ? 200 : 503 });
}
