const stats = [
  { value: "50K+", label: "Active Stores" },
  { value: "4.9/5", label: "Customer Satisfaction" },
  { value: "99.9%", label: "Uptime Guarantee" },
];

export default function StatsBar() {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="bg-soft-gradient relative overflow-hidden rounded-3xl border border-blue-100 px-6 py-8 shadow-[0_24px_50px_-28px_rgba(29,78,216,0.35)] sm:px-10 lg:px-14">
          {/* Decorative glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-300/30 blur-3xl"
          />

          <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:justify-between lg:gap-12">
            {/* Left text */}
            <p className="max-w-xs text-center text-base font-medium leading-relaxed text-slate-600 lg:text-left">
              Trusted by creators, small businesses, and growing brands.
            </p>

            {/* Stats */}
            <div className="grid w-full grid-cols-3 gap-3 sm:gap-6 lg:w-auto lg:gap-8">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="glass-card card-lift rounded-2xl px-3 py-4 text-center sm:px-8 sm:py-5"
                >
                  <p className="text-gradient text-2xl font-extrabold tracking-tight sm:text-4xl">
                    {s.value}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-slate-500 sm:text-sm">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}