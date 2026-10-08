"use client";

const steps = [
  {
    number: "1",
    title: "Share Your Idea",
    description:
      "Tell us what kind of store you want. Be as specific or general as you like.",
  },
  {
    number: "2",
    title: "Let AI Build It",
    description:
      "Our AI creates your store, adds products, sets up design and pages — automatically.",
  },
  {
    number: "3",
    title: "Launch & Grow",
    description:
      "Review, customize and hit publish. Your store is ready to welcome customers!",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="w-full bg-[#f7faff] px-4 py-16 font-[Arial,Helvetica,sans-serif] sm:px-6 lg:px-8"
    >
      {/* Section Heading */}
      <div className="mx-auto mb-10 max-w-4xl text-center">
        <p className="mb-2 text-[16px] font-bold uppercase tracking-[0.18em] text-[#2457d6]">
          HOW IT WORKS
        </p>

        <h2 className="text-3xl font-bold tracking-tight text-[#17243a] sm:text-4xl">
          Get Your Store Online in 3 Simple Steps
        </h2>

        <p className="mt-3 text-[15px] leading-6 text-[#707b8d]">
          No technical skills. No complicated setup. Just a few clicks and
          you're ready to go.
        </p>
      </div>

      {/* Steps */}
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 lg:flex-row lg:items-center lg:gap-0">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className="flex w-full items-center lg:w-1/3"
          >
            {/* Card */}
            <div className="w-full rounded-xl border border-[#e1e7f0] bg-white px-6 py-6 shadow-[0_4px_15px_rgba(30,60,100,0.04)]">
              {/* Number */}
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#2160d9] text-[14px] font-bold text-white">
                {step.number}
              </div>

              {/* Title */}
              <h3 className="text-[17px] font-bold text-[#17243a]">
                {step.title}
              </h3>

              {/* Description */}
              <p className="mt-2 text-[14px] leading-[20px] text-[#707b8d]">
                {step.description}
              </p>
            </div>

            {/* Arrow */}
            {index < steps.length - 1 && (
              <div className="hidden shrink-0 px-3 lg:block">
                <span className="text-[25px] font-normal text-[#4f78b8]">
                  →
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}