"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

// 👉 Apni real support email yahan likho
const SUPPORT_EMAIL = "support@yourdomain.com";

type Topic = {
  q: string;
  steps: string[];
  link?: { label: string; href: string };
};
type Category = {
  id: string;
  icon: string;
  title: string;
  blurb: string;
  grad: string;
  accent: string;
  topics: Topic[];
};

const CATEGORIES: Category[] = [
  {
    id: "getting-started",
    icon: "🚀",
    title: "Getting Started",
    blurb: "Create your account and launch your first store",
    grad: "from-sky-500 to-indigo-600",
    accent: "bg-sky-600",
    topics: [
      {
        q: "How to create your Buildexom account",
        steps: [
          "Click “Get Started Free” at the top right of the website.",
          "Sign up with your email and choose a password.",
          "Confirm your email if we ask you to.",
          "You will land on your dashboard, ready to build.",
        ],
      },
      {
        q: "How to build your first store with AI",
        steps: [
          "Open your dashboard and find the “Describe your store” box.",
          "Write what you sell, who it is for, and the look you want.",
          "Click “Generate Store” and wait a few seconds.",
          "Review your store, then edit anything you want to change.",
        ],
      },
      {
        q: "How to describe your business for the best results",
        steps: [
          "Say what you sell, for example “handmade candles” or “women’s clothing”.",
          "Mention your style: minimal, modern, colorful, warm and cozy.",
          "Add your city or customers if it matters, for example “for customers in Lahore”.",
          "Example: “A store for handmade candles with a clean, minimal design.”",
        ],
      },
      {
        q: "How to publish your store",
        steps: [
          "Check the preview and add at least a few products.",
          "Click “Publish” in your dashboard.",
          "Share your store link, or your QR code, with customers.",
        ],
      },
    ],
  },
  {
    id: "products",
    icon: "🛍️",
    title: "Products",
    blurb: "Add products, photos, descriptions and categories",
    grad: "from-amber-400 to-orange-600",
    accent: "bg-orange-500",
    topics: [
      {
        q: "How to add and edit products",
        steps: [
          "Go to Products in your dashboard.",
          "Click “Add product” and fill in the name, price and details.",
          "Save. To change something later, open the product and edit it.",
        ],
      },
      {
        q: "How to upload product images and write descriptions",
        steps: [
          "Use clear photos taken in good daylight with a plain background.",
          "Upload them on the product page.",
          "Write a short description yourself, or let AI draft one and then edit it.",
        ],
      },
      {
        q: "How to organize products into categories",
        steps: [
          "Create categories such as “Men”, “Women” or “Gifts”.",
          "Open a product and choose its category.",
          "Customers can then browse your store by category.",
        ],
      },
    ],
  },
  {
    id: "orders-whatsapp",
    icon: "💬",
    title: "Orders & WhatsApp",
    blurb: "Receive and manage orders on WhatsApp",
    grad: "from-emerald-400 to-teal-600",
    accent: "bg-emerald-600",
    topics: [
      {
        q: "How to connect your WhatsApp number",
        steps: [
          "Open Settings in your dashboard.",
          "Find the WhatsApp section.",
          "Enter your number with the country code, for example +92…",
          "Save. New orders will now reach this WhatsApp number.",
        ],
      },
      {
        q: "How customers place orders on WhatsApp",
        steps: [
          "The customer opens your store and adds products to the cart.",
          "They tap the order button.",
          "WhatsApp opens with their order details already written.",
          "They send it, and you receive it on your WhatsApp.",
        ],
      },
      {
        q: "How to confirm and track orders from your dashboard",
        steps: [
          "Open Orders in your dashboard.",
          "Click an order to see the customer and items.",
          "Update the status (new, confirmed, delivered) as you go.",
        ],
      },
    ],
  },
  {
    id: "qr-code",
    icon: "📱",
    title: "Store QR Code",
    blurb: "Create, style and download your store QR code",
    grad: "from-violet-500 to-fuchsia-600",
    accent: "bg-violet-600",
    topics: [
      {
        q: "How to get your store QR code",
        steps: [
          "Open the QR Code section in your dashboard.",
          "Your store QR code is created from your store link.",
        ],
      },
      {
        q: "How to download it as PNG or PDF",
        steps: [
          "In the QR Code section, choose the format you need.",
          "Click Download. Use PNG for social media and PDF for printing.",
        ],
      },
      {
        q: "How to change QR color and add your logo",
        steps: [
          "In the QR Code section, pick a color that matches your brand.",
          "Upload your logo to place it in the center.",
          "Keep strong contrast so phones can still scan it easily.",
        ],
      },
    ],
  },
  {
    id: "plans-account",
    icon: "💳",
    title: "Plans & Account",
    blurb: "Plans, upgrades and how to reach support",
    grad: "from-rose-400 to-pink-600",
    accent: "bg-rose-500",
    topics: [
      {
        q: "Free, Pro, and Business plan differences",
        steps: [
          "Basic is free and good for getting started.",
          "Pro adds more advanced features, such as WhatsApp product alerts.",
          "Business is for unlimited use and adds the AI chatbot for customers.",
          "See the full list on our Pricing section.",
        ],
        link: { label: "View pricing", href: "/#pricing" },
      },
      {
        q: "How to upgrade or change your plan",
        steps: [
          "Open Settings in your dashboard and go to your plan.",
          "Choose the plan you want and follow the steps.",
        ],
        link: { label: "Compare plans", href: "/#pricing" },
      },
      {
        q: "How to contact support",
        steps: [
          "Ask Bexi AI, the chat bubble at the bottom right of every page.",
          `Or email us at ${SUPPORT_EMAIL}.`,
        ],
      },
    ],
  },
];

