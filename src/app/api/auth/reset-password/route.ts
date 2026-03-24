import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const resetSchema = z.object({
  token: z.string().min(1, "Token is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, email, password } = resetSchema.parse(body);

    // Find the reset token
    const verificationToken = await db.verificationToken.findFirst({
      where: {
        identifier: `reset:${email}`,
        token,
      },
    });

    if (!verificationToken) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    // Check expiration
    if (new Date() > verificationToken.expires) {
      await db.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationToken.identifier,
            token: verificationToken.token,
          },
        },
      });
      return NextResponse.json({ error: "Reset link has expired. Please request a new one." }, { status: 400 });
    }

    // Atomic: delete token first (consume it), then update password
    const passwordHash = await bcrypt.hash(password, 12);
    await db.$transaction(async (tx) => {
      await tx.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationToken.identifier,
            token: verificationToken.token,
          },
        },
      });
      await tx.user.update({
        where: { email },
        data: { passwordHash },
      });
    });

    return NextResponse.json({ message: "Password has been reset successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
