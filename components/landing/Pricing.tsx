import { Check, Sparkles, ArrowRight } from 'lucide-react';

export default function Pricing() {
  const plans = [
    {
      name: 'Free Plan',
      price: 'Rs. 0',
      period: 'Forever free',
      desc: 'Ideal for trying out store building and testing product ideas.',
      features: [
        'Max 10 Products in Catalog',
        'Up to 3 Categories',
        'Standard Subdomain (store.buildexom.store)',
        'Store Admin Dashboard',
        'Direct WhatsApp Order Links',
        'Standard Theme Layout'
      ],
      popular: false,
      cta: 'Start with Free'
    },
    {
      name: 'Pro Plan',
      price: 'Rs. 1,499',
      period: 'per month',
      desc: 'Our most popular plan for active e-commerce brands & growing sellers.',
      features: [
        'Max 25 Products in Catalog',
        'Up to 6 Categories',
        'Full WhatsApp Cart Drawer Checkout',
        'Theme Customizer (Colors & Fonts)',
        'AI Product Catalog Generator',
        'Delivery Fee Rules (Local vs Other Cities)',
        'Store Analytics & Orders Overview'
      ],
      popular: true,
      cta: 'Build with Pro Plan'
    },
    {
      name: 'Advanced Plan',
      price: 'Rs. 3,999',
      period: 'per month',
      desc: 'For high-volume brands needing unlimited capacity and AI agents.',
      features: [
        'Unlimited Products & Categories',
        'MCP AI Chatbot Store Assistant',
        'Custom Domain Linking (.com / .pk)',
        'Priority 24/7 WhatsApp Support',
        'Automated Inventory Stock Alerts',
        'Wholesale & Pricing Intelligence'
      ],
      popular: false,
      cta: 'Build with Advanced'
    }
  ];

  return (
    <section id="pricing" className="bg-slate-950 py-24 px-4 sm:px-6 border-t border-slate-800">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Pricing & Tiers</span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Choose Your Store Tier
          </h2>
          <p className="mt-3 text-xs text-slate-400 sm:text-sm">
            Launch for free today. Upgrade anytime as your catalog and order volume expand.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl border p-8 flex flex-col justify-between transition ${
                p.popular
                  ? 'border-emerald-500 bg-slate-900/90 ring-2 ring-emerald-500/20 shadow-2xl'
                  : 'border-slate-800 bg-slate-900/40'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-950">
                  Most Popular Choice
                </span>
              )}

              <div>
                <h3 className="text-lg font-bold text-white">{p.name}</h3>
                <p className="mt-1 text-xs text-slate-400">{p.desc}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-mono">{p.price}</span>
                  <span className="text-xs text-slate-400">/{p.period}</span>
                </div>

                <div className="mt-8 border-t border-slate-800 pt-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">What's included:</span>
                  <ul className="mt-4 space-y-3 text-xs text-slate-300">
                    {p.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800">
                <a
                  href="#hero"
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition ${
                    p.popular
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  <span>{p.cta}</span>
                  <ArrowRight size={14} />
                </a>
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
  return (
    typeof plan.id === "string" &&
    typeof plan.name === "string" &&
    (typeof plan.price === "number" || typeof plan.price === "string") &&
    typeof plan.billing_cycle === "string" &&
    Array.isArray(plan.features) &&
    plan.features.every((feature) => typeof feature === "string")
  );
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
        if (
          !response.ok ||
          typeof result !== "object" ||
          result === null
        ) {
          throw new Error("Unable to load pricing.");
        }
        const values = (result as { plans?: unknown }).plans;
        if (!Array.isArray(values) || !values.every(isPricingPlan)) {
          throw new Error("Invalid pricing response.");
        }
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
    return () => {
      active = false;
    };
  }, []);

  return (
    <section
      id="pricing"
      className="w-full bg-[#f7faff] px-4 py-16 font-[Arial,Helvetica,sans-serif] sm:px-6 lg:px-8"
    >
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="mb-2 text-[16px] font-bold uppercase tracking-[0.18em] text-[#2457d6]">
          PRICING
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-[#17243a] sm:text-4xl">
          Choose the Plan That Fits Your Store
        </h2>
        <p className="mt-2 text-[15px] leading-6 text-[#707b8d]">
          Start for free and upgrade as your business grows.
        </p>
      </div>

      {loading && (
        <p role="status" className="text-center text-sm text-slate-500">
          Loading current plans…
        </p>
      )}
      {error && (
        <p role="alert" className="text-center text-sm text-slate-600">
          Pricing is temporarily unavailable. Please try again later.
        </p>
      )}
      {!loading && !error && plans.length === 0 && (
        <p className="text-center text-sm text-slate-600">
          No pricing plans are currently available.
        </p>
      )}
      {!loading && !error && plans.length > 0 && (
        <div className="mx-auto grid max-w-6xl items-stretch gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="relative flex h-full flex-col rounded-xl border border-[#edf0f5] bg-white shadow-[0_5px_20px_rgba(30,60,100,0.05)]"
            >
              <div className="border-b border-[#edf1f6] px-6 pb-4 pt-6">
                <p className="text-[14px] font-bold tracking-[0.14em] text-[#2160d9]">
                  {plan.name}
                </p>
                <p className="mt-2 text-2xl font-bold text-[#17243a]">
                  PKR {Number(plan.price).toLocaleString()}
                  <span className="ml-1 text-xs font-normal text-[#707b8d]">
                    / {plan.billing_cycle}
                  </span>
                </p>
              </div>
              <div className="flex-1 px-6 py-4">
                {plan.features.length ? (
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, index) => {
                      const isNew = feature.endsWith("(NEW)");
                      const cleanFeature = feature.replace(" (NEW)", "");
                      return (
                        <li
                          key={`${plan.id}-${index}`}
                          className="flex items-start gap-2.5 text-[14px] leading-[20px] text-[#667386]"
                        >
                          <Check
                            size={15}
                            strokeWidth={2}
                            className="mt-[2px] shrink-0 text-[#3165c9]"
                          />
                          <span>
                            {cleanFeature}
                            {isNew && (
                              <span className="ml-1.5 rounded bg-[#eaf1ff] px-1.5 py-[2px] text-[8px] font-bold uppercase tracking-wide text-[#2160d9]">
                                NEW
                              </span>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">
                    Plan features will be announced soon.
                  </p>
                )}
              </div>
              <div className="px-6 pb-6 pt-2">
                <Link
                  href="/login"
                  prefetch
                  className="block w-full rounded-lg bg-[#2057d7] py-2.5 text-center text-[12px] font-bold text-white shadow-[0_5px_12px_rgba(32,87,215,0.2)] transition-all duration-200 hover:bg-[#1749c1] hover:shadow-[0_7px_16px_rgba(32,87,215,0.3)]"
                >
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
