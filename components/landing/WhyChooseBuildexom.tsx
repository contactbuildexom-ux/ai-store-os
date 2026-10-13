import Link from "next/link";

const features = [
  {
    title: "Store in minutes",
    text: "Describe your business and AI builds your store. No coding.",
    tag: "AI powered",
    icon: (
      <>
        <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z" />
        <path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" />
      </>
    ),
  },
  {
    title: "WhatsApp ordering",
    text: "Customers send orders straight to your WhatsApp.",
    tag: "One tap orders",
    icon: (
      <>
        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
        <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
      </>
    ),
  },
  {
    title: "Works on every device",
    text: "Looks great on mobile, tablet, and desktop.",
    tag: "Fully responsive",
    icon: (
      <>
        <rect x="7" y="2.5" width="10" height="19" rx="2" />
        <path d="M11 18.5h2" />
      </>
    ),
  },
  {
    title: "Start free",
    text: "Launch on the free plan and upgrade when you grow.",
    tag: "No card needed",
    icon: (
      <>
        <path d="M20 12v8H4v-8" />
        <path d="M2 7h20v5H2z" />
        <path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z" />
      </>
    ),
  },
  {
    title: "Secure and reliable",
    text: "Your store and customer data stay protected.",
    tag: "Data protected",
    icon: (
      <>
        <path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5c-4-1.5-7-5-7-9.5V6l7-3z" />
        <path d="M9 12l2 2l4-4" />
      </>
    ),
  },
  {
    title: "Help when you need it",
    text: "Our team is a message away, with priority support on Business.",
    tag: "Priority support",
    icon: (
      <>
        <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
        <rect x="3" y="13" width="4" height="6" rx="1.5" />
        <rect x="17" y="13" width="4" height="6" rx="1.5" />
        <path d="M19 19c0 1.5-2 2.5-5 2.5" />
      </>
    ),
  },
];

export default function WhyChooseBuildexom() {
  return (
    <section
      id="features"
      className="bg-modern relative scroll-mt-20 overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      {/* Decorative glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-blue-300/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-blue">
            Why Buildexom
          </span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-brand-navy sm:text-5xl">
            Everything you need to{" "}
            <span className="text-gradient">sell online</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Built for small businesses that want to start fast.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="glass-card card-lift group relative overflow-hidden rounded-3xl p-7"
            >
              {/* Number watermark */}
              <span
                aria-hidden="true"
                className="absolute right-5 top-3 text-6xl font-extrabold text-blue-100/80 transition-colors group-hover:text-blue-200"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Icon */}
              <span className="btn-glow relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-sky-500 text-white transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {f.icon}
                </svg>
              </span>

              <h3 className="relative mt-6 text-lg font-bold text-brand-navy">
                {f.title}
              </h3>
              <p className="relative mt-2 text-[15px] leading-relaxed text-slate-600">
                {f.text}
              </p>

              <span className="relative mt-5 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                {f.tag}
              </span>

              {/* Bottom accent line */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-blue-700 to-sky-400 transition-transform duration-500 group-hover:scale-x-100"
              />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/#generate-store"
            className="btn-glow inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110"
          >
            Start building free <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}