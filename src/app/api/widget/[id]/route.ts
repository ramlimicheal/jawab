import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbot = await db.chatbot.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        language: true,
        active: true,
        welcomeMessage: true,
        placeholder: true,
        primaryColor: true,
        position: true,
      },
    });

    if (!chatbot || !chatbot.active) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    return NextResponse.json({ chatbot });
  } catch (error) {
    console.error("Widget config error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
