import Link from "next/link";

/* ============ CONFIG ============ */
const CTA_HREF = "/user/signup"; // "Use template" button ka path
/* ================================== */

const templates = [
  {
    name: "Fashion",
    text: "Modern clothing and style stores.",
    preview: "from-indigo-300 via-blue-200 to-blue-100",
    block: "bg-indigo-500/70",
  },
  {
    name: "Home Decor",
    text: "Furniture and cozy living products.",
    preview: "from-stone-200 via-amber-100 to-orange-50",
    block: "bg-amber-600/60",
  },
  {
    name: "Electronics",
    text: "Gadgets, audio, and smart devices.",
    preview: "from-blue-950 via-blue-800 to-indigo-600",
    block: "bg-sky-400/70",
  },
  {
    name: "Beauty",
    text: "Skincare and wellness brands.",
    preview: "from-pink-200 via-rose-100 to-pink-50",
    block: "bg-rose-400/60",
  },
];

export default function Templates() {
  return (
    <section
      id="templates"
      className="bg-soft-gradient relative scroll-mt-20 overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      {/* Decorative glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">
            Templates
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-navy sm:text-5xl">
            Start With a Ready-Made{" "}
            <span className="text-gradient">Template</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Pick a style that fits your business. Our AI fills it with your
            products and brand.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((t) => (
            <div
              key={t.name}
              className="glass-card card-lift group rounded-3xl p-3"
            >
              {/* Preview with mini store mockup */}
              <div
                className={`relative h-44 w-full overflow-hidden rounded-2xl bg-gradient-to-br ${t.preview}`}
                aria-hidden="true"
              >
                <div className="absolute inset-x-4 top-4 flex items-center justify-between">
                  <span className="h-1.5 w-10 rounded-full bg-white/80" />
                  <span className="flex gap-1">
                    <span className="h-1.5 w-4 rounded-full bg-white/60" />
                    <span className="h-1.5 w-4 rounded-full bg-white/60" />
                  </span>
                </div>

                <div className="absolute inset-x-4 bottom-4 grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-white/85 p-1.5 shadow-sm transition-transform duration-300 group-hover:-translate-y-1"
                    >
                      <div className={`h-10 w-full rounded-lg ${t.block}`} />
                      <div className="mt-1.5 h-1 w-3/4 rounded-full bg-slate-300" />
                      <div className="mt-1 h-1 w-1/2 rounded-full bg-slate-200" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Text */}
              <div className="px-2 pb-2 pt-4">
                <h3 className="text-base font-bold text-brand-navy">
                  {t.name}
                </h3>
                <p className="mt-1 min-h-[40px] text-sm leading-relaxed text-slate-600">
                  {t.text}
                </p>

                <Link
                  href={CTA_HREF}
                  className="btn-glow mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  Use template
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}