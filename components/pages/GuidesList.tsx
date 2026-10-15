"use client";

import Link from "next/link";
import { guides } from "@/lib/guides";

type IconName =
  | "book"
  | "bag"
  | "chat"
  | "trending"
  | "camera"
  | "package"
  | "card"
  | "truck";

const ICONS: Record<IconName, React.ReactNode> = {
  book: (
    <>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </>
  ),
  bag: (
    <>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </>
  ),
  chat: (
    <>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      <path d="M8 12h.01" />
      <path d="M12 12h.01" />
      <path d="M16 12h.01" />
    </>
  ),
  trending: (
    <>
      <path d="m22 7-8.5 8.5-5-5L2 17" />
      <path d="M16 7h6v6" />
    </>
  ),
  camera: (
    <>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </>
  ),
  package: (
    <>
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </>
  ),
  card: (
    <>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </>
  ),
  truck: (
    <>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </>
  ),
};

function Icon({
  name,
  className = "h-6 w-6",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-3 w-3"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8.5l3.2 3.2L13 4.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

/* Har card ke liye alag blue shade */
const GRADS = [
  "from-[#2196f3] to-[#1565c0]",
  "from-[#1976d2] to-[#0d47a1]",
  "from-[#1646f5] to-[#0b2a9c]",
  "from-[#0288d1] to-[#01579b]",
  "from-[#1565c0] to-[#0b2545]",
  "from-[#039be5] to-[#0277bd]",
];

const FALLBACK_ICONS: IconName[] = [
  "book",
  "bag",
  "chat",
  "trending",
  "camera",
  "package",
];

/* Guide ke title/slug se icon choose hota hai, warna order ke hisab se */
function pickIcon(slug: string, title: string, index: number): IconName {
  const key = `${slug} ${title}`.toLowerCase();
  if (/whatsapp/.test(key)) return "chat";
  if (/photo|image|picture/.test(key)) return "camera";
  if (/pay/.test(key)) return "card";
  if (/deliver|ship/.test(key)) return "truck";
  if (/order/.test(key)) return "package";
  if (/grow|market|promot|sell/.test(key)) return "trending";
  if (/product|store|catalog/.test(key)) return "bag";
  return FALLBACK_ICONS[index % FALLBACK_ICONS.length];
}

export default function GuidesList() {
  return (
    <>
      {/* ───────── HERO (light blue) ───────── */}
      <section className="relative pb-12 pt-14 sm:pb-16 sm:pt-20">
        <div className="relative mx-auto max-w-[1200px] px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1976d2] shadow-sm ring-1 ring-blue-100">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1976d2]" />
            E-commerce Guides
          </span>

          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-[#0b2545] sm:text-5xl lg:text-6xl">
            Your playbook to{" "}
            <span className="bg-gradient-to-r from-[#1976d2] to-[#0288d1] bg-clip-text text-transparent">
              sell online
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            Products, orders, WhatsApp selling, and more. Practical guides to
            run and grow your store.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-500">
            <span>
              <b className="text-[#0b2545]">{guides.length}</b> in-depth guides
            </span>
            <span>
              <b className="text-[#0b2545]">Step-by-step</b> checklists
            </span>
            <span>
              <b className="text-[#0b2545]">Free</b> to read
            </span>
          </div>
        </div>
      </section>

      <div className="relative mx-auto max-w-[1200px] px-4 pb-20 sm:px-6">
        {/* ───────── GUIDE CARDS ───────── */}
        <div className="grid gap-6 md:grid-cols-2">
          {guides.map((g, i) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="group flex flex-col overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg shadow-blue-900/10 transition duration-300 hover:-translate-y-2 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/20"
            >
              <div
                className={`relative flex items-center justify-between overflow-hidden bg-gradient-to-br ${
                  GRADS[i % GRADS.length]
                } px-6 py-6 text-white`}
              >
                <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
                <div className="absolute -bottom-10 left-1/3 h-28 w-28 rounded-full bg-black/10" />
                <div className="relative">
                  <span className="text-xs font-bold tracking-widest text-white/80">
                    GUIDE {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                    {g.title}
                  </h2>
                </div>
                <span className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg ring-1 ring-white/30 transition duration-500 group-hover:-rotate-6 group-hover:scale-110 sm:h-20 sm:w-20">
                  <Icon
                    name={pickIcon(g.slug, g.title, i)}
                    className="h-8 w-8 sm:h-10 sm:w-10"
                  />
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <p className="text-base font-semibold leading-snug text-[#0b2545]">
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
                        className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1976d2] text-white"
                        aria-hidden="true"
                      >
                        <CheckIcon />
                      </span>
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-center justify-between border-t border-blue-50 pt-4 text-sm">
                  <span className="rounded-full bg-[#e6f1ff] px-3 py-1 text-xs font-semibold text-[#1976d2] ring-1 ring-blue-100">
                    {g.readTime}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#1976d2] transition-all duration-300 group-hover:gap-2">
                    Read guide <ArrowRight />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

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
              Ready to put these guides to work?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100/85">
              Build your store with AI in minutes, then follow the guides to
              grow it.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login?mode=signup"
                className="w-full rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[#0b2545] shadow-xl transition duration-200 hover:-translate-y-0.5 hover:bg-blue-50 active:scale-95 sm:w-auto"
              >
                Get Started Free
              </Link>
              <Link
                href="/tutorials"
                className="w-full rounded-full border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:scale-95 sm:w-auto"
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