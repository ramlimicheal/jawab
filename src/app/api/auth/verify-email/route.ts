import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";

// POST: Send verification email (requires auth)
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ message: "Email already verified" });
  }

  // Generate verification token
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Delete any existing tokens
  await db.verificationToken.deleteMany({
    where: { identifier: `verify:${user.email}` },
  });

  await db.verificationToken.create({
    data: {
      identifier: `verify:${user.email}`,
      token,
      expires,
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/auth/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;

  // TODO: Send email via transactional email service
  console.log(`[Email Verification] Link for ${user.email}: ${verifyUrl}`);

  return NextResponse.json({ message: "Verification email sent" });
}

// GET: Verify email with token (public)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.json({ error: "Missing token or email" }, { status: 400 });
  }

  const verificationToken = await db.verificationToken.findFirst({
    where: {
      identifier: `verify:${email}`,
      token,
    },
  });

  if (!verificationToken) {
    return NextResponse.json({ error: "Invalid or expired verification link" }, { status: 400 });
  }

  if (new Date() > verificationToken.expires) {
    await db.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    });
    return NextResponse.json({ error: "Verification link has expired" }, { status: 400 });
  }

  // Mark email as verified
  await db.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  // Delete token
  await db.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
      },
    },
  });

  return NextResponse.json({ message: "Email verified successfully" });
}
