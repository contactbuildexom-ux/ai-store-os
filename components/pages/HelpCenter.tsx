"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

// 👉 Apni real support email yahan likho
const SUPPORT_EMAIL = "support@yourdomain.com";

type IconName =
  | "rocket"
  | "bag"
  | "chat"
  | "qr"
  | "card"
  | "bot"
  | "mail"
  | "play"
  | "search";

type Topic = {
  q: string;
  steps: string[];
  link?: { label: string; href: string };
};
type Category = {
  id: string;
  icon: IconName;
  title: string;
  blurb: string;
  grad: string;
  accent: string;
  topics: Topic[];
};

/* ───────────────────────── ICONS ───────────────────────── */

function Icon({
  name,
  className = "h-6 w-6",
}: {
  name: IconName;
  className?: string;
}) {
  let paths: React.ReactNode;
  switch (name) {
    case "rocket":
      paths = (
        <>
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </>
      );
      break;
    case "bag":
      paths = (
        <>
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </>
      );
      break;
    case "chat":
      paths = (
        <>
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
          <path d="M8 12h.01" />
          <path d="M12 12h.01" />
          <path d="M16 12h.01" />
        </>
      );
      break;
    case "qr":
      paths = (
        <>
          <rect width="5" height="5" x="3" y="3" rx="1" />
          <rect width="5" height="5" x="16" y="3" rx="1" />
          <rect width="5" height="5" x="3" y="16" rx="1" />
          <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
          <path d="M21 21v.01" />
          <path d="M12 7v3a2 2 0 0 1-2 2H7" />
          <path d="M3 12h.01" />
          <path d="M12 3h.01" />
          <path d="M12 16v.01" />
          <path d="M16 12h1" />
          <path d="M21 12v.01" />
          <path d="M12 21v-1" />
        </>
      );
      break;
    case "card":
      paths = (
        <>
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <path d="M2 10h20" />
          <path d="M6 15h4" />
        </>
      );
      break;
    case "bot":
      paths = (
        <>
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M15 13v2" />
          <path d="M9 13v2" />
        </>
      );
      break;
    case "mail":
      paths = (
        <>
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </>
      );
      break;
    case "play":
      paths = (
        <>
          <circle cx="12" cy="12" r="10" />
          <polygon points="10 8 16 12 10 16 10 8" />
        </>
      );
      break;
    case "search":
      paths = (
        <>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </>
      );
      break;
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths}
    </svg>
  );
}

/* ───────────────────────── DATA ───────────────────────── */

