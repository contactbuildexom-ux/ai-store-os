"use client";

import { useState } from "react";
import Link from "next/link";

type IconName =
  | "sparkles"
  | "pen"
  | "wrench"
  | "bot"
  | "bulb"
  | "scale"
  | "layout"
  | "palette"
  | "filetext"
  | "bag"
  | "zap"
  | "refresh"
  | "search"
  | "dollar"
  | "camera"
  | "help"
  | "clock"
  | "target"
  | "check"
  | "x"
  | "flask"
  | "flame"
  | "shirt"
  | "home"
  | "gem"
  | "layers"
  | "type"
  | "image"
  | "list"
  | "rocket"
  | "alert"
  | "chat"
  | "arrowRight"
  | "arrowLeft";

const ICONS: Record<IconName, React.ReactNode> = {
  sparkles: (
    <>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
      <path d="M19 3v4" />
      <path d="M21 5h-4" />
    </>
  ),
  pen: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
  wrench: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
  bot: (
    <>
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </>
  ),
  bulb: (
    <>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </>
  ),
  scale: (
    <>
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </>
  ),
  layout: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </>
  ),
  palette: (
    <>
      <path d="M12 22a10 10 0 1 1 10-10c0 2.5-2 3-4 3h-2a2 2 0 0 0-1.5 3.3c.6.7.5 1.7-.2 2.2-.7.5-1.6.5-2.3.5Z" />
      <circle cx="7.5" cy="10.5" r=".6" />
      <circle cx="12" cy="7.5" r=".6" />
      <circle cx="16.5" cy="10.5" r=".6" />
    </>
  ),
  filetext: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </>
  ),
  bag: (
    <>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </>
  ),
  zap: <path d="M13 2 3 14h9l-1 8 10-12h-9Z" />,
  refresh: (
    <>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  dollar: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 18V6" />
    </>
  ),
  camera: (
    <>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  check: <path d="M4 12.5 9.5 18 20 6.5" />,
  x: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  flask: (
    <>
      <path d="M10 2v7.31" />
      <path d="M14 9.3V1.99" />
      <path d="M8.5 2h7" />
      <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
      <path d="M5.52 16h12.96" />
    </>
  ),
  flame: (
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  ),
  shirt: (
    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
  ),
  home: (
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </>
  ),
  gem: (
    <>
      <path d="M6 3h12l4 6-10 13L2 9Z" />
      <path d="M11 3 8 9l4 13 4-13-3-6" />
      <path d="M2 9h20" />
    </>
  ),
  layers: (
    <>
      <path d="m12 2 10 5-10 5L2 7Z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </>
  ),
  type: (
    <>
      <path d="M4 7V4h16v3" />
      <path d="M9 20h6" />
      <path d="M12 4v16" />
    </>
  ),
  image: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21" />
    </>
  ),
  list: (
    <>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </>
  ),
  rocket: (
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </>
  ),
  alert: (
    <>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </>
  ),
  chat: (
    <>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      <path d="M8 12h.01" />
      <path d="M12 12h.01" />
      <path d="M16 12h.01" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </>
  ),
};

function Icon({
  name,
  className = "h-6 w-6",
  stroke = 1.7,
}: {
  name: IconName;
  className?: string;
  stroke?: number;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

/* ───────────────────────── DATA ───────────────────────── */

const TOC: { id: string; icon: IconName; label: string }[] = [
  { id: "builder", icon: "sparkles", label: "What the AI can do" },
  { id: "prompts", icon: "pen", label: "Write a good prompt" },
  { id: "editing", icon: "wrench", label: "Edit what AI created" },
  { id: "chatbot", icon: "bot", label: "AI chatbot" },
  { id: "tips", icon: "bulb", label: "Tips for better results" },
  { id: "limits", icon: "scale", label: "What AI can't do yet" },
];

const CAPABILITIES: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "layout",
    title: "Builds your first store",
    text: "Turns a short description of your business into a complete first version of your store.",
  },
  {
    icon: "palette",
    title: "Suggests a look",
    text: "Chooses a style, layout and colors that fit the kind of business you described.",
  },
  {
    icon: "filetext",
    title: "Writes the text",
    text: "Drafts headings and descriptions so you are not staring at a blank page.",
  },
  {
    icon: "bag",
    title: "Drafts product descriptions",
    text: "Gives you a starting description for each product that you can edit.",
  },
  {
    icon: "zap",
    title: "Saves you time",
    text: "Gets you from an idea to a store you can edit and publish in minutes.",
  },
  {
    icon: "refresh",
    title: "Lets you try again",
    text: "Not happy? Change your description and generate a new version.",
  },
];

