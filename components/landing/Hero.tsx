'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

/* ---------- Sidebar icons ---------- */
const sidebarIcons = [
  // Home
  <path key="home" d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V11z" />,
  // Store
  <g key="store">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </g>,
  // Products
  <g key="box">
    <path d="M21 8l-9-5-9 5 9 5 9-5z" />
    <path d="M3 8v8l9 5 9-5V8" />
  </g>,
  // Orders
  <g key="cart">
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M2 3h3l2.5 12h11L21 7H6" />
  </g>,
  // Analytics
  <path key="chart" d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  // Settings
  <g key="gear">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
  </g>,
];

const categories = ["New Arrivals", "Best Sellers", "Home & Living", "Accessories"];
const categoryColors = ["bg-slate-800", "bg-slate-300", "bg-stone-500", "bg-amber-900"];

const productRows = [
  { name: "Wireless Headphones", price: "Rs 8,500", stock: "24 in stock" },
  { name: "Ceramic Vase", price: "Rs 2,200", stock: "12 in stock" },
  { name: "Leather Bag", price: "Rs 6,900", stock: "8 in stock" },
  { name: "Wooden Chair", price: "Rs 11,500", stock: "5 in stock" },
];

const orderRows = [
  { id: "#1042", name: "Ayesha K.", status: "Delivered", color: "bg-emerald-100 text-emerald-700" },
  { id: "#1043", name: "Hassan R.", status: "Shipped", color: "bg-blue-100 text-blue-700" },
  { id: "#1044", name: "Sana M.", status: "Pending", color: "bg-amber-100 text-amber-700" },
  { id: "#1045", name: "Ali Z.", status: "Pending", color: "bg-amber-100 text-amber-700" },
];

const bars = [35, 55, 40, 70, 60, 85, 75];

