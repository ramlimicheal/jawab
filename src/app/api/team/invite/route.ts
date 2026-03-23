import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { email, role } = inviteSchema.parse(body);

    // Find or check if user exists
    let user = await db.user.findUnique({ where: { email } });

    if (!user) {
      // Create a placeholder user for the invitation
      user = await db.user.create({
        data: { email, name: email.split("@")[0] },
      });
    }

    // Check if already a team member
    const existing = await db.teamMember.findFirst({
      where: { userId: user.id, invitedBy: session.user.id },
    });

    if (existing) {
      return NextResponse.json({ error: "User is already a team member" }, { status: 409 });
    }

    const member = await db.teamMember.create({
      data: {
        userId: user.id,
        role,
        invitedBy: session.user.id,
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
