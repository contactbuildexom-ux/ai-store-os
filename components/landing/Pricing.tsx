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
