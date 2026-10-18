"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/landing/logo";


const AFTER_LOGIN_HREF = "/dashboard"; 
const SIGNUP_HREF = "/user/signup";

type LoginPayload = { email: string; password: string; remember: boolean };

type LoginResponse = {
  error?: string;
  store?: { slug?: string | null };
};

/**
 * Asli login: /api/stores/login par email + password bhejta hai.
 * Kamyab hone par us user ke dashboard ka path wapas karta hai.
 */
async function authenticateUser(payload: LoginPayload): Promise<string> {
  const response = await fetch("/api/stores/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: payload.email, password: payload.password }),
  });

  let data: LoginResponse = {};
  try {
    data = (await response.json()) as LoginResponse;
  } catch {
    // JSON na aaye to neeche generic error chalega
  }

  if (!response.ok) {
    throw new Error(data.error || "Login failed. Please check your email and password.");
  }

  const slug = data.store?.slug;
  return slug ? `/merchant/${encodeURIComponent(slug)}/dashboard` : AFTER_LOGIN_HREF;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const highlights = [
  "Manage products, orders and customers",
  "Track your sales and store growth",
  "Get instant help from Bexi AI",
];

export default function UserLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    const cleanEmail = email.trim();
    if (!EMAIL_RE.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const nextPath = await authenticateUser({ email: cleanEmail, password, remember });
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-[#cfe2fa] bg-[#f6faff] px-4 text-[#0b2545] outline-none transition placeholder:text-[#8aa3c4] focus:border-[#1976d2] focus:bg-white focus:ring-4 focus:ring-[#1976d2]/15";

  return (
    <main className="grid min-h-screen bg-[#e6f4ff] lg:grid-cols-[1.05fr_1fr]">
      {/* ================= Brand panel (desktop only) ================= */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0b2545] via-[#0f3a73] to-[#1976d2] p-12 text-white lg:flex">
        <Link
          href="/"
          aria-label="Buildexom home"
          className="inline-block w-fit transition-transform duration-300 hover:scale-[1.03]"
        >
          <Image
            src="/logo-full.png"
            alt="Buildexom"
            width={888}
            height={277}
            priority
            className="h-16 w-auto brightness-0 invert"
          />
        </Link>

        <div>
          <p className="text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
            Run your whole store from one place.
          </p>
          <ul className="mt-8 space-y-4">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-base text-[#d6e9ff]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
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
        <div className="w-full max-w-md">
          {/* Mobile par left panel nahi hota, is liye logo yahan dikhta hai */}
          <Link href="/" aria-label="Buildexom home" className="mb-8 inline-block lg:hidden">
            <Logo />
          </Link>

          <div className="rounded-3xl bg-white p-6 shadow-[0_30px_60px_-30px_rgba(25,118,210,0.45)] sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1976d2]">
              User login
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0b2545]">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-[#2c4a73]">Log in to manage your store.</p>

            <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700"
                >
                  {error}
                </p>
              )}

              <div>
                <label htmlFor="user-email" className="mb-1.5 block text-sm font-bold text-[#0b2545]">
                  Email
                </label>
                <input
                  id="user-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="user-password" className="mb-1.5 block text-sm font-bold text-[#0b2545]">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="user-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#5b7aa3] transition hover:bg-[#e6f4ff] hover:text-[#1976d2]"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <path d="M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-[#2c4a73]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#1976d2]"
                />
                Remember me
              </label>

              <button
                type="submit"
                disabled={loading}
                style={{ fontSize: 15, fontWeight: 700 }}
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1976d2] to-[#1565c0] text-white shadow-[0_14px_28px_-12px_rgba(25,118,210,0.8)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                )}
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#2c4a73]">
              New to Buildexom?{" "}
              <Link href={SIGNUP_HREF} className="font-bold text-[#1976d2] hover:underline">
                Create a free account
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