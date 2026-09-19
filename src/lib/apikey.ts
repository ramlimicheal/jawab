import crypto from "crypto";
import { db } from "./db";

export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const key = `jwb_${crypto.randomBytes(32).toString("hex")}`;
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  const prefix = key.slice(0, 12);
  return { key, prefix, hash };
}

export function hashKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export async function validateApiKey(req: Request): Promise<{ userId: string; keyId: string } | null> {
  const header = req.headers.get("authorization") || req.headers.get("x-api-key") || "";
  const raw = header.startsWith("Bearer ") ? header.slice(7) : header;
  if (!raw) return null;
  const hash = hashKey(raw);
  const rec = await (db as any).apiKey.findUnique({ where: { hash } });
  if (!rec || rec.revokedAt) return null;
  await (db as any).apiKey.update({ where: { id: rec.id }, data: { lastUsedAt: new Date() } }).catch(()=>{});
  return { userId: rec.userId, keyId: rec.id };
}
