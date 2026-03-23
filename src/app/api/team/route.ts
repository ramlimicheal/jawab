import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find all chatbots owned by the current user, then get their team members
  const userChatbots = await db.chatbot.findMany({
    where: { userId: session.user.id },
    select: { id: true },
  });
  const chatbotIds = userChatbots.map((c: { id: string }) => c.id);

  const members = await db.teamMember.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { chatbotId: { in: chatbotIds } },
      ],
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      chatbot: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ members });
}
