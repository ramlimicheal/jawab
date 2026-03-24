import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = await db.lead.findMany({
    where: { chatbot: { userId: session.user.id } },
    include: { chatbot: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ leads });
}

const createLeadSchema = z.object({
  chatbotId: z.string(),
  threadId: z.string().nullish(),
  name: z.string().nullish(),
  email: z.string().email().nullish(),
  phone: z.string().nullish(),
  whatsapp: z.string().nullish(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createLeadSchema.parse(body);

    const chatbot = await db.chatbot.findUnique({ where: { id: data.chatbotId } });
    if (!chatbot || !chatbot.isActive) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    const lead = await db.lead.create({
      data: {
        chatbotId: data.chatbotId,
        threadId: data.threadId || null,
        name: data.name || null,
        email: data.email || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        source: "WIDGET",
        status: "NEW",
      },
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Create lead error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
