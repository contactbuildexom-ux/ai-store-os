"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import MerchantStoreSetupModal from "./MerchantStoreSetupModal";

/* ---------- tiny icon helper ---------- */
function Ico({
  children,
  size = 16,
  stroke = "currentColor",
  fill = "none",
  sw = 2,
}: {
  children: ReactNode;
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
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
};

/* ---------- product illustrations ---------- */
function Headphones({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M12 38v-6a20 20 0 0 1 40 0v6" fill="none" stroke="#1f2a37" strokeWidth="5" strokeLinecap="round" />
      <rect x="8" y="36" width="13" height="21" rx="6.5" fill="#111827" />
      <rect x="43" y="36" width="13" height="21" rx="6.5" fill="#111827" />
      <rect x="11.5" y="41" width="6" height="11" rx="3" fill="#475569" />
      <rect x="46.5" y="41" width="6" height="11" rx="3" fill="#475569" />
    </svg>
  );
}

function Sneaker({ size = 56, accent = "#1976d2" }: { size?: number; accent?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M5 41c0-4 3-6.5 7-7.5l9-3 6 6h10c6 0 12 3 15 8v6H5V41z"
        fill="#ffffff"
        stroke="#c5d9f3"
        strokeWidth="1.5"
      />
      <path d="M5 50h54v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5z" fill="#dbe8fb" />
      <path d="M22 31l4-6 8 6" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25 39h15" stroke={accent} strokeWidth="3" strokeLinecap="round" />
      <path d="M12 44h14" stroke="#c5d9f3" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SmartWatch({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect x="22" y="3" width="20" height="14" rx="4" fill="#1f2937" />
      <rect x="22" y="47" width="20" height="14" rx="4" fill="#1f2937" />
      <rect x="15" y="14" width="34" height="36" rx="11" fill="#111827" />
      <rect x="19" y="18" width="26" height="28" rx="8" fill="#0b2545" />
      <path d="M32 24v9l6 3" fill="none" stroke="#4a9bf0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="49" y="26" width="3" height="8" rx="1.5" fill="#374151" />
    </svg>
  );
}

/* ---------- data ---------- */
const sidebar = [
  { label: "Dashboard", icon: Icons.grid, active: true },
  { label: "Products", icon: Icons.box },
  { label: "Orders", icon: Icons.cart },
  { label: "Customers", icon: Icons.users },
  { label: "Analytics", icon: Icons.chart },
  { label: "Settings", icon: Icons.gear },
];

const stats = [
  { label: "Total Sales", value: "$12,430", delta: "12.5%", icon: Icons.bag, bg: "#e7f8ee", fg: "#16a34a" },
  { label: "Total Orders", value: "245", delta: "18.2%", icon: Icons.users, bg: "#e8f1ff", fg: "#1976d2" },
  { label: "Products", value: "32", delta: "7.3%", icon: Icons.cart, bg: "#f1eaff", fg: "#7c3aed" },
  { label: "Visitors", value: "8.4K", delta: "9.1%", icon: Icons.chart, bg: "#fff1e0", fg: "#f59e0b" },
];

const products = [
  { name: "Wireless Headphones", price: "$49.99", art: <Headphones /> },
  { name: "Running Shoes", price: "$79.99", art: <Sneaker /> },
  { name: "Smart Watch", price: "$129.99", art: <SmartWatch /> },
];

const features = [
  { label: "No Coding", icon: Icons.bolt },
  { label: "Secure & Fast", icon: Icons.shield },
  { label: "Fully Responsive", icon: Icons.chart },
];

/* ---------- Hero ---------- */
const DEMO_VIDEO = "/demo.mp4";

export default function Hero() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderPrompt, setBuilderPrompt] = useState("");
  const startRef = useRef<HTMLButtonElement>(null);

  /* teammate logic: open the AI store builder modal (unchanged) */
  const handleOpenBuilder = (p?: string) => {
    if (typeof p === "string" && p) {
      setBuilderPrompt(p);
    }
    setIsBuilderOpen(true);
  };

  /* /#generate-store -> scroll to the CTA and focus the main button */
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
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-6 lg:py-10">
        {/* ================= LEFT ================= */}
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#1976d2]/25 bg-white px-4 py-2 text-sm font-bold text-[#1976d2] shadow-[0_6px_18px_-8px_rgba(25,118,210,0.5)]">
            <Ico size={15}>{Icons.sparkle}</Ico>
            AI-Powered Store Builder
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-[#0b2545] sm:text-5xl lg:text-[3.3rem]">
            Build Your Online
            <br />
            Store
            <br />
            in Minutes <span className="text-[#1976d2]">with AI</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#2c4a73] sm:text-lg lg:mx-0">
            Turn your ideas into a fully functional online store. No coding, no
            hassle. Just describe your business and let our AI handle the rest.
          </p>

          <div
            id="generate-store"
            className="mt-7 flex scroll-mt-28 flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
          >
            <button
              ref={startRef}
              type="button"
              onClick={() => handleOpenBuilder()}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1976d2] to-[#1565c0] px-7 py-4 text-base font-bold text-white shadow-[0_14px_28px_-10px_rgba(25,118,210,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_34px_-10px_rgba(25,118,210,0.9)] sm:w-auto"
            >
              Start Building Free
              <Ico size={18} sw={2.4}>{Icons.arrow}</Ico>
            </button>

            <button
              type="button"
              onClick={() => setDemoOpen(true)}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 text-base font-bold text-[#0b2545] shadow-[0_10px_24px_-12px_rgba(11,37,69,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-12px_rgba(25,118,210,0.55)] sm:w-auto"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1976d2]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
                  <path d="M7 4.5v15l13-7.5L7 4.5z" />
                </svg>
              </span>
              Watch Demo
            </button>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 lg:justify-start">
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

        {/* ================= RIGHT: product mockup ================= */}
        <div className="relative mx-auto w-full max-w-[640px] px-2 pb-6 pt-12 sm:px-4 sm:pb-20">
          {/* dotted ring */}
          <div className="pointer-events-none absolute inset-x-0 bottom-10 top-6 rounded-full border border-dashed border-[#1976d2]/25" />

          {/* chip: Build with AI -> opens the builder modal */}
          <button
            type="button"
            onClick={() => handleOpenBuilder()}
            className="animate-float absolute left-0 top-1 z-30 flex -rotate-3 cursor-pointer items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 text-left shadow-[0_18px_34px_-16px_rgba(25,118,210,0.65)] sm:left-2"
            style={{ animationDelay: "0s" }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ece9ff] text-[#6d4aff]">
              <Ico size={16}>{Icons.sparkle}</Ico>
            </span>
            <span className="leading-tight">
              <span className="block text-xs font-extrabold text-[#0b2545]">Build with AI</span>
              <span className="block text-[10px] font-semibold text-[#2c4a73]">Just type your idea</span>
            </span>
          </button>

          {/* curved arrow from the chip to the dashboard */}
          <svg
            className="pointer-events-none absolute left-[150px] top-[14px] z-20 hidden sm:block"
            width="70"
            height="44"
            viewBox="0 0 70 44"
            fill="none"
            aria-hidden="true"
          >
            <path d="M3 6c26-2 50 6 58 30" stroke="#0b2545" strokeWidth="2" strokeLinecap="round" />
            <path d="M54 30l8 8 4-11" stroke="#0b2545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

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

          {/* ---- dashboard + phone (phone is attached to the dashboard corner) ---- */}
          <div className="relative z-10">
            <div className="flex overflow-hidden rounded-[1.6rem] border border-white bg-white shadow-[0_40px_80px_-30px_rgba(25,118,210,0.55)]">
              {/* sidebar */}
              <aside className="flex w-[15%] min-w-[46px] flex-col items-center gap-1 bg-gradient-to-b from-[#0b2545] to-[#123a73] px-1.5 py-4 sm:w-[24%] sm:items-stretch sm:px-3">
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
              <div className="min-w-0 flex-1 p-3 sm:p-4">
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

                <p className="mt-3 text-xs font-extrabold text-[#0b2545]">Your Store</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {products.map((p) => (
                    <div key={p.name} className="rounded-xl border border-[#e3eefc] p-2">
                      <div className="flex h-14 items-center justify-center rounded-lg bg-[#f3f8ff] sm:h-[4.5rem]">
                        {p.art}
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

            {/* phone: bottom-right corner of the dashboard, tall like a real phone */}
            <div className="absolute -bottom-6 -right-2 z-20 hidden w-[27%] sm:-right-4 sm:block">
              <div className="flex aspect-[9/14] flex-col overflow-hidden rounded-[1.6rem] border-[5px] border-[#0b2545] bg-white shadow-[0_26px_44px_-18px_rgba(11,37,69,0.7)]">
                <div className="flex items-center justify-between px-2.5 pb-1.5 pt-3">
                  <span className="flex items-center gap-1 text-[8px] font-extrabold text-[#0b2545]">
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#1976d2] text-white">
                      <Ico size={8}>{Icons.bag}</Ico>
                    </span>
                    Buildexom
                  </span>
                  <Ico size={9}>{Icons.cart}</Ico>
                </div>
                <div className="mx-2 flex flex-1 flex-col rounded-lg bg-[#e8f1ff] p-2">
                  <p className="text-[10px] font-extrabold leading-tight text-[#0b2545]">Premium Products</p>
                  <p className="text-[7px] font-semibold text-[#2c4a73]">Modern. Fast. Secure.</p>
                  <span className="mt-1.5 inline-block w-fit rounded bg-[#1976d2] px-2 py-0.5 text-[7px] font-bold text-white">
                    Shop Now
                  </span>
                  <div className="flex flex-1 items-center justify-center">
                    <Sneaker size={64} accent="#1976d2" />
                  </div>
                </div>
                <div className="flex justify-center gap-1 py-2">
                  <span className="h-1 w-3 rounded-full bg-[#1976d2]" />
                  <span className="h-1 w-1 rounded-full bg-[#bfdcff]" />
                  <span className="h-1 w-1 rounded-full bg-[#bfdcff]" />
                </div>
              </div>
            </div>
          </div>

          {/* chip: secure */}
          <div
            className="animate-float relative z-30 mt-4 flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-[0_18px_34px_-16px_rgba(25,118,210,0.65)] sm:absolute sm:bottom-6 sm:left-5 sm:mt-0 sm:w-fit"
            style={{ animationDelay: "2s" }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e7f8ee] text-[#16a34a]">
              <Ico size={17}>{Icons.lock}</Ico>
            </span>
            <span className="leading-tight">
              <span className="block text-xs font-extrabold text-[#0b2545]">Secure & Reliable</span>
              <span className="block text-[10px] font-semibold text-[#2c4a73]">Your data is safe</span>
            </span>
          </div>

          {/* handwritten tag */}
          <div
            className="pointer-events-none absolute bottom-0 right-4 z-10 hidden -rotate-6 text-lg leading-tight text-[#1976d2] sm:block"
            style={{ fontFamily: "'Segoe Script','Brush Script MT',cursive" }}
          >
            Your Store,
            <br />
            Your Way!
            <svg width="110" height="10" viewBox="0 0 120 10" fill="none" aria-hidden="true">
              <path d="M2 6c20-6 40 2 60-2s36 2 56-1" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
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
            <video src={DEMO_VIDEO} controls autoPlay className="aspect-video w-full" />
          </div>
        </div>
      )}

      {/* Merchant AI Store Setup Modal (teammate's component, unchanged) */}
      <MerchantStoreSetupModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        initialPrompt={builderPrompt}
      />
    </section>
  );
}