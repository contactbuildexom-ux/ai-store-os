'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  Store, 
  Layers, 
  Palette, 
  CheckCircle2, 
  ExternalLink, 
  Lock, 
  Globe, 
  MessageCircle,
  Cpu,
  ShieldCheck,
  Check
} from 'lucide-react';
import { THEME_PRESETS } from '@/lib/ai/ai-generator';

const PROMPT_SUGGESTIONS = [
  {
    title: 'Luxury Perfume & Oud',
    prompt: 'Create a luxury royal perfume store named Velvet Aura, with gold and obsidian theme, selling Cambodian oud, saffron EDPs, and discovery sets.',
    theme: 'royal-gold'
  },
  {
    title: 'Trendy Streetwear',
    prompt: 'A modern oversized urban streetwear brand called Nova Threads, with bold minimal styling, selling 400 GSM hoodies and cargo trousers.',
    theme: 'cyber-slate'
  },
  {
    title: 'Organic Glow Skincare',
    prompt: 'A clean botanical skincare brand called Glow Botanica, with fresh emerald green theme, selling hyaluronic acid serums and ceramide repair creams.',
    theme: 'emerald'
  },
  {
    title: 'Artisan Coffee Roasters',
    prompt: 'A specialty coffee roastery called Roast & Sip, with warm terracotta theme, selling single origin Ethiopian beans and French presses.',
    theme: 'artisan-cream'
  }
];

