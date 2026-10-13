"use client";

import Link from "next/link";
import { guides, type Guide } from "@/lib/guides";

const THEME: Record<
  Guide["theme"],
  { grad: string; soft: string; accent: string }
> = {
  amber: {
    grad: "from-amber-400 via-orange-500 to-rose-600",
    soft: "bg-orange-50 text-orange-700 ring-orange-200",
    accent: "bg-orange-500",
  },
  blue: {
    grad: "from-sky-500 via-blue-600 to-indigo-700",
    soft: "bg-blue-50 text-blue-700 ring-blue-200",
    accent: "bg-blue-600",
  },
  emerald: {
    grad: "from-emerald-400 via-emerald-600 to-teal-700",
    soft: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    accent: "bg-emerald-600",
  },
  violet: {
    grad: "from-violet-500 via-purple-600 to-fuchsia-600",
    soft: "bg-violet-50 text-violet-700 ring-violet-200",
    accent: "bg-violet-600",
  },
  rose: {
    grad: "from-rose-400 via-pink-500 to-fuchsia-600",
    soft: "bg-rose-50 text-rose-700 ring-rose-200",
    accent: "bg-rose-500",
  },
  teal: {
    grad: "from-teal-400 via-cyan-500 to-blue-600",
    soft: "bg-teal-50 text-teal-700 ring-teal-200",
    accent: "bg-teal-600",
  },
};

const dots = {
  backgroundImage:
    "radial-gradient(rgba(255,255,255,0.35) 1.2px, transparent 1.2px)",
  backgroundSize: "18px 18px",
};

export default function GuidesList() {
  return (
    <>
      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden bg-[#0b1736] pb-28 pt-14 text-white sm:pb-32 sm:pt-20">
        <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-emerald-500/25 blur-3xl" />
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

        <div className="relative mx-auto max-w-[1200px] px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-sky-200 ring-1 ring-white/20 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
            E-commerce Guides
          </span>

          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Your playbook to{" "}
            <span className="bg-gradient-to-r from-sky-300 via-emerald-300 to-violet-300 bg-clip-text text-transparent">
              sell online
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-blue-100/80 sm:text-lg">
            Products, orders, WhatsApp selling, and more. Practical guides to
            run and grow your store.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-blue-100/80">
            <span>
              <b className="text-white">{guides.length}</b> in-depth guides
            </span>
            <span>
              <b className="text-white">Step-by-step</b> checklists
            </span>
            <span>
              <b className="text-white">Free</b> to read
            </span>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-12 max-w-[1200px] px-4 pb-20 sm:px-6">
        {/* ───────── GUIDE CARDS ───────── */}
        <div className="grid gap-6 md:grid-cols-2">
          {guides.map((g, i) => {
            const t = THEME[g.theme];
            return (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/70 transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div
                  className={`relative flex items-center justify-between overflow-hidden bg-gradient-to-br ${t.grad} px-6 py-6 text-white`}
                >
                  <div className="absolute inset-0 opacity-40" style={dots} />
                  <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
                  <div className="relative">
                    <span className="text-xs font-bold tracking-widest text-white/80">
                      GUIDE {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                      {g.title}
                    </h2>
                  </div>
                  <span className="relative text-5xl drop-shadow-xl transition duration-500 group-hover:scale-110 group-hover:-rotate-6 sm:text-6xl">
                    {g.emoji}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="text-base font-semibold leading-snug text-[#0f2350]">
                    {g.tagline}
                  </p>

                  <p className="mt-5 text-xs font-bold uppercase tracking-wide text-slate-400">
                    You will learn
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {g.learn.map((l) => (
                      <li
                        key={l}
                        className="flex gap-3 text-sm leading-6 text-slate-600"
                      >
                        <span
                          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${t.accent}`}
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                        <span>{l}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${t.soft}`}
                    >
                      {g.readTime}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-blue-600 transition group-hover:gap-2">
                      Read guide <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ───────── CTA ───────── */}
        <div className="relative mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1736] via-[#12297a] to-blue-700 p-8 text-center text-white shadow-2xl sm:p-14">
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-sky-400/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="relative">
            <h2 className="text-2xl font-extrabold sm:text-4xl">
              Ready to put these guides to work?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100/85">
              Build your store with AI in minutes, then follow the guides to
              grow it.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
          </div>
        </div>
      </div>
    </>
  );
}