const EXAMPLES: { id: string; label: string; icon: IconName; text: string }[] =
  [
    {
      id: "candles",
      label: "Handmade candles",
      icon: "flame",
      text: "A store for handmade candles with a clean, minimal design",
    },
    {
      id: "clothing",
      label: "Women's clothing",
      icon: "shirt",
      text: "A clothing store for women with a modern, colorful look",
    },
    {
      id: "decor",
      label: "Home decor",
      icon: "home",
      text: "A home decor store with warm, cozy colors",
    },
    {
      id: "jewelry",
      label: "Jewelry",
      icon: "gem",
      text: "A jewelry store with an elegant, simple design and soft gold and white colors",
    },
  ];

const EDIT_STEPS: { t: string; d: string; icon: IconName }[] = [
  {
    t: "Review the whole store",
    d: "Scroll through every page and section, on both phone and computer, before you change anything.",
    icon: "layers",
  },
  {
    t: "Fix the text",
    d: "Read every heading and description. Change anything that does not sound like you or is not accurate.",
    icon: "type",
  },
  {
    t: "Make it yours",
    d: "Upload your logo and adjust colors so the store matches your brand.",
    icon: "image",
  },
  {
    t: "Add your real products",
    d: "Add your own products, prices and photos. The AI cannot know these, so this part is up to you.",
    icon: "bag",
  },
  {
    t: "Reorder and refine",
    d: "Move sections around so your best products and most important information come first.",
    icon: "list",
  },
  {
    t: "Preview, then publish",
    d: "Check everything one last time, then publish and share your store link.",
    icon: "rocket",
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

const LIMITS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "search",
    title: "It may not be perfect the first time",
    text: "The first version is a starting point. Expect to review and edit it.",
  },
  {
    icon: "dollar",
    title: "It does not know your real details",
    text: "Your prices, stock, delivery charges and policies must come from you.",
  },
  {
    icon: "camera",
    title: "It does not take your product photos",
    text: "Clear, honest photos of your real products still need to be uploaded by you.",
  },
  {
    icon: "filetext",
    title: "It is not legal or financial advice",
    text: "Always check policies, taxes and legal wording yourself before publishing.",
  },
  {
    icon: "chat",
    title: "The chatbot only knows what you teach it",
    text: "It answers from the business details you provide, so keep them accurate and up to date.",
  },
];

