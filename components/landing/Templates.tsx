import Link from "next/link";

/* ============ CONFIG ============ */
const CTA_HREF = "/login"; // "Use template" button ka path
/* ================================== */

const templates = [
  {
    name: "Fashion",
    text: "Modern clothing and style stores.",
    preview: "from-indigo-200 via-blue-200 to-blue-100",
  },
  {
    name: "Home Decor",
    text: "Furniture and cozy living products.",
    preview: "from-stone-200 via-amber-100 to-orange-50",
  },
  {
    name: "Electronics",
    text: "Gadgets, audio, and smart devices.",
    preview: "from-blue-950 via-blue-800 to-indigo-700",
  },
  {
    name: "Beauty",
    text: "Skincare and wellness brands.",
    preview: "from-pink-200 via-rose-100 to-pink-50",
  },
];

export default function Templates() {
  return (
    <section
      id="templates"
      className="scroll-mt-20 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">
            Templates
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            Start With a Ready-Made Template
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Pick a style that fits your business. Our AI fills it with your
            products and brand.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((t) => (
            <div
              key={t.name}
              className="group rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-blue/10"
            >
              {/* Preview */}
              <div
                className={`h-40 w-full rounded-xl bg-gradient-to-br ${t.preview}`}
                aria-hidden="true"
              />

              {/* Text */}
              <div className="px-2 pb-2 pt-4">
                <h3 className="text-base font-semibold text-brand-navy">
                  {t.name}
                </h3>
                <p className="mt-1 min-h-[40px] text-sm leading-relaxed text-slate-600">
                  {t.text}
                </p>

                <Link
                  href={CTA_HREF}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-navy transition hover:border-brand-blue hover:bg-brand-blue hover:text-white"
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