import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/landing/PageShell";
import { getGuide, guides, type Guide } from "@/lib/guides";

type Props = { params: Promise<{ slug: string }> };

const THEME: Record<
  Guide["theme"],
  { grad: string; soft: string; accent: string; text: string }
> = {
  amber: {
    grad: "from-amber-400 via-orange-500 to-rose-600",
    soft: "bg-orange-50 ring-orange-200",
    accent: "bg-orange-500",
    text: "text-orange-700",
  },
  blue: {
    grad: "from-sky-500 via-blue-600 to-indigo-700",
    soft: "bg-blue-50 ring-blue-200",
    accent: "bg-blue-600",
    text: "text-blue-700",
  },
  emerald: {
    grad: "from-emerald-400 via-emerald-600 to-teal-700",
    soft: "bg-emerald-50 ring-emerald-200",
    accent: "bg-emerald-600",
    text: "text-emerald-700",
  },
  violet: {
    grad: "from-violet-500 via-purple-600 to-fuchsia-600",
    soft: "bg-violet-50 ring-violet-200",
    accent: "bg-violet-600",
    text: "text-violet-700",
  },
  rose: {
    grad: "from-rose-400 via-pink-500 to-fuchsia-600",
    soft: "bg-rose-50 ring-rose-200",
    accent: "bg-rose-500",
    text: "text-rose-700",
  },
  teal: {
    grad: "from-teal-400 via-cyan-500 to-blue-600",
    soft: "bg-teal-50 ring-teal-200",
    accent: "bg-teal-600",
    text: "text-teal-700",
  },
};