const POPULAR = ["WhatsApp", "QR code", "publish", "products", "plans"];

export default function HelpCenter() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const searching = query.trim().length > 0;

  const results = useMemo(() => {
    const t = query.trim().toLowerCase();
    if (!t) return CATEGORIES;
    return CATEGORIES.map((c) => ({
      ...c,
      topics: c.topics.filter(
        (x) =>
          x.q.toLowerCase().includes(t) ||
          x.steps.some((s) => s.toLowerCase().includes(t))
      ),
    })).filter((c) => c.topics.length > 0);
  }, [query]);

  const totalTopics = CATEGORIES.reduce((n, c) => n + c.topics.length, 0);

  return (
    <>
      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden bg-[#0b1736] pb-28 pt-14 text-white sm:pb-32 sm:pt-20">
        <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />

        <div className="relative mx-auto max-w-[1200px] px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-sky-200 ring-1 ring-white/20 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
            Help Center
          </span>

          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            How can we{" "}
            <span className="bg-gradient-to-r from-sky-300 via-blue-300 to-emerald-300 bg-clip-text text-transparent">
              help you?
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-blue-100/80 sm:text-lg">
            Guides to build and manage your store.
          </p>

          {/* Search */}
          <div className="relative mx-auto mt-8 max-w-xl">
            <svg
              className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search guides, e.g. WhatsApp, QR, publish"
              aria-label="Search help articles"
              className="w-full rounded-full border border-white/10 bg-white py-4 pl-14 pr-5 text-sm text-slate-800 shadow-2xl shadow-blue-950/40 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-blue-400/40 sm:text-base"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-blue-100/70">Popular:</span>
            {POPULAR.map((p) => (
              <button
                key={p}
                onClick={() => setQuery(p)}
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20 transition hover:bg-white/20"
              >
                {p}
              </button>
            ))}
          </div>

          <p className="mt-6 text-sm text-blue-100/70">
            <b className="text-white">{totalTopics}</b> guides across{" "}
            <b className="text-white">{CATEGORIES.length}</b> topics
          </p>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-14 max-w-[1200px] px-4 pb-20 sm:px-6">
        {/* ───────── CATEGORY CARDS ───────── */}
        {!searching && (
          <nav
            aria-label="Help categories"
            className="mb-14 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5"
          >
            {CATEGORIES.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-lg shadow-slate-200/70 transition duration-300 hover:-translate-y-2 hover:shadow-2xl sm:p-5"
              >
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${c.grad} text-2xl shadow-md transition group-hover:scale-110 group-hover:-rotate-6`}
                >
                  {c.icon}
                </span>
                <span className="mt-3 text-sm font-bold text-[#0f2350] sm:text-base">
                  {c.title}
                </span>
                <span className="mt-1 hidden text-xs leading-5 text-slate-500 sm:block">
                  {c.blurb}
                </span>
                <span className="mt-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                  {c.topics.length} guides
                </span>
              </a>
            ))}
          </nav>
        )}

        {/* ───────── SECTIONS ───────── */}
        {results.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <div className="text-4xl">🔍</div>
            <p className="mt-3 text-lg font-bold text-slate-800">
              No results for “{query}”
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try a different word, or ask Bexi AI in the chat at the bottom
              right.
            </p>
            <button
              onClick={() => setQuery("")}
              className="mt-5 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {results.map((c) => (
              <section
                key={c.id}
                id={c.id}
                className="scroll-mt-28 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md"
              >
                <div
                  className={`flex items-center gap-4 bg-gradient-to-r ${c.grad} px-5 py-4 text-white sm:px-6`}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-2xl ring-1 ring-white/30">
                    {c.icon}
                  </span>
                  <div>
                    <h2 className="text-lg font-extrabold sm:text-xl">
                      {c.title}
                    </h2>
                    <p className="text-xs text-white/85 sm:text-sm">
                      {c.blurb}
                    </p>
                  </div>
                </div>

                <ul className="divide-y divide-slate-100 px-3 py-2 sm:px-4">
                  {c.topics.map((t) => {
                    const key = `${c.id}:${t.q}`;
                    const isOpen = searching || open === key;
                    return (
                      <li key={key}>
                        <button
                          type="button"
                          onClick={() => setOpen(open === key ? null : key)}
                          aria-expanded={isOpen}
                          className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-4 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-50 hover:text-blue-700 sm:text-base"
                        >
                          <span>{t.q}</span>
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base font-bold transition ${
                              isOpen
                                ? `${c.accent} rotate-45 text-white`
                                : "bg-slate-100 text-slate-500"
                            }`}
                            aria-hidden="true"
                          >
                            +
                          </span>
                        </button>

                        {isOpen && (
                          <div className="px-2 pb-5">
                            <ol className="space-y-3 rounded-2xl bg-slate-50 p-4">
                              {t.steps.map((s, i) => (
                                <li
                                  key={i}
                                  className="flex gap-3 text-sm leading-6 text-slate-600"
                                >
                                  <span
                                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${c.accent}`}
                                  >
                                    {i + 1}
                                  </span>
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ol>
                            {t.link && (
                              <Link
                                href={t.link.href}
                                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:gap-2 hover:text-blue-800"
                              >
                                {t.link.label} <span aria-hidden="true">→</span>
                              </Link>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}

        {/* ───────── STILL NEED HELP ───────── */}
        <section className="relative mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1736] via-[#12297a] to-blue-700 p-8 text-white shadow-2xl sm:p-12">
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-sky-400/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-violet-500/30 blur-3xl" />

          <div className="relative text-center">
            <h2 className="text-2xl font-extrabold sm:text-4xl">
              Still need help?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100/85">
              We are happy to help. Pick whatever is easiest for you.
            </p>
          </div>

          <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-5 text-center ring-1 ring-white/20 backdrop-blur">
              <div className="text-3xl">🤖</div>
              <p className="mt-2 font-bold">Ask Bexi AI</p>
              <p className="mt-1 text-sm text-blue-100/80">
                Tap the chat bubble at the bottom right.
              </p>
            </div>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="rounded-2xl bg-white/10 p-5 text-center ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20"
            >
              <div className="text-3xl">✉️</div>
              <p className="mt-2 font-bold">Email us</p>
              <p className="mt-1 break-all text-sm text-blue-100/80">
                {SUPPORT_EMAIL}
              </p>
            </a>
            <Link
              href="/tutorials"
              className="rounded-2xl bg-white/10 p-5 text-center ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20"
            >
              <div className="text-3xl">🎬</div>
              <p className="mt-2 font-bold">Watch tutorials</p>
              <p className="mt-1 text-sm text-blue-100/80">
                Short step-by-step guides.
              </p>
            </Link>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          Button names may look slightly different as we keep improving
          Buildexom.
        </p>
      </div>
    </>
  );
}