/* ---------- Mockup 6 views ---------- */
function Title({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-sm font-bold text-brand-navy">{children}</p>;
}

function HomeView() {
  const stats = [
    { label: "Sales", value: "Rs 84K" },
    { label: "Orders", value: "126" },
    { label: "Visitors", value: "2.4K" },
  ];
  return (
    <>
      <Title>Welcome back</Title>
      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-blue-50 p-3">
            <p className="text-[9px] text-slate-500">{s.label}</p>
            <p className="mt-1 text-sm font-bold text-brand-navy">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl bg-slate-50 p-3">
        <p className="mb-2 text-[9px] text-slate-500">Sales this week</p>
        <div className="flex h-16 items-end gap-2">
          {bars.map((h, i) => (
            <span
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-blue-600 to-sky-400"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function StoreView() {
  return (
    <>
      <div className="mb-3 flex items-center justify-between text-[10px] text-slate-500">
        <b className="text-sm text-brand-navy">Buildexom</b>
        <span className="hidden gap-3 sm:flex">
          <span>Home</span>
          <span>Shop</span>
          <span>About</span>
          <span>Contact</span>
        </span>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-sky-100 p-5">
        <p className="max-w-[9rem] text-base font-bold leading-tight text-brand-navy">
          Better Products for a Brighter You
        </p>
        <p className="mt-2 max-w-[9rem] text-[9px] text-slate-500">
          Discover premium products designed for modern life.
        </p>
        <Link
          href="/#templates"
          className="mt-3 inline-block cursor-pointer rounded-md bg-brand-navy px-3 py-1.5 text-[9px] font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Shop Now
        </Link>
        <div className="absolute bottom-0 right-8 h-24 w-16 rounded-t-[2rem] rounded-b-xl bg-white shadow-inner" />
        <div className="absolute bottom-20 right-10 h-14 w-12 rounded-full bg-blue-600/80" />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {categories.map((c, i) => (
          <div key={c} className="rounded-xl bg-slate-50 py-3 text-center">
            <span className={`mx-auto mb-2 block h-8 w-6 rounded ${categoryColors[i]}`} />
            <span className="text-[8px] text-slate-500">{c}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function ProductsView() {
  return (
    <>
      <Title>Products</Title>
      <div className="space-y-2">
        {productRows.map((p, i) => (
          <div key={p.name} className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5">
            <span className={`h-9 w-9 shrink-0 rounded-lg ${categoryColors[i]}`} />
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-brand-navy">{p.name}</p>
              <p className="text-[9px] text-slate-500">{p.stock}</p>
            </div>
            <p className="text-[11px] font-bold text-brand-navy">{p.price}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function OrdersView() {
  return (
    <>
      <Title>Recent orders</Title>
      <div className="space-y-2">
        {orderRows.map((o) => (
          <div key={o.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
            <div>
              <p className="text-[11px] font-semibold text-brand-navy">{o.id}</p>
              <p className="text-[9px] text-slate-500">{o.name}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${o.color}`}>
              {o.status}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function AnalyticsView() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <>
      <Title>Analytics</Title>
      <div className="rounded-xl bg-slate-50 p-3">
        <p className="text-[9px] text-slate-500">Visitors this week</p>
        <p className="text-lg font-bold text-brand-navy">
          2,430 <span className="text-[10px] font-semibold text-emerald-600">+12%</span>
        </p>
        <div className="mt-3 flex h-20 items-end gap-2">
          {bars.map((h, i) => (
            <div key={i} className="flex h-full flex-1 flex-col justify-end gap-1">
              <span
                className="w-full rounded-t bg-gradient-to-t from-blue-700 to-sky-400"
                style={{ height: `${h}%` }}
              />
              <span className="text-center text-[8px] text-slate-400">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function SettingsView() {
  const [toggles, setToggles] = useState([true, true, false]);
  const labels = ["WhatsApp ordering", "Email notifications", "Show Buildexom branding"];
  return (
    <>
      <Title>Store settings</Title>
      <div className="space-y-2">
        {labels.map((l, i) => (
          <div key={l} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
            <span className="text-[11px] text-slate-700">{l}</span>
            <button
              type="button"
              aria-label={l}
              onClick={() => setToggles(toggles.map((t, j) => (j === i ? !t : t)))}
              className={`relative h-5 w-9 cursor-pointer rounded-full transition-colors ${
                toggles[i] ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                  toggles[i] ? "left-[18px]" : "left-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

const views = [HomeView, StoreView, ProductsView, OrdersView, AnalyticsView, SettingsView];

/* ---------- Right side: dashboard mockup + AI card ---------- */
function Mockup() {
  const [prompt, setPrompt] = useState("");
  const [active, setActive] = useState(1);
  const View = views[active];

  return (
    <div className="relative mx-auto w-full max-w-[520px] pb-14 lg:ml-auto">
      {/* Soft glow behind mockup */}
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-blue-200/60 via-sky-100/40 to-transparent blur-2xl"
      />

      {/* Floating chip: top left */}
      <div className="glass-card animate-float absolute -left-6 top-10 z-20 hidden items-center gap-2 rounded-2xl px-3 py-2 sm:flex">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-600">
          ✓
        </span>
        <div>
          <p className="text-[11px] font-bold text-brand-navy">Store is live</p>
          <p className="text-[9px] text-slate-500">Built in 2 minutes</p>
        </div>
      </div>

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

      {/* Floating AI card (yahan id lagi hai, cursor yahin aayega) */}
      <div
        id="generate-store"
        className="glass-card animate-float absolute bottom-0 right-0 z-20 w-56 rounded-2xl p-4 lg:-right-4"
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
        <Link
          href="/login"
          className="btn-glow mt-3 block w-full rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 py-2 text-center text-xs font-semibold text-white transition hover:brightness-110"
        >
          ✦ Generate Store
        </Link>
      </div>
    </div>
  );
}

/* ---------- Hero ---------- */
const DEMO_VIDEO = "/demo.mp4";

export default function Hero() {
  const [showDemo, setShowDemo] = useState(false);

  /* Demo popup: Escape se band */
  useEffect(() => {
    if (!showDemo) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowDemo(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showDemo]);

  /* "/#generate-store" wale kisi bhi link par click ho to
     Describe your store box tak scroll hoga aur cursor textbox mein aayega */
  useEffect(() => {
    const focusPrompt = () => {
      document
        .getElementById("generate-store")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => {
        (document.getElementById("store-prompt") as HTMLTextAreaElement | null)?.focus({
          preventScroll: true,
        });
      }, 800);
    };

    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a");
      const href = link?.getAttribute("href");
      if (href === "/#generate-store" || href === "#generate-store") {
        window.setTimeout(focusPrompt, 120);
      }
    };

    document.addEventListener("click", onClick);

    // Doosre page se /#generate-store khol kar aaye to bhi kaam kare
    if (window.location.hash === "#generate-store") {
      window.setTimeout(focusPrompt, 500);
    }

    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <section className="bg-modern relative overflow-hidden">
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-blue-300/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-0 h-[320px] w-[320px] rounded-full bg-sky-200/40 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-14 px-5 pb-24 pt-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-16">
        {/* Left: text */}
        <div>
          <span className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-blue-700">
            <span className="text-blue-500">✦</span> AI-Powered Store Builder
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-brand-navy sm:text-5xl lg:text-[56px]">
            Build Your Online Store <br />
            in Minutes <span className="text-gradient">with AI</span>
          </h1>

          <p className="mt-6 max-w-[500px] text-[17px] leading-8 text-slate-600">
            Turn your ideas into a fully functional online store. No coding, no hassle. Just describe
            your business and let our AI handle the rest.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/#generate-store"
              className="btn-glow inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-7 py-4 text-[15px] font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110"
            >
              Start Building Free <span aria-hidden>→</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowDemo(true)}
              className="glass-card inline-flex cursor-pointer items-center gap-2 rounded-xl px-7 py-4 text-[15px] font-semibold text-brand-navy transition hover:-translate-y-0.5"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[9px] text-white">
                ▶
              </span>
              Watch Demo
            </button>
          </div>

          {/* Social proof (sample number, asli number baad mein lagayein) */}
          <div className="mt-9 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["bg-amber-200", "bg-rose-200", "bg-emerald-200", "bg-sky-200"].map((c) => (
                <span key={c} className={`h-9 w-9 rounded-full border-2 border-white shadow-sm ${c}`} />
              ))}
            </div>
            <p className="text-sm font-medium text-slate-600">
              Join 50,000+ happy creators and business owners
            </p>
          </div>
        </div>

        {/* Right: interactive mockup */}
        <Mockup />
      </div>

      {/* Demo video popup */}
      {showDemo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-navy/80 p-4 backdrop-blur-sm"
          onClick={() => setShowDemo(false)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close demo"
              onClick={() => setShowDemo(false)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-900 hover:bg-white"
            >
              ✕
            </button>
            <video src={DEMO_VIDEO} controls autoPlay className="aspect-video w-full" />
          </div>
        </div>
      )}
    </section>
  );
}