const dots = {
  backgroundImage:
    "radial-gradient(rgba(255,255,255,0.35) 1.2px, transparent 1.2px)",
  backgroundSize: "18px 18px",
};

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return { title: "Guide not found | Buildexom" };
  return {
    title: `${g.title} Guide | Buildexom`,
    description: g.tagline,
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();

  const t = THEME[g.theme];
  const index = guides.findIndex((x) => x.slug === slug);
  const prev = index > 0 ? guides[index - 1] : null;
  const next = index < guides.length - 1 ? guides[index + 1] : null;

  return (
    <PageShell>
      {/* ───────── HERO ───────── */}
      <header
        className={`relative overflow-hidden bg-gradient-to-br ${t.grad} pb-24 pt-10 text-white sm:pb-28 sm:pt-14`}
      >
        <div className="absolute inset-0 opacity-40" style={dots} />
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-black/15 blur-3xl" />

        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
          <nav
            className="mb-6 flex items-center gap-2 text-sm text-white/80"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/guides" className="hover:text-white">
              E-commerce Guides
            </Link>
          </nav>

          <div className="flex items-start gap-4 sm:gap-6">
            <span className="text-5xl drop-shadow-xl sm:text-7xl">
              {g.emoji}
            </span>
            <div className="max-w-3xl">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wide ring-1 ring-white/30 backdrop-blur">
                GUIDE {String(index + 1).padStart(2, "0")} · {g.readTime}
              </span>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {g.title}
              </h1>
              <p className="mt-3 text-base text-white/90 sm:text-lg">
                {g.tagline}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ───────── BODY ───────── */}
      <div className="relative z-10 mx-auto -mt-12 max-w-[1200px] px-4 pb-20 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[270px_1fr]">
          {/* TOC */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                In this guide
              </p>
              <ol className="mt-3 space-y-1">
                {g.sections.map((s, i) => (
                  <li key={i}>
                    <a
                      href={`#section-${i}`}
                      className="flex gap-3 rounded-xl px-2 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-blue-700"
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${t.accent}`}
                      >
                        {i + 1}
                      </span>
                      <span>{s.h}</span>
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#checklist"
                    className="flex gap-3 rounded-xl px-2 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 hover:text-blue-700"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-white">
                      ✓
                    </span>
                    <span>Quick checklist</span>
                  </a>
                </li>
              </ol>
            </div>
          </aside>

          {/* CONTENT */}
          <div className="min-w-0 space-y-6">
            {g.sections.map((s, i) => (
              <section
                key={i}
                id={`section-${i}`}
                className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-extrabold text-white shadow-md ${t.accent}`}
                  >
                    {i + 1}
                  </span>
                  <h2 className="pt-1 text-xl font-extrabold leading-snug text-[#0f2350] sm:text-2xl">
                    {s.h}
                  </h2>
                </div>

                {s.p && (
                  <p className="mt-4 text-base leading-7 text-slate-600 sm:text-[17px] sm:leading-8">
                    {s.p}
                  </p>
                )}

                {s.points && (
                  <ul className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-5">
                    {s.points.map((p, j) => (
                      <li
                        key={j}
                        className="flex gap-3 text-sm leading-6 text-slate-700 sm:text-base sm:leading-7"
                      >
                        <span
                          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${t.accent}`}
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {s.tip && (
                  <div
                    className={`mt-4 flex gap-3 rounded-2xl p-4 ring-1 ${t.soft}`}
                  >
                    <span className="text-xl">💡</span>
                    <p className="text-sm leading-6 text-slate-700 sm:text-base">
                      <b className={t.text}>Tip: </b>
                      {s.tip}
                    </p>
                  </div>
                )}
              </section>
            ))}

            {/* Checklist */}
            <section
              id="checklist"
              className="scroll-mt-28 rounded-3xl bg-gradient-to-br from-[#0b1736] via-[#12297a] to-blue-700 p-6 text-white shadow-2xl sm:p-8"
            >
              <h2 className="flex items-center gap-2 text-xl font-extrabold sm:text-2xl">
                ✅ Quick checklist
              </h2>
              <p className="mt-1 text-sm text-blue-100/80">
                Tick these off to make sure you covered the basics.
              </p>
              <ul className="mt-5 space-y-3">
                {g.checklist.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-xl bg-white/10 p-3 text-sm ring-1 ring-white/15 sm:text-base"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-white/60 text-xs text-transparent">
                      ✓
                    </span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Growth plan link */}
            {g.slug === "growth" && (
              <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-md ring-1 ring-teal-200 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-700">
                  <b className="text-[#0f2350]">Ready to compare plans?</b> See
                  what Basic, Pro and Business include.
                </p>
                <Link
                  href="/#pricing"
                  className="shrink-0 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-center text-sm font-semibold text-white shadow-md"
                >
                  View pricing
                </Link>
              </div>
            )}

            {/* Prev / Next */}
            <nav className="grid gap-3 sm:grid-cols-2" aria-label="More guides">
              {prev ? (
                <Link
                  href={`/guides/${prev.slug}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:bg-blue-50/60"
                >
                  <span className="text-xs font-semibold text-slate-400">
                    ← Previous guide
                  </span>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <span>{prev.emoji}</span> {prev.title}
                  </p>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  href={`/guides/${next.slug}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:bg-blue-50/60 sm:text-right"
                >
                  <span className="text-xs font-semibold text-slate-400">
                    Next guide →
                  </span>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800 sm:justify-end">
                    <span>{next.emoji}</span> {next.title}
                  </p>
                </Link>
              )}
            </nav>

            {/* CTA */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1736] via-[#12297a] to-blue-700 p-8 text-center text-white shadow-2xl">
              <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-sky-400/30 blur-3xl" />
              <div className="relative">
                <h2 className="text-xl font-extrabold sm:text-2xl">
                  Ready to build your store?
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-blue-100/85">
                  Describe your business and let AI build your store in
                  minutes.
                </p>
                <Link
                  href="/login"
                  className="mt-5 inline-block rounded-full bg-white px-7 py-3 text-sm font-bold text-[#0f2350] shadow-xl transition hover:scale-105"
                >
                  Get Started Free
                </Link>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/guides"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                ← Back to all guides
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}