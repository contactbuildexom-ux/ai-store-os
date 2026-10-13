import type { ReactNode } from "react";

type Step = {
  id: number;
  title: string;
  description: string;
  icon: ReactNode;
};

const iconProps = {
  className: "h-7 w-7",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const steps: Step[] = [
  {
    id: 1,
    title: "Share Your Idea",
    description:
      "Tell us what kind of store you want. Be as specific or general as you like.",
    icon: (
      <svg {...iconProps}>
        <path d="M9 18h6M10 21h4" />
        <path d="M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Let AI Build It",
    description:
      "Our AI creates your store, adds products, and sets up design and pages automatically.",
    icon: (
      <svg {...iconProps}>
        <path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9L11 3z" />
        <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Launch & Grow",
    description:
      "Review, customize, and hit publish. Your store is ready to welcome customers.",
    icon: (
      <svg {...iconProps}>
        <path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2" />
        <path d="M12 15l-3-3a22 22 0 012-4 12 12 0 019-5c0 3-1 7-5 11a22 22 0 01-4 2z" />
        <circle cx="15" cy="9" r="1" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[#f6f9ff] py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-600 shadow-sm ring-1 ring-blue-100">
            How it works
          </span>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Get Your Store Online in 3 Simple Steps
          </h2>
          <p className="mt-4 text-base text-slate-500">
            No technical skills. No complicated setup. Just a few clicks and
            you&apos;re ready to go.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-6">
          {/* Dotted connector (desktop only) */}
          <div className="absolute left-[16.66%] right-[16.66%] top-8 hidden border-t-2 border-dashed border-blue-200 md:block" />

          {steps.map((step) => (
            <div key={step.id} className="relative flex flex-col items-center">
              {/* Icon */}
              <div className="relative z-10">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1646f5] to-[#2f6bff] text-white shadow-lg shadow-blue-500/30">
                  {step.icon}
                </div>
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-600 shadow ring-2 ring-blue-100">
                  {step.id}
                </span>
              </div>

              {/* Card */}
              <div className="mt-6 w-full flex-1 rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100">
                <h3 className="text-xl font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}