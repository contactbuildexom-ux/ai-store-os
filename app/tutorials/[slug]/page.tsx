import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/landing/PageShell";
import { getTutorial, tutorials } from "@/lib/tutorials";

type Props = { params: Promise<{ slug: string }> };

const THEME = {
  "All plans": {
    grad: "from-sky-500 via-blue-600 to-indigo-700",
    accent: "bg-blue-600",
    ring: "ring-blue-200",
  },
  "Pro & Business": {
    grad: "from-amber-400 via-orange-500 to-rose-600",
    accent: "bg-orange-500",
    ring: "ring-orange-200",
  },
  Business: {
    grad: "from-violet-500 via-purple-600 to-fuchsia-600",
    accent: "bg-violet-600",
    ring: "ring-violet-200",
  },
} as const;

const dots = {
  backgroundImage:
    "radial-gradient(rgba(255,255,255,0.35) 1.2px, transparent 1.2px)",
  backgroundSize: "18px 18px",
};

export function generateStaticParams() {
  return tutorials.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = getTutorial(slug);
  if (!t) return { title: "Tutorial not found" };
  return {
    title: t.title,
    description: t.summary,
  };
}

export default async function TutorialPage({ params }: Props) {
  const { slug } = await params;
  const t = getTutorial(slug);
  if (!t) notFound();

  const theme = THEME[t.plan];
  const index = tutorials.findIndex((x) => x.slug === slug);
  const prev = index > 0 ? tutorials[index - 1] : null;
  const next = index < tutorials.length - 1 ? tutorials[index + 1] : null;
  const others = tutorials.filter((x) => x.slug !== slug).slice(0, 4);

  return (
    <PageShell>
      {/* ───────── HERO ───────── */}
      <header
        className={`relative overflow-hidden bg-gradient-to-br ${theme.grad} pb-24 pt-10 text-white sm:pb-28 sm:pt-14`}
      >
        <div className="absolute inset-0 opacity-40" style={dots} />
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-black/15 blur-3xl" />

        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
          <nav
            className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/80"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/tutorials" className="hover:text-white">
              Tutorials
            </Link>
          </nav>

          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wide ring-1 ring-white/30 backdrop-blur">
                LESSON {String(index + 1).padStart(2, "0")}
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold ring-1 ring-white/30 backdrop-blur">
                {t.plan}
              </span>
            </div>

            <h1 className="mt-5 flex items-start gap-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              <span className="drop-shadow-xl">{t.emoji}</span>
              <span>{t.title}</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base text-white/90 sm:text-lg">
              {t.summary}
            </p>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/90">
              <span>⏱ {t.duration}</span>
              <span>📋 {t.steps.length} steps</span>
            </div>
          </div>
        </div>
      </header>

      {/* ───────── CONTENT ───────── */}
      <div className="relative z-10 mx-auto -mt-12 max-w-[1200px] px-4 pb-20 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* LEFT */}
          <div className="min-w-0 space-y-8">
            {/* Video */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/50">
              {t.video ? (
                <video
                  controls
                  preload="metadata"
                  className="aspect-video w-full bg-black"
                  src={t.video}
                />
              ) : (
                <div
                  className={`relative flex aspect-video flex-col items-center justify-center bg-gradient-to-br ${theme.grad} text-center text-white`}
                >
                  <div className="absolute inset-0 opacity-40" style={dots} />
                  <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-[#0f2350] shadow-2xl">
                    <svg
                      className="h-9 w-9 translate-x-0.5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11-6.86a1 1 0 0 0 0-1.7l-11-6.86A1 1 0 0 0 8 5.14Z" />
                    </svg>
                  </span>
                  <p className="relative mt-4 text-lg font-bold">
                    Video coming soon
                  </p>
                  <p className="relative mt-1 px-6 text-sm text-white/85">
                    Follow the written steps below in the meantime.
                  </p>
                </div>
              )}
            </div>

            {/* Plan note */}
            {t.plan !== "All plans" && (
              <div
                className={`flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-md ring-1 ${theme.ring} sm:flex-row sm:items-center sm:justify-between`}
              >
                <p className="text-sm text-slate-700">
                  <b className="text-[#0f2350]">Available on {t.plan} plans.</b>{" "}
                  Upgrade to use this feature in your store.
                </p>
                <Link
                  href="/#pricing"
                  className="shrink-0 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-center text-sm font-semibold text-white shadow-md"
                >
                  View plans
                </Link>
              </div>
            )}

            {/* Steps */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-8">
              <h2 className="text-xl font-extrabold text-[#0f2350] sm:text-2xl">
                Step by step
              </h2>

              <ol className="mt-6">
                {t.steps.map((s, i) => (
                  <li key={i} className="relative flex gap-4 pb-8 last:pb-0">
                    {i < t.steps.length - 1 && (
                      <span
                        className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 bg-slate-200"
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md ${theme.accent}`}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 pt-1">
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

            {/* Tips */}
            {t.tips.length > 0 && (
              <section className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 ring-1 ring-amber-200 sm:p-8">
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-amber-900">
                  💡 Pro tips
                </h2>
                <ul className="mt-4 space-y-3">
                  {t.tips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm leading-6 text-amber-950/80 sm:text-base"
                    >
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white">
                        ✓
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Prev / Next */}
            <nav className="grid gap-3 sm:grid-cols-2" aria-label="More lessons">
              {prev ? (
                <Link
                  href={`/tutorials/${prev.slug}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:bg-blue-50/60"
                >
                  <span className="text-xs font-semibold text-slate-400">
                    ← Previous lesson
                  </span>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {prev.title}
                  </p>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  href={`/tutorials/${next.slug}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:bg-blue-50/60 sm:text-right"
                >
                  <span className="text-xs font-semibold text-slate-400">
                    Next lesson →
                  </span>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {next.title}
                  </p>
                </Link>
              )}
            </nav>

            {/* Back links */}
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
              <Link
                href="/tutorials"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                ← Back to all tutorials
              </Link>
              <Link
                href="/"
                className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                🏠 Back to Home
              </Link>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
              <h2 className="text-base font-extrabold text-[#0f2350]">
                In this lesson
              </h2>
              <ul className="mt-4 space-y-3">
                {t.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-600">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${theme.accent}`}
                    >
                      {i + 1}
                    </span>
                    <span>{s.t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
              <h2 className="text-base font-extrabold text-[#0f2350]">
                More tutorials
              </h2>
              <ul className="mt-3 divide-y divide-slate-100">
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link
                      href={`/tutorials/${o.slug}`}
                      className="flex items-center gap-3 py-3 text-sm font-medium text-slate-700 transition hover:text-blue-700"
                    >
                      <span className="text-xl">{o.emoji}</span>
                      <span className="flex-1">{o.title}</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/tutorials"
                className="mt-2 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                View all tutorials →
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1736] via-[#12297a] to-blue-700 p-6 text-center text-white shadow-xl">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sky-400/30 blur-2xl" />
              <div className="relative">
                <p className="text-lg font-extrabold">Need help?</p>
                <p className="mt-1 text-sm text-blue-100/85">
                  Ask Bexi AI at the bottom right, or visit our Help Center.
                </p>
                <Link
                  href="/help"
                  className="mt-4 inline-block rounded-full bg-white px-5 py-2 text-sm font-bold text-[#0f2350] transition hover:scale-105"
                >
                  Help Center
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}