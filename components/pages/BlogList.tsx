"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, posts, type Post } from "@/lib/blog";

const THEME: Record<string, { grad: string }> = {
  "Starting out": { grad: "from-[#2196f3] to-[#1565c0]" },
  "Selling on WhatsApp": { grad: "from-[#1646f5] to-[#0b2a9c]" },
  "Growing your store": { grad: "from-[#0288d1] to-[#01579b]" },
};

const FALLBACK = THEME["Starting out"];

/* ───────────────────────── ICONS ───────────────────────── */

function CategoryIcon({
  category,
  className = "h-10 w-10",
}: {
  category: string;
  className?: string;
}) {
  const key = category.toLowerCase();
  let paths: React.ReactNode;

  if (key.includes("whatsapp")) {
    paths = (
      <>
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        <path d="M8 12h.01" />
        <path d="M12 12h.01" />
        <path d="M16 12h.01" />
      </>
    );
  } else if (key.includes("grow")) {
    paths = (
      <>
        <path d="m22 7-8.5 8.5-5-5L2 17" />
        <path d="M16 7h6v6" />
      </>
    );
  } else {
    paths = (
      <>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths}
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

function Visual({ post, tall = false }: { post: Post; tall?: boolean }) {
  const t = THEME[post.category] ?? FALLBACK;
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${t.grad} ${
        tall ? "h-56 sm:h-72 lg:h-full lg:min-h-[320px]" : "h-40"
      }`}
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-black/10" />
      <span
        className={`relative flex items-center justify-center rounded-3xl bg-white/15 text-white shadow-xl ring-1 ring-white/30 transition duration-500 group-hover:scale-110 group-hover:-rotate-6 ${
          tall ? "h-28 w-28" : "h-20 w-20"
        }`}
      >
        <CategoryIcon
          category={post.category}
          className={tall ? "h-14 w-14" : "h-10 w-10"}
        />
      </span>
      <span className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/30 backdrop-blur-md">
        {post.category}
      </span>
    </div>
  );
}

/* ───────────────────────── PAGE ───────────────────────── */

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
              The Buildexom Blog
            </span>

            <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-[#0b2545] sm:text-5xl lg:text-6xl">
              Tips to{" "}
              <span className="bg-gradient-to-r from-[#1976d2] to-[#0288d1] bg-clip-text text-transparent">
                sell more online
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
              E-commerce, online selling, and business tips to help your store
              grow.
            </p>

            {/* Search */}
            <div className="relative mx-auto mt-8 max-w-xl">
              <SearchIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles, e.g. WhatsApp, photos, QR"
                aria-label="Search articles"
                className="w-full rounded-full border border-blue-100 bg-white py-4 pl-14 pr-5 text-sm text-slate-800 shadow-xl shadow-blue-500/10 outline-none transition placeholder:text-slate-400 focus:border-[#1976d2] focus:ring-4 focus:ring-blue-200/70 sm:text-base"
              />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-500">
              <span>
                <b className="text-[#0b2545]">{posts.length}</b> practical
                guides
              </span>
              <span>
                <b className="text-[#0b2545]">{CATEGORIES.length}</b> topics
              </span>
              <span>
                <b className="text-[#0b2545]">Free</b> to read
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
                type="button"
                role="tab"
                aria-selected={active === c}
                onClick={() => setActive(c)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition duration-200 active:scale-95 ${
                  active === c
                    ? "bg-[#1976d2] text-white shadow-md shadow-blue-400/40"
                    : "text-[#0b2545] hover:bg-[#e6f1ff]"
                }`}
              >
                {c}
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    active === c
                      ? "bg-white/25 text-white"
                      : "bg-[#e6f1ff] text-[#1976d2]"
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
            className="group mb-10 grid overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-xl shadow-blue-900/10 transition duration-300 hover:shadow-2xl hover:shadow-blue-500/20 lg:grid-cols-2"
          >
            <Visual post={featured} tall />
            <div className="flex flex-col justify-center p-6 sm:p-10">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#e6f1ff] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#1976d2]">
                <StarIcon />
                Featured
              </span>
              <h2 className="mt-4 text-2xl font-extrabold leading-tight text-[#0b2545] transition group-hover:text-[#1976d2] sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                {featured.excerpt}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#1976d2] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-400/40 transition-all duration-300 group-hover:gap-3 group-hover:bg-[#1565c0]">
                  Read article <ArrowRight />
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
          <div className="mx-auto max-w-md rounded-3xl border border-dashed border-blue-200 bg-white p-10 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f1ff] text-[#1976d2]">
              <SearchIcon className="h-7 w-7" />
            </span>
            <p className="mt-4 text-lg font-bold text-[#0b2545]">
              No articles found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try a different word or choose another topic.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActive("All");
              }}
              className="mt-5 rounded-full bg-[#1976d2] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition duration-200 hover:-translate-y-0.5 hover:bg-[#1565c0] active:scale-95"
            >
              Show all articles
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-md shadow-blue-900/5 transition duration-300 hover:-translate-y-2 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/20"
              >
                <Visual post={p} />
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-lg font-bold leading-snug text-[#0b2545] transition group-hover:text-[#1976d2]">
                    {p.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                    {p.excerpt}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-blue-50 pt-4 text-sm">
                    <span className="text-slate-500">{p.readTime}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#1976d2] transition-all duration-300 group-hover:gap-2">
                      Read <ArrowRight />
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
              Ready to put these tips into action?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100/85">
              Describe your business and let AI build your online store in
              minutes.
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