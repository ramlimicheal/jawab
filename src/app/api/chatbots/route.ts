import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  language: z.enum(["ar", "en", "both"]).default("both"),
  description: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chatbots = await db.chatbot.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { threads: true, leads: true, contents: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ chatbots });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, language, description } = createSchema.parse(body);

    const chatbot = await db.chatbot.create({
      data: {
        name,
        description: description || null,
        language,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ chatbot }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Create chatbot error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
