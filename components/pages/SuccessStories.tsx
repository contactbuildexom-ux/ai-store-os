"use client";

import { useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/landing/PageShell";

type Story = {
  id: string;
  name: string; // owner name
  business: string; // store / business name
  category: string; // e.g. "Clothing", "Jewelry"
  location?: string; // e.g. "Lahore"
  quote: string; // short quote from the owner
  challenge: string; // what problem they had
  result: string; // what changed after using Buildexom
};

/*
  ───────── REAL STORIES YAHAN ADD KAREIN ─────────
  Sirf asli customers ki stories, unki permission ke saath.
  Neeche example ka format hai. Isko copy karke list mein
  daalein aur apni asli details likhein.

  {
    id: "story-1",
    name: "Owner ka naam",
    business: "Store ka naam",
    category: "Clothing",
    location: "Lahore",
    quote: "Owner ne jo khud kaha",
    challenge: "Pehle kya masla tha",
    result: "Buildexom ke baad kya badla",
  },
*/
const STORIES: Story[] = [];

/* ───────────────────────── ICONS ───────────────────────── */

type IconName =
  | "star"
  | "book"
  | "pen"
  | "store"
  | "puzzle"
  | "rocket"
  | "sprout"
  | "build"
  | "message"
  | "shield"
  | "check"
  | "arrowRight";

const ICONS: Record<IconName, React.ReactNode> = {
  star: (
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
  ),
  book: (
    <>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </>
  ),
  pen: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
  store: (
    <>
      <path d="m2 7 1.5-4h17L22 7" />
      <path d="M2 7h20v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0Z" />
      <path d="M4 12v9h16v-9" />
      <path d="M10 21v-5h4v5" />
    </>
  ),
  puzzle: (
    <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z" />
  ),
  rocket: (
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </>
  ),
  sprout: (
    <>
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8Z" />
      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2Z" />
    </>
  ),
  build: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </>
  ),
  message: (
    <>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      <path d="M8 12h.01" />
      <path d="M12 12h.01" />
      <path d="M16 12h.01" />
    </>
  ),
  shield: (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  check: <path d="M4 12.5 9.5 18 20 6.5" />,
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
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

const STORY_PARTS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "store",
    title: "The business",
    text: "Who the owner is, what they sell and who their customers are.",
  },
  {
    icon: "puzzle",
    title: "The challenge",
    text: "What was hard before they had an online store.",
  },
  {
    icon: "rocket",
    title: "What they did",
    text: "How they built and launched their store with Buildexom.",
  },
  {
    icon: "sprout",
    title: "What changed",
    text: "The real difference it made, in the owner's own words.",
  },
];

const SHARE_STEPS: { t: string; d: string; icon: IconName }[] = [
  {
    t: "Build and publish your store",
    d: "Create your store with Buildexom and share your store link.",
    icon: "build",
  },
  {
    t: "Tell us your experience",
    d: "Write a few lines about your business, what was hard and what changed.",
    icon: "pen",
  },
  {
    t: "We review it with you",
    d: "We check the details with you so every word in your story is accurate.",
    icon: "message",
  },
  {
    t: "You approve, then we publish",
    d: "Your story goes live only after you say yes.",
    icon: "check",
  },
];

/* ───────────────────────── SMALL PARTS ───────────────────────── */

