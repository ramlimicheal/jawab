import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await (db as any).user.findUnique({ where: { email: session.user.email } });
  const orgs = await (db as any).organization.findMany({ where: { ownerId: user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ organizations: orgs });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await (db as any).user.findUnique({ where: { email: session.user.email } });
  const { name, slug, domain, logoUrl } = await req.json();
  if (!name || !slug) return NextResponse.json({ error: "name and slug required" }, { status: 400 });
  const org = await (db as any).organization.create({ data: { ownerId: user.id, name, slug, domain: domain || null, logoUrl: logoUrl || null } });
  return NextResponse.json({ organization: org }, { status: 201 });
}
