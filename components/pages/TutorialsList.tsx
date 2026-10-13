"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { tutorials, type Tutorial } from "@/lib/tutorials";

const PLAN_THEME: Record<
  Tutorial["plan"],
  { grad: string; badge: string }
> = {
  "All plans": {
    grad: "from-sky-500 via-blue-600 to-indigo-700",
    badge: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  "Pro & Business": {
    grad: "from-amber-400 via-orange-500 to-rose-600",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  Business: {
    grad: "from-violet-500 via-purple-600 to-fuchsia-600",
    badge: "bg-violet-50 text-violet-700 ring-violet-200",
  },
};

const dots = {
  backgroundImage:
    "radial-gradient(rgba(255,255,255,0.35) 1.2px, transparent 1.2px)",
  backgroundSize: "18px 18px",
};

const FILTERS = ["All", "All plans", "Pro & Business", "Business"] as const;

function PlayIcon() {
  return (
    <svg
      className="h-6 w-6 translate-x-0.5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11-6.86a1 1 0 0 0 0-1.7l-11-6.86A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

function Visual({
  t,
  index,
  tall = false,
}: {
  t: Tutorial;
  index: number;
  tall?: boolean;
}) {
  const theme = PLAN_THEME[t.plan];
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${theme.grad} ${
        tall ? "h-56 sm:h-72 lg:h-full lg:min-h-[340px]" : "h-44"
      }`}
    >
      <div className="absolute inset-0 opacity-40" style={dots} />
      <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
      <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-black/10 blur-2xl" />

      <span className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wide text-white ring-1 ring-white/30 backdrop-blur-md">
        LESSON {String(index + 1).padStart(2, "0")}
      </span>
      <span className="absolute right-4 top-4 rounded-full bg-black/25 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
        {t.video ? "Video" : "Guide"}
      </span>

      <span className="absolute text-6xl opacity-20 blur-[1px]">{t.emoji}</span>
      <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#0f2350] shadow-2xl transition duration-300 group-hover:scale-110">
        <PlayIcon />
      </span>

      <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
        ⏱ {t.duration}
      </span>
    </div>
  );
}

export default function TutorialsList() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tutorials
      .map((t, i) => ({ t, i }))
      .filter(
        ({ t }) =>
          (filter === "All" || t.plan === filter) &&
          (!q ||
            t.title.toLowerCase().includes(q) ||
            t.summary.toLowerCase().includes(q))
      );
  }, [filter, query]);

  const showFeatured = filter === "All" && !query.trim() && list.length > 0;
  const featured = showFeatured ? list[0] : null;
  const rest = showFeatured ? list.slice(1) : list;

  return (
    <>
      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden bg-[#0b1736] pb-28 pt-8 text-white sm:pb-32 sm:pt-10">
        <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-blue-500/30 blur-3xl" />
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
          {/* Back to home */}
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
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-300" />
              Tutorials
            </span>

            <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Learn Buildexom in{" "}
              <span className="bg-gradient-to-r from-sky-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">
                minutes
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-blue-100/80 sm:text-lg">
              Short how-to guides and videos. Each lesson takes just 2 to 3
              minutes.
            </p>

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
                placeholder="Search tutorials, e.g. WhatsApp, QR, chatbot"
                aria-label="Search tutorials"
                className="w-full rounded-full border border-white/10 bg-white py-4 pl-14 pr-5 text-sm text-slate-800 shadow-2xl shadow-blue-950/40 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-blue-400/40 sm:text-base"
              />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-blue-100/80">
              <span>
                <b className="text-white">{tutorials.length}</b> step-by-step
                lessons
              </span>
              <span>
                <b className="text-white">2–3 min</b> each
              </span>
              <span>
                <b className="text-white">Free</b> to learn
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-12 max-w-[1200px] px-4 pb-20 sm:px-6">
        {/* ───────── FILTERS ───────── */}
        <div
          className="mb-8 flex flex-wrap justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/60 sm:mx-auto sm:w-fit sm:rounded-full"
          role="tablist"
          aria-label="Filter tutorials by plan"
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === f
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-300/50"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {f === "All" ? "All tutorials" : f}
            </button>
          ))}
        </div>

        {/* ───────── FEATURED ───────── */}
        {featured && (
          <Link
            href={`/tutorials/${featured.t.slug}`}
            className="group mb-10 grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 transition hover:shadow-2xl lg:grid-cols-2"
          >
            <Visual t={featured.t} index={featured.i} tall />
            <div className="flex flex-col justify-center p-6 sm:p-10">
              <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
                ★ Start here
              </span>
              <h2 className="mt-4 text-2xl font-extrabold leading-tight text-[#0f2350] transition group-hover:text-blue-700 sm:text-3xl">
                {featured.t.title}
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                {featured.t.summary}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span>⏱ {featured.t.duration}</span>
                <span>• {featured.t.steps.length} steps</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
                    PLAN_THEME[featured.t.plan].badge
                  }`}
                >
                  {featured.t.plan}
                </span>
              </div>
              <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-300/50 transition group-hover:gap-3">
                Start lesson <span aria-hidden="true">→</span>
              </span>
            </div>
          </Link>
        )}

        {/* ───────── GRID ───────── */}
        {list.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <div className="text-4xl">🔍</div>
            <p className="mt-3 text-lg font-bold text-slate-800">
              No tutorials found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try a different word or another plan filter.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setFilter("All");
              }}
              className="mt-5 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Show all tutorials
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map(({ t, i }) => (
              <Link
                key={t.slug}
                href={`/tutorials/${t.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <Visual t={t} index={i} />
                <div className="flex flex-1 flex-col p-6">
                  <span
                    className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                      PLAN_THEME[t.plan].badge
                    }`}
                  >
                    {t.plan}
                  </span>
                  <h2 className="mt-3 text-lg font-bold leading-snug text-[#0f2350] transition group-hover:text-blue-700">
                    {t.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                    {t.summary}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                    <span className="text-slate-500">
                      {t.steps.length} steps
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-blue-600 transition group-hover:gap-2">
                      Start <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ───────── CTA ───────── */}
        <div className="relative mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1736] via-[#12297a] to-blue-700 p-8 text-center text-white shadow-2xl sm:p-14">
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-sky-400/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="relative">
            <h2 className="text-2xl font-extrabold sm:text-4xl">
              Ready to try it yourself?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100/85">
              Build your first store with AI in minutes. No coding needed.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="w-full rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[#0f2350] shadow-xl transition hover:scale-105 sm:w-auto"
              >
                Get Started Free
              </Link>
              <Link
                href="/"
                className="w-full rounded-full border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}