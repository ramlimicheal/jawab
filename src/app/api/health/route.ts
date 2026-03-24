import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  let dbStatus = "connected";
  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "error";
  }

  return NextResponse.json({
    status: dbStatus === "connected" ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    database: dbStatus,
  });
}
