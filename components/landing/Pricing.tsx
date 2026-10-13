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