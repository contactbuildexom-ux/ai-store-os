const features = [
  {
    title: "AI-Powered Setup",
    text: "Describe your business and get a complete store in seconds.",
    grad: "from-blue-700 to-sky-400",
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
    grad: "from-indigo-600 to-blue-400",
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
    grad: "from-cyan-500 to-blue-600",
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
    grad: "from-blue-800 to-indigo-500",
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
    <section className="relative z-10 -mt-10 px-4 pb-10 sm:px-6 lg:-mt-16 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="group relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-6 transition-all duration-300 hover:-translate-y-2 hover:border-transparent"
          >
            {/* Top color line */}
            <span
              aria-hidden="true"
              className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${f.grad}`}
            />

            {/* Hover fill */}
            <span
              aria-hidden="true"
              className={`absolute inset-0 bg-gradient-to-br ${f.grad} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
            />

            {/* Big number watermark */}
            <span
              aria-hidden="true"
              className="absolute -right-1 top-2 text-7xl font-extrabold text-blue-100/70 transition-colors duration-300 group-hover:text-white/20"
            >
              {String(i + 1).padStart(2, "0")}
            </span>

            <div className="relative">
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.grad} text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:from-white group-hover:to-white group-hover:text-brand-blue`}
              >
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

              <h3 className="mt-5 text-lg font-extrabold text-brand-navy transition-colors duration-300 group-hover:text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 transition-colors duration-300 group-hover:text-blue-50">
                {f.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}