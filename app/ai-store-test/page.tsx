"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const themes = ["emerald", "ocean", "rose", "midnight", "amber", "violet", "fashion", "home-decor", "electronics", "beauty"];
const socialPlatforms = ["instagram", "facebook", "youtube", "tiktok", "x"] as const;
const paymentFields = [
  ["bank_name", "Bank name"],
  ["account_title", "Bank account title"],
  ["account_number", "Bank account number"],
  ["iban", "IBAN"],
  ["jazzcash_title", "JazzCash account title"],
  ["jazzcash_number", "JazzCash number"],
  ["easypaisa_title", "EasyPaisa account title"],
  ["easypaisa_number", "EasyPaisa number"],
] as const;

export default function AiStoreTestPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("Create a boutique bakery with artisan cakes and pastries");
  const [theme, setTheme] = useState("emerald");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [socialLinks, setSocialLinks] = useState<Record<(typeof socialPlatforms)[number], string>>({
    instagram: "",
    facebook: "",
    youtube: "",
    tiktok: "",
    x: "",
  });
  const [paymentDetails, setPaymentDetails] = useState<Record<(typeof paymentFields)[number][0], string>>({
    bank_name: "",
    account_title: "",
    account_number: "",
    iban: "",
    jazzcash_title: "",
    jazzcash_number: "",
    easypaisa_title: "",
    easypaisa_number: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signInRequired, setSignInRequired] = useState(false);

  async function generateStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSignInRequired(false);
    setLoading(true);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (isSupabaseConfigured()) {
        const { data: { session }, error: sessionError } = await createClient().auth.getSession();
        if (sessionError) throw new Error(sessionError.message);
        if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch("/api/ai/generate-store", {
        method: "POST",
        headers,
        credentials: "same-origin",
        body: JSON.stringify({ prompt, theme, whatsapp_number: whatsappNumber, social_links: socialLinks, payment_details: paymentDetails }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) setSignInRequired(true);
        throw new Error(data.error || "Store generation failed.");
      }
      if (typeof data.dashboard_url !== "string" || !data.dashboard_url.startsWith("/merchant/")) {
        throw new Error("Store was generated, but its dashboard URL was missing.");
      }
      router.replace(data.dashboard_url);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Store generation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="text-sm font-bold tracking-wide">BUILDEXOM <span className="font-normal text-slate-500">AI</span></Link>
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">LIVE API</span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-emerald-100 text-emerald-800"><Sparkles size={19} /></span>
          <div>
            <p className="text-xs font-medium text-slate-500">AI store builder</p>
            <h1 className="text-xl font-semibold">Generate a storefront</h1>
          </div>
        </div>

        <form onSubmit={generateStore} className="space-y-5 border border-slate-200 bg-white p-5 sm:p-6">
          <label className="block text-sm font-medium text-slate-700" htmlFor="store-prompt">Store description
            <textarea
              id="store-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              minLength={8}
              maxLength={2000}
              required
              rows={5}
              className="mt-2 block w-full resize-y rounded-md border border-slate-300 px-3.5 py-3 text-sm leading-6 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            />
          </label>
          <section className="space-y-4 border-t border-slate-100 pt-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Store contact</h2>
              <p className="mt-1 text-xs text-slate-500">Add the number customers should use to contact your store on WhatsApp.</p>
            </div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="store-whatsapp">WhatsApp number
              <input id="store-whatsapp" type="tel" autoComplete="tel" value={whatsappNumber} onChange={(event) => setWhatsappNumber(event.target.value)} maxLength={40} placeholder="+92 300 1234567" className="mt-2 block h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15" />
            </label>
          </section>
          <section className="space-y-3 border-t border-slate-100 pt-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Social links</h2>
              <p className="mt-1 text-xs text-slate-500">Configured links appear as icons in your storefront footer.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {socialPlatforms.map((platform) => (
                <label key={platform} className="block text-xs font-medium capitalize text-slate-600" htmlFor={`social-${platform}`}>{platform}
                  <input id={`social-${platform}`} type="url" value={socialLinks[platform]} onChange={(event) => setSocialLinks((current) => ({ ...current, [platform]: event.target.value }))} maxLength={2048} placeholder={`https://${platform}.com/your-store`} className="mt-1.5 block h-10 w-full rounded-md border border-slate-300 px-3 text-sm normal-case outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15" />
                </label>
              ))}
            </div>
          </section>
          <section className="space-y-3 border-t border-slate-100 pt-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Advance payment details</h2>
              <p className="mt-1 text-xs text-slate-500">These details are displayed in your public store footer when provided.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {paymentFields.map(([key, label]) => (
                <label key={key} className="block text-xs font-medium text-slate-600" htmlFor={`payment-${key}`}>{label}
                  <input id={`payment-${key}`} type="text" value={paymentDetails[key]} onChange={(event) => setPaymentDetails((current) => ({ ...current, [key]: event.target.value }))} maxLength={120} className="mt-1.5 block h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15" />
                </label>
              ))}
            </div>
          </section>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <label className="block text-sm font-medium text-slate-700" htmlFor="store-theme">Theme
              <select id="store-theme" value={theme} onChange={(event) => setTheme(event.target.value)} className="mt-2 block h-10 min-w-48 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15">
                {themes.map((item) => <option key={item} value={item}>{item.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}</option>)}
              </select>
            </label>
            <button type="submit" disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60">
              <Sparkles size={16} />{loading ? "Generating…" : "Generate store"}
            </button>
          </div>
        </form>

        {error && <div role="alert" className="mt-5 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <p>{error}</p>
          {signInRequired && <Link href="/merchant/login" className="mt-2 inline-block font-semibold underline underline-offset-2">Store owner sign in or sign up</Link>}
        </div>}

      </div>
    </main>
  );
}
