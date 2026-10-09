const features = [
  {
    title: "AI-Powered Setup",
    text: "Describe your business and get a complete store in seconds.",
    icon: (
      <>
        <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z" />
        <path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" />
      </>
    ),
  },
  {
    title: "Fully Responsive",
    text: "Looks perfect on every device. Desktop, tablet, or mobile.",
    icon: (
      <>
        <rect x="7" y="2.5" width="10" height="19" rx="2" />
        <path d="M11 18.5h2" />
      </>
    ),
  },
  {
    title: "Secure & Reliable",
    text: "Your data is always protected.",
    icon: (
      <>
        <path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5c-4-1.5-7-5-7-9.5V6l7-3z" />
        <path d="M9 12l2 2l4-4" />
      </>
    ),
  },
  {
    title: "Built for Growth",
    text: "Get the tools you need to scale, from marketing to analytics.",
    icon: (
      <>
        <path d="M4 20V10" />
        <path d="M10 20V4" />
        <path d="M16 20v-7" />
        <path d="M22 20H2" />
      </>
    ),
  },
];

export default function FeatureStrip() {
  return (
    <section
      id="features"
      className="scroll-mt-20 bg-white px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="glass-card card-lift flex items-start gap-4 rounded-3xl p-5"
          >
            <span className="btn-glow flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-sky-500 text-white">
              <svg
                width="22"
                height="22"
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

            <div>
              <h3 className="text-[15px] font-bold text-brand-navy">
                {f.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {f.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}