/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { usePlatformBranding } from "@/components/platform-branding";

/* ============ CONFIG ============ */

const WHATSAPP_FALLBACK = "923374257290";
const WHATSAPP_MESSAGE =
  "Hi Buildexom team, I would like to know more about building my online store.";
/* ================================== */

const perks = ["Free plan available", "No credit card needed", "Live in minutes"];

const products = [
  {
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80",
    title: "Sport Runner",
    price: "Rs. 4,900",
  },
  {
    img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=300&q=80",
    title: "Soy Candle",
    price: "Rs. 2,450",
  },
  {
    img: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=300&q=80",
    title: "French EDP",
    price: "Rs. 3,800",
  },
];

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

/* Right side: a real store picture inside a small browser frame (desktop only) */
function StoreVisual() {
  return (
    <div
      className="relative mx-auto hidden h-[280px] w-full max-w-[440px] lg:block"
      aria-hidden="true"
    >
      {/* Main store card with browser chrome */}
      <div className="absolute inset-x-2 bottom-0 top-3 overflow-hidden rounded-2xl border border-white/80 bg-white p-3 shadow-2xl">
        {/* Browser bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-0.5 text-[9px] font-medium text-slate-500">
            mystore.buildexom.store
          </span>
          <div className="w-8" />
        </div>

        {/* Announcement Ticker */}
        <div className="mt-1 flex items-center justify-center rounded-md bg-[#1976d2] px-2 py-0.5 text-[8px] font-bold tracking-wide text-white">
          <span>⚡ Fast Nationwide Delivery on All Orders</span>
        </div>

        {/* Hero banner */}
        <div className="relative mt-2 flex items-center justify-between gap-3 overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/80 p-3">
          <div className="space-y-1">
            <span className="inline-block rounded-md bg-[#1976d2] px-1.5 py-0.5 text-[8px] font-bold text-white">
              Featured Collection
            </span>
            <p className="text-xs font-black leading-tight text-slate-900">
              Aura Lifestyle Atelier
            </p>
            <p className="line-clamp-1 text-[9px] text-slate-600">
              Curated premium essentials delivered across Pakistan.
            </p>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="rounded-md bg-[#1976d2] px-2 py-0.5 text-[8px] font-bold text-white">
                Shop Collection
              </span>
              <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[8px] font-bold text-white">
                WhatsApp
              </span>
            </div>
          </div>

          <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-white shadow-md">
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80"
              alt="Store Preview"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Product tiles with real images */}
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {products.map((item) => (
            <div
              key={item.title}
              className="flex flex-col justify-between rounded-lg border border-slate-100 bg-slate-50 p-1"
            >
              <div className="relative h-12 w-full overflow-hidden rounded-md bg-slate-200">
                <img
                  src={item.img}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-1 flex items-center justify-between px-0.5">
                <span className="truncate text-[8px] font-bold text-slate-800">
                  {item.title}
                </span>
                <span className="text-[7px] font-extrabold text-[#1976d2]">
                  {item.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Chip: New order via WhatsApp */}
      <div className="animate-float absolute -left-2 top-0 flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-3 py-2 shadow-lg">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
          ✓
        </span>
        <div>
          <p className="text-[11px] font-bold leading-tight text-slate-900">New order</p>
          <p className="text-[10px] leading-tight text-slate-500">via WhatsApp</p>
        </div>
      </div>

      {/* Floating Chip: Store is live */}
      <div className="animate-float absolute -right-2 bottom-3 flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-3 py-2 shadow-lg">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-[#1976d2]">
          ✦
        </span>
        <div>
          <p className="text-[11px] font-bold leading-tight text-slate-900">Store is live</p>
          <p className="text-[10px] leading-tight text-slate-500">Built in minutes</p>
        </div>
      </div>
    </div>
  );
}

export default function FinalCta() {
  const { settings } = usePlatformBranding();
  const number = (settings.whatsapp || WHATSAPP_FALLBACK).replace(/\D/g, "");
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
                <li
                  key={p}
                  className="flex items-center gap-2 text-sm font-medium text-blue-100"
                >
                  <Tick />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: visual (desktop only) */}
          <StoreVisual />
        </div>
      </div>
    </section>
  );
}