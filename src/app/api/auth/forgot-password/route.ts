import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";
import { z } from "zod";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotSchema.parse(body);

    const user = await db.user.findUnique({ where: { email } });

    // Always perform the same operations to prevent timing side-channel enumeration
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Always perform DB writes on both paths to prevent timing side-channel
    await db.verificationToken.deleteMany({
      where: { identifier: `reset:${email}` },
    });

    await db.verificationToken.create({
      data: {
        identifier: `reset:${email}`,
        token,
        expires,
      },
    });

    if (user && user.passwordHash) {
      // Build reset URL
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

      // TODO: Send email via transactional email service (SendGrid, Resend, etc.)
      // For now, log the reset URL
      console.log(`[Password Reset] Link for ${email}: ${resetUrl}`);
    }

    return NextResponse.json({
      message: "If an account exists with this email, you will receive a password reset link.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
