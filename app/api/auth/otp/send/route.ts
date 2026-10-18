import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateOtpCode, hashOtpCode, sendOtpEmail, OTP_TTL_MINUTES } from "@/lib/email-otp";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const phone = typeof input.phone === "string" ? input.phone.replace(/[^\d+]/g, "").slice(0, 20) : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    return NextResponse.json({ error: "Enter a valid contact number with country code." }, { status: 400 });
  }

  try {
    const { data: existingStore, error: lookupError } = await supabase
      .from("stores")
      .select("id")
      .eq("owner_email", email)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (existingStore) {
      return NextResponse.json(
        { error: "An account already exists for this email. Please log in instead." },
        { status: 409 },
      );
    }

    // Rate limit: 45 second gap, aur ek ghante mein max 5 codes
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recent, error: recentError } = await supabase
      .from("signup_otps")
      .select("created_at")
      .eq("email", email)
      .gte("created_at", hourAgo)
      .order("created_at", { ascending: false });
    if (recentError) throw recentError;
    if ((recent?.length ?? 0) >= 5) {
      return NextResponse.json({ error: "Too many codes requested. Please try again in an hour." }, { status: 429 });
    }
    const last = recent?.[0]?.created_at ? new Date(recent[0].created_at).getTime() : 0;
    if (last && Date.now() - last < 45_000) {
      return NextResponse.json({ error: "Please wait a minute before requesting another code." }, { status: 429 });
    }

    const code = generateOtpCode();
    const { data: row, error: insertError } = await supabase
      .from("signup_otps")
      .insert([
        {
          email,
          phone,
          code_hash: hashOtpCode(email, code),
          expires_at: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString(),
        },
      ])
      .select("id")
      .single();
    if (insertError) throw insertError;

    try {
      await sendOtpEmail(email, code);
    } catch (sendError) {
      console.error("OTP email failed:", sendError);
      await supabase.from("signup_otps").delete().eq("id", row.id);
      return NextResponse.json(
        { error: "We could not send the verification email. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, expires_in_minutes: OTP_TTL_MINUTES });
  } catch (error) {
    console.error("OTP send failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Unable to send a verification code right now." }, { status: 500 });
  }
}