import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export const OTP_TTL_MINUTES = 10;
const VERIFICATION_TTL_SECONDS = 30 * 60;

function getSecret() {
  const secret =
    process.env.OTP_SECRET ||
    process.env.MERCHANT_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("OTP secret is not configured.");
  return secret;
}

function hmac(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** 6 digit code */
export function generateOtpCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashOtpCode(email: string, code: string) {
  return hmac(`otp:${email.toLowerCase()}:${code}`);
}

/** Signed token issued after the code is verified (valid for 30 minutes) */
export function createEmailVerificationToken(email: string) {
  const payload = Buffer.from(
    JSON.stringify({
      email: email.toLowerCase(),
      exp: Math.floor(Date.now() / 1000) + VERIFICATION_TTL_SECONDS,
    }),
  ).toString("base64url");
  return `${payload}.${hmac(`verify:${payload}`)}`;
}

export function verifyEmailVerificationToken(token: string, email: string) {
  if (!token) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return false;
  try {
    if (!safeEqual(signature, hmac(`verify:${payload}`))) return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email?: string;
      exp?: number;
    };
    if (!data.email || !data.exp) return false;
    if (data.exp <= Math.floor(Date.now() / 1000)) return false;
    return data.email === email.toLowerCase();
  } catch {
    return false;
  }
}

function otpEmailHtml(code: string) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0b2545">
    <h2 style="margin:0 0 8px">Verify your email</h2>
    <p style="margin:0 0 16px;color:#2c4a73">Use this code to finish creating your Buildexom store:</p>
    <p style="font-size:34px;font-weight:800;letter-spacing:8px;margin:0 0 16px;color:#1976d2">${code}</p>
    <p style="margin:0;color:#5b7aa3;font-size:13px">This code expires in ${OTP_TTL_MINUTES} minutes. If you did not request it, you can ignore this email.</p>
  </div>`;
}

/**
 * Sends the verification email. Provider: Brevo or Resend (whichever API key is set).
 * If neither is set and the site runs locally (development), the code is printed to the terminal.
 */
export async function sendOtpEmail(email: string, code: string): Promise<"sent" | "dev"> {
  const from = process.env.OTP_FROM_EMAIL;
  const fromName = process.env.OTP_FROM_NAME || "Buildexom";
  const subject = "Your Buildexom verification code";
  const html = otpEmailHtml(code);

  if (process.env.BREVO_API_KEY && from) {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: fromName, email: from },
        to: [{ email }],
        subject,
        htmlContent: html,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`Brevo error ${response.status}: ${await response.text()}`);
    return "sent";
  }

  if (process.env.RESEND_API_KEY && from) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: `${fromName} <${from}>`, to: [email], subject, html }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`Resend error ${response.status}: ${await response.text()}`);
    return "sent";
  }

  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[DEV OTP] ${email} -> ${code}\n`);
    return "dev";
  }
  throw new Error("Email service is not configured.");
}