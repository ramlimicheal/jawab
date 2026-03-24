import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = await db.content.findFirst({
    where: { id: params.id, chatbot: { userId: session.user.id } },
  });

  if (!content) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.contentChunk.deleteMany({ where: { contentId: params.id } });
  await db.content.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
