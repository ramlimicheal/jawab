import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateApiKey } from "@/lib/apikey";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const keys = await (db as any).apiKey.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ keys: keys.map((k: any) => ({ id: k.id, name: k.name, prefix: k.prefix, lastUsedAt: k.lastUsedAt, createdAt: k.createdAt, revokedAt: k.revokedAt })) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const name = (body.name || "Default").toString().slice(0, 80);
  const { key, prefix, hash } = generateApiKey();
  const rec = await (db as any).apiKey.create({ data: { userId: session.user.id, name, prefix, hash } });
  return NextResponse.json({ apiKey: key, record: { id: rec.id, name: rec.name, prefix: rec.prefix } }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const rec = await (db as any).apiKey.findFirst({ where: { id, userId: session.user.id } });
  if (!rec) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await (db as any).apiKey.update({ where: { id }, data: { revokedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
