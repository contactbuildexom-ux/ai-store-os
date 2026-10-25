"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { formatPricingPlanPrice, type PublicPricingPlan } from "@/lib/pricing-plan-catalog";
import { usePricingPlans } from "@/hooks/use-pricing-plans";

const VISIBLE_COUNT = 6;
function PlanCard({ plan, index, featuredIndex }: { plan: PublicPricingPlan; index: number; featuredIndex: number }) {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const dark = index === featuredIndex;
  const visible = open ? plan.features : plan.features.slice(0, VISIBLE_COUNT);
  const hiddenCount = plan.features.length - VISIBLE_COUNT;

  // Scroll par fade-up animation
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 120}ms` }}
      className={`transition-all duration-700 ease-out ${
        show ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      <div
        className={`group relative flex h-full flex-col rounded-3xl p-5 transition duration-300 sm:p-7 ${
          dark
            ? "bg-gradient-to-b from-[#16396b] to-[#0b2545] text-white shadow-2xl shadow-[#0b2545]/30 hover:-translate-y-2 hover:shadow-[#0b2545]/50 lg:-translate-y-2 lg:hover:-translate-y-3"
            : "border border-slate-200 bg-white text-slate-900 shadow-sm hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100"
        }`}
      >
        {dark && (
          <span className="absolute right-4 top-4 animate-pulse rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur sm:right-5 sm:top-5">
            Most popular
          </span>
        )}

        {/* Header */}
        <div>
          <p
            className={`text-sm font-semibold ${
              dark ? "text-blue-100" : "text-blue-600"
            }`}
          >
            {plan.name}
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {formatPricingPlanPrice(plan.price, plan.billing_cycle)}
          </p>
        </div>

        {/* Button */}
        <Link
          href={plan.plan_key ? `/user/signup?plan=${encodeURIComponent(plan.plan_key)}` : "/user/signup"}
          className={`group/btn mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
            dark
              ? "bg-white text-[#0b2545] hover:bg-blue-50 hover:shadow-white/30"
              : "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white hover:shadow-blue-300/50"
          }`}
        >
          {`Get started${Number(plan.price) === 0 ? " free" : ""}`}
          <svg
            className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <div className={`my-6 h-px ${dark ? "bg-white/15" : "bg-slate-100"}`} />

        {/* Features */}
        <ul className="space-y-3">
          {visible.map((feature, featureIndex) => (
            <li
              key={`${plan.id}-${featureIndex}-${feature}`}
              className={`flex items-start gap-3 text-sm transition duration-200 hover:translate-x-1 ${
                dark ? "text-blue-50" : "text-slate-600"
              }`}
            >
              <span className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full ${
                dark ? "bg-white/15 text-white" : "bg-blue-50 text-blue-600"
              }`}>
                <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Toggle */}
        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            className={`mt-5 inline-flex items-center gap-1 self-start rounded-lg px-2 py-1 text-sm font-semibold transition duration-200 hover:scale-105 active:scale-95 ${
              dark
                ? "text-white hover:bg-white/10"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            {open ? "Show less" : `+${hiddenCount} more features`}
            <svg
              className={`h-4 w-4 transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

      </div>
    </div>
  );
}

export default function Pricing() {
  const { plans, loading, error } = usePricingPlans();

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-white py-12 sm:py-16 lg:py-20"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-50 to-transparent" />

      {plans.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Buildexom",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "Buildexom is an AI-powered online store builder for small businesses.",
            offers: plans.map((p) => ({
              "@type": "Offer",
              name: p.name,
              price: Number(p.price),
              priceCurrency: "PKR",
              description: p.features.join(", "),
            })),
          }}
        />
      )}

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            Pricing
          </span>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-[#0b2545] sm:text-5xl lg:text-6xl">
            Affordable Online Store Builder Plans
          </h2>
          <p className="mt-4 text-base text-slate-500">
            Create your online store with AI for free, and upgrade as your business grows.
          </p>
        </div>

        {error && <p role="alert" className="mt-8 text-center text-sm text-red-600">{error}</p>}

        {/* Cards */}
        <div className="mt-8 grid items-stretch gap-6 sm:mt-10 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} featuredIndex={Math.floor(plans.length / 2)} />
          ))}
        </div>
        {loading && <p role="status" className="mt-8 text-center text-sm text-slate-500">Loading pricing plans…</p>}
        {!loading && !error && plans.length === 0 && <p role="status" className="mt-8 text-center text-sm text-slate-500">No pricing plans are currently available.</p>}
      </div>
    </section>
  );
}