"use client";

import { useState } from "react";
import Link from "next/link";

type Feature = {
  label: string;
  isNew?: boolean;
};

type Plan = {
  id: string;
  name: string;
  price: string;
  description: string;
  features: Feature[];
  cta: string;
  href: string;
  popular?: boolean;
};

const VISIBLE_COUNT = 6;

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: "Free",
    description: "Perfect for starting your online store.",
    features: [
      { label: "Up to 20 Products" },
      { label: "WhatsApp Ordering" },
      { label: "Basic Store Customization" },
      { label: "Product Management" },
      { label: "Product Images & Descriptions" },
      { label: "Basic Dashboard" },
      { label: "Basic Order Management" },
      { label: "Store Categories" },
      { label: "Buildexom Branding" },
    ],
    cta: "Get Started Free",
    href: "/signup",
  },
  {
    id: "pro",
    name: "Pro",
    price: "Advanced",
    description: "For growing stores that need more flexibility.",
    popular: true,
    features: [
      { label: "Up to 75 Products" },
      { label: "Up to 5 Categories" },
      { label: "Up to 15 Products per Category" },
      { label: "Advanced Store Customization" },
      { label: "WhatsApp Ordering" },
      { label: "WhatsApp New Product Alerts", isNew: true },
      { label: "Order Tracking" },
      { label: "Payment Integration" },
      { label: "Coupons & Discounts" },
      { label: "Basic Analytics" },
      { label: "Remove Buildexom Branding" },
    ],
    cta: "Upgrade to Pro",
    href: "/signup?plan=pro",
  },
  {
    id: "business",
    name: "Business",
    price: "Unlimited",
    description: "For businesses ready to scale their online store.",
    features: [
      { label: "Unlimited Products" },
      { label: "Unlimited Categories" },
      { label: "Advanced Store Customization" },
      { label: "WhatsApp Ordering" },
      { label: "Smart WhatsApp Product Alerts", isNew: true },
      { label: "Category-based customer targeting", isNew: true },
      { label: "Scheduled notifications", isNew: true },
      { label: "Notification delivery and click stats", isNew: true },
      { label: "Customer subscription management", isNew: true },
      { label: "Order Tracking" },
      { label: "Payment Integration" },
      { label: "AI Customer Chatbot" },
      { label: "Advanced Analytics" },
      { label: "Remove Buildexom Branding" },
      { label: "Priority Support" },
    ],
    cta: "Go Business",
    href: "/signup?plan=business",
  },
];

