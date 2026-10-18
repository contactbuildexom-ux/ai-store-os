"use client";

import { useEffect, useRef, useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Stage = "idle" | "sent" | "verified";

type ApiResponse = { error?: string; verification_token?: string };

async function post(url: string, body: Record<string, string>): Promise<ApiResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data: ApiResponse = {};
  try {
    data = (await response.json()) as ApiResponse;
  } catch {
    // generic error neeche
  }
  if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

export default function EmailVerifyField({
  email,
  phone,
  onVerified,
}: {
  email: string;
  phone: string;
  /** Verify hone par token deta hai; email badalne par "" deta hai */
  onVerified: (token: string) => void;
}) {
  const [stage, setStage] = useState<Stage>("idle");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const previousEmail = useRef(email);

  // Email badal jaye to verification dobara karni paregi
  useEffect(() => {
    if (previousEmail.current === email) return;
    previousEmail.current = email;
    setStage("idle");
    setCode("");
    setError("");
    setCooldown(0);
    onVerified("");
  }, [email, onVerified]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const cleanEmail = email.trim().toLowerCase();
  const phoneDigits = phone.replace(/\D/g, "").length;
  const emailOk = EMAIL_RE.test(cleanEmail);
  const phoneOk = phoneDigits >= 10 && phoneDigits <= 15;
  const canSend = emailOk && phoneOk && !busy && cooldown === 0;

  async function sendCode() {
    if (!canSend) return;
    setError("");
    setBusy(true);
    try {
      await post("/api/auth/otp/send", { email: cleanEmail, phone: phone.trim() });
      setStage("sent");
      setCode("");
      setCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the code.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode() {
    if (code.length !== 6 || busy) return;
    setError("");
    setBusy(true);
    try {
      const data = await post("/api/auth/otp/verify", { email: cleanEmail, code });
      if (!data.verification_token) throw new Error("Verification failed. Please try again.");
      setStage("verified");
      onVerified(data.verification_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify the code.");
    } finally {
      setBusy(false);
    }
  }

  if (stage === "verified") {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12l5 5L20 7" />
          </svg>
        </span>
        Email verified
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-[#cfe2fa] bg-[#f6faff] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-[#0b2545]">Verify your email</p>
        <button
          type="button"
          onClick={sendCode}
          disabled={!canSend}
          className="rounded-full bg-[#1976d2] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#1565c0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy && stage === "idle"
            ? "Sending..."
            : stage === "sent"
              ? cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend code"
              : "Send code"}
        </button>
      </div>

      {stage === "idle" && (
        <p className="text-xs text-[#5b7aa3]">
          Enter your email and contact number, then tap Send code. We will email you a 6-digit code.
        </p>
      )}

      {stage === "sent" && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit code"
            className="h-11 min-w-0 flex-1 rounded-xl border border-[#bfdcff] bg-white px-4 text-center text-lg font-bold tracking-[0.4em] text-[#0b2545] outline-none placeholder:text-sm placeholder:font-medium placeholder:tracking-normal placeholder:text-[#8aa3c4] focus:border-[#1976d2] focus:ring-4 focus:ring-[#1976d2]/15"
          />
          <button
            type="button"
            onClick={verifyCode}
            disabled={code.length !== 6 || busy}
            className="h-11 rounded-xl bg-[#0b2545] px-5 text-sm font-bold text-white transition hover:bg-[#12335e] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Checking..." : "Verify"}
          </button>
        </div>
      )}

      {stage === "sent" && (
        <p className="text-xs text-[#5b7aa3]">Code sent to {cleanEmail}. It expires in 10 minutes.</p>
      )}

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}