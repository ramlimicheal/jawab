import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const templates = await (db as any).personaTemplate.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const { key, name, nameAr, description, systemPrompt, tone, welcomeMessage } = await req.json();
  if (!key || !name || !systemPrompt) return NextResponse.json({ error: "key, name, systemPrompt required" }, { status: 400 });
  const t = await (db as any).personaTemplate.create({ data: { key, name, nameAr, description, systemPrompt, tone: tone || "professional", welcomeMessage } });
  return NextResponse.json({ template: t }, { status: 201 });
}
