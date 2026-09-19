import Stripe from "stripe";

let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
    _stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  }
  return _stripe;
}
// Lazy proxy so existing `stripe.xxx` call-sites keep working without top-level throw during `next build`
export const stripe = new Proxy({} as Stripe, {
  get(_t, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
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
