import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/landing/PageShell";
import { getPost, posts } from "@/lib/blog";

type Props = { params: Promise<{ slug: string }> };

const THEME: Record<string, { grad: string; accent: string }> = {
  "Starting out": {
    grad: "from-sky-500 via-blue-600 to-indigo-700",
    accent: "bg-blue-600",
  },
  "Selling on WhatsApp": {
    grad: "from-emerald-400 via-emerald-600 to-teal-700",
    accent: "bg-emerald-600",
  },
  "Growing your store": {
    grad: "from-violet-500 via-purple-600 to-fuchsia-600",
    accent: "bg-violet-600",
  },
};
const FALLBACK = THEME["Starting out"];

const dots = {
  backgroundImage:
    "radial-gradient(rgba(255,255,255,0.35) 1.2px, transparent 1.2px)",
  backgroundSize: "18px 18px",
};

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const t = THEME[post.category] ?? FALLBACK;
  const index = posts.findIndex((p) => p.slug === slug);
  const prev = index > 0 ? posts[index - 1] : null;
  const next = index < posts.length - 1 ? posts[index + 1] : null;
  const related = posts
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 2);

  const whatsappShare = `https://wa.me/?text=${encodeURIComponent(
    `${post.title} - Buildexom Blog`
  )}`;

  const leadIndex = post.body.findIndex((b) => "p" in b);

  return (
    <PageShell>
      <article>
        {/* ───────── HERO ───────── */}
        <header
          className={`relative overflow-hidden bg-gradient-to-br ${t.grad} pb-24 pt-10 text-white sm:pb-28 sm:pt-14`}
        >
          <div className="absolute inset-0 opacity-40" style={dots} />
          <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-black/15 blur-3xl" />

          <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
            <nav
              className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/80"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-white">
                Blog
              </Link>
            </nav>

            <div className="flex items-start gap-4">
              <span className="text-5xl drop-shadow-xl sm:text-6xl">
                {post.emoji}
              </span>
              <span className="mt-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold ring-1 ring-white/30 backdrop-blur">
                {post.category}
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/85">
              <span className="inline-flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold ring-1 ring-white/30">
                  B
                </span>
                Buildexom Team
              </span>
              <span>• {post.readTime}</span>
            </div>
          </div>
        </header>

        {/* ───────── BODY CARD ───────── */}
        <div className="relative z-10 mx-auto -mt-12 max-w-3xl px-4 pb-16 sm:px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-300/50 sm:p-10">
            <div className="space-y-5">
              {post.body.map((b, i) => {
                if ("h" in b)
                  return (
                    <h2
                      key={i}
                      className="flex items-center gap-3 pt-5 text-xl font-extrabold text-[#0f2350] sm:text-2xl"
                    >
                      <span
                        className={`h-6 w-1.5 rounded-full ${t.accent}`}
                        aria-hidden="true"
                      />
                      {b.h}
                    </h2>
                  );

                if ("p" in b)
                  return (
                    <p
                      key={i}
                      className={
                        i === leadIndex
                          ? "text-lg font-medium leading-8 text-slate-800 sm:text-xl"
                          : "text-base leading-7 text-slate-600 sm:text-[17px] sm:leading-8"
                      }
                    >
                      {b.p}
                    </p>
                  );

                if ("ul" in b)
                  return (
                    <ul
                      key={i}
                      className="space-y-3 rounded-2xl bg-slate-50 p-5"
                    >
                      {b.ul.map((x, j) => (
                        <li
                          key={j}
                          className="flex gap-3 text-base leading-7 text-slate-700"
                        >
                          <span
                            className={`mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${t.accent}`}
                            aria-hidden="true"
                          >
                            ✓
                          </span>
                          <span>{x}</span>
                        </li>
                      ))}
                    </ul>
                  );

                return (
                  <ol
                    key={i}
                    className="space-y-3 rounded-2xl bg-slate-50 p-5"
                  >
                    {b.ol.map((x, j) => (
                      <li
                        key={j}
                        className="flex gap-3 text-base leading-7 text-slate-700"
                      >
                        <span
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${t.accent}`}
                          aria-hidden="true"
                        >
                          {j + 1}
                        </span>
                        <span>{x}</span>
                      </li>
                    ))}
                  </ol>
                );
              })}
            </div>

            {/* Share */}
            <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center">
              <p className="text-sm font-semibold text-slate-700">
                Found this useful? Share it.
              </p>
              <a
                href={whatsappShare}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:scale-105"
              >
                Share on WhatsApp
              </a>
            </div>
          </div>

          {/* ───────── CTA ───────── */}
          <div className="relative mt-10 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1736] via-[#12297a] to-blue-700 p-8 text-center text-white shadow-2xl sm:p-10">
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-sky-400/30 blur-3xl" />
            <div className="relative">
              <h2 className="text-xl font-extrabold sm:text-2xl">
                Ready to build your store?
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-blue-100/85">
                Describe your business and let AI build your store in minutes.
              </p>
              <Link
                href="/login"
                className="mt-5 inline-block rounded-full bg-white px-7 py-3 text-sm font-bold text-[#0f2350] shadow-xl transition hover:scale-105"
              >
                Get Started Free
              </Link>
            </div>
          </div>

          {/* ───────── RELATED ───────── */}
          {related.length > 0 && (
            <section className="mt-14">
              <h2 className="mb-5 text-xl font-extrabold text-[#0f2350]">
                More in {post.category}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {related.map((r) => {
                  const rt = THEME[r.category] ?? FALLBACK;
                  return (
                    <Link
                      key={r.slug}
                      href={`/blog/${r.slug}`}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div
                        className={`relative flex h-24 items-center justify-center bg-gradient-to-br ${rt.grad}`}
                      >
                        <div
                          className="absolute inset-0 opacity-40"
                          style={dots}
                        />
                        <span className="relative text-4xl transition group-hover:scale-110">
                          {r.emoji}
                        </span>
                      </div>
                      <div className="p-4">
                        <p className="font-bold leading-snug text-[#0f2350] group-hover:text-blue-700">
                          {r.title}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          {r.readTime}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* ───────── PREV / NEXT ───────── */}
          <nav
            className="mt-10 grid gap-3 sm:grid-cols-2"
            aria-label="More articles"
          >
            {prev ? (
              <Link
                href={`/blog/${prev.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:bg-blue-50/60"
              >
                <span className="text-xs font-semibold text-slate-400">
                  ← Previous
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
                href={`/blog/${next.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:bg-blue-50/60 sm:text-right"
              >
                <span className="text-xs font-semibold text-slate-400">
                  Next →
                </span>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {next.title}
                </p>
              </Link>
            )}
          </nav>

          {/* ───────── BACK LINKS ───────── */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
            <Link
              href="/blog"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              ← Back to all articles
            </Link>
            <Link
              href="/"
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              🏠 Back to Home
            </Link>
          </div>
        </div>
      </article>
    </PageShell>
  );
}