function SectionTitle({
  icon,
  title,
  sub,
}: {
  icon: IconName;
  title: string;
  sub: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2196f3] to-[#1565c0] text-white shadow-md">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <div>
        <h2 className="text-2xl font-extrabold text-[#0b2545] sm:text-3xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">{sub}</p>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

/* ───────────────────────── PAGE ───────────────────────── */

export default function SuccessStories() {
  const [active, setActive] = useState("All");

  const categories = [
    "All",
    ...Array.from(new Set(STORIES.map((s) => s.category))),
  ];
  const visible =
    active === "All" ? STORIES : STORIES.filter((s) => s.category === active);

  return (
    <PageShell>
      {/* ───────── HERO (light blue) ───────── */}
      <section className="relative pb-12 pt-10 sm:pb-16 sm:pt-14">
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1976d2] shadow-sm ring-1 ring-blue-100">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1976d2]" />
              Success Stories
            </span>

            <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-[#0b2545] sm:text-5xl lg:text-6xl">
              Real businesses,{" "}
              <span className="bg-gradient-to-r from-[#1976d2] to-[#0288d1] bg-clip-text text-transparent">
                real stories
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
              See how business owners turn their ideas into online stores with
              Buildexom.
            </p>
          </div>
        </div>
      </section>

      <div className="relative mx-auto max-w-[1200px] space-y-8 px-4 pb-20 sm:px-6">
        {/* ───────── STORIES ───────── */}
        <section
          id="stories"
          className="scroll-mt-32 rounded-3xl border border-blue-100 bg-white p-6 shadow-xl shadow-blue-900/10 sm:p-8"
        >
          <SectionTitle
            icon="star"
            title="Customer stories"
            sub="In their own words."
          />

          {STORIES.length > 0 ? (
            <>
              {categories.length > 2 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setActive(c)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition duration-200 active:scale-95 ${
                        active === c
                          ? "bg-[#1976d2] text-white shadow-md shadow-blue-400/40"
                          : "bg-[#e6f1ff] text-[#1976d2] hover:bg-[#d3e8ff]"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                {visible.map((s) => (
                  <article
                    key={s.id}
                    className="flex flex-col rounded-2xl border border-blue-100 bg-[#f3f8ff] p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/15"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#2196f3] to-[#1565c0] text-sm font-extrabold text-white shadow-md">
                        {initials(s.name)}
                      </span>
                      <div>
                        <p className="text-base font-bold text-[#0b2545]">
                          {s.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {s.business}
                          {s.location ? ` · ${s.location}` : ""}
                        </p>
                      </div>
                      <span className="ml-auto rounded-full bg-[#e6f1ff] px-3 py-1 text-xs font-bold text-[#1976d2]">
                        {s.category}
                      </span>
                    </div>

                    <p className="mt-4 rounded-xl bg-white p-4 text-sm italic leading-6 text-slate-700 ring-1 ring-blue-100">
                      “{s.quote}”
                    </p>

                    <div className="mt-4 space-y-3 text-sm leading-6">
                      <p>
                        <b className="text-[#0b2545]">Challenge: </b>
                        <span className="text-slate-600">{s.challenge}</span>
                      </p>
                      <p>
                        <b className="text-[#0b2545]">Result: </b>
                        <span className="text-slate-600">{s.result}</span>
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-[#f3f8ff] p-8 text-center sm:p-12">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6f1ff] text-[#1976d2]">
                <Icon name="sprout" className="h-8 w-8" />
              </span>
              <h3 className="mt-4 text-xl font-extrabold text-[#0b2545]">
                Our first stories are on the way
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                We only publish real stories, shared by real business owners
                with their permission. Be one of the first to tell yours.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/user/signup"
                  className="w-full rounded-full bg-[#1976d2] px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-400/40 transition duration-200 hover:-translate-y-0.5 hover:bg-[#1565c0] active:scale-95 sm:w-auto"
                >
                  Build your store
                </Link>
                <a
                  href="#share"
                  className="w-full rounded-full border border-blue-300 px-6 py-3 text-sm font-semibold text-[#1976d2] transition duration-200 hover:-translate-y-0.5 hover:bg-white active:scale-95 sm:w-auto"
                >
                  How to share your story
                </a>
              </div>
            </div>
          )}
        </section>

        {/* ───────── WHAT A STORY INCLUDES ───────── */}
        <section
          id="includes"
          className="scroll-mt-32 rounded-3xl border border-blue-100 bg-white p-6 shadow-md shadow-blue-900/5 sm:p-8"
        >
          <SectionTitle
            icon="book"
            title="What every story includes"
            sub="Simple, honest and easy to read."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STORY_PARTS.map((p) => (
              <div
                key={p.title}
                className="group rounded-2xl bg-[#f3f8ff] p-5 ring-1 ring-blue-100 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/15"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e6f1ff] text-[#1976d2] transition duration-300 group-hover:bg-[#1976d2] group-hover:text-white">
                  <Icon name={p.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-3 text-base font-bold text-[#0b2545]">
                  {p.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ───────── SHARE YOUR STORY ───────── */}
        <section
          id="share"
          className="scroll-mt-32 rounded-3xl border border-blue-100 bg-white p-6 shadow-md shadow-blue-900/5 sm:p-8"
        >
          <SectionTitle
            icon="pen"
            title="Share your story"
            sub="Built a store with Buildexom? We would love to hear from you."
          />
          <ol className="mt-2">
            {SHARE_STEPS.map((s, i) => (
              <li key={s.t} className="relative flex gap-4 pb-7 last:pb-0">
                {i < SHARE_STEPS.length - 1 && (
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

          <p className="mt-6 flex gap-3 rounded-2xl bg-[#e6f1ff] p-4 text-sm leading-6 text-[#0b2545] ring-1 ring-blue-200">
            <Icon
              name="shield"
              className="mt-0.5 h-5 w-5 shrink-0 text-[#1976d2]"
            />
            <span>
              <b>Our promise:</b> we never publish a story without the owner
              approval, and we never change the facts.
            </span>
          </p>
        </section>

        {/* ───────── CTA ───────── */}
        <div
          className="relative overflow-hidden rounded-3xl p-8 text-center text-white shadow-2xl shadow-blue-900/30 sm:p-12"
          style={{
            background:
              "linear-gradient(135deg, #0b2545 0%, #0d3068 50%, #1976d2 100%)",
          }}
        >
          <div className="relative">
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              Your story could be next
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100/85">
              Describe your business and let AI build your store in minutes.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/user/signup"
                className="w-full rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[#0b2545] shadow-xl transition duration-200 hover:-translate-y-0.5 hover:bg-blue-50 active:scale-95 sm:w-auto"
              >
                Get Started Free
              </Link>
              <Link
                href="/ai-guide"
                className="w-full rounded-full border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:scale-95 sm:w-auto"
              >
                Read the AI Guide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}