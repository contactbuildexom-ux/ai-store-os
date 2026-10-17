"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
<<<<<<< HEAD
=======
import React, { useEffect, useState } from 'react';
import MerchantStoreSetupModal from './MerchantStoreSetupModal';
>>>>>>> 7057bf30ab6ae5b526e874dcbe843283ad1869de

/* ---------- tiny icon helper ---------- */
function Ico({
  children,
  size = 16,
  stroke = "currentColor",
  fill = "none",
  sw = 2,
}: {
  children: React.ReactNode;
  size?: number;
  stroke?: string;
  fill?: string;
  sw?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const Icons = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  box: (
    <>
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2 3h3l2.5 12h11L21 7H6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.2c2 .6 3.5 2.4 3.5 5.8" />
    </>
  ),
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
    </>
  ),
  bag: (
    <>
      <path d="M6 8h12l1 12H5L6 8z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </>
  ),
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
  shield: (
    <>
      <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" />
    </>
  ),
  trend: (
    <>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </>
  ),
  headphones: (
    <>
      <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
      <rect x="3" y="14" width="4" height="7" rx="2" />
      <rect x="17" y="14" width="4" height="7" rx="2" />
    </>
  ),
  shoe: (
    <>
      <path d="M3 16c0-2.2 1-3.4 3-3.6l3-.4 2 2h3c2 0 4 1.2 5 2.6V18H3v-2z" />
      <path d="M3 18h18" />
    </>
  ),
  watch: (
    <>
      <rect x="7" y="6" width="10" height="12" rx="3" />
      <path d="M9 6l1-3h4l1 3M9 18l1 3h4l1-3" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
};

/* ---------- data ---------- */
const sidebar = [
  { label: "Dashboard", icon: Icons.grid, active: true },
  { label: "Products", icon: Icons.box },
  { label: "Orders", icon: Icons.cart },
  { label: "Customers", icon: Icons.users },
  { label: "Analytics", icon: Icons.chart },
  { label: "Settings", icon: Icons.gear },
];

<<<<<<< HEAD
const stats = [
  { label: "Total Sales", value: "$12,430", delta: "12.5%", icon: Icons.bag, bg: "#e7f8ee", fg: "#16a34a" },
  { label: "Total Orders", value: "245", delta: "18.2%", icon: Icons.users, bg: "#e8f1ff", fg: "#1976d2" },
  { label: "Products", value: "32", delta: "7.3%", icon: Icons.cart, bg: "#f1eaff", fg: "#7c3aed" },
  { label: "Visitors", value: "8.4K", delta: "9.1%", icon: Icons.chart, bg: "#fff1e0", fg: "#f59e0b" },
];
=======
/* ---------- Right side: dashboard mockup + AI card ---------- */
function Mockup({ onOpenBuilder }: { onOpenBuilder: (prompt: string) => void }) {
  const [prompt, setPrompt] = useState("");
  const [active, setActive] = useState(1);
  const View = views[active];
>>>>>>> 7057bf30ab6ae5b526e874dcbe843283ad1869de

const products = [
  { name: "Wireless Headphones", price: "$49.99", icon: Icons.headphones },
  { name: "Running Shoes", price: "$79.99", icon: Icons.shoe },
  { name: "Smart Watch", price: "$129.99", icon: Icons.watch },
];

<<<<<<< HEAD
const features = [
  { label: "No Coding", icon: Icons.bolt },
  { label: "Secure & Fast", icon: Icons.shield },
  { label: "Fully Responsive", icon: Icons.chart },
];

export default function Hero() {
  const [demoOpen, setDemoOpen] = useState(false);
  const startRef = useRef<HTMLAnchorElement>(null);
=======
      {/* Dashboard */}
      <div className="flex overflow-hidden rounded-3xl border border-white bg-white shadow-2xl shadow-blue-900/15 ring-1 ring-blue-100">
        {/* Sidebar */}
        <div className="flex w-12 flex-col items-center gap-3 bg-gradient-to-b from-[#0b1b4d] to-[#13307f] py-5">
          {sidebarIcons.map((icon, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors ${
                active === i
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/40"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {icon}
              </svg>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[300px] flex-1 p-4">
          <div className="mb-3 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-2 w-2 rounded-full bg-blue-100" />
            ))}
          </div>
          <View />
        </div>
      </div>

      {/* AI card (yahan id lagi hai, cursor yahin aayega) - static, no floating */}
      <div
        id="generate-store"
        className="glass-card absolute bottom-0 right-0 z-20 w-56 rounded-2xl p-4 lg:-right-4"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 text-[10px] font-bold text-white">
          AI
        </span>
        <p className="mt-2 text-sm font-bold text-brand-navy">Describe your store</p>
        <textarea
          id="store-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A store for handmade candles, with a clean and minimal design..."
          className="mt-2 h-16 w-full resize-none rounded-lg border border-blue-100 bg-white/80 p-2 text-[11px] leading-snug text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="button"
          onClick={() => onOpenBuilder(prompt)}
          className="btn-glow mt-3 block w-full rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 py-2 text-center text-xs font-semibold text-white transition hover:brightness-110 cursor-pointer"
        >
          ✦ Generate Store
        </button>
      </div>
    </div>
  );
}

/* ---------- Hero ---------- */
const DEMO_VIDEO = "/demo.mp4";

export default function Hero() {
  const [showDemo, setShowDemo] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderPrompt, setBuilderPrompt] = useState("");

  const handleOpenBuilder = (p?: string) => {
    if (typeof p === "string" && p) {
      setBuilderPrompt(p);
    }
    setIsBuilderOpen(true);
  };
>>>>>>> 7057bf30ab6ae5b526e874dcbe843283ad1869de

  /* /#generate-store -> scroll to the CTA and focus the button */
  useEffect(() => {
    const focusFromHash = () => {
      if (window.location.hash !== "#generate-store") return;
      const el = document.getElementById("generate-store");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => startRef.current?.focus({ preventScroll: true }), 500);
    };
    focusFromHash();
    window.addEventListener("hashchange", focusFromHash);
    return () => window.removeEventListener("hashchange", focusFromHash);
  }, []);

  /* demo video: Esc closes + lock page scroll */
  useEffect(() => {
    if (!demoOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDemoOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [demoOpen]);

  return (
    <section className="relative overflow-x-clip bg-[#e6f4ff]">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:py-20">
        {/* ================= LEFT ================= */}
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#1976d2]/25 bg-white px-4 py-2 text-sm font-bold text-[#1976d2] shadow-[0_6px_18px_-8px_rgba(25,118,210,0.5)]">
            <Ico size={15}>{Icons.sparkle}</Ico>
            AI-Powered Store Builder
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-[#0b2545] sm:text-5xl lg:text-[3.6rem]">
            Build Your Online
            <br />
            Store
            <br />
            in Minutes <span className="text-[#1976d2]">with AI</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#2c4a73] sm:text-lg lg:mx-0">
            Turn your ideas into a fully functional online store. No coding, no
            hassle. Just describe your business and let our AI handle the rest.
          </p>

<<<<<<< HEAD
          <div
            id="generate-store"
            className="mt-8 flex scroll-mt-28 flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
          >
            <Link
              ref={startRef}
              href="/login?mode=signup"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1976d2] to-[#1565c0] px-7 py-4 text-base font-bold text-white shadow-[0_14px_28px_-10px_rgba(25,118,210,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_34px_-10px_rgba(25,118,210,0.9)] sm:w-auto"
            >
              Start Building Free
              <Ico size={18} sw={2.4}>{Icons.arrow}</Ico>
            </Link>
=======
          <div className="mt-9 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => handleOpenBuilder()}
              className="btn-glow inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-7 py-4 text-[15px] font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110 cursor-pointer"
            >
              Start Building Free <span aria-hidden>→</span>
            </button>
>>>>>>> 7057bf30ab6ae5b526e874dcbe843283ad1869de

            <button
              type="button"
              onClick={() => setDemoOpen(true)}
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 text-base font-bold text-[#0b2545] shadow-[0_10px_24px_-12px_rgba(11,37,69,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-12px_rgba(25,118,210,0.55)] sm:w-auto"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1976d2]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
                  <path d="M7 4.5v15l13-7.5L7 4.5z" />
                </svg>
              </span>
              Watch Demo
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 lg:justify-start">
            {features.map((f) => (
              <div key={f.label} className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1976d2] shadow-[0_6px_14px_-8px_rgba(25,118,210,0.6)]">
                  <Ico size={16}>{f.icon}</Ico>
                </span>
                <span className="text-sm font-semibold text-[#2c4a73]">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

<<<<<<< HEAD
        {/* ================= RIGHT: product mockup ================= */}
        <div className="relative mx-auto w-full max-w-[620px] px-2 pb-12 pt-14 sm:px-4">
          {/* dotted ring */}
          <div className="pointer-events-none absolute inset-x-0 bottom-2 top-8 rounded-full border border-dashed border-[#1976d2]/25" />

          {/* chip: Build with AI */}
          <div
            className="animate-float absolute left-0 top-2 z-30 flex -rotate-3 items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-[0_18px_34px_-16px_rgba(25,118,210,0.65)] sm:left-2"
            style={{ animationDelay: "0s" }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ece9ff] text-[#6d4aff]">
              <Ico size={16}>{Icons.sparkle}</Ico>
            </span>
            <span className="leading-tight">
              <span className="block text-xs font-extrabold text-[#0b2545]">Build with AI</span>
              <span className="block text-[10px] font-semibold text-[#2c4a73]">Just type your idea</span>
            </span>
          </div>

          {/* chip: growth */}
          <div
            className="animate-float absolute right-0 top-0 z-30 flex rotate-3 items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-[0_18px_34px_-16px_rgba(25,118,210,0.65)] sm:right-2"
            style={{ animationDelay: "1.2s" }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e7f8ee] text-[#16a34a]">
              <Ico size={16}>{Icons.trend}</Ico>
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-extrabold text-[#0b2545]">+320%</span>
              <span className="block text-[10px] font-semibold text-[#2c4a73]">Store Growth</span>
            </span>
          </div>

          {/* ---- dashboard card ---- */}
          <div className="relative z-10 flex overflow-hidden rounded-[1.6rem] border border-white bg-white shadow-[0_40px_80px_-30px_rgba(25,118,210,0.55)]">
            {/* sidebar */}
            <aside className="flex w-[15%] min-w-[46px] flex-col items-center gap-1 bg-gradient-to-b from-[#0b2545] to-[#123a73] px-1.5 py-4 sm:w-[25%] sm:items-stretch sm:px-3">
              <div className="mb-3 flex items-center gap-2 sm:px-1">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1976d2] text-white">
                  <Ico size={15}>{Icons.bag}</Ico>
                </span>
                <span className="hidden text-xs font-extrabold text-white sm:inline">Buildexom</span>
              </div>
              {sidebar.map((s) => (
                <div
                  key={s.label}
                  className={`flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-[10px] font-semibold sm:justify-start ${
                    s.active ? "bg-[#1976d2] text-white" : "text-[#bcd3f2]"
                  }`}
                >
                  <Ico size={14}>{s.icon}</Ico>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              ))}
            </aside>

            {/* main */}
            <div className="min-w-0 flex-1 p-3 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-extrabold text-[#0b2545] sm:text-base">Dashboard</p>
                  <p className="text-[10px] font-medium text-[#2c4a73]">Welcome back!</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f8ee] px-2.5 py-1 text-[9px] font-bold text-[#16a34a]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                  Store is live
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-xl p-2.5" style={{ backgroundColor: s.bg }}>
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-lg bg-white"
                      style={{ color: s.fg }}
                    >
                      <Ico size={13}>{s.icon}</Ico>
                    </span>
                    <p className="mt-1.5 text-[9px] font-semibold text-[#2c4a73]">{s.label}</p>
                    <p className="text-sm font-extrabold leading-tight text-[#0b2545]">{s.value}</p>
                    <p className="text-[9px] font-bold text-[#16a34a]">↑ {s.delta}</p>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs font-extrabold text-[#0b2545]">Your Store</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {products.map((p) => (
                  <div key={p.name} className="rounded-xl border border-[#e3eefc] p-2">
                    <div className="flex h-12 items-center justify-center rounded-lg bg-[#f3f8ff] text-[#0b2545] sm:h-16">
                      <Ico size={26} sw={1.8}>{p.icon}</Ico>
                    </div>
                    <p className="mt-1.5 truncate text-[9px] font-bold text-[#0b2545]">{p.name}</p>
                    <div className="mt-0.5 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-[#0b2545]">{p.price}</span>
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#1976d2] text-white">
                        <Ico size={10}>{Icons.cart}</Ico>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ---- phone ---- */}
          <div className="absolute -bottom-2 right-0 z-20 w-[31%] sm:-right-2 sm:w-[29%]">
            <div className="overflow-hidden rounded-[1.5rem] border-[5px] border-[#0b2545] bg-white shadow-[0_26px_44px_-18px_rgba(11,37,69,0.7)]">
              <div className="flex items-center justify-between px-2.5 pb-1.5 pt-3">
                <span className="text-[8px] font-extrabold text-[#0b2545]">Buildexom</span>
                <Ico size={9}>{Icons.cart}</Ico>
              </div>
              <div className="mx-2 rounded-lg bg-[#e8f1ff] p-2">
                <p className="text-[9px] font-extrabold leading-tight text-[#0b2545]">Premium Products</p>
                <p className="text-[7px] font-semibold text-[#2c4a73]">Modern. Fast. Secure.</p>
                <span className="mt-1.5 inline-block rounded bg-[#1976d2] px-2 py-0.5 text-[7px] font-bold text-white">
                  Shop Now
                </span>
                <div className="mt-1 flex justify-end text-[#1976d2]">
                  <Ico size={26} sw={1.8}>{Icons.shoe}</Ico>
                </div>
              </div>
              <div className="mx-2 mb-3 mt-2 grid grid-cols-2 gap-1.5">
                <span className="h-8 rounded-md bg-[#f3f8ff]" />
                <span className="h-8 rounded-md bg-[#f3f8ff]" />
              </div>
            </div>
          </div>

          {/* chip: secure */}
          <div
            className="animate-float absolute -bottom-1 left-0 z-30 flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-[0_18px_34px_-16px_rgba(25,118,210,0.65)] sm:left-4"
            style={{ animationDelay: "2s" }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e7f8ee] text-[#16a34a]">
              <Ico size={16}>{Icons.lock}</Ico>
            </span>
            <span className="leading-tight">
              <span className="block text-xs font-extrabold text-[#0b2545]">Secure & Reliable</span>
              <span className="block text-[10px] font-semibold text-[#2c4a73]">Your data is safe</span>
            </span>
          </div>

          {/* handwritten tag */}
          <div
            className="pointer-events-none absolute -bottom-9 right-1 z-10 hidden -rotate-6 text-lg text-[#1976d2] sm:block"
            style={{ fontFamily: "'Segoe Script','Brush Script MT',cursive" }}
          >
            Your Store, Your Way!
            <svg width="120" height="10" viewBox="0 0 120 10" fill="none" aria-hidden="true">
              <path d="M2 6c20-6 40 2 60-2s36 2 56-1" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
=======
        {/* Right: interactive mockup */}
        <Mockup onOpenBuilder={handleOpenBuilder} />
>>>>>>> 7057bf30ab6ae5b526e874dcbe843283ad1869de
      </div>

      {/* ================= demo video popup ================= */}
      {demoOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b2545]/80 p-4 backdrop-blur-sm"
          onClick={() => setDemoOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Buildexom demo video"
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setDemoOpen(false)}
              aria-label="Close video"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0b2545] shadow-md transition-transform hover:scale-105"
            >
              <Ico size={18} sw={2.4}>{Icons.close}</Ico>
            </button>
            <video src="/demo.mp4" controls autoPlay className="aspect-video w-full" />
          </div>
        </div>
      )}

      {/* Merchant AI Store Setup Modal */}
      <MerchantStoreSetupModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        initialPrompt={builderPrompt}
      />
    </section>
  );
}