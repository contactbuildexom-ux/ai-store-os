import Link from "next/link";

const steps = [
  {
    title: "Customer picks products",
    text: "Browses your store and adds items to the cart.",
    icon: (
      <>
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
        <path d="M2 3h3l2.5 12h11L21 7H6" />
      </>
    ),
  },
  {
    title: "Order opens in WhatsApp",
    text: "Items, quantity, and total are filled in automatically.",
    icon: (
      <>
        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
        <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
      </>
    ),
  },
  {
    title: "You confirm and deliver",
    text: "Track it from your dashboard.",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M8 12.5l3 3l5-6" />
      </>
    ),
  },
];

/* Right side: phone mockup with WhatsApp chat */
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[330px]">
      {/* Glow behind phone */}
      <div
        aria-hidden="true"
        className="absolute -inset-8 -z-10 rounded-full bg-gradient-to-br from-emerald-200/50 via-blue-200/50 to-transparent blur-3xl"
      />

      {/* Floating chip: top right */}
      <div className="animate-float absolute -right-4 top-14 z-20 hidden items-center gap-2 rounded-2xl border border-blue-100 bg-white px-3 py-2 sm:flex">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-600">
          ✓
        </span>
        <div>
          <p className="text-[11px] font-bold leading-tight text-brand-navy">New order</p>
          <p className="text-[10px] leading-tight text-slate-500">Rs 3,200</p>
        </div>
      </div>

      {/* Phone frame */}
      <div className="rounded-[2.75rem] border-[10px] border-[#0b1b4d] bg-[#0b1b4d] p-0">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#e9efe6]">
          {/* Notch */}
          <span className="absolute left-1/2 top-2 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-[#0b1b4d]" />

          {/* WhatsApp header */}
          <div className="flex items-center gap-3 bg-[#128c5e] px-4 pb-3 pt-9 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
              R
            </span>
            <div>
              <p className="text-sm font-bold leading-tight">Rose &amp; Wick Candles</p>
              <p className="text-[10px] leading-tight text-white/80">online</p>
            </div>
          </div>

          {/* Chat */}
          <div className="min-h-[330px] space-y-3 p-4">
            {/* Customer order message */}
            <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-[#d9fdd3] px-3.5 py-3 text-[12px] leading-relaxed text-slate-800">
              <p className="font-bold">New order 🕯️</p>
              <p className="mt-1.5">2 × Rose Candle — Rs 2,400</p>
              <p>1 × Gift Box — Rs 800</p>
              <p className="mt-1.5 font-bold">Total: Rs 3,200</p>
              <p className="mt-1 text-right text-[9px] text-slate-500">10:42 ✓✓</p>
            </div>

            {/* Store reply */}
            <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-3 text-[12px] leading-relaxed text-slate-800">
              <p>Thank you! Order confirmed ✅</p>
              <p>Delivery in 2-3 days.</p>
              <p className="mt-1 text-right text-[9px] text-slate-500">10:43</p>
            </div>
          </div>

          {/* Input bar */}
          <div className="flex items-center gap-2 bg-[#f0f2f5] px-3 py-2.5">
            <span className="h-8 flex-1 rounded-full bg-white" />
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#128c5e] text-xs text-white">
              ➤
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WhatsappOrdering() {
  return (
    <section
      id="whatsapp-ordering"
      className="bg-modern relative scroll-mt-20 overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      {/* Decorative glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-16">
        {/* LEFT: text */}
        <div>
          <span className="inline-flex items-center rounded-full border border-blue-100 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-blue">
            WhatsApp Ordering
          </span>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-brand-navy sm:text-5xl">
            Orders land right in{" "}
            <span className="text-gradient">your WhatsApp</span>
          </h2>

          <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600">
            No complicated checkout. Your customers pick products and send the
            order in one tap.
          </p>

          <ol className="mt-8 space-y-3">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="card-lift flex items-start gap-4 rounded-2xl border border-blue-100 bg-white/85 p-4"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-sky-500 text-white">
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
                    {step.icon}
                  </svg>
                </span>

                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Step {i + 1}
                  </p>
                  <p className="mt-0.5 text-base font-bold text-brand-navy">
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-8">
            <Link
              href="/user/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110"
            >
              Start selling on Buildexom <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        {/* RIGHT: phone mockup */}
        <PhoneMockup />
      </div>
    </section>
  );
}