function PlanCard({ plan }: { plan: Plan }) {
  const [open, setOpen] = useState(false);
  const dark = Boolean(plan.popular);
  const visible = open ? plan.features : plan.features.slice(0, VISIBLE_COUNT);
  const hiddenCount = plan.features.length - VISIBLE_COUNT;

  return (
    <div
      className={`relative flex flex-col rounded-3xl p-7 transition duration-300 ${
        dark
          ? "bg-gradient-to-b from-[#1646f5] to-[#0b2a9c] text-white shadow-2xl shadow-blue-600/30 md:-translate-y-2"
          : "border border-slate-200 bg-white text-slate-900 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100"
      }`}
    >
      {plan.popular && (
        <span className="absolute right-5 top-5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
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
        <p className="mt-2 text-4xl font-extrabold tracking-tight">
          {plan.price}
        </p>
        <p
          className={`mt-2 text-sm leading-6 ${
            dark ? "text-blue-100" : "text-slate-500"
          }`}
        >
          {plan.description}
        </p>
      </div>

      {/* Button */}
      <Link
        href={plan.href}
        className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
          dark
            ? "bg-white text-blue-700 hover:bg-blue-50"
            : "bg-blue-50 text-blue-700 hover:bg-blue-100"
        }`}
      >
        {plan.cta}
      </Link>

      <div className={`my-6 h-px ${dark ? "bg-white/15" : "bg-slate-100"}`} />

      {/* Features */}
      <ul className="space-y-3">
        {visible.map((feature) => (
          <li key={feature.label} className="flex items-start gap-3 text-sm">
            <span
              className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full ${
                dark ? "bg-white/15 text-white" : "bg-blue-50 text-blue-600"
              }`}
            >
              <svg
                className="h-3 w-3"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8.5l3.2 3.2L13 4.8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={dark ? "text-blue-50" : "text-slate-600"}>
              {feature.label}
              {feature.isNew && (
                <span
                  className={`ml-2 inline-block rounded-full px-2 py-0.5 align-middle text-[10px] font-bold ${
                    dark
                      ? "bg-white/20 text-white"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  NEW
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {/* Toggle */}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className={`mt-5 inline-flex items-center gap-1 self-start text-sm font-semibold ${
            dark ? "text-white" : "text-blue-600"
          }`}
        >
          {open ? "Show less" : `+${hiddenCount} more features`}
          <svg
            className={`h-4 w-4 transition-transform ${
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
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

type PricingPlan = {
  id: string;
  name: string;
  price: number | string;
  billing_cycle: string;
  features: string[];
};

function isPricingPlan(value: unknown): value is PricingPlan {
  if (typeof value !== "object" || value === null) return false;
  const plan = value as Record<string, unknown>;
  return typeof plan.id === "string"
    && typeof plan.name === "string"
    && (typeof plan.price === "number" || typeof plan.price === "string")
    && typeof plan.billing_cycle === "string"
    && Array.isArray(plan.features) && plan.features.every((feature) => typeof feature === "string");
}

export default function Pricing() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/pricing")
      .then(async (response) => {
        const result: unknown = await response.json();
        if (!response.ok || typeof result !== "object" || result === null) throw new Error("Unable to load pricing.");
        const values = (result as { plans?: unknown }).plans;
        if (!Array.isArray(values) || !values.every(isPricingPlan)) throw new Error("Invalid pricing response.");
        return values;
      })
      .then((values) => {
        if (active) setPlans(values);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <section id="pricing" className="w-full bg-[#f7faff] px-4 py-16 font-[Arial,Helvetica,sans-serif] sm:px-6 lg:px-8">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="mb-2 text-[16px] font-bold uppercase tracking-[0.18em] text-[#2457d6]">PRICING</p>
        <h2 className="text-3xl font-bold tracking-tight text-[#17243a] sm:text-4xl">Choose the Plan That Fits Your Store</h2>
        <p className="mt-2 text-[15px] leading-6 text-[#707b8d]">Start for free and upgrade as your business grows.</p>
      </div>

      {loading && <p role="status" className="text-center text-sm text-slate-500">Loading current plans…</p>}
      {error && <p role="alert" className="text-center text-sm text-slate-600">Pricing is temporarily unavailable. Please try again later.</p>}
      {!loading && !error && plans.length === 0 && <p className="text-center text-sm text-slate-600">No pricing plans are currently available.</p>}
      {!loading && !error && plans.length > 0 && (
        <div className="mx-auto grid max-w-6xl items-stretch gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id} className="relative flex h-full flex-col rounded-xl border border-[#edf0f5] bg-white shadow-[0_5px_20px_rgba(30,60,100,0.05)]">
              <div className="border-b border-[#edf1f6] px-6 pb-4 pt-6">
                <p className="text-[14px] font-bold tracking-[0.14em] text-[#2160d9]">{plan.name}</p>
                <p className="mt-2 text-2xl font-bold text-[#17243a]">
                  PKR {Number(plan.price).toLocaleString()}
                  <span className="ml-1 text-xs font-normal text-[#707b8d]">/ {plan.billing_cycle}</span>
                </p>
              </div>
              <div className="flex-1 px-6 py-4">
                {plan.features.length ? (
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, index) => {
                      const isNew = feature.endsWith("(NEW)");
                      const cleanFeature = feature.replace(" (NEW)", "");
                      return (
                        <li key={`${plan.id}-${index}`} className="flex items-start gap-2.5 text-[14px] leading-[20px] text-[#667386]">
                          <Check size={15} strokeWidth={2} className="mt-[2px] shrink-0 text-[#3165c9]" />
                          <span>{cleanFeature}{isNew && <span className="ml-1.5 rounded bg-[#eaf1ff] px-1.5 py-[2px] text-[8px] font-bold uppercase tracking-wide text-[#2160d9]">NEW</span>}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : <p className="text-sm text-slate-500">Plan features will be announced soon.</p>}
              </div>
              <div className="px-6 pb-6 pt-2">
                <Link href="/login" prefetch className="block w-full rounded-lg bg-[#2057d7] py-2.5 text-center text-[12px] font-bold text-white shadow-[0_5px_12px_rgba(32,87,215,0.2)] transition-all duration-200 hover:bg-[#1749c1] hover:shadow-[0_7px_16px_rgba(32,87,215,0.3)]">
                  Get started
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-white py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-50 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            Pricing
          </span>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Choose the Plan That Fits Your Store
          </h2>
          <p className="mt-4 text-base text-slate-500">
            Start for free and upgrade as your business grows.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-14 grid items-start gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}