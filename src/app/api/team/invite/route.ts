import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email(),
  chatbotId: z.string(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { email, chatbotId, role } = inviteSchema.parse(body);

    // Verify the current user owns the chatbot
    const chatbot = await db.chatbot.findFirst({
      where: { id: chatbotId, userId: session.user.id },
    });
    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    // Find or create the invited user
    let user = await db.user.findUnique({ where: { email } });

    if (!user) {
      user = await db.user.create({
        data: { email, name: email.split("@")[0] },
      });
    }

    // Check if already a team member for this chatbot
    const existing = await db.teamMember.findUnique({
      where: { userId_chatbotId: { userId: user.id, chatbotId } },
    });

    if (existing) {
      return NextResponse.json({ error: "User is already a team member for this chatbot" }, { status: 409 });
    }

    const member = await db.teamMember.create({
      data: {
        userId: user.id,
        chatbotId,
        role,
        inviteEmail: email,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Invite error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
