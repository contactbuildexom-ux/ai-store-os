import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const MERCHANT_SESSION_COOKIE = "ai_store_merchant_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

type MerchantSession = {
  storeId: string;
  slug: string;
  email: string;
  expiresAt: number;
};

function getSessionSecret() {
  const secret = process.env.MERCHANT_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Merchant session secret is not configured.");
  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function createMerchantSession(storeId: string, slug: string, email: string) {
  const session: MerchantSession = {
    storeId,
    slug,
    email,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return { token: `${payload}.${sign(payload)}`, maxAge: SESSION_DURATION_SECONDS };
}

export function verifyMerchantSession(token: string | undefined): MerchantSession | null {
  if (!token) return null;

  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return null;

  try {
    const expected = Buffer.from(sign(payload));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as MerchantSession;
    if (!session.storeId || !session.slug || session.expiresAt <= Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}