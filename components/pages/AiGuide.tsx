"use client";

import { useState } from "react";
import Link from "next/link";

const TOC = [
  { id: "builder", icon: "✨", label: "What the AI can do" },
  { id: "prompts", icon: "✍️", label: "Write a good prompt" },
  { id: "editing", icon: "🛠️", label: "Edit what AI created" },
  { id: "chatbot", icon: "🤖", label: "AI chatbot" },
  { id: "tips", icon: "💡", label: "Tips for better results" },
  { id: "limits", icon: "⚖️", label: "What AI can't do yet" },
];

const CAPABILITIES = [
  {
    icon: "🏗️",
    title: "Builds your first store",
    text: "Turns a short description of your business into a complete first version of your store.",
  },
  {
    icon: "🎨",
    title: "Suggests a look",
    text: "Chooses a style, layout and colors that fit the kind of business you described.",
  },
  {
    icon: "📝",
    title: "Writes the text",
    text: "Drafts headings and descriptions so you are not staring at a blank page.",
  },
  {
    icon: "🛍️",
    title: "Drafts product descriptions",
    text: "Gives you a starting description for each product that you can edit.",
  },
  {
    icon: "⚡",
    title: "Saves you time",
    text: "Gets you from an idea to a store you can edit and publish in minutes.",
  },
  {
    icon: "🔄",
    title: "Lets you try again",
    text: "Not happy? Change your description and generate a new version.",
  },
];

const EXAMPLES = [
  {
    id: "candles",
    label: "Handmade candles",
    emoji: "🕯️",
    text: "A store for handmade candles with a clean, minimal design",
  },
  {
    id: "clothing",
    label: "Women's clothing",
    emoji: "👗",
    text: "A clothing store for women with a modern, colorful look",
  },
  {
    id: "decor",
    label: "Home decor",
    emoji: "🏡",
    text: "A home decor store with warm, cozy colors",
  },
  {
    id: "jewelry",
    label: "Jewelry",
    emoji: "💍",
    text: "A jewelry store with an elegant, simple design and soft gold and white colors",
  },
];

const EDIT_STEPS = [
  {
    t: "Review the whole store",
    d: "Scroll through every page and section, on both phone and computer, before you change anything.",
  },
  {
    t: "Fix the text",
    d: "Read every heading and description. Change anything that does not sound like you or is not accurate.",
  },
  {
    t: "Make it yours",
    d: "Upload your logo and adjust colors so the store matches your brand.",
  },
  {
    t: "Add your real products",
    d: "Add your own products, prices and photos. The AI cannot know these, so this part is up to you.",
  },
  {
    t: "Reorder and refine",
    d: "Move sections around so your best products and most important information come first.",
  },
  {
    t: "Preview, then publish",
    d: "Check everything one last time, then publish and share your store link.",
  },
];

const DOS = [
  "Say exactly what you sell",
  "Describe the style: minimal, modern, colorful, cozy",
  "Mention colors you like",
  "Say who your customers are",
  "Try again with small changes",
];

const DONTS = [
  "Write only “make a store”",
  "Mix many different product types",
  "Skip reviewing before you publish",
  "Expect prices or stock to be filled in for you",
  "Give up after the first try",
];

const LIMITS = [
  {
    icon: "🔍",
    title: "It may not be perfect the first time",
    text: "The first version is a starting point. Expect to review and edit it.",
  },
  {
    icon: "💰",
    title: "It does not know your real details",
    text: "Your prices, stock, delivery charges and policies must come from you.",
  },
  {
    icon: "📸",
    title: "It does not take your product photos",
    text: "Clear, honest photos of your real products still need to be uploaded by you.",
  },
  {
    icon: "📄",
    title: "It is not legal or financial advice",
    text: "Always check policies, taxes and legal wording yourself before publishing.",
  },
  {
    icon: "💬",
    title: "The chatbot only knows what you teach it",
    text: "It answers from the business details you provide, so keep them accurate and up to date.",
  },
];