export default function Hero() {
  const router = useRouter();

  // Builder inputs
  const [prompt, setPrompt] = useState('Create a luxury royal perfume store named Velvet Aura, with emerald green and gold royal theme, selling signature fragrances and concentrated oud oils.');
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'advanced'>('pro');
  const [selectedTheme, setSelectedTheme] = useState('royal-gold');
  const [customName, setCustomName] = useState('Velvet Aura Fragrances');
  const [whatsappNumber, setWhatsappNumber] = useState('923001234567');
  const [adminEmail, setAdminEmail] = useState('owner@velvet-aura.com');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedStore, setGeneratedStore] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const steps = [
    'Analyzing store prompt & target audience...',
    'Generating custom color palette & theme styles...',
    'Curating realistic catalog with high-res photos & PKR pricing...',
    'Configuring subdomain routing & WhatsApp ordering...',
    'Setting up your Store Admin credentials & dashboard...'
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setErrorMessage('Please enter a description or prompt for your store.');
      return;
    }

    setErrorMessage('');
    setIsGenerating(true);
    setGenerationStep(0);

    // Step animation interval
    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 700);

    try {
      const res = await fetch('/api/ai/create-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          plan: selectedPlan,
          selected_theme: selectedTheme,
          custom_store_name: customName,
          whatsapp_number: whatsappNumber,
          owner_email: adminEmail,
          password: 'store-admin-pass'
        })
      });

      const data = await res.json();
      clearInterval(stepInterval);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate store');
      }

      setGeneratedStore(data);
    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorMessage(err.message || 'Error occurred while creating store.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-slate-950 pt-16 pb-24 text-white sm:pt-20 lg:pb-32">
      {/* Background Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-950/40 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Badges & Headline */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 backdrop-blur-md">
            <Cpu size={14} className="text-emerald-400" /> Model Context Protocol (MCP) AI Integrated
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.1]">
            Build Your Online Store in <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">30 Seconds</span> with AI
          </h1>

          <p className="mt-5 text-base font-light text-slate-300 sm:text-lg">
            Give a prompt, choose your theme & plan tier. AI creates your live storefront with a subdomain, catalog products with imagery, WhatsApp checkout, and your own Store Admin dashboard.
          </p>
        </div>

        {/* The Interactive AI Store Builder Box */}
        <div className="mx-auto mt-12 max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300">
              {errorMessage}
            </div>
          )}

          {!generatedStore ? (
            <form onSubmit={handleGenerate} className="space-y-8">
              {/* 1. Prompt Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Sparkles size={14} /> 1. Describe Your Dream Store (Prompt)
                  </label>
                  <span className="text-[11px] text-slate-400">Natural Language Prompt</span>
                </div>

                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., Create a luxury perfume store called Velvet Aura with royal emerald and gold theme..."
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition"
                  required
                />

                {/* Prompt Suggestion Pills */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-slate-400">Try examples:</span>
                  {PROMPT_SUGGESTIONS.map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => {
                        setPrompt(item.prompt);
                        setSelectedTheme(item.theme);
                        if (item.theme === 'royal-gold') setCustomName('Velvet Aura Fragrances');
                        if (item.theme === 'cyber-slate') setCustomName('Nova Threads');
                        if (item.theme === 'emerald') setCustomName('Glow Botanica');
                        if (item.theme === 'artisan-cream') setCustomName('Roast & Sip Co.');
                      }}
                      className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-[11px] text-slate-300 hover:border-emerald-500/50 hover:text-white transition"
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Three Main Plan Categories (Free, Pro, Advanced) */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-3">
                  <Layers size={14} /> 2. Choose Store Plan Tier
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Free Plan */}
                  <div
                    onClick={() => setSelectedPlan('free')}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      selectedPlan === 'free'
                        ? 'border-emerald-500 bg-emerald-950/20 ring-2 ring-emerald-500/20'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">Free Plan</span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">Rs. 0</span>
                    </div>
                    <ul className="mt-3 space-y-1.5 text-[11px] text-slate-400">
                      <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Max 10 Products</li>
                      <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> 3 Categories</li>
                      <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Standard Subdomain</li>
                      <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Store Admin Portal</li>
                    </ul>
                  </div>

                  {/* Pro Plan */}
                  <div
                    onClick={() => setSelectedPlan('pro')}
                    className={`relative cursor-pointer rounded-2xl border p-4 transition ${
                      selectedPlan === 'pro'
                        ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/30'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <span className="absolute -top-2.5 right-3 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-950">
                      Most Popular
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">Pro Plan</span>
                      <span className="rounded bg-emerald-900/60 px-2 py-0.5 text-[10px] font-bold text-emerald-300">Rs. 1,499/mo</span>
                    </div>
                    <ul className="mt-3 space-y-1.5 text-[11px] text-slate-300">
                      <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Max 25 Products</li>
                      <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> 6 Categories</li>
                      <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> WhatsApp Checkout</li>
                      <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Full Theme Customizer</li>
                    </ul>
                  </div>

                  {/* Advanced Plan */}
                  <div
                    onClick={() => setSelectedPlan('advanced')}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      selectedPlan === 'advanced'
                        ? 'border-emerald-500 bg-emerald-950/20 ring-2 ring-emerald-500/20'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">Advanced Plan</span>
                      <span className="rounded bg-indigo-900/60 px-2 py-0.5 text-[10px] font-bold text-indigo-300">Rs. 3,999/mo</span>
                    </div>
                    <ul className="mt-3 space-y-1.5 text-[11px] text-slate-400">
                      <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Unlimited Products</li>
                      <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Unlimited Categories</li>
                      <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> MCP AI Assistant</li>
                      <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Custom Domain Support</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 3. Theme Presets Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-3">
                  <Palette size={14} /> 3. Select Visual Theme Preset
                </label>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {Object.values(THEME_PRESETS).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTheme(t.id)}
                      className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition ${
                        selectedTheme === t.id
                          ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/20 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-2">
                        <span className="size-4 rounded-full border border-white/20" style={{ backgroundColor: t.primaryColor }} />
                        <span className="size-3 rounded-full border border-white/20" style={{ backgroundColor: t.secondaryColor || t.accentColor }} />
                      </div>
                      <span className="text-[11px] font-bold leading-tight">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Store Branding & Admin Setup */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5 space-y-4">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Store Details & WhatsApp Settings
                </span>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="E.g. Velvet Aura"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      WhatsApp Orders Number
                    </label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="923001234567"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@mystore.com"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Generate CTA Button */}
              <div>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-4 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-400 disabled:opacity-60"
                >
                  <Sparkles size={18} />
                  <span>Generate E-Commerce Store with AI</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          ) : (
            /* STORE CREATED SUCCESS DISPLAY */
            <div className="space-y-6 text-center py-6">
              <div className="grid size-16 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-white">Your AI Store is Live! 🎉</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {generatedStore.message}
                </p>
              </div>

              {/* Details Card */}
              <div className="mx-auto max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">Store Name:</span>
                  <span className="font-bold text-white text-sm">{generatedStore.store.name}</span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">Subdomain Link:</span>
                  <span className="font-mono text-emerald-400 text-xs font-semibold">
                    https://{generatedStore.store.subdomain}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">Subscription Tier:</span>
                  <span className="rounded bg-emerald-950 px-2.5 py-0.5 text-xs font-bold text-emerald-300 uppercase">
                    {generatedStore.store.plan}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">Curated Products:</span>
                  <span className="font-bold text-white text-xs">{generatedStore.store.total_products} items</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Admin Account:</span>
                  <span className="font-mono text-slate-300 text-xs">{generatedStore.store.owner_email}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
                <Link
                  href={generatedStore.live_url}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 shadow-md hover:bg-emerald-400 transition"
                >
                  <ExternalLink size={15} /> Visit Live Storefront
                </Link>

                <Link
                  href={generatedStore.admin_url}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-700 transition"
                >
                  <Store size={15} /> Manage as Store Admin
                </Link>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setGeneratedStore(null)}
                  className="text-xs text-slate-500 hover:text-slate-300 underline"
                >
                  Create another store with a different prompt
                </button>
              </div>
            </div>
          )}

          {/* GENERATION PROGRESS OVERLAY */}
          {isGenerating && (
            <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <span className="size-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                <span className="font-bold text-emerald-400 text-sm">Building Your Store with AI...</span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                {steps[generationStep]}
              </p>
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden max-w-md mx-auto">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${((generationStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* ---------- Sidebar icons ---------- */
const sidebarIcons = [
  // Home
  <path key="home" d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V11z" />,
  // Store
  <g key="store">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </g>,
  // Products
  <g key="box">
    <path d="M21 8l-9-5-9 5 9 5 9-5z" />
    <path d="M3 8v8l9 5 9-5V8" />
  </g>,
  // Orders
  <g key="cart">
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M2 3h3l2.5 12h11L21 7H6" />
  </g>,
  // Analytics
  <path key="chart" d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  // Settings
  <g key="gear">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
  </g>,
];

const categories = ["New Arrivals", "Best Sellers", "Home & Living", "Accessories"];
const categoryColors = ["bg-slate-800", "bg-slate-300", "bg-stone-500", "bg-amber-900"];

const productRows = [
  { name: "Wireless Headphones", price: "Rs 8,500", stock: "24 in stock" },
  { name: "Ceramic Vase", price: "Rs 2,200", stock: "12 in stock" },
  { name: "Leather Bag", price: "Rs 6,900", stock: "8 in stock" },
  { name: "Wooden Chair", price: "Rs 11,500", stock: "5 in stock" },
];

const orderRows = [
  { id: "#1042", name: "Ayesha K.", status: "Delivered", color: "bg-emerald-100 text-emerald-700" },
  { id: "#1043", name: "Hassan R.", status: "Shipped", color: "bg-blue-100 text-blue-700" },
  { id: "#1044", name: "Sana M.", status: "Pending", color: "bg-amber-100 text-amber-700" },
  { id: "#1045", name: "Ali Z.", status: "Pending", color: "bg-amber-100 text-amber-700" },
];

const bars = [35, 55, 40, 70, 60, 85, 75];

/* ---------- Mockup 6 views ---------- */
function Title({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-sm font-bold text-brand-navy">{children}</p>;
}

function HomeView() {
  const stats = [
    { label: "Sales", value: "Rs 84K" },
    { label: "Orders", value: "126" },
    { label: "Visitors", value: "2.4K" },
  ];
  return (
    <>
      <Title>Welcome back</Title>
      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-blue-50 p-3">
            <p className="text-[9px] text-slate-500">{s.label}</p>
            <p className="mt-1 text-sm font-bold text-brand-navy">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl bg-slate-50 p-3">
        <p className="mb-2 text-[9px] text-slate-500">Sales this week</p>
        <div className="flex h-16 items-end gap-2">
          {bars.map((h, i) => (
            <span
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-blue-600 to-sky-400"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function StoreView() {
  return (
    <>
      <div className="mb-3 flex items-center justify-between text-[10px] text-slate-500">
        <b className="text-sm text-brand-navy">Buildexom</b>
        <span className="hidden gap-3 sm:flex">
          <span>Home</span>
          <span>Shop</span>
          <span>About</span>
          <span>Contact</span>
        </span>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-sky-100 p-5">
        <p className="max-w-[9rem] text-base font-bold leading-tight text-brand-navy">
          Better Products for a Brighter You
        </p>
        <p className="mt-2 max-w-[9rem] text-[9px] text-slate-500">
          Discover premium products designed for modern life.
        </p>
        <Link
          href="/#templates"
          className="mt-3 inline-block cursor-pointer rounded-md bg-brand-navy px-3 py-1.5 text-[9px] font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Shop Now
        </Link>
        <div className="absolute bottom-0 right-8 h-24 w-16 rounded-t-[2rem] rounded-b-xl bg-white shadow-inner" />
        <div className="absolute bottom-20 right-10 h-14 w-12 rounded-full bg-blue-600/80" />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {categories.map((c, i) => (
          <div key={c} className="rounded-xl bg-slate-50 py-3 text-center">
            <span className={`mx-auto mb-2 block h-8 w-6 rounded ${categoryColors[i]}`} />
            <span className="text-[8px] text-slate-500">{c}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function ProductsView() {
  return (
    <>
      <Title>Products</Title>
      <div className="space-y-2">
        {productRows.map((p, i) => (
          <div key={p.name} className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5">
            <span className={`h-9 w-9 shrink-0 rounded-lg ${categoryColors[i]}`} />
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-brand-navy">{p.name}</p>
              <p className="text-[9px] text-slate-500">{p.stock}</p>
            </div>
            <p className="text-[11px] font-bold text-brand-navy">{p.price}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function OrdersView() {
  return (
    <>
      <Title>Recent orders</Title>
      <div className="space-y-2">
        {orderRows.map((o) => (
          <div key={o.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
            <div>
              <p className="text-[11px] font-semibold text-brand-navy">{o.id}</p>
              <p className="text-[9px] text-slate-500">{o.name}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${o.color}`}>
              {o.status}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function AnalyticsView() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <>
      <Title>Analytics</Title>
      <div className="rounded-xl bg-slate-50 p-3">
        <p className="text-[9px] text-slate-500">Visitors this week</p>
        <p className="text-lg font-bold text-brand-navy">
          2,430 <span className="text-[10px] font-semibold text-emerald-600">+12%</span>
        </p>
        <div className="mt-3 flex h-20 items-end gap-2">
          {bars.map((h, i) => (
            <div key={i} className="flex h-full flex-1 flex-col justify-end gap-1">
              <span
                className="w-full rounded-t bg-gradient-to-t from-blue-700 to-sky-400"
                style={{ height: `${h}%` }}
              />
              <span className="text-center text-[8px] text-slate-400">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function SettingsView() {
  const [toggles, setToggles] = useState([true, true, false]);
  const labels = ["WhatsApp ordering", "Email notifications", "Show Buildexom branding"];
  return (
    <>
      <Title>Store settings</Title>
      <div className="space-y-2">
        {labels.map((l, i) => (
          <div key={l} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
            <span className="text-[11px] text-slate-700">{l}</span>
            <button
              type="button"
              aria-label={l}
              onClick={() => setToggles(toggles.map((t, j) => (j === i ? !t : t)))}
              className={`relative h-5 w-9 cursor-pointer rounded-full transition-colors ${
                toggles[i] ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                  toggles[i] ? "left-[18px]" : "left-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

const views = [HomeView, StoreView, ProductsView, OrdersView, AnalyticsView, SettingsView];

/* ---------- Right side: dashboard mockup + AI card ---------- */
function Mockup() {
  const [prompt, setPrompt] = useState("");
  const [active, setActive] = useState(1);
  const View = views[active];

  return (
    <div className="relative mx-auto w-full max-w-[520px] pb-14 lg:ml-auto">
      {/* Soft glow behind mockup */}
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-blue-200/60 via-sky-100/40 to-transparent blur-2xl"
      />

      {/* Floating chip: top left */}
      <div className="glass-card animate-float absolute -left-6 top-10 z-20 hidden items-center gap-2 rounded-2xl px-3 py-2 sm:flex">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-600">
          ✓
        </span>
        <div>
          <p className="text-[11px] font-bold text-brand-navy">Store is live</p>
          <p className="text-[9px] text-slate-500">Built in 2 minutes</p>
        </div>
      </div>

      {/* Dashboard */}
      <div className="flex overflow-hidden rounded-3xl border border-white bg-white shadow-2xl shadow-blue-900/15 ring-1 ring-blue-100">
        {/* Sidebar */}
        <div className="flex w-12 flex-col items-center gap-3 bg-gradient-to-b from-[#0b1b4d] to-[#13307f] py-5">
          {sidebarIcons.map((icon, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors ${
                active === i
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/40"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {icon}
              </svg>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[300px] flex-1 p-4">
          <div className="mb-3 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-2 w-2 rounded-full bg-blue-100" />
            ))}
          </div>
          <View />
        </div>
      </div>

      {/* Floating AI card (yahan id lagi hai, cursor yahin aayega) */}
      <div
        id="generate-store"
        className="glass-card animate-float absolute bottom-0 right-0 z-20 w-56 rounded-2xl p-4 lg:-right-4"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 text-[10px] font-bold text-white">
          AI
        </span>
        <p className="mt-2 text-sm font-bold text-brand-navy">Describe your store</p>
        <textarea
          id="store-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A store for handmade candles, with a clean and minimal design..."
          className="mt-2 h-16 w-full resize-none rounded-lg border border-blue-100 bg-white/80 p-2 text-[11px] leading-snug text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <Link
          href="/login"
          className="btn-glow mt-3 block w-full rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 py-2 text-center text-xs font-semibold text-white transition hover:brightness-110"
        >
          ✦ Generate Store
        </Link>
      </div>
    </div>
  );
}

/* ---------- Hero ---------- */
const DEMO_VIDEO = "/demo.mp4";

export default function Hero() {
  const [showDemo, setShowDemo] = useState(false);

  /* Demo popup: Escape se band */
  useEffect(() => {
    if (!showDemo) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowDemo(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showDemo]);

  /* "/#generate-store" wale kisi bhi link par click ho to
     Describe your store box tak scroll hoga aur cursor textbox mein aayega */
  useEffect(() => {
    const focusPrompt = () => {
      document
        .getElementById("generate-store")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => {
        (document.getElementById("store-prompt") as HTMLTextAreaElement | null)?.focus({
          preventScroll: true,
        });
      }, 800);
    };

    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a");
      const href = link?.getAttribute("href");
      if (href === "/#generate-store" || href === "#generate-store") {
        window.setTimeout(focusPrompt, 120);
      }
    };

    document.addEventListener("click", onClick);

    // Doosre page se /#generate-store khol kar aaye to bhi kaam kare
    if (window.location.hash === "#generate-store") {
      window.setTimeout(focusPrompt, 500);
    }

    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <section className="bg-modern relative overflow-hidden">
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-blue-300/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-0 h-[320px] w-[320px] rounded-full bg-sky-200/40 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-14 px-5 pb-24 pt-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-16">
        {/* Left: text */}
        <div>
          <span className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-blue-700">
            <span className="text-blue-500">✦</span> AI-Powered Store Builder
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-brand-navy sm:text-5xl lg:text-[56px]">
            Build Your Online Store <br />
            in Minutes <span className="text-gradient">with AI</span>
          </h1>

          <p className="mt-6 max-w-[500px] text-[17px] leading-8 text-slate-600">
            Turn your ideas into a fully functional online store. No coding, no hassle. Just describe
            your business and let our AI handle the rest.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/#generate-store"
              className="btn-glow inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-7 py-4 text-[15px] font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110"
            >
              Start Building Free <span aria-hidden>→</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowDemo(true)}
              className="glass-card inline-flex cursor-pointer items-center gap-2 rounded-xl px-7 py-4 text-[15px] font-semibold text-brand-navy transition hover:-translate-y-0.5"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[9px] text-white">
                ▶
              </span>
              Watch Demo
            </button>
          </div>

          {/* Social proof (sample number, asli number baad mein lagayein) */}
          <div className="mt-9 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["bg-amber-200", "bg-rose-200", "bg-emerald-200", "bg-sky-200"].map((c) => (
                <span key={c} className={`h-9 w-9 rounded-full border-2 border-white shadow-sm ${c}`} />
              ))}
            </div>
            <p className="text-sm font-medium text-slate-600">
              Join 50,000+ happy creators and business owners
            </p>
          </div>
        </div>

        {/* Right: interactive mockup */}
        <Mockup />
      </div>

      {/* Demo video popup */}
      {showDemo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-navy/80 p-4 backdrop-blur-sm"
          onClick={() => setShowDemo(false)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close demo"
              onClick={() => setShowDemo(false)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-900 hover:bg-white"
            >
              ✕
            </button>
            <video src={DEMO_VIDEO} controls autoPlay className="aspect-video w-full" />
          </div>
        </div>
      )}
    </section>
  );
}