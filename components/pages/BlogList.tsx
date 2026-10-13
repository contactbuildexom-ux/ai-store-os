"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, posts, type Post } from "@/lib/blog";

const THEME: Record<string, { grad: string; glow: string }> = {
  "Starting out": {
    grad: "from-sky-500 via-blue-600 to-indigo-700",
    glow: "group-hover:shadow-sky-200/70",
  },
  "Selling on WhatsApp": {
    grad: "from-emerald-400 via-emerald-600 to-teal-700",
    glow: "group-hover:shadow-emerald-200/70",
  },
  "Growing your store": {
    grad: "from-violet-500 via-purple-600 to-fuchsia-600",
    glow: "group-hover:shadow-violet-200/70",
  },
};

const FALLBACK = THEME["Starting out"];

const dots = {
  backgroundImage:
    "radial-gradient(rgba(255,255,255,0.35) 1.2px, transparent 1.2px)",
  backgroundSize: "18px 18px",
};

function Visual({ post, tall = false }: { post: Post; tall?: boolean }) {
  const t = THEME[post.category] ?? FALLBACK;
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${t.grad} ${
        tall ? "h-56 sm:h-72 lg:h-full lg:min-h-[320px]" : "h-40"
      }`}
    >
      <div className="absolute inset-0 opacity-40" style={dots} />
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
      <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-black/10 blur-2xl" />
      <span
        className={`relative drop-shadow-xl transition duration-500 group-hover:scale-110 group-hover:-rotate-6 ${
          tall ? "text-7xl sm:text-8xl" : "text-6xl"
        }`}
      >
        {post.emoji}
      </span>
      <span className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/30 backdrop-blur-md">
        {post.category}
      </span>
    </div>
  );
}

export default function BlogList() {
  const [active, setActive] = useState<string>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (active === "All" || p.category === active) &&
        (!q ||
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q))
    );
  }, [active, query]);

  const showFeatured = active === "All" && !query.trim() && filtered.length > 0;
  const featured = showFeatured ? filtered[0] : null;
  const rest = showFeatured ? filtered.slice(1) : filtered;

  return (
    <>
      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden bg-[#0b1736] pb-24 pt-8 text-white sm:pb-28 sm:pt-10">
        <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-violet-500/25 blur-3xl" />
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
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-300" />
              The Buildexom Blog
            </span>

            <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Tips to{" "}
              <span className="bg-gradient-to-r from-sky-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">
                sell more online
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-blue-100/80 sm:text-lg">
              E-commerce, online selling, and business tips to help your store
              grow.
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
                placeholder="Search articles, e.g. WhatsApp, photos, QR"
                aria-label="Search articles"
                className="w-full rounded-full border border-white/10 bg-white py-4 pl-14 pr-5 text-sm text-slate-800 shadow-2xl shadow-blue-950/40 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-blue-400/40 sm:text-base"
              />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-blue-100/80">
              <span>
                <b className="text-white">{posts.length}</b> practical guides
              </span>
              <span>
                <b className="text-white">{CATEGORIES.length}</b> topics
              </span>
              <span>
                <b className="text-white">Free</b> to read
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
          aria-label="Blog categories"
        >
          {["All", ...CATEGORIES].map((c) => {
            const count =
              c === "All"
                ? posts.length
                : posts.filter((p) => p.category === c).length;
            return (
              <button
                key={c}
                role="tab"
                aria-selected={active === c}
                onClick={() => setActive(c)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active === c
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-300/50"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {c}
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    active === c
                      ? "bg-white/25 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ───────── FEATURED ───────── */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group mb-10 grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 transition hover:shadow-2xl lg:grid-cols-2"
          >
            <Visual post={featured} tall />
            <div className="flex flex-col justify-center p-6 sm:p-10">
              <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
                ★ Featured
              </span>
              <h2 className="mt-4 text-2xl font-extrabold leading-tight text-[#0f2350] transition group-hover:text-blue-700 sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                {featured.excerpt}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-300/50 transition group-hover:gap-3">
                  Read article <span aria-hidden="true">→</span>
                </span>
                <span className="text-sm text-slate-500">
                  {featured.readTime}
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* ───────── GRID ───────── */}
        {filtered.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <div className="text-4xl">🔍</div>
            <p className="mt-3 text-lg font-bold text-slate-800">
              No articles found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try a different word or choose another topic.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setActive("All");
              }}
              className="mt-5 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Show all articles
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => {
              const t = THEME[p.category] ?? FALLBACK;
              return (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className={`group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-2xl ${t.glow}`}
                >
                  <Visual post={p} />
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="text-lg font-bold leading-snug text-[#0f2350] transition group-hover:text-blue-700">
                      {p.title}
                    </h2>
                    <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                      {p.excerpt}
                    </p>
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                      <span className="text-slate-500">{p.readTime}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-blue-600 transition group-hover:gap-2">
                        Read <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ───────── CTA ───────── */}
        <div className="relative mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1736] via-[#12297a] to-blue-700 p-8 text-center text-white shadow-2xl sm:p-14">
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-sky-400/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="relative">
            <h2 className="text-2xl font-extrabold sm:text-4xl">
              Ready to put these tips into action?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100/85">
              Describe your business and let AI build your online store in
              minutes.
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