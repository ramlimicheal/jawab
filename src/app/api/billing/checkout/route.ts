import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession, createCustomer } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { plan } = await req.json();

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get or create Stripe customer
    let subscription = await db.subscription.findFirst({
      where: { userId: session.user.id },
    });

    let customerId = subscription?.stripeCustomerId;
    if (!customerId && user.email) {
      const customer = await createCustomer(user.email, user.name || undefined);
      customerId = customer.id;
    }

    if (!customerId) {
      return NextResponse.json({ error: "Could not create customer" }, { status: 500 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const checkoutSession = await createCheckoutSession(
      customerId,
      plan,
      `${baseUrl}/dashboard/billing?success=true`,
      `${baseUrl}/dashboard/billing?canceled=true`
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
