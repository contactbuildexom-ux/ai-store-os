import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createEmailVerificationToken, hashOtpCode, safeEqual } from "@/lib/email-otp";

const MAX_ATTEMPTS = 5;

export async function POST(request: Request) {
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Verification is not configured." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const input = body && typeof body === "object" ? (body as Record<string, unknown>) : {};

  const email = typeof input.email === "string" ? input.email.trim().toLowerCase().slice(0, 120) : "";
  const code = typeof input.code === "string" ? input.code.replace(/\D/g, "").slice(0, 6) : "";
  if (!email || code.length !== 6) {
    return NextResponse.json({ error: "Enter the 6-digit code from your email." }, { status: 400 });
  }

  try {
    const { data: row, error } = await supabase
      .from("signup_otps")
      .select("id, code_hash, attempts, expires_at")
      .eq("email", email)
      .is("verified_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;

    if (!row || new Date(row.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: "This code has expired. Please request a new one." }, { status: 400 });
    }
    if (row.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Too many incorrect codes. Please request a new one." }, { status: 429 });
    }

    if (!safeEqual(row.code_hash, hashOtpCode(email, code))) {
      await supabase.from("signup_otps").update({ attempts: row.attempts + 1 }).eq("id", row.id);
      return NextResponse.json({ error: "Incorrect code. Please check and try again." }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("signup_otps")
      .update({ verified_at: new Date().toISOString() })
      .eq("id", row.id);
    if (updateError) throw updateError;

    return NextResponse.json({ success: true, verification_token: createEmailVerificationToken(email) });
  } catch (error) {
    console.error("OTP verify failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Unable to verify the code right now." }, { status: 500 });
  }
}