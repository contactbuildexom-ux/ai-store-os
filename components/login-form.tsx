"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Boxes, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function LoginForm({ notice }: { notice?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!isSupabaseConfigured()) {
      if (process.env.NODE_ENV !== "development") {
        setError("Authentication is not configured. Add your Supabase URL and anon key to .env.local.");
        return;
      }

      setPending(true);
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
    setPending(true);
    const { error: signInError } = await createClient().auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message === "Invalid login credentials" ? "Email or password is incorrect." : signInError.message);
      setPending(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#132522] px-12 py-10 text-white lg:flex xl:px-20">
        <div className="absolute inset-0 opacity-40" aria-hidden="true"><div className="absolute -right-32 top-24 size-[32rem] rounded-full border border-[#8ab49e]/25" /><div className="absolute -right-8 top-48 size-[24rem] rounded-full border border-[#8ab49e]/20" /><div className="absolute bottom-0 left-0 h-64 w-full bg-gradient-to-t from-[#1c3a31] to-transparent" /></div>
        <a href="/login" className="relative z-10 flex w-fit items-center gap-3 font-semibold tracking-wide"><span className="grid size-10 place-items-center rounded-xl bg-[#d7f1e2] text-[#173b2d]"><Boxes size={21} /></span><span className="text-lg">Buildexom <span className="font-normal text-[#afc8bd]">AI</span></span></a>
        <div className="relative z-10 max-w-xl pb-10">
          <div className="mb-7 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#9ec6ae]"><span className="size-1.5 rounded-full bg-[#92d6ac]" /> Commerce, in clear view</div>
          <h1 className="max-w-lg text-5xl font-semibold leading-[1.08] tracking-tight xl:text-6xl">Build better commerce, together.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-[#c1d1ca]">One calm command center for every seller, storefront, and signal across your platform.</p>
          <div className="mt-14 flex items-center gap-4 border-t border-white/15 pt-6 text-sm text-[#d8e5de]"><span className="grid size-10 place-items-center rounded-full border border-white/20"><ShieldCheck size={18} /></span>Protected access for your admin team</div>
        </div>
        <p className="relative z-10 text-xs text-[#8ba39a]">© 2026 Buildexom. All rights reserved.</p>
      </section>
      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-[420px]">
          <a href="/login" className="mb-12 flex w-fit items-center gap-3 font-semibold text-[#17362c] lg:hidden"><span className="grid size-10 place-items-center rounded-xl bg-[#e3f3e9]"><Boxes size={21} /></span>Buildexom AI</a>
          <div className="mb-9"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#24704f]">Admin workspace</p><h2 className="text-[32px] font-semibold tracking-tight text-[#182622]">Welcome back</h2><p className="mt-2 text-sm text-[#75817c]">Sign in to continue to your dashboard.</p></div>
          {notice && <p role="status" className="mb-5 rounded-lg border border-[#e7e9cf] bg-[#faf9ed] px-3.5 py-3 text-sm leading-5 text-[#716c3e]">{notice}</p>}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-[#26342f]">Work email<span className="mt-2 flex h-12 items-center gap-3 rounded-lg border border-[#dfe6e1] px-3.5 transition focus-within:border-[#398263] focus-within:ring-2 focus-within:ring-[#398263]/10"><Mail size={17} className="shrink-0 text-[#89958f]" /><input className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#a3aca8]" type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></span></label>
            <label className="block text-sm font-medium text-[#26342f]">Password<span className="mt-2 flex h-12 items-center gap-3 rounded-lg border border-[#dfe6e1] px-3.5 transition focus-within:border-[#398263] focus-within:ring-2 focus-within:ring-[#398263]/10"><LockKeyhole size={17} className="shrink-0 text-[#89958f]" /><input className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#a3aca8]" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} className="text-[#89958f] hover:text-[#26342f]" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
            <div className="flex items-center justify-between pt-0.5"><label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#66736d]"><input className="size-4 accent-[#24704f]" type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />Remember me</label><span className="text-xs text-[#84908a]">Secure sign in</span></div>
            {error && <p role="alert" className="rounded-lg border border-[#f2d5d1] bg-[#fff5f3] px-3.5 py-3 text-sm text-[#a34036]">{error}</p>}
            <button className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1b6d4d] px-4 text-sm font-semibold text-white transition hover:bg-[#155b3f] disabled:cursor-wait disabled:opacity-70" type="submit" disabled={pending}>{pending ? <><span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />Signing in...</> : <>Sign in <ArrowRight size={16} /></>}</button>
          </form>
          <p className="mt-8 text-center text-xs leading-5 text-[#929c97]">Access is managed by your organization administrator.<br />Contact your team if you need an account.</p>
        </div>
      </section>
    </main>
  );
}