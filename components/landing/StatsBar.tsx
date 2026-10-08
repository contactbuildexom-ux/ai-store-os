const stats = [
  { value: "50K+", label: "Active Stores" },
  { value: "4.9/5", label: "Customer Satisfaction" },
  { value: "99.9%", label: "Uptime Guarantee" },
];

export default function StatsBar() {
  return (
    <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 lg:flex-row lg:justify-between lg:gap-12">
        {/* Left text */}
        <p className="max-w-xs text-center text-sm leading-relaxed text-slate-500 lg:text-left">
          Trusted by creators, small businesses, and growing brands.
        </p>

        {/* Stats */}
        <div className="grid w-full grid-cols-3 gap-4 sm:gap-8 lg:w-auto lg:gap-16">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`text-center ${
                i > 0 ? "border-l border-slate-200 pl-4 sm:pl-8 lg:pl-16" : ""
              }`}
            >
              <p className="text-2xl font-bold tracking-tight text-brand-blue sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}