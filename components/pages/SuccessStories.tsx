"use client";

import { useState } from "react";
import Link from "next/link";

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

const STORY_PARTS = [
  {
    icon: "🏪",
    title: "The business",
    text: "Who the owner is, what they sell and who their customers are.",
  },
  {
    icon: "🧩",
    title: "The challenge",
    text: "What was hard before they had an online store.",
  },
  {
    icon: "🚀",
    title: "What they did",
    text: "How they built and launched their store with Buildexom.",
  },
  {
    icon: "🌱",
    title: "What changed",
    text: "The real difference it made, in the owner's own words.",
  },
];

const SHARE_STEPS = [
  {
    t: "Build and publish your store",
    d: "Create your store with Buildexom and share your store link.",
  },
  {
    t: "Tell us your experience",
    d: "Write a few lines about your business, what was hard and what changed.",
  },
  {
    t: "We review it with you",
    d: "We check the details with you so every word in your story is accurate.",
  },
  {
    t: "You approve, then we publish",
    d: "Your story goes live only after you say yes.",
  },
];

function SectionTitle({
  icon,
  title,
  sub,
}: {
  icon: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-600 text-2xl shadow-md">
        {icon}
      </span>
      <div>
        <h2 className="text-2xl font-extrabold text-[#0f2350] sm:text-3xl">
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

export default function SuccessStories() {
  const [active, setActive] = useState("All");

  const categories = ["All", ...Array.from(new Set(STORIES.map((s) => s.category)))];
  const visible =
    active === "All" ? STORIES : STORIES.filter((s) => s.category === active);

  return (
    <>
      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden bg-[#0b1736] pb-24 pt-8 text-white sm:pb-28 sm:pt-10">
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
              Success Stories
            </span>

            <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Real businesses,{" "}
              <span className="bg-gradient-to-r from-teal-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">
                real stories
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-blue-100/80 sm:text-lg">
              See how business owners turn their ideas into online stores with
              Buildexom.
            </p>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-12 max-w-[1200px] space-y-8 px-4 pb-20 sm:px-6">
        {/* ───────── STORIES ───────── */}
        <section
          id="stories"
          className="scroll-mt-32 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8"
        >
          <SectionTitle
            icon="🌟"
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
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        active === c
                          ? "bg-teal-600 text-white shadow-md"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                    className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 text-sm font-extrabold text-white shadow-md">
                        {initials(s.name)}
                      </span>
                      <div>
                        <p className="text-base font-bold text-[#0f2350]">
                          {s.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {s.business}
                          {s.location ? ` · ${s.location}` : ""}
                        </p>
                      </div>
                      <span className="ml-auto rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                        {s.category}
                      </span>
                    </div>

                    <p className="mt-4 rounded-xl bg-white p-4 text-sm italic leading-6 text-slate-700 ring-1 ring-slate-200">
                      “{s.quote}”
                    </p>

                    <div className="mt-4 space-y-3 text-sm leading-6">
                      <p>
                        <b className="text-[#0f2350]">Challenge: </b>
                        <span className="text-slate-600">{s.challenge}</span>
                      </p>
                      <p>
                        <b className="text-[#0f2350]">Result: </b>
                        <span className="text-slate-600">{s.result}</span>
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center sm:p-12">
              <span className="text-5xl">🌱</span>
              <h3 className="mt-4 text-xl font-extrabold text-[#0f2350]">
                Our first stories are on the way
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                We only publish real stories, shared by real business owners
                with their permission. Be one of the first to tell yours.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="w-full rounded-full bg-teal-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-teal-700 sm:w-auto"
                >
                  Build your store
                </Link>
                <a
                  href="#share"
                  className="w-full rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white sm:w-auto"
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
          className="scroll-mt-32 rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-8"
        >
          <SectionTitle
            icon="📖"
            title="What every story includes"
            sub="Simple, honest and easy to read."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STORY_PARTS.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="text-3xl">{p.icon}</span>
                <h3 className="mt-3 text-base font-bold text-[#0f2350]">
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
          className="scroll-mt-32 rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-8"
        >
          <SectionTitle
            icon="✍️"
            title="Share your story"
            sub="Built a store with Buildexom? We would love to hear from you."
          />
          <ol className="mt-2">
            {SHARE_STEPS.map((s, i) => (
              <li key={s.t} className="relative flex gap-4 pb-7 last:pb-0">
                {i < SHARE_STEPS.length - 1 && (
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

          <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900 ring-1 ring-amber-200">
            <b>Our promise:</b> we never publish a story without the owner approval, and we never change the facts.
          </p>
        </section>

        {/* ───────── CTA ───────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1736] via-[#12297a] to-blue-700 p-8 text-center text-white shadow-2xl sm:p-12">
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-sky-400/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="relative">
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              Your story could be next
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100/85">
              Describe your business and let AI build your store in minutes.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="w-full rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[#0f2350] shadow-xl transition hover:scale-105 sm:w-auto"
              >
                Get Started Free
              </Link>
              <Link
                href="/ai-guide"
                className="w-full rounded-full border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
              >
                Read the AI Guide
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
    </>
  );
}