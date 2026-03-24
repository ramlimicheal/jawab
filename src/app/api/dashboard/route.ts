import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Get counts in parallel
  const [conversationCount, leadCount, activeChatbotCount, recentThreads, recentLeads] =
    await Promise.all([
      db.thread.count({
        where: { chatbot: { userId } },
      }),
      db.lead.count({
        where: { chatbot: { userId } },
      }),
      db.chatbot.count({
        where: { userId, isActive: true },
      }),
      db.thread.findMany({
        where: { chatbot: { userId } },
        include: {
          _count: { select: { messages: true } },
          chatbot: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.lead.findMany({
        where: { chatbot: { userId } },
        include: { chatbot: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  return NextResponse.json({
    stats: {
      conversations: conversationCount,
      leads: leadCount,
      activeChatbots: activeChatbotCount,
    },
    recentThreads,
    recentLeads,
  });
}
