import { createHmac } from "crypto";
import { db } from "./db";

export function signPayload(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function parseEvents(s: string): string[] {
  return (s || "").split(",").map((x) => x.trim()).filter(Boolean);
}

export async function enqueueWebhook(opts: { chatbotId: string; event: string; payload: Record<string, unknown> }) {
  const { chatbotId, event, payload } = opts;
  const body = JSON.stringify({ event, chatbotId, timestamp: new Date().toISOString(), data: payload });
  const hooks = await (db as any).webhook.findMany({ where: { chatbotId, active: true } });
  const matching = hooks.filter((h: any) => parseEvents(h.events).includes(event) || parseEvents(h.events).includes("*"));
  for (const h of matching) {
    await (db as any).webhookDelivery.create({
      data: {
        webhookId: h.id,
        event,
        payload: body,
        status: "PENDING",
        attempts: 0,
      },
    });
  }
  // Fire-and-forget delivery (no await to not block request)
  deliverPending().catch(() => {});
}

async function deliverOne(delivery: any) {
  const webhook = await (db as any).webhook.findUnique({ where: { id: delivery.webhookId } });
  if (!webhook || !webhook.active) return;
  const signature = signPayload(webhook.secret, delivery.payload);
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Jawab-Event": delivery.event,
        "X-Jawab-Signature": signature,
        "X-Jawab-Delivery": delivery.id,
      },
      body: delivery.payload,
      signal: controller.signal,
    });
    if (res.ok) {
      await (db as any).webhookDelivery.update({ where: { id: delivery.id }, data: { status: "SUCCESS", attempts: delivery.attempts + 1 } });
    } else {
      const err = `HTTP ${res.status}`;
      const nextRetry = new Date(Date.now() + Math.min(60000 * Math.pow(2, delivery.attempts), 3600000));
      const status = delivery.attempts + 1 >= 5 ? "FAILED" : "RETRYING";
      await (db as any).webhookDelivery.update({ where: { id: delivery.id }, data: { status, attempts: delivery.attempts + 1, lastError: err, nextRetryAt: nextRetry } });
    }
  } catch (e: any) {
    const nextRetry = new Date(Date.now() + Math.min(60000 * Math.pow(2, delivery.attempts), 3600000));
    const status = delivery.attempts + 1 >= 5 ? "FAILED" : "RETRYING";
    await (db as any).webhookDelivery.update({ where: { id: delivery.id }, data: { status, attempts: delivery.attempts + 1, lastError: String(e?.message || e), nextRetryAt: nextRetry } });
  } finally {
    clearTimeout(t);
  }
}

export async function deliverPending() {
  const pending = await (db as any).webhookDelivery.findMany({
    where: { status: { in: ["PENDING", "RETRYING"] }, OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: new Date() } }] },
    take: 20,
    orderBy: { createdAt: "asc" },
  });
  for (const d of pending) {
    await deliverOne(d);
  }
}