const CHATBOT_FEATURES: { icon: IconName; t: string; d: string }[] = [
  {
    icon: "help",
    t: "Answers common questions",
    d: "Delivery time, charges, payment methods and return rules.",
  },
  {
    icon: "clock",
    t: "Replies any time",
    d: "Customers get quick answers, even when you are busy or offline.",
  },
  {
    icon: "target",
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

/* ───────────────────────── SMALL PARTS ───────────────────────── */

function SectionTitle({
  icon,
  title,
  sub,
  badge,
}: {
  icon: IconName;
  title: string;
  sub: string;
  badge?: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2196f3] to-[#1565c0] text-white shadow-md">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <div>
        <h2 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold text-[#0b2545] sm:text-3xl">
          {title}
          {badge && (
            <span className="rounded-full bg-[#e6f1ff] px-3 py-1 text-xs font-bold text-[#1976d2]">
              {badge}
            </span>
          )}
        </h2>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">{sub}</p>
      </div>
    </div>
  );
}

function IconTile({ name }: { name: IconName }) {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e6f1ff] text-[#1976d2] transition duration-300 group-hover:bg-[#1976d2] group-hover:text-white">
      <Icon name={name} className="h-6 w-6" />
    </span>
  );
}

/* ───────────────────────── PAGE ───────────────────────── */

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
      {/* ───────── HERO (light blue) ───────── */}
      <section className="relative pb-12 pt-8 sm:pb-16 sm:pt-10">
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="mb-8 flex justify-start">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0b2545] shadow-sm ring-1 ring-blue-100 transition duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
            >
              <Icon
                name="arrowLeft"
                className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
                stroke={2}
              />
              Back to Home
            </Link>
          </div>

          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1976d2] shadow-sm ring-1 ring-blue-100">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1976d2]" />
              AI Tools Guide
            </span>

            <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-[#0b2545] sm:text-5xl lg:text-6xl">
              Get the most from{" "}
              <span className="bg-gradient-to-r from-[#1976d2] to-[#0288d1] bg-clip-text text-transparent">
                Buildexom AI
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
              How to use the AI store builder and the AI chatbot, with simple
              examples you can copy.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-500">
              <span>
                <b className="text-[#0b2545]">6</b> short sections
              </span>
              <span>
                <b className="text-[#0b2545]">4</b> prompt examples
              </span>
              <span>
                <b className="text-[#0b2545]">Copy</b> and paste ready
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* mobile chips */}
      <div className="sticky top-[72px] z-30 mb-6 lg:hidden">
        <div className="mx-4 overflow-x-auto rounded-full border border-blue-100 bg-white/95 p-1.5 shadow-lg backdrop-blur">
          <div className="flex w-max gap-1">
            {TOC.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-[#0b2545] transition hover:bg-[#e6f1ff]"
              >
                <Icon name={t.icon} className="h-3.5 w-3.5 text-[#1976d2]" />
                {t.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4 pb-20 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* TOC */}
          <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-xl shadow-blue-900/10">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                On this page
              </p>
              <ol className="mt-3 space-y-1">
                {TOC.map((t) => (
                  <li key={t.id}>
                    <a
                      href={`#${t.id}`}
                      className="group flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-[#0b2545] transition hover:bg-[#e6f1ff] hover:text-[#1976d2]"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e6f1ff] text-[#1976d2] transition duration-300 group-hover:bg-[#1976d2] group-hover:text-white">
                        <Icon name={t.icon} className="h-4 w-4" />
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
              className="scroll-mt-32 rounded-3xl border border-blue-100 bg-white p-6 shadow-md shadow-blue-900/5 sm:p-8"
            >
              <SectionTitle
                icon="sparkles"
                title="What the AI store builder can do"
                sub="Your assistant for the first draft of your store."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {CAPABILITIES.map((c) => (
                  <div
                    key={c.title}
                    className="group rounded-2xl bg-[#f3f8ff] p-5 ring-1 ring-blue-100 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/15"
                  >
                    <IconTile name={c.icon} />
                    <h3 className="mt-3 text-base font-bold text-[#0b2545]">
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
              className="scroll-mt-32 rounded-3xl border border-blue-100 bg-white p-6 shadow-md shadow-blue-900/5 sm:p-8"
            >
              <SectionTitle
                icon="pen"
                title="How to write a good prompt"
                sub="A prompt is just a short description of your store."
              />

              <div className="rounded-2xl bg-[#e6f1ff] p-5 ring-1 ring-blue-200">
                <p className="text-sm font-bold text-[#0b2545]">
                  The simple formula
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold">
                  {["What you sell", "Style", "Colors", "Who it is for"].map(
                    (p, i) => (
                      <span key={p} className="flex items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1.5 text-[#1976d2] shadow-sm ring-1 ring-blue-200">
                          {p}
                        </span>
                        {i < 3 && <span className="text-[#1976d2]">+</span>}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Examples */}
              <h3 className="mb-3 mt-8 text-lg font-bold text-[#0b2545]">
                Examples you can copy
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {EXAMPLES.map((e) => (
                  <div
                    key={e.id}
                    className="group flex flex-col rounded-2xl border border-blue-100 p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/15"
                  >
                    <div className="flex items-center gap-3 text-sm font-bold text-[#0b2545]">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f1ff] text-[#1976d2] transition duration-300 group-hover:bg-[#1976d2] group-hover:text-white">
                        <Icon name={e.icon} className="h-5 w-5" />
                      </span>
                      {e.label}
                    </div>
                    <p className="mt-3 flex-1 rounded-xl bg-[#f3f8ff] p-3 text-sm leading-6 text-slate-700">
                      “{e.text}”
                    </p>
                    <button
                      type="button"
                      onClick={() => copy(e.id, e.text)}
                      className={`mt-3 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 active:scale-95 ${
                        copied === e.id
                          ? "bg-[#0b2545]"
                          : "bg-[#1976d2] hover:bg-[#1565c0]"
                      }`}
                    >
                      {copied === e.id && (
                        <Icon name="check" className="h-4 w-4" stroke={2.5} />
                      )}
                      {copied === e.id ? "Copied" : "Copy prompt"}
                    </button>
                  </div>
                ))}
              </div>

              {/* Prompt builder */}
              <div
                className="mt-8 rounded-3xl p-6 text-white shadow-xl shadow-blue-900/20 sm:p-8"
                style={{
                  background:
                    "linear-gradient(135deg, #0b2545 0%, #0d3068 50%, #1976d2 100%)",
                }}
              >
                <h3 className="flex items-center gap-2 text-lg font-extrabold sm:text-xl">
                  <Icon name="flask" className="h-5 w-5 text-sky-200" />
                  Build your own prompt
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
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-sky-300/50"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-blue-100">
                    Style
                    <input
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-sky-300/50"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-blue-100">
                    Colors
                    <input
                      value={colors}
                      onChange={(e) => setColors(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-sky-300/50"
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
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition duration-200 hover:-translate-y-0.5 active:scale-95 ${
                      copied === "builder"
                        ? "bg-sky-300 text-[#0b2545]"
                        : "bg-white text-[#0b2545] hover:bg-blue-50"
                    }`}
                  >
                    {copied === "builder" && (
                      <Icon name="check" className="h-4 w-4" stroke={2.5} />
                    )}
                    {copied === "builder" ? "Copied" : "Copy my prompt"}
                  </button>
                  <Link
                    href="/login?mode=signup"
                    className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-center text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:scale-95"
                  >
                    Try it in Buildexom
                    <Icon
                      name="arrowRight"
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      stroke={2}
                    />
                  </Link>
                </div>
              </div>
            </section>

            {/* 3. EDITING */}
            <section
              id="editing"
              className="scroll-mt-32 rounded-3xl border border-blue-100 bg-white p-6 shadow-md shadow-blue-900/5 sm:p-8"
            >
              <SectionTitle
                icon="wrench"
                title="How to edit what the AI created"
                sub="The AI gives you a draft. You make it yours."
              />
              <ol className="mt-2">
                {EDIT_STEPS.map((s, i) => (
                  <li key={s.t} className="relative flex gap-4 pb-7 last:pb-0">
                    {i < EDIT_STEPS.length - 1 && (
                      <span
                        className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 bg-blue-100"
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1976d2] text-white shadow-md shadow-blue-400/40">
                      <Icon name={s.icon} className="h-5 w-5" />
                    </span>
                    <div className="pt-1">
                      <h3 className="text-base font-bold text-[#0b2545] sm:text-lg">
                        <span className="mr-2 text-[#1976d2]">{i + 1}.</span>
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
              className="scroll-mt-32 rounded-3xl border border-blue-100 bg-white p-6 shadow-md shadow-blue-900/5 sm:p-8"
            >
              <SectionTitle
                icon="bot"
                title="Use the AI chatbot to answer customers"
                sub="Your assistant that replies to common customer questions."
                badge="Business plan"
              />

              <div className="grid gap-4 sm:grid-cols-3">
                {CHATBOT_FEATURES.map((c) => (
                  <div
                    key={c.t}
                    className="group rounded-2xl bg-[#f3f8ff] p-5 ring-1 ring-blue-100 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/15"
                  >
                    <IconTile name={c.icon} />
                    <h3 className="mt-3 text-base font-bold text-[#0b2545]">
                      {c.t}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {c.d}
                    </p>
                  </div>
                ))}
              </div>

              <h3 className="mb-3 mt-8 text-lg font-bold text-[#0b2545]">
                Give your chatbot these details
              </h3>
              <ul className="space-y-3 rounded-2xl bg-[#f3f8ff] p-5 ring-1 ring-blue-100">
                {CHATBOT_DETAILS.map((x) => (
                  <li
                    key={x}
                    className="flex gap-3 text-sm leading-6 text-slate-700 sm:text-base"
                  >
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1976d2] text-white">
                      <Icon name="check" className="h-3 w-3" stroke={3} />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-[#e6f1ff] p-5 ring-1 ring-blue-200 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-700">
                  <b className="text-[#0b2545]">
                    Chatbot is on the Business plan.
                  </b>{" "}
                  See the step-by-step setup lesson.
                </p>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href="/tutorials/use-ai-chatbot-for-customer-questions"
                    className="rounded-full bg-[#1976d2] px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#1565c0] active:scale-95"
                  >
                    Watch tutorial
                  </Link>
                  <Link
                    href="/#pricing"
                    className="rounded-full border border-blue-300 px-4 py-2 text-sm font-semibold text-[#1976d2] transition duration-200 hover:-translate-y-0.5 hover:bg-white active:scale-95"
                  >
                    View plans
                  </Link>
                </div>
              </div>
            </section>

            {/* 5. TIPS */}
            <section
              id="tips"
              className="scroll-mt-32 rounded-3xl border border-blue-100 bg-white p-6 shadow-md shadow-blue-900/5 sm:p-8"
            >
              <SectionTitle
                icon="bulb"
                title="Tips to get better results"
                sub="Small changes that make a big difference."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#e6f1ff] p-5 ring-1 ring-blue-200">
                  <h3 className="flex items-center gap-2 text-base font-extrabold text-[#0b2545]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1976d2] text-white">
                      <Icon name="check" className="h-3.5 w-3.5" stroke={3} />
                    </span>
                    Do
                  </h3>
                  <ul className="mt-3 space-y-2.5">
                    {DOS.map((d) => (
                      <li
                        key={d}
                        className="flex gap-2 text-sm leading-6 text-slate-700"
                      >
                        <Icon
                          name="check"
                          className="mt-1 h-4 w-4 shrink-0 text-[#1976d2]"
                          stroke={2.5}
                        />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-slate-100 p-5 ring-1 ring-slate-200">
                  <h3 className="flex items-center gap-2 text-base font-extrabold text-[#0b2545]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-500 text-white">
                      <Icon name="x" className="h-3.5 w-3.5" stroke={3} />
                    </span>
                    Avoid
                  </h3>
                  <ul className="mt-3 space-y-2.5">
                    {DONTS.map((d) => (
                      <li
                        key={d}
                        className="flex gap-2 text-sm leading-6 text-slate-700"
                      >
                        <Icon
                          name="x"
                          className="mt-1 h-4 w-4 shrink-0 text-slate-500"
                          stroke={2.5}
                        />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f3f8ff] p-5 ring-1 ring-blue-100">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Too vague
                  </p>
                  <p className="mt-1 text-sm text-slate-700">“Make a store.”</p>
                </div>
                <div className="rounded-2xl bg-[#f3f8ff] p-5 ring-1 ring-blue-100">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#1976d2]">
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
              className="scroll-mt-32 rounded-3xl border border-blue-100 bg-white p-6 shadow-md shadow-blue-900/5 sm:p-8"
            >
              <SectionTitle
                icon="scale"
                title="What the AI can't do yet"
                sub="We believe in being honest, because honesty builds trust."
              />
              <ul className="space-y-3">
                {LIMITS.map((l) => (
                  <li
                    key={l.title}
                    className="group flex gap-4 rounded-2xl bg-[#f3f8ff] p-5 ring-1 ring-blue-100 transition duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-500/10"
                  >
                    <IconTile name={l.icon} />
                    <div>
                      <h3 className="text-base font-bold text-[#0b2545]">
                        {l.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {l.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-5 flex gap-3 rounded-2xl bg-[#e6f1ff] p-4 text-sm leading-6 text-[#0b2545] ring-1 ring-blue-200">
                <Icon
                  name="alert"
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#1976d2]"
                />
                <span>
                  <b>Our advice:</b> use the AI to save time, and use your own
                  judgment for the final check. You know your business best.
                </span>
              </p>
            </section>

            {/* CTA */}
            <div
              className="relative overflow-hidden rounded-3xl p-8 text-center text-white shadow-2xl shadow-blue-900/30 sm:p-12"
              style={{
                background:
                  "linear-gradient(135deg, #0b2545 0%, #0d3068 50%, #1976d2 100%)",
              }}
            >
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
                    href="/login?mode=signup"
                    className="w-full rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[#0b2545] shadow-xl transition duration-200 hover:-translate-y-0.5 hover:bg-blue-50 active:scale-95 sm:w-auto"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/tutorials"
                    className="w-full rounded-full border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:scale-95 sm:w-auto"
                  >
                    Watch tutorials
                  </Link>
                </div>
                <Link
                  href="/"
                  className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-200 transition hover:text-white"
                >
                  <Icon
                    name="arrowLeft"
                    className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
                    stroke={2}
                  />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}