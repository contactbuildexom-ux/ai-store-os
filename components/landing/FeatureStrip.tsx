import { Sparkles, MessageCircle, Store, Zap } from 'lucide-react';

export default function FeatureStrip() {
  const features = [
    {
      icon: Sparkles,
      title: 'Prompt to Live Storefront',
      desc: 'Type your vision in plain Urdu or English; AI writes copy, curates products, and assigns styles.'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Direct Checkout',
      desc: 'Customers order in 1-click via pre-formatted WhatsApp invoices with itemized totals and city delivery fee.'
    },
    {
      icon: Store,
      title: 'Dedicated Store Admin',
      desc: 'Every store builder becomes the Store Admin with full permissions to edit, delete, modify, and add items.'
    },
    {
      icon: Zap,
      title: 'Model Context Protocol (MCP)',
      desc: 'Built on open AI standards allowing agentic tools to manage themes, stock, and customer assistant chat.'
    }
  ];

  return (
    <section id="features" className="border-y border-slate-800 bg-slate-950 py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-3.5">
                <Icon size={20} />
              </span>
              <h3 className="text-sm font-bold text-white mb-1">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>

"use client";

import {
  Zap,
  Smartphone,
  ShieldCheck,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "AI-Powered Setup",
    description:
      "Describe your business and get a complete store in seconds.",
  },
  {
    icon: Smartphone,
    title: "Fully Responsive",
    description:
      "Looks perfect on every device — desktop, tablet, or mobile.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Reliable",
    description:
      "Your data is always protected with industry-leading security.",
  },
  {
    icon: BarChart3,
    title: "Built for Growth",
    description:
      "Get the tools you need to scale — from marketing to analytics.",
  },
];

export default function FeaturesStrip() {
  return (
    <section
      className="w-full border-y border-[#e8edf4] bg-[#f8faff] px-4 py-7 font-[Arial,Helvetica,sans-serif] sm:px-6 lg:px-8"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="flex items-start gap-3"
            >
              {/* Icon */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef4ff]">
                <Icon
                  size={15}
                  strokeWidth={2}
                  className="text-[#2457d6]"
                />
              </div>

              {/* Text */}
              <div className="pt-[1px]">
                <h3 className="text-[14px] font-bold leading-[17px] text-[#17243a]">
                  {feature.title}
                </h3>

                <p className="mt-0.5 max-w-[190px] text-[13px] leading-[15px] text-[#707b8d]">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
