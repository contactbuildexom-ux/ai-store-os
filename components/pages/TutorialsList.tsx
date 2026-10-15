"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { tutorials, type Tutorial } from "@/lib/tutorials";

const PLAN_THEME: Record<Tutorial["plan"], { grad: string; badge: string }> = {
  "All plans": {
    grad: "from-[#2196f3] to-[#1565c0]",
    badge: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  "Pro & Business": {
    grad: "from-[#1976d2] to-[#0d47a1]",
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  Business: {
    grad: "from-[#1646f5] to-[#0b2545]",
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  },
};

const FILTERS = ["All", "All plans", "Pro & Business", "Business"] as const;

/* ───────────────────────── ICONS ───────────────────────── */

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

function ClockIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg
      className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

/* ───────────────────────── CARD VISUAL ───────────────────────── */

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
      <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
      <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-black/10" />

      <span className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wide text-white ring-1 ring-white/30 backdrop-blur-md">
        LESSON {String(index + 1).padStart(2, "0")}
      </span>
      <span className="absolute right-4 top-4 rounded-full bg-black/25 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
        {t.video ? "Video" : "Guide"}
      </span>

      <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#1976d2] shadow-2xl transition duration-300 group-hover:scale-110">
        <PlayIcon />
      </span>

      <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
        <ClockIcon />
        {t.duration}
      </span>
    </div>
  );
}

/* ───────────────────────── PAGE ───────────────────────── */

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
      {/* ───────── HERO (light blue) ───────── */}
      <section className="relative pb-12 pt-8 sm:pb-16 sm:pt-10">
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
          {/* Back to home */}
          <div className="mb-8 flex justify-start">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0b2545] shadow-sm ring-1 ring-blue-100 transition duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
            >
              <ArrowLeft />
              Back to Home
            </Link>
          </div>

          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1976d2] shadow-sm ring-1 ring-blue-100">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1976d2]" />
              Tutorials
            </span>

            <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-[#0b2545] sm:text-5xl lg:text-6xl">
              Learn Buildexom in{" "}
              <span className="bg-gradient-to-r from-[#1976d2] to-[#0288d1] bg-clip-text text-transparent">
                minutes
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
              Short how-to guides and videos. Each lesson takes just 2 to 3
              minutes.
            </p>

            <div className="relative mx-auto mt-8 max-w-xl">
              <SearchIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tutorials, e.g. WhatsApp, QR, chatbot"
                aria-label="Search tutorials"
                className="w-full rounded-full border border-blue-100 bg-white py-4 pl-14 pr-5 text-sm text-slate-800 shadow-xl shadow-blue-500/10 outline-none transition placeholder:text-slate-400 focus:border-[#1976d2] focus:ring-4 focus:ring-blue-200/70 sm:text-base"
              />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-500">
              <span>
                <b className="text-[#0b2545]">{tutorials.length}</b>{" "}
                step-by-step lessons
              </span>
              <span>
                <b className="text-[#0b2545]">2–3 min</b> each
              </span>
              <span>
                <b className="text-[#0b2545]">Free</b> to learn
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto max-w-[1200px] px-4 pb-20 sm:px-6">
        {/* ───────── FILTERS ───────── */}
        <div
          className="mb-8 flex flex-wrap justify-center gap-2 rounded-2xl border border-blue-100 bg-white p-2 shadow-lg shadow-blue-900/5 sm:mx-auto sm:w-fit sm:rounded-full"
          role="tablist"
          aria-label="Filter tutorials by plan"
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition duration-200 active:scale-95 ${
                filter === f
                  ? "bg-[#1976d2] text-white shadow-md shadow-blue-400/40"
                  : "text-[#0b2545] hover:bg-[#e6f1ff]"
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
            className="group mb-10 grid overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-xl shadow-blue-900/10 transition duration-300 hover:shadow-2xl hover:shadow-blue-500/20 lg:grid-cols-2"
          >
            <Visual t={featured.t} index={featured.i} tall />
            <div className="flex flex-col justify-center p-6 sm:p-10">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#e6f1ff] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#1976d2]">
                <StarIcon />
                Start here
              </span>
              <h2 className="mt-4 text-2xl font-extrabold leading-tight text-[#0b2545] transition group-hover:text-[#1976d2] sm:text-3xl">
                {featured.t.title}
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                {featured.t.summary}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon />
                  {featured.t.duration}
                </span>
                <span>• {featured.t.steps.length} steps</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
                    PLAN_THEME[featured.t.plan].badge
                  }`}
                >
                  {featured.t.plan}
                </span>
              </div>
              <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#1976d2] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-400/40 transition-all duration-300 group-hover:gap-3 group-hover:bg-[#1565c0]">
                Start lesson <ArrowRight />
              </span>
            </div>
          </Link>
        )}

        {/* ───────── GRID ───────── */}
        {list.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl border border-dashed border-blue-200 bg-white p-10 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f1ff] text-[#1976d2]">
              <SearchIcon className="h-7 w-7" />
            </span>
            <p className="mt-4 text-lg font-bold text-[#0b2545]">
              No tutorials found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try a different word or another plan filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFilter("All");
              }}
              className="mt-5 rounded-full bg-[#1976d2] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition duration-200 hover:-translate-y-0.5 hover:bg-[#1565c0] active:scale-95"
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
                className="group flex flex-col overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-md shadow-blue-900/5 transition duration-300 hover:-translate-y-2 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/20"
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
                  <h2 className="mt-3 text-lg font-bold leading-snug text-[#0b2545] transition group-hover:text-[#1976d2]">
                    {t.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                    {t.summary}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-blue-50 pt-4 text-sm">
                    <span className="text-slate-500">
                      {t.steps.length} steps
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#1976d2] transition-all duration-300 group-hover:gap-2">
                      Start <ArrowRight />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ───────── CTA ───────── */}
        <div
          className="relative mt-16 overflow-hidden rounded-3xl p-8 text-center text-white shadow-2xl shadow-blue-900/30 sm:p-14"
          style={{
            background:
              "linear-gradient(135deg, #0b2545 0%, #0d3068 50%, #1976d2 100%)",
          }}
        >
          <div className="relative">
            <h2 className="text-2xl font-extrabold sm:text-4xl">
              Ready to try it yourself?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100/85">
              Build your first store with AI in minutes. No coding needed.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login?mode=signup"
                className="w-full rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[#0b2545] shadow-xl transition duration-200 hover:-translate-y-0.5 hover:bg-blue-50 active:scale-95 sm:w-auto"
              >
                Get Started Free
              </Link>
              <Link
                href="/"
                className="w-full rounded-full border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:scale-95 sm:w-auto"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}