const CATEGORIES: Category[] = [
  {
    id: "getting-started",
    icon: "rocket",
    title: "Getting Started",
    blurb: "Create your account and launch your first store",
    grad: "from-[#2196f3] to-[#1565c0]",
    accent: "bg-[#1976d2]",
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
    icon: "bag",
    title: "Products",
    blurb: "Add products, photos, descriptions and categories",
    grad: "from-[#1976d2] to-[#0d47a1]",
    accent: "bg-[#1565c0]",
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
    icon: "chat",
    title: "Orders & WhatsApp",
    blurb: "Receive and manage orders on WhatsApp",
    grad: "from-[#1646f5] to-[#0b2a9c]",
    accent: "bg-[#1646f5]",
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
    icon: "qr",
    title: "Store QR Code",
    blurb: "Create, style and download your store QR code",
    grad: "from-[#0288d1] to-[#01579b]",
    accent: "bg-[#0288d1]",
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
    icon: "card",
    title: "Plans & Account",
    blurb: "Plans, upgrades and how to reach support",
    grad: "from-[#1565c0] to-[#0b2545]",
    accent: "bg-[#0b2545]",
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

/* ───────────────────────── PAGE ───────────────────────── */

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
      {/* ───────── HERO (light, site ke background ke sath match) ───────── */}
      <section className="relative pb-12 pt-14 sm:pb-16 sm:pt-20">
        <div className="relative mx-auto max-w-[1200px] px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1976d2] shadow-sm ring-1 ring-blue-100">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1976d2]" />
            Help Center
          </span>

          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-[#0b2545] sm:text-5xl lg:text-6xl">
            How can we{" "}
            <span className="bg-gradient-to-r from-[#1976d2] to-[#0288d1] bg-clip-text text-transparent">
              help you?
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            Guides to build and manage your store.
          </p>

          {/* Search */}
          <div className="relative mx-auto mt-8 max-w-xl">
            <Icon
              name="search"
              className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search guides, e.g. WhatsApp, QR, publish"
              aria-label="Search help articles"
              className="w-full rounded-full border border-blue-100 bg-white py-4 pl-14 pr-5 text-sm text-slate-800 shadow-xl shadow-blue-500/10 outline-none transition placeholder:text-slate-400 focus:border-[#1976d2] focus:ring-4 focus:ring-blue-200/70 sm:text-base"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-slate-500">Popular:</span>
            {POPULAR.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setQuery(p)}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#1976d2] shadow-sm ring-1 ring-blue-100 transition duration-200 hover:-translate-y-0.5 hover:bg-[#1976d2] hover:text-white hover:shadow-md active:scale-95"
              >
                {p}
              </button>
            ))}
          </div>

          <p className="mt-6 text-sm text-slate-500">
            <b className="text-[#0b2545]">{totalTopics}</b> guides across{" "}
            <b className="text-[#0b2545]">{CATEGORIES.length}</b> topics
          </p>
        </div>
      </section>

      <div className="relative mx-auto max-w-[1200px] px-4 pb-20 sm:px-6">
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
                className="group flex flex-col items-center rounded-2xl border border-blue-100 bg-white p-4 text-center shadow-lg shadow-blue-900/10 transition duration-300 hover:-translate-y-2 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/20 sm:p-5"
              >
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${c.grad} text-white shadow-md transition duration-300 group-hover:-rotate-6 group-hover:scale-110`}
                >
                  <Icon name={c.icon} className="h-7 w-7" />
                </span>
                <span className="mt-3 text-sm font-bold text-[#0b2545] sm:text-base">
                  {c.title}
                </span>
                <span className="mt-1 hidden text-xs leading-5 text-slate-500 sm:block">
                  {c.blurb}
                </span>
                <span className="mt-2 rounded-full bg-[#e6f1ff] px-2.5 py-0.5 text-[11px] font-semibold text-[#1976d2]">
                  {c.topics.length} guides
                </span>
              </a>
            ))}
          </nav>
        )}

        {/* ───────── SECTIONS ───────── */}
        {results.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl border border-dashed border-blue-200 bg-white p-10 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f1ff] text-[#1976d2]">
              <Icon name="search" className="h-7 w-7" />
            </span>
            <p className="mt-4 text-lg font-bold text-[#0b2545]">
              No results for “{query}”
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try a different word, or ask Bexi AI in the chat at the bottom
              right.
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-5 rounded-full bg-[#1976d2] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition duration-200 hover:-translate-y-0.5 hover:bg-[#1565c0] active:scale-95"
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
                className="scroll-mt-28 overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-md shadow-blue-900/5 transition duration-300 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div
                  className={`flex items-center gap-4 bg-gradient-to-r ${c.grad} px-5 py-4 text-white sm:px-6`}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30">
                    <Icon name={c.icon} className="h-6 w-6" />
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

                <ul className="divide-y divide-blue-50 px-3 py-2 sm:px-4">
                  {c.topics.map((t) => {
                    const key = `${c.id}:${t.q}`;
                    const isOpen = searching || open === key;
                    return (
                      <li key={key}>
                        <button
                          type="button"
                          onClick={() => setOpen(open === key ? null : key)}
                          aria-expanded={isOpen}
                          className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-4 text-left text-sm font-semibold text-[#0b2545] transition hover:bg-[#f3f8ff] hover:text-[#1976d2] sm:text-base"
                        >
                          <span>{t.q}</span>
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base font-bold transition duration-300 ${
                              isOpen
                                ? `${c.accent} rotate-45 text-white`
                                : "bg-[#e6f1ff] text-[#1976d2]"
                            }`}
                            aria-hidden="true"
                          >
                            +
                          </span>
                        </button>

                        {isOpen && (
                          <div className="px-2 pb-5">
                            <ol className="space-y-3 rounded-2xl bg-[#f3f8ff] p-4 ring-1 ring-blue-100">
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
                                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#1976d2] transition-all hover:gap-2 hover:text-[#0b2545]"
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
        <section
          className="relative mt-16 overflow-hidden rounded-3xl p-8 text-white shadow-2xl shadow-blue-900/30 sm:p-12"
          style={{
            background:
              "linear-gradient(135deg, #0b2545 0%, #0d3068 50%, #1976d2 100%)",
          }}
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-sky-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-blue-400/25 blur-3xl" />

          <div className="relative text-center">
            <h2 className="text-2xl font-extrabold sm:text-4xl">
              Still need help?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100/85">
              We are happy to help. Pick whatever is easiest for you.
            </p>
          </div>

          <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
            <div className="group rounded-2xl bg-white/10 p-5 text-center ring-1 ring-white/20 backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/15">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-sky-200 transition duration-300 group-hover:scale-110">
                <Icon name="bot" className="h-6 w-6" />
              </span>
              <p className="mt-3 font-bold">Ask Bexi AI</p>
              <p className="mt-1 text-sm text-blue-100/80">
                Tap the chat bubble at the bottom right.
              </p>
            </div>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="group rounded-2xl bg-white/10 p-5 text-center ring-1 ring-white/20 backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/20"
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-sky-200 transition duration-300 group-hover:scale-110">
                <Icon name="mail" className="h-6 w-6" />
              </span>
              <p className="mt-3 font-bold">Email us</p>
              <p className="mt-1 break-all text-sm text-blue-100/80">
                {SUPPORT_EMAIL}
              </p>
            </a>
            <Link
              href="/tutorials"
              className="group rounded-2xl bg-white/10 p-5 text-center ring-1 ring-white/20 backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/20"
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-sky-200 transition duration-300 group-hover:scale-110">
                <Icon name="play" className="h-6 w-6" />
              </span>
              <p className="mt-3 font-bold">Watch tutorials</p>
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