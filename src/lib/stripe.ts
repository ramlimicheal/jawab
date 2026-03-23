import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

export const STRIPE_PLANS = {
  STARTER: {
    monthly: { priceId: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || "" },
    annual: { priceId: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID || "" },
  },
  GROWTH: {
    monthly: { priceId: process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID || "" },
    annual: { priceId: process.env.STRIPE_GROWTH_ANNUAL_PRICE_ID || "" },
  },
  SCALE: {
    monthly: { priceId: process.env.STRIPE_SCALE_MONTHLY_PRICE_ID || "" },
    annual: { priceId: process.env.STRIPE_SCALE_ANNUAL_PRICE_ID || "" },
  },
};

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    currency: "aed",
  });
}

export async function createCustomer(email: string, name?: string) {
  return stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { source: "jawab" },
  });
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}
