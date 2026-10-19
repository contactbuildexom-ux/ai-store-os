"use client";

import { useCallback, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/landing/logo";
import EmailVerifyField from "@/components/auth/EmailVerifyField";
import { EMAIL_OTP_REQUIRED } from "@/lib/email-otp-config";

/* ---------- Settings ---------- */
const LOGIN_HREF = "/user/login";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const highlights = [
  "Your AI-built store, ready in minutes",
  "WhatsApp ordering and QR code included",
  "Start free, upgrade when you grow",
];

type Plan = "basic" | "pro" | "business";

type GenerateResponse = {
  error?: string;
  slug?: string;
  dashboard_url?: string;
};

export default function UserSignupForm({ plan = "basic" }: { plan?: Plan }) {
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerified = useCallback((token: string) => setVerificationToken(token), []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();
    const phoneDigits = phone.replace(/\D/g, "").length;

    if (!EMAIL_RE.test(cleanEmail)) return setError("Please enter a valid email address.");
    if (phoneDigits < 10 || phoneDigits > 15) return setError("Please enter a valid contact number with country code.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (EMAIL_OTP_REQUIRED && !verificationToken) return setError("Please verify your email with the code we send you.");
    if (prompt.trim().length < 8) return setError("Please describe what you will sell (at least 8 characters).");

    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/ai/generate-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registration: "merchant",
          store_name: storeName.trim() || undefined,
          prompt: prompt.trim(),
          plan,
          owner_email: cleanEmail,
          password,
          owner_phone: phone.trim(),
          whatsapp_number: phone.trim(),
          verification_token: verificationToken || undefined,
        }),
      });

      let data: GenerateResponse = {};
      try {
        data = (await response.json()) as GenerateResponse;
      } catch {
        // If the response is not JSON, the generic error below is used
      }
      if (!response.ok) throw new Error(data.error || "We could not create your store. Please try again.");

      const next = data.dashboard_url || (data.slug ? `/merchant/${encodeURIComponent(data.slug)}/dashboard` : "/dashboard");
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not create your store. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-[#cfe2fa] bg-[#f6faff] px-4 text-[#0b2545] outline-none transition focus:border-[#1976d2] focus:bg-white focus:ring-4 focus:ring-[#1976d2]/15";
  const labelClass = "mb-1.5 block text-sm font-bold text-[#0b2545]";

  return (
    <main className="grid min-h-screen bg-[#e6f4ff] lg:grid-cols-[1fr_1.1fr]">
      {/* ================= Brand panel (desktop only) ================= */}
      <aside className="relative hidden flex-col justify-center gap-12 overflow-hidden bg-gradient-to-br from-[#0b2545] via-[#0f3a73] to-[#1976d2] p-12 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:self-start">
        <Link href="/" aria-label="Buildexom home" className="inline-block w-fit transition-transform duration-300 hover:scale-[1.03]">
          <Image src="/logo-full.png" alt="Buildexom" width={888} height={277} priority className="h-16 w-auto brightness-0 invert" />
        </Link>

        <div>
          <p className="text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
            Create your free online store.
          </p>
          <ul className="mt-8 space-y-4">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-base text-[#d6e9ff]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-[#a9c9f0]">Your store, your way.</p>
      </aside>

      {/* ================= Form side ================= */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-lg">
          <Link href="/" aria-label="Buildexom home" className="mb-8 inline-block lg:hidden">
            <Logo />
          </Link>

          <div className="rounded-3xl bg-white p-6 shadow-[0_30px_60px_-30px_rgba(25,118,210,0.45)] sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1976d2]">
              {plan === "basic" ? "Free account" : `${plan === "pro" ? "Pro" : "Business"} plan`}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0b2545]">Create your account</h1>
            <p className="mt-1 text-sm text-[#2c4a73]">
              {plan === "basic"
                ? "Sign up and let AI build your store."
                : "Your store starts on the free plan and upgrades after payment approval."}
            </p>

            <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
              {error && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                  {error}
                </p>
              )}

              <div>
                <label htmlFor="su-store" className={labelClass}>Store name <span className="font-medium text-[#5b7aa3]">(optional)</span></label>
                <input id="su-store" type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className={inputClass} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="su-email" className={labelClass}>Email</label>
                  <input id="su-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="su-phone" className={labelClass}>Contact number</label>
                  <input id="su-phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div>
                <label htmlFor="su-password" className={labelClass}>Password</label>
                <div className="relative">
                  <input
                    id="su-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={128}
                    className={`${inputClass} pr-16`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-xs font-bold text-[#1976d2] transition hover:bg-[#e6f4ff]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {EMAIL_OTP_REQUIRED && <EmailVerifyField email={email} phone={phone} onVerified={handleVerified} />}

              <div>
                <label htmlFor="su-prompt" className={labelClass}>What will you sell?</label>
                <textarea
                  id="su-prompt"
                  rows={3}
                  maxLength={300}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full resize-none rounded-xl border border-[#cfe2fa] bg-[#f6faff] px-4 py-3 text-[#0b2545] outline-none transition focus:border-[#1976d2] focus:bg-white focus:ring-4 focus:ring-[#1976d2]/15"
                />
              </div>

              <button
                type="submit"
                disabled={loading || (EMAIL_OTP_REQUIRED && !verificationToken)}
                style={{ fontSize: 15, fontWeight: 700 }}
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1976d2] to-[#1565c0] text-white shadow-[0_14px_28px_-12px_rgba(25,118,210,0.8)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                )}
                {loading ? "Creating your store..." : "Create my store"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#2c4a73]">
              Already have an account?{" "}
              <Link href={LOGIN_HREF} className="font-bold text-[#1976d2] hover:underline">
                Log in
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-sm">
            <Link href="/" className="font-semibold text-[#2c4a73] transition hover:text-[#1976d2]">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}