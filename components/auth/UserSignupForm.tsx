"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, Check } from "lucide-react";
import Logo from "@/components/landing/logo";
import EmailVerifyField from "@/components/auth/EmailVerifyField";
import { STORE_IDEA_PRESETS } from "@/components/landing/MerchantStoreSetupModal";
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
  storefront_url?: string;
};

export default function UserSignupForm({ plan = "basic" }: { plan?: Plan }) {
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Curated niches and global store ideas
  const allIdeas = STORE_IDEA_PRESETS.flatMap((grp) => grp.options);
  const [selectedIdeaId, setSelectedIdeaId] = useState("");
  const [nicheSearch, setNicheSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customIdea, setCustomIdea] = useState("");
  const [prompt, setPrompt] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleVerified = useCallback((token: string) => setVerificationToken(token), []);

  const filteredIdeas = allIdeas.filter((opt) => {
    const q = nicheSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      opt.name.toLowerCase().includes(q) ||
      opt.sampleName.toLowerCase().includes(q) ||
      opt.prompt.toLowerCase().includes(q)
    );
  });

  const selectedIdea = allIdeas.find((i) => i.id === selectedIdeaId);

  const handleSelectIdea = (opt: (typeof allIdeas)[number]) => {
    setSelectedIdeaId(opt.id);
    setIsCustomMode(false);
    if (!storeName || allIdeas.some((i) => i.sampleName === storeName)) {
      setStoreName(opt.sampleName);
    }
    setPrompt(opt.prompt);
    setIsDropdownOpen(false);
    setError("");
  };

  const handleSwitchToCustom = () => {
    setIsCustomMode(true);
    setSelectedIdeaId("");
    setIsDropdownOpen(false);
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();
    const phoneDigits = phone.replace(/\D/g, "").length;

    if (!EMAIL_RE.test(cleanEmail)) return setError("Please enter a valid email address.");
    if (phoneDigits < 10 || phoneDigits > 15) return setError("Please enter a valid contact number with country code.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (EMAIL_OTP_REQUIRED && !verificationToken) return setError("Please verify your email with the code we send you.");

    // Resolve final prompt
    let finalPrompt = "";
    if (isCustomMode) {
      if (customIdea.trim().length < 3) {
        return setError("Please enter what you will sell (at least 3 characters).");
      }
      finalPrompt = customIdea.trim().length >= 8
        ? customIdea.trim()
        : `A modern e-commerce storefront for ${storeName.trim() || "My Store"} specializing in ${customIdea.trim()} with nationwide delivery.`;
    } else if (selectedIdea) {
      finalPrompt = selectedIdea.prompt;
    } else if (prompt.trim().length >= 8) {
      finalPrompt = prompt.trim();
    } else {
      return setError("Please select a store niche from the dropdown or write your custom store idea.");
    }

    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/ai/generate-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registration: "merchant",
          store_name: storeName.trim() || undefined,
          prompt: finalPrompt,
          niche: selectedIdea?.id || undefined,
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
        // Fallback
      }
      if (!response.ok) {
        throw new Error(data.error || "Unable to generate your store. Please try again.");
      }

      // User is redirected directly to their live storefront as requested
      const target = data.slug
        ? `/store/${encodeURIComponent(data.slug)}`
        : (data.storefront_url || `/store/${data.slug || ''}`);
      router.push(target);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate your store. Please try again.");
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
                <input
                  id="su-store"
                  type="text"
                  placeholder="e.g. Aura Footwear or Nexus Gaming"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="su-email" className={labelClass}>Email</label>
                  <input
                    id="su-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="merchant@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="su-phone" className={labelClass}>Contact number</label>
                  <input
                    id="su-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="03001234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="su-password" className={labelClass}>Password</label>
                <div className="relative">
                  <input
                    id="su-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
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

              {/* Worldwide E-Commerce Store Niches Dropdown with Search & Custom Write Option */}
              <div ref={dropdownRef} className="relative space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>
                    {isCustomMode ? "Write your store idea" : "Select store niche / idea"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomMode((prev) => !prev)}
                    className="text-xs font-bold text-[#1976d2] hover:underline"
                  >
                    {isCustomMode ? "Choose from curated niches" : "Or write custom idea"}
                  </button>
                </div>

                {isCustomMode ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="e.g. Handmade ceramic mugs, luxury organic teas, custom sneakers..."
                      value={customIdea}
                      onChange={(e) => setCustomIdea(e.target.value)}
                      className={inputClass}
                      autoFocus
                    />
                    <p className="text-[11px] text-[#5b7aa3]">
                      Type short keywords or a description of what you want to sell.
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Selector button */}
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen((v) => !v)}
                      className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cfe2fa] bg-[#f6faff] px-4 text-left text-xs sm:text-sm font-semibold text-[#0b2545] transition hover:bg-white focus:border-[#1976d2] focus:ring-4 focus:ring-[#1976d2]/15"
                    >
                      <span className="truncate">
                        {selectedIdea ? (
                          <span className="font-bold text-[#1976d2]">{selectedIdea.name}</span>
                        ) : (
                          <span className="text-[#8aa3c4]">Select from worldwide store niches...</span>
                        )}
                      </span>
                      <ChevronDown size={16} className={`ml-2 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Searchable Dropdown Popup */}
                    {isDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-hidden rounded-2xl border border-[#cfe2fa] bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150">
                        {/* Search Input */}
                        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white p-2">
                          <div className="relative">
                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400/80 stroke-[1.75]" />
                            <input
                              type="text"
                              placeholder="Search global e-commerce niches..."
                              value={nicheSearch}
                              onChange={(e) => setNicheSearch(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#1976d2] focus:bg-white"
                              autoFocus
                            />
                          </div>
                        </div>

                        {/* Niches List */}
                        <div className="max-h-48 overflow-y-auto divide-y divide-slate-50 p-1">
                          {/* Option to switch to custom idea */}
                          <button
                            type="button"
                            onClick={handleSwitchToCustom}
                            className="flex w-full items-center rounded-lg px-3 py-2 text-left text-xs font-bold text-[#1976d2] bg-blue-50/70 hover:bg-blue-50 transition"
                          >
                            <span>Write my own custom idea</span>
                          </button>

                          {filteredIdeas.length === 0 ? (
                            <div className="p-3 text-center text-xs text-slate-400">
                              No matching niche found. Click &quot;Write my own custom idea&quot; above.
                            </div>
                          ) : (
                            filteredIdeas.map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleSelectIdea(opt)}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                                  selectedIdeaId === opt.id
                                    ? "bg-blue-50 font-bold text-[#1976d2]"
                                    : "text-[#0b2545] hover:bg-slate-50"
                                }`}
                              >
                                <span className="font-semibold">{opt.name}</span>
                                {selectedIdeaId === opt.id ? (
                                  <Check size={14} className="text-[#1976d2]" />
                                ) : (
                                  <span className="text-[10px] text-slate-400">{opt.sampleName}</span>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                {loading ? "Creating your store & account..." : "Create my store"}
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