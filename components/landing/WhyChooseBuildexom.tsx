import Link from "next/link";

const features = [
  {
    title: "Store in minutes",
    text: "Describe your business and AI builds your store. No coding.",
    tag: "AI powered",
    // Storefront
    icon: (
      <>
        <path d="M3 9l1.5-5h15L21 9" />
        <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
        <path d="M5 12v8h14v-8" />
        <path d="M10 20v-5h4v5" />
      </>
    ),
  },
  {
    title: "WhatsApp ordering",
    text: "Customers send orders straight to your WhatsApp.",
    tag: "One tap orders",
    // WhatsApp bubble
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
    // Laptop + phone
    icon: (
      <>
        <rect x="2" y="4" width="14" height="10" rx="1.5" />
        <path d="M1 18h16" />
        <rect x="18" y="8" width="4" height="10" rx="1" />
      </>
    ),
  },
  {
    title: "Start free",
    text: "Launch on the free plan and upgrade when you grow.",
    tag: "No card needed",
    // Gift
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
    // Shield check
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
    // Headset
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
      className="relative scroll-mt-20 overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="relative mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span>Why Buildexom</span>
          <h2 className="text-brand-navy">
            Everything you need to{" "}
            <span className="text-gradient">sell online</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Built for small businesses that want to start fast.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              className="group relative isolate flex cursor-default flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white p-7 shadow-[0_12px_32px_-20px_rgba(11,37,69,0.35)] transition duration-300 hover:-translate-y-1.5 hover:border-[#1976d2] hover:shadow-[0_30px_55px_-22px_rgba(25,118,210,0.75)]"
            >
              {/* Blue fill that fades in on hover */}
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0b2545] via-[#1556a8] to-[#1976d2] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />

              {/* Large faint icon in the corner */}
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute -right-5 -top-5 h-32 w-32 text-[#1976d2]/[0.07] transition duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:text-white/10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {f.icon}
              </svg>

              {/* Icon tile (turns white on hover) */}
              <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b2545] to-[#1976d2] text-white shadow-lg shadow-blue-500/30 ring-4 ring-[#1976d2]/10 transition duration-300 group-hover:scale-105 group-hover:bg-white group-hover:from-white group-hover:to-white group-hover:text-[#1976d2] group-hover:ring-white/20">
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

              <h3 className="relative mt-6 text-lg font-bold text-brand-navy transition-colors duration-300 group-hover:text-white">
                {f.title}
              </h3>
              <p className="relative mt-2 flex-1 text-[15px] leading-relaxed text-slate-600 transition-colors duration-300 group-hover:text-blue-100">
                {f.text}
              </p>

              {/* Footer: tag */}
              <div className="relative mt-6 flex items-center justify-between border-t border-blue-100 pt-4 transition-colors duration-300 group-hover:border-white/20">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e6f1ff] px-3 py-1 text-xs font-bold text-[#1976d2] transition-colors duration-300 group-hover:bg-white/15 group-hover:text-white">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  {f.tag}
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/#generate-store"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1976d2] px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition hover:-translate-y-0.5 hover:bg-[#1565c0]"
          >
            Start building free <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}