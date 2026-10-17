"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Boxes, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { PlatformLogo, usePlatformBranding } from "@/components/platform-branding";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function LoginForm({ notice }: { notice?: string }) {
  const { settings } = usePlatformBranding();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function redirectMerchantFromSupabaseSession() {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("Unable to resolve your merchant account.");
    }

    const response = await fetch("/api/stores/current", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error ?? "No store is linked to this account.");
    }

    const slug = result.store?.slug;
    if (!slug) {
      throw new Error("Your store is missing a dashboard slug.");
    }

    router.replace(`/merchant/${slug}/dashboard`);
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    setPending(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (response.ok) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      if (response.status === 503 || (response.status !== 401 && !response.ok)) {
        throw new Error(result.error ?? "Unable to sign in.");
      }
    } catch (adminError) {
      setError(adminError instanceof Error ? adminError.message : "Unable to sign in.");
      setPending(false);
      return;
    }

    if (!isSupabaseConfigured()) {
      if (process.env.NODE_ENV === "development") {
        try {
          const response = await fetch("/api/mock-auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error ?? "Unable to sign in.");
          router.replace("/dashboard");
          router.refresh();
        } catch (mockError) {
          setError(mockError instanceof Error ? mockError.message : "Unable to sign in.");
          setPending(false);
        }
        return;
      }

      setError("Authentication is not configured. Add your Supabase URL and anon key to .env.local.");
      setPending(false);
      return;
    }
    const { error: signInError } = await createClient().auth.signInWithPassword({ email, password });
    if (signInError) {
      try {
        const response = await fetch("/api/stores/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            signInError.message === "Invalid login credentials"
              ? "Email or password is incorrect."
              : result.error ?? signInError.message
          );
        }

        const slug = result.store?.slug;
        if (!slug) throw new Error("Your store is missing a dashboard slug.");

        router.replace(`/merchant/${slug}/dashboard`);
        router.refresh();
        return;
      } catch (merchantError) {
        setError(merchantError instanceof Error ? merchantError.message : "Unable to sign in.");
        setPending(false);
        return;
      }
    }

    try {
      const { data: { user } } = await createClient().auth.getUser();
      if (user?.app_metadata?.role === "super_admin") {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      await redirectMerchantFromSupabaseSession();
    } catch (merchantError) {
      setError(merchantError instanceof Error ? merchantError.message : "Unable to open your dashboard.");
      setPending(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      <div className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-[#101c45] via-[#172b63] to-[#2346a0] px-10 py-9 text-white lg:flex xl:px-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-40 top-16 size-[34rem] rounded-full border border-blue-200/15" />
          <div className="absolute -right-12 top-44 size-[25rem] rounded-full border border-indigo-100/15" />
          <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#101c45]/80 to-transparent" />
        </div>
        <Link href="/" aria-label={`${settings.title} home`} className="relative z-10 flex w-fit items-center gap-3 rounded-md font-semibold tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          <PlatformLogo
            fallback={
              <>
                <span className="grid size-10 place-items-center rounded-xl bg-blue-500 text-white"><Boxes size={21} /></span>
                <span className="text-lg">{settings.title}</span>
              </>
            }
            className="max-h-10 max-w-[200px] object-contain"
          />
          {settings.logoUrl && <span className="text-lg">{settings.title}</span>}
        </Link>
        <div className="relative z-10 max-w-xl pb-8">
          <div className="mb-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-200"><span className="size-1.5 rounded-full bg-blue-300" /> Commerce, in clear view</div>
          <h1 className="max-w-lg text-5xl font-semibold leading-[1.08] tracking-tight xl:text-6xl">Build better commerce, together.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-blue-100/80">One calm command center for every seller, storefront, and signal across your platform.</p>
          <div className="mt-12 flex items-center gap-4 border-t border-white/15 pt-6 text-sm text-blue-50"><span className="grid size-10 place-items-center rounded-full border border-white/20"><ShieldCheck size={18} /></span>Protected access for your admin team</div>
        </div>
        <p className="relative z-10 text-xs text-blue-100/60">© 2026 Buildexom. All rights reserved.</p>
      </div>
      <main className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 sm:py-12">
        <div className="w-full max-w-[460px]">
          <Link href="/" aria-label={`${settings.title} home`} className="mb-8 flex w-fit items-center gap-3 rounded-md font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:hidden">
            <PlatformLogo
              fallback={
                <>
                  <span className="grid size-10 place-items-center rounded-xl bg-blue-100 text-blue-700"><Boxes size={21} /></span>
                  <span>{settings.title}</span>
                </>
              }
              className="max-h-10 max-w-[200px] object-contain"
            />
            {settings.logoUrl && <span>{settings.title}</span>}
          </Link>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_55px_-28px_rgba(30,64,175,0.28)] sm:p-9">
            <div className="mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-blue-700">Admin workspace</p>
              <h2 className="text-[30px] font-semibold tracking-tight text-slate-900 sm:text-[32px]">Welcome back</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to continue to your dashboard.</p>
            </div>
            {notice && <p role="status" className="mb-5 rounded-lg border border-blue-100 bg-blue-50 px-3.5 py-3 text-sm leading-5 text-blue-900">{notice}</p>}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-slate-700">
                Work email
                <span className="mt-2 flex h-12 items-center gap-3 rounded-lg border border-slate-300 bg-white px-3.5 transition focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-600/10">
                  <Mail size={17} className="shrink-0 text-slate-400" />
                  <input className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
                </span>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Password
                <span className="mt-2 flex h-12 items-center gap-3 rounded-lg border border-slate-300 bg-white px-3.5 transition focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-600/10">
                  <LockKeyhole size={17} className="shrink-0 text-slate-400" />
                  <input className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} />
                  <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} className="shrink-0 rounded text-slate-400 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </span>
              </label>
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600"><input className="size-4 accent-blue-600" type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />Remember me</label>
                <span className="text-xs text-slate-500">Secure sign in</span>
              </div>
              {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-800">{error}</p>}
              <button className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-700/20 disabled:cursor-wait disabled:opacity-70" type="submit" disabled={pending}>
                {pending ? <><span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />Signing in...</> : <>Sign in <ArrowRight size={16} /></>}
              </button>
            </form>
            <p className="mt-7 text-center text-xs leading-5 text-slate-500">Access is managed by your organization administrator.<br />Contact your team if you need an account.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
