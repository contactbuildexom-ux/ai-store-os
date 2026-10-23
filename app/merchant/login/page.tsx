"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

export default function MerchantLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [targetSlug, setTargetSlug] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlEmail = params.get("email");
      const urlSlug = params.get("slug");
      if (urlEmail) setEmail(urlEmail);
      if (urlSlug) setTargetSlug(urlSlug);
    }
  }, []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const response = await fetch("/api/stores/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: storeName,
            slug: storeSlug,
            owner_email: email,
            password,
            plan: "basic",
            selected_theme: "emerald",
          }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to create your store account.");
        const newSlug = result?.store?.slug || result?.slug || storeSlug;
        router.replace(newSlug ? `/merchant/${encodeURIComponent(newSlug)}/dashboard` : "/dashboard");
        router.refresh();
        return;
      }

      if (isSupabaseConfigured()) {
        const { data, error: authError } = await createClient().auth.signInWithPassword({ email, password });
        if (!authError && data.session?.access_token) {
          const response = await fetch("/api/stores/current", {
            headers: { Authorization: `Bearer ${data.session.access_token}` },
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "No store is linked to this account.");
          const currentSlug = result?.store?.slug || result?.slug;
          router.replace(currentSlug ? `/merchant/${encodeURIComponent(currentSlug)}/dashboard` : "/dashboard");
          router.refresh();
          return;
        }
      }

      const response = await fetch("/api/stores/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to sign in to this store.");

      const loggedInSlug = targetSlug || result?.store?.slug || result?.slug;
      router.replace(loggedInSlug ? `/merchant/${encodeURIComponent(loggedInSlug)}/dashboard` : "/dashboard");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 text-slate-900">
      <section className="w-full max-w-md border border-slate-200 bg-white p-6 sm:p-8">
        <Link href="/" className="text-sm font-bold tracking-wide">BUILDEXOM <span className="font-normal text-slate-500">STORE</span></Link>
        <p className="mt-8 text-xs font-medium text-emerald-800">Merchant account</p>
        <h1 className="mt-1 text-2xl font-semibold">{mode === "login" ? "Store owner sign in" : "Create your store account"}</h1>
        <p className="mt-2 text-sm text-slate-600">{mode === "login" ? "Sign in with the account linked to your store." : "Create a merchant account to generate your storefront."}</p>

        <div className="mt-5 grid grid-cols-2 border border-slate-200 p-1" role="group" aria-label="Account action">
          {(["login", "signup"] as const).map((item) => (
            <button key={item} type="button" aria-pressed={mode === item} onClick={() => { setMode(item); setError(""); }} className={`h-9 rounded-sm text-sm font-semibold capitalize ${mode === item ? "bg-emerald-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              {item === "login" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" && <>
            <label className="block text-sm font-medium text-slate-700" htmlFor="store-name">Store name
              <input id="store-name" autoComplete="organization" required minLength={2} maxLength={100} value={storeName} onChange={(event) => {
                const name = event.target.value;
                setStoreName(name);
                setStoreSlug(name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80));
              }} className="mt-1.5 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15" />
            </label>
            <label className="block text-sm font-medium text-slate-700" htmlFor="store-slug">Store address
              <input id="store-slug" autoComplete="url" required pattern="[a-z0-9-]{1,80}" maxLength={80} value={storeSlug} onChange={(event) => setStoreSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} className="mt-1.5 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15" />
            </label>
          </>}
          <label className="block text-sm font-medium text-slate-700" htmlFor="email">Email
            <input id="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15" />
          </label>
          <label className="block text-sm font-medium text-slate-700" htmlFor="password">Password
            <input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "signup" ? 8 : undefined} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15" />
          </label>
          {error && <p role="alert" className="border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">{error}</p>}
          <button type="submit" disabled={loading} className="h-11 w-full rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60">
            {loading ? (mode === "login" ? "Signing in…" : "Creating account…") : (mode === "login" ? "Sign in to store" : "Create store account")}
          </button>
        </form>
      </section>
    </main>
  );
}