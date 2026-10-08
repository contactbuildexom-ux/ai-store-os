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
    <section className="border-y border-slate-100 bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {features.map((f) => (
          <div key={f.title} className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
              <svg
                width="20"
                height="20"
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
              <h3 className="text-sm font-semibold text-brand-navy">
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