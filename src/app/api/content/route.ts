import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contents = await db.content.findMany({
    where: { chatbot: { userId: session.user.id } },
    include: {
      chatbot: { select: { name: true } },
      _count: { select: { chunks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = contents.map((c) => ({
    id: c.id,
    type: c.type,
    title: c.title,
    sourceUrl: c.sourceUrl,
    status: c.status,
    chunksCount: c._count.chunks,
    createdAt: c.createdAt,
    chatbot: c.chatbot,
  }));

  return NextResponse.json({ contents: mapped });
}
