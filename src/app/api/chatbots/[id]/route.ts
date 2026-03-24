import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chatbot = await db.chatbot.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { _count: { select: { threads: true, leads: true, contents: true } } },
  });

  if (!chatbot) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ chatbot });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chatbot = await db.chatbot.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!chatbot) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const allowedFields = ["name", "welcomeMessage", "brandColor", "textColor", "systemPrompt", "temperature", "isActive", "position", "language", "botName", "logoUrl"];
  const updateData: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  const updated = await db.chatbot.update({
    where: { id: params.id },
    data: updateData,
  });

  return NextResponse.json({ chatbot: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chatbot = await db.chatbot.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!chatbot) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.chatbot.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
