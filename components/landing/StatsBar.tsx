const stats = [
  {
    value: "50K+",
    label: "Active Stores",
    icon: (
      <>
        <path d="M3 9l1.5-5h15L21 9" />
        <path d="M4 9v11h16V9" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
  },
  {
    value: "4.9/5",
    label: "Customer Satisfaction",
    icon: (
      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />
    ),
  },
  {
    value: "99.9%",
    label: "Uptime Guarantee",
    icon: (
      <>
        <path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5c-4-1.5-7-5-7-9.5V6l7-3z" />
        <path d="M9 12l2 2l4-4" />
      </>
    ),
  },
];

export default function StatsBar() {
  return (
    <section className="bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-white to-sky-50/80 px-6 py-5 lg:flex-row lg:justify-between lg:gap-10 lg:rounded-full lg:px-10">
        {/* Left text */}
        <p className="max-w-[260px] text-center text-sm font-medium leading-snug text-slate-600 lg:text-left">
          Trusted by creators, small businesses, and growing brands.
        </p>

        {/* Stats */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-0 lg:w-auto">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex items-center justify-center gap-3 sm:px-8 ${
                i > 0 ? "sm:border-l sm:border-blue-100" : ""
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-brand-blue">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {s.icon}
                </svg>
              </span>

              <div>
                <p className="text-gradient text-xl font-extrabold leading-tight tracking-tight">
                  {s.value}
                </p>
                <p className="text-[11px] leading-tight text-slate-500">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}