const CHATBOT_FEATURES = [
  {
    icon: "❓",
    t: "Answers common questions",
    d: "Delivery time, charges, payment methods and return rules.",
  },
  {
    icon: "🕒",
    t: "Replies any time",
    d: "Customers get quick answers, even when you are busy or offline.",
  },
  {
    icon: "🎯",
    t: "Learns from your details",
    d: "It answers using the business information you give it.",
  },
];

const CHATBOT_DETAILS = [
  "What you sell and who your customers are",
  "Delivery areas, delivery time and delivery charges",
  "Payment methods you accept",
  "Your return and exchange policy",
  "Your working hours and how to reach you",
];

function SectionTitle({
  icon,
  title,
  sub,
  badge,
}: {
  icon: string;
  title: string;
  sub: string;
  badge?: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-600 text-2xl shadow-md">
        {icon}
      </span>
      <div>
        <h2 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold text-[#0f2350] sm:text-3xl">
          {title}
          {badge && (
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
              {badge}
            </span>
          )}
        </h2>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">{sub}</p>
      </div>
    </div>
  );
}

export default function AiGuide() {
  const [copied, setCopied] = useState<string | null>(null);
  const [product, setProduct] = useState("handmade candles");
  const [style, setStyle] = useState("clean, minimal");
  const [colors, setColors] = useState("soft white and beige");

  const built = `A store for ${product.trim() || "my products"} with a ${
    style.trim() || "modern"
  } design and ${colors.trim() || "simple"} colors`;

  async function copy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1800);
    } catch {
      /* clipboard not available */
    }
  }

  return (
    <>
      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden bg-[#0b1736] pb-28 pt-8 text-white sm:pb-32 sm:pt-10">
        <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-teal-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-violet-500/30 blur-3xl" />
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

        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="mb-8 flex justify-start">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20"
            >
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-x-1"
              >
                ←
              </span>
              Back to Home
            </Link>
          </div>

          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-sky-200 ring-1 ring-white/20 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-300" />
              AI Tools Guide
            </span>

            <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Get the most from{" "}
              <span className="bg-gradient-to-r from-teal-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">
                Buildexom AI
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-blue-100/80 sm:text-lg">
              How to use the AI store builder and the AI chatbot, with simple
              examples you can copy.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-blue-100/80">
              <span>
                <b className="text-white">6</b> short sections
              </span>
              <span>
                <b className="text-white">4</b> prompt examples
              </span>
              <span>
                <b className="text-white">Copy</b> and paste ready
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* mobile chips */}
      <div className="sticky top-[72px] z-30 -mt-6 lg:hidden">
        <div className="mx-4 overflow-x-auto rounded-full border border-slate-200 bg-white/95 p-1.5 shadow-lg backdrop-blur">
          <div className="flex w-max gap-1">
            {TOC.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                {t.icon} {t.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-6 max-w-[1200px] px-4 pb-20 sm:px-6 lg:-mt-12">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* TOC */}
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                On this page
              </p>
              <ol className="mt-3 space-y-1">
                {TOC.map((t, i) => (
                  <li key={t.id}>
                    <a
                      href={`#${t.id}`}
                      className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-blue-700"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-[11px] font-bold text-white">
                        {i + 1}
                      </span>
                      {t.label}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          {/* CONTENT */}
          <div className="min-w-0 space-y-8">
            {/* 1. BUILDER */}
            <section
              id="builder"
              className="scroll-mt-32 rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-8"
            >
              <SectionTitle
                icon="✨"
                title="What the AI store builder can do"
                sub="Your assistant for the first draft of your store."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {CAPABILITIES.map((c) => (
                  <div
                    key={c.title}
                    className="rounded-2xl bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <span className="text-3xl">{c.icon}</span>
                    <h3 className="mt-3 text-base font-bold text-[#0f2350]">
                      {c.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. PROMPTS */}
            <section
              id="prompts"
              className="scroll-mt-32 rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-8"
            >
              <SectionTitle
                icon="✍️"
                title="How to write a good prompt"
                sub="A prompt is just a short description of your store."
              />

              <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 p-5 ring-1 ring-teal-200">
                <p className="text-sm font-bold text-teal-900">
                  The simple formula
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold">
                  {["What you sell", "Style", "Colors", "Who it is for"].map(
                    (p, i) => (
                      <span key={p} className="flex items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1.5 text-teal-800 shadow-sm ring-1 ring-teal-200">
                          {p}
                        </span>
                        {i < 3 && <span className="text-teal-500">+</span>}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Examples */}
              <h3 className="mb-3 mt-8 text-lg font-bold text-[#0f2350]">
                Examples you can copy
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {EXAMPLES.map((e) => (
                  <div
                    key={e.id}
                    className="flex flex-col rounded-2xl border border-slate-200 p-5 transition hover:border-teal-300 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-2 text-sm font-bold text-[#0f2350]">
                      <span className="text-2xl">{e.emoji}</span>
                      {e.label}
                    </div>
                    <p className="mt-3 flex-1 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                      “{e.text}”
                    </p>
                    <button
                      type="button"
                      onClick={() => copy(e.id, e.text)}
                      className={`mt-3 rounded-full px-4 py-2 text-sm font-semibold transition ${
                        copied === e.id
                          ? "bg-emerald-500 text-white"
                          : "bg-teal-600 text-white hover:bg-teal-700"
                      }`}
                    >
                      {copied === e.id ? "✓ Copied" : "Copy prompt"}
                    </button>
                  </div>
                ))}
              </div>

              {/* Prompt builder */}
              <div className="mt-8 rounded-3xl bg-gradient-to-br from-[#0b1736] via-[#12297a] to-blue-700 p-6 text-white shadow-xl sm:p-8">
                <h3 className="text-lg font-extrabold sm:text-xl">
                  🧪 Build your own prompt
                </h3>
                <p className="mt-1 text-sm text-blue-100/80">
                  Fill in the boxes and copy your ready prompt.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <label className="block text-xs font-semibold text-blue-100">
                    What do you sell?
                    <input
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-blue-400/40"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-blue-100">
                    Style
                    <input
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-blue-400/40"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-blue-100">
                    Colors
                    <input
                      value={colors}
                      onChange={(e) => setColors(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-blue-400/40"
                    />
                  </label>
                </div>

                <div className="mt-5 rounded-2xl bg-white/10 p-4 ring-1 ring-white/20">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-200">
                    Your prompt
                  </p>
                  <p className="mt-1 text-sm leading-6 sm:text-base">
                    “{built}”
                  </p>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => copy("builder", built)}
                    className={`rounded-full px-6 py-3 text-sm font-bold transition ${
                      copied === "builder"
                        ? "bg-emerald-400 text-[#0b1736]"
                        : "bg-white text-[#0f2350] hover:scale-105"
                    }`}
                  >
                    {copied === "builder" ? "✓ Copied" : "Copy my prompt"}
                  </button>
                  <Link
                    href="/login"
                    className="rounded-full border border-white/30 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Try it in Buildexom →
                  </Link>
                </div>
              </div>
            </section>

            {/* 3. EDITING */}
            <section
              id="editing"
              className="scroll-mt-32 rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-8"
            >
              <SectionTitle
                icon="🛠️"
                title="How to edit what the AI created"
                sub="The AI gives you a draft. You make it yours."
              />
              <ol className="mt-2">
                {EDIT_STEPS.map((s, i) => (
                  <li key={s.t} className="relative flex gap-4 pb-7 last:pb-0">
                    {i < EDIT_STEPS.length - 1 && (
                      <span
                        className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 bg-slate-200"
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white shadow-md">
                      {i + 1}
                    </span>
                    <div className="pt-1">
                      <h3 className="text-base font-bold text-[#0f2350] sm:text-lg">
                        {s.t}
                      </h3>
                      <p className="mt-1 text-sm leading-7 text-slate-600 sm:text-base">
                        {s.d}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* 4. CHATBOT */}
            <section
              id="chatbot"
              className="scroll-mt-32 rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-8"
            >
              <SectionTitle
                icon="🤖"
                title="Use the AI chatbot to answer customers"
                sub="Your assistant that replies to common customer questions."
                badge="Business plan"
              />

              <div className="grid gap-4 sm:grid-cols-3">
                {CHATBOT_FEATURES.map((c) => (
                  <div key={c.t} className="rounded-2xl bg-slate-50 p-5">
                    <span className="text-3xl">{c.icon}</span>
                    <h3 className="mt-3 text-base font-bold text-[#0f2350]">
                      {c.t}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {c.d}
                    </p>
                  </div>
                ))}
              </div>

              <h3 className="mb-3 mt-8 text-lg font-bold text-[#0f2350]">
                Give your chatbot these details
              </h3>
              <ul className="space-y-3 rounded-2xl bg-slate-50 p-5">
                {CHATBOT_DETAILS.map((x) => (
                  <li
                    key={x}
                    className="flex gap-3 text-sm leading-6 text-slate-700 sm:text-base"
                  >
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[11px] font-bold text-white">
                      ✓
                    </span>
                    {x}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-violet-50 p-5 ring-1 ring-violet-200 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-700">
                  <b className="text-[#0f2350]">
                    Chatbot is on the Business plan.
                  </b>{" "}
                  See the step-by-step setup lesson.
                </p>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href="/tutorials/use-ai-chatbot-for-customer-questions"
                    className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                  >
                    Watch tutorial
                  </Link>
                  <Link
                    href="/#pricing"
                    className="rounded-full border border-violet-300 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-white"
                  >
                    View plans
                  </Link>
                </div>
              </div>
            </section>

            {/* 5. TIPS */}
            <section
              id="tips"
              className="scroll-mt-32 rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-8"
            >
              <SectionTitle
                icon="💡"
                title="Tips to get better results"
                sub="Small changes that make a big difference."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200">
                  <h3 className="flex items-center gap-2 text-base font-extrabold text-emerald-800">
                    ✅ Do
                  </h3>
                  <ul className="mt-3 space-y-2.5">
                    {DOS.map((d) => (
                      <li
                        key={d}
                        className="flex gap-2 text-sm leading-6 text-emerald-950/80"
                      >
                        <span className="text-emerald-600">✓</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-rose-50 p-5 ring-1 ring-rose-200">
                  <h3 className="flex items-center gap-2 text-base font-extrabold text-rose-800">
                    ❌ Avoid
                  </h3>
                  <ul className="mt-3 space-y-2.5">
                    {DONTS.map((d) => (
                      <li
                        key={d}
                        className="flex gap-2 text-sm leading-6 text-rose-950/80"
                      >
                        <span className="text-rose-500">✕</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-rose-500">
                    Too vague
                  </p>
                  <p className="mt-1 text-sm text-slate-700">“Make a store.”</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                    Much better
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    “A store for handmade candles with a clean, minimal design
                    and soft beige colors.”
                  </p>
                </div>
              </div>
            </section>

            {/* 6. LIMITS */}
            <section
              id="limits"
              className="scroll-mt-32 rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-8"
            >
              <SectionTitle
                icon="⚖️"
                title="What the AI can't do yet"
                sub="We believe in being honest, because honesty builds trust."
              />
              <ul className="space-y-3">
                {LIMITS.map((l) => (
                  <li
                    key={l.title}
                    className="flex gap-4 rounded-2xl bg-slate-50 p-5"
                  >
                    <span className="text-3xl">{l.icon}</span>
                    <div>
                      <h3 className="text-base font-bold text-[#0f2350]">
                        {l.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {l.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900 ring-1 ring-amber-200">
                <b>Our advice:</b> use the AI to save time, and use your own
                judgment for the final check. You know your business best.
              </p>
            </section>

            {/* CTA */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1736] via-[#12297a] to-blue-700 p-8 text-center text-white shadow-2xl sm:p-12">
              <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-sky-400/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-violet-500/30 blur-3xl" />
              <div className="relative">
                <h2 className="text-2xl font-extrabold sm:text-3xl">
                  Ready to try Buildexom AI?
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-blue-100/85">
                  Describe your business and let AI build your store in
                  minutes.
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/login"
                    className="w-full rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[#0f2350] shadow-xl transition hover:scale-105 sm:w-auto"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/tutorials"
                    className="w-full rounded-full border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
                  >
                    Watch tutorials
                  </Link>
                </div>
                <Link
                  href="/"
                  className="mt-5 inline-block text-sm font-semibold text-blue-200 hover:text-white"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}