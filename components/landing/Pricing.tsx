"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Feature = {
  label: string;
  isNew?: boolean;
  locked?: boolean; // true = disabled jab tak customer pay na kare
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

type ApiPlan = {
  id: string;
  name: string;
  price: number | string;
  billing_cycle: string;
  features: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isApiPlan(value: unknown): value is ApiPlan {
  if (!isRecord(value)) return false;
  if (typeof value.price !== "number" && typeof value.price !== "string") return false;
  if (typeof value.price === "string" && !value.price.trim()) return false;
  const price = typeof value.price === "number" ? value.price : Number(value.price);
  return typeof value.id === "string"
    && value.id.length > 0
    && typeof value.name === "string"
    && value.name.trim().length > 0
    && (typeof value.price === "number" || typeof value.price === "string")
    && Number.isFinite(price)
    && price >= 0
    && typeof value.billing_cycle === "string"
    && value.billing_cycle.trim().length > 0
    && Array.isArray(value.features)
    && value.features.every((feature) => typeof feature === "string" && feature.trim().length > 0);
}

function toPlan(record: ApiPlan): Plan {
  const planName = record.name.trim();
  const normalizedName = planName.toLowerCase();
  const amount = Number(record.price);
  const presentation = {
    basic: {
      description: "Perfect for starting your online store.",
      cta: "Get Started Free",
      href: "/login?mode=signup",
    },
    pro: {
      description: "For growing stores that need more flexibility.",
      cta: "Upgrade to Pro",
      href: "/login?mode=signup&plan=pro",
      popular: true,
    },
    business: {
      description: "For businesses ready to scale their online store.",
      cta: "Go Business",
      href: "/login?mode=signup&plan=business",
    },
  }[normalizedName];

  return {
    id: record.id,
    name: planName,
    price: amount === 0
      ? "Free"
      : `PKR ${amount.toLocaleString("en-PK", { maximumFractionDigits: 2 })} / ${record.billing_cycle}`,
    description: presentation?.description ?? "A flexible plan for your online store.",
    features: record.features.map((label) => ({ label })),
    cta: presentation?.cta ?? "Get Started",
    href: presentation?.href ?? "/login?mode=signup",
    popular: presentation?.popular,
  };
}

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const dark = Boolean(plan.popular);
  const visible = open ? plan.features : plan.features.slice(0, VISIBLE_COUNT);
  const hiddenCount = plan.features.length - VISIBLE_COUNT;
  const hasLocked = plan.features.some((f) => f.locked);

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
        {plan.popular && (
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
          className={`group/btn mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
            dark
              ? "bg-white text-[#0b2545] hover:bg-blue-50 hover:shadow-white/30"
              : "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white hover:shadow-blue-300/50"
          }`}
        >
          {plan.cta}
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
              key={`${plan.id}-${featureIndex}-${feature.label}`}
              title={
                feature.locked ? "Payment ke baad enable ho jayega" : undefined
              }
              className={`flex items-start gap-3 text-sm transition duration-200 ${
                feature.locked
                  ? "cursor-not-allowed opacity-60"
                  : "hover:translate-x-1"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full transition duration-200 ${
                  feature.locked
                    ? dark
                      ? "bg-white/10 text-white/70"
                      : "bg-slate-100 text-slate-400"
                    : dark
                    ? "bg-white/15 text-white"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                {feature.locked ? (
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <rect
                      x="3.5"
                      y="7"
                      width="9"
                      height="6.5"
                      rx="1.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M5.5 7V5a2.5 2.5 0 015 0v2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
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
                )}
              </span>
              <span
                className={`${
                  feature.locked
                    ? dark
                      ? "text-blue-100/80 line-through decoration-white/30"
                      : "text-slate-400 line-through decoration-slate-300"
                    : dark
                    ? "text-blue-50"
                    : "text-slate-600"
                }`}
              >
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
                {feature.locked && (
                  <span
                    className={`ml-2 inline-block rounded-full px-2 py-0.5 align-middle text-[10px] font-bold no-underline ${
                      dark
                        ? "bg-amber-300/20 text-amber-200"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    LOCKED
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

        {/* Locked note */}
        {hasLocked && open && (
          <p
            className={`mt-4 rounded-lg px-3 py-2 text-xs ${
              dark ? "bg-white/10 text-blue-100" : "bg-amber-50 text-amber-700"
            }`}
          >
            Locked features payment ke baad automatically unlock ho jayengi.
          </p>
        )}
      </div>
    </div>
  );
}

export default function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPlans() {
      try {
        const response = await fetch("/api/pricing", { cache: "no-store", signal: controller.signal });
        let body: unknown;
        try {
          body = await response.json();
        } catch {
          throw new Error("The pricing service returned an invalid response.");
        }
        if (!response.ok) {
          const message = isRecord(body) && typeof body.error === "string"
            ? body.error
            : "Unable to load pricing plans.";
          throw new Error(message);
        }
        if (!isRecord(body) || !Array.isArray(body.plans) || !body.plans.every(isApiPlan)) {
          throw new Error("The pricing service returned invalid plan data.");
        }
        setPlans(body.plans.map(toPlan));
      } catch (reason) {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : "Unable to load pricing plans.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadPlans();
    return () => controller.abort();
  }, []);

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-white py-12 sm:py-16 lg:py-20"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-50 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            Pricing
          </span>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-[#0b2545] sm:text-5xl lg:text-6xl">
            Choose the Plan That Fits Your Store
          </h2>
          <p className="mt-4 text-base text-slate-500">
            Start for free and upgrade as your business grows.
          </p>
        </div>

        {error && <p role="alert" className="mt-8 text-center text-sm text-red-600">{error}</p>}

        {/* Cards */}
        <div className="mt-8 grid items-stretch gap-6 sm:mt-10 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>
        {loading && <p role="status" className="mt-8 text-center text-sm text-slate-500">Loading pricing plans…</p>}
        {!loading && !error && plans.length === 0 && <p role="status" className="mt-8 text-center text-sm text-slate-500">No pricing plans are currently available.</p>}
      </div>
    </section>
  );
}