"use client";

import Link from "next/link";
import { usePlatformBranding } from "@/components/platform-branding";
import { DEFAULT_PLATFORM_SETTINGS } from "@/lib/platform-settings-defaults";

/* ============ CONFIG ============ */

const WHATSAPP_MESSAGE =
  "Hi Buildexom team, I would like to know more about building my online store.";
/* ================================== */

const perks = ["Free plan available", "No credit card needed", "Live in minutes"];

function Tick() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3 w-3 text-white"
        aria-hidden="true"
      >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

/* Right side: chhota store mockup */
function StoreVisual() {
  return (
    <div className="relative mx-auto hidden h-[270px] w-full max-w-[420px] lg:block" aria-hidden="true">
      {/* Main store card */}
      <div className="absolute inset-x-4 bottom-0 top-6 rounded-2xl border border-white/60 bg-white p-4">
        {/* Browser bar */}
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-300" />
          <span className="h-2 w-2 rounded-full bg-amber-300" />
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          <span className="ml-3 h-4 flex-1 rounded-full bg-slate-100" />
        </div>

        {/* Hero banner */}
        <div className="relative mt-4 overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-sky-100 p-4">
          <span className="block h-2.5 w-28 rounded-full bg-brand-navy" />
          <span className="mt-2 block h-2 w-20 rounded-full bg-slate-300" />
          <span className="mt-3 block h-5 w-16 rounded-md bg-brand-blue" />
          <span className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-blue-300/50" />
          <span className="absolute bottom-0 right-8 h-12 w-10 rounded-t-2xl bg-white/80" />
        </div>

        {/* Product tiles */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {["bg-indigo-200", "bg-sky-200", "bg-blue-300"].map((c) => (
            <div key={c} className="rounded-lg bg-slate-50 p-1.5">
              <span className={`block h-10 w-full rounded-md ${c}`} />
              <span className="mt-1.5 block h-1.5 w-3/4 rounded-full bg-slate-300" />
              <span className="mt-1 block h-1.5 w-1/2 rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Chip: new order */}
      <div className="animate-float absolute -left-2 top-0 flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-3 py-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-600">
          ✓
        </span>
        <div>
          <p className="text-[11px] font-bold leading-tight text-brand-navy">New order</p>
          <p className="text-[10px] leading-tight text-slate-500">via WhatsApp</p>
        </div>
      </div>

      {/* Chip: store live */}
      <div className="animate-float absolute -right-2 bottom-6 flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-3 py-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm text-blue-600">
          ✦
        </span>
        <div>
          <p className="text-[11px] font-bold leading-tight text-brand-navy">Store is live</p>
          <p className="text-[10px] leading-tight text-slate-500">Built in minutes</p>
        </div>
      </div>
    </div>
  );
}

export default function FinalCta() {
  const { settings } = usePlatformBranding();
  const number = (settings.whatsapp || DEFAULT_PLATFORM_SETTINGS.whatsapp).replace(/\D/g, "");
  const whatsappHref = `https://wa.me/${number}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="bg-brand-gradient relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] px-6 py-12 sm:px-10 lg:px-14 lg:py-14">
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: text */}
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white">
              ✦ Free to start
            </span>

            <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-[42px]">
              Ready to launch{" "}
              <span className="bg-gradient-to-r from-sky-200 to-white bg-clip-text text-transparent">
                your store?
              </span>
            </h2>

            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-blue-100 lg:mx-0">
              Join creators and small businesses selling online with Buildexom. It
              takes minutes.
            </p>

            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:items-center">
              <Link
                href="/user/signup"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-blue-dark transition hover:-translate-y-0.5 hover:bg-blue-50 sm:w-auto"
              >
                Start building free <span aria-hidden>→</span>
              </Link>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto"
              >
                <WhatsAppIcon />
                Talk to our team
              </a>
            </div>

            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start">
              {perks.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm font-medium text-blue-100">
                  <Tick />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: visual (sirf laptop par) */}
          <StoreVisual />
        </div>
      </div>
    </section>
  );
}