"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal, { type TemplateMetadata } from "@/components/landing/AuthModal";

export interface TemplateItem extends TemplateMetadata {
  text: string;
  preview: string;
  block: string;
}

const templates: TemplateItem[] = [
  {
    id: "fashion",
    name: "Fashion & Apparel",
    niche: "women-fashion",
    theme: "velvet-rose",
    sampleName: "Zahra Festive Pret",
    text: "Modern clothing, designer lawn, and festive wear.",
    prompt: "A contemporary designer clothing boutique specializing in ready-to-wear printed lawn, luxury chiffon festive 3-piece suits, and embroidered organza dupattas with nationwide cash on delivery.",
    preview: "from-indigo-300 via-blue-200 to-blue-100",
    block: "bg-indigo-500/70",
  },
  {
    id: "shoes",
    name: "Footwear & Shoes",
    niche: "shoes",
    theme: "ocean-blue",
    sampleName: "Aura Kicks Atelier",
    text: "Athletic sneakers, running shoes, and lifestyle trainers.",
    prompt: "A modern performance footwear brand featuring cushioned running sneakers, streetwear lifestyle kicks, and everyday comfortable trainers with nationwide delivery and Cash on Delivery.",
    preview: "from-sky-300 via-blue-200 to-cyan-100",
    block: "bg-blue-600/70",
  },
  {
    id: "home-decor",
    name: "Home Decor & Living",
    niche: "home-candles",
    theme: "artisan-cream",
    sampleName: "Haven Living Atelier",
    text: "Furniture, pottery, scented candles, and cozy decor.",
    prompt: "A modern interior boutique featuring artisanal scented soy wax candles, amber jar aromatherapy candles, ceramic wax melters, and room diffusers with nationwide delivery.",
    preview: "from-stone-200 via-amber-100 to-orange-50",
    block: "bg-amber-600/60",
  },
  {
    id: "perfume",
    name: "Perfumes & Scents",
    niche: "perfume",
    theme: "royal-gold",
    sampleName: "Velvet Oud Fragrances",
    text: "Luxury oud, French EDPs, and concentrated attars.",
    prompt: "A luxury fragrance atelier offering artisanal concentrated oud oils, French long-lasting EDP perfumes, and curated gift boxes with nationwide delivery.",
    preview: "from-amber-200 via-yellow-100 to-amber-50",
    block: "bg-amber-700/70",
  },
  {
    id: "electronics",
    name: "Electronics & Gaming",
    niche: "gaming-tech",
    theme: "cyber-slate",
    sampleName: "Nexus Gaming Gear",
    text: "Gadgets, mechanical keyboards, audio, and devices.",
    prompt: "A dedicated gaming peripherals brand featuring hot-swappable mechanical keyboards, ultra-lightweight gaming mice, RGB desk mats, and 7.1 surround headsets with cash on delivery.",
    preview: "from-blue-950 via-blue-800 to-indigo-600",
    block: "bg-sky-400/70",
  },
  {
    id: "beauty",
    name: "Beauty & Skincare",
    niche: "skincare",
    theme: "mint-fresh",
    sampleName: "Glow Botanica Organics",
    text: "Clean skincare, botanical serums, and wellness.",
    prompt: "A clean skincare brand featuring hyaluronic acid glow serums, barrier repair ceramide creams, gentle green tea cleansers, and broad-spectrum mineral sunscreens.",
    preview: "from-pink-200 via-rose-100 to-pink-50",
    block: "bg-rose-400/60",
  },
];

export default function Templates() {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);

  const handleUseTemplate = async (t: TemplateItem) => {
    setSelectedTemplate(t);
    try {
      const res = await fetch("/api/auth/check");
      if (res.ok) {
        const data = await res.json();
        if (data.loggedIn) {
          // If already logged in, navigate straight to store generation with selected template
          const params = new URLSearchParams({
            template: t.id,
            niche: t.niche || "",
            theme: t.theme || "",
            name: t.sampleName || "",
            prompt: t.prompt || "",
          });
          router.push(`/user/signup?${params.toString()}`);
          return;
        }
      }
    } catch {
      // Fallback
    }

    // If not logged in, open the Welcome Back / Auth modal with this template
    setAuthOpen(true);
  };

  return (
    <>
      <section
        id="templates"
        className="bg-soft-gradient relative scroll-mt-20 overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
      >
        {/* Decorative glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl">
          {/* Heading */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">
              Templates
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-navy sm:text-5xl">
              Start With a Ready-Made{" "}
              <span className="text-gradient">Template</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Pick a style that fits your business. Our AI fills it with your
              products, theme colors, and brand.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <div
                key={t.id}
                className="glass-card card-lift group flex flex-col justify-between rounded-3xl p-3 bg-white border border-[#bfdcff]/60 shadow-[0_10px_30px_-15px_rgba(25,118,210,0.15)]"
              >
                {/* Preview with mini store mockup */}
                <div
                  className={`relative h-44 w-full overflow-hidden rounded-2xl bg-gradient-to-br ${t.preview}`}
                  aria-hidden="true"
                >
                  <div className="absolute inset-x-4 top-4 flex items-center justify-between">
                    <span className="h-1.5 w-10 rounded-full bg-white/80" />
                    <span className="flex gap-1">
                      <span className="h-1.5 w-4 rounded-full bg-white/60" />
                      <span className="h-1.5 w-4 rounded-full bg-white/60" />
                    </span>
                  </div>

                  <div className="absolute inset-x-4 bottom-4 grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-white/85 p-1.5 shadow-sm transition-transform duration-300 group-hover:-translate-y-1"
                      >
                        <div className={`h-10 w-full rounded-lg ${t.block}`} />
                        <div className="mt-1.5 h-1 w-3/4 rounded-full bg-slate-300" />
                        <div className="mt-1 h-1 w-1/2 rounded-full bg-slate-200" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Text & Button */}
                <div className="px-2 pb-2 pt-4">
                  <h3 className="text-base font-bold text-brand-navy">
                    {t.name}
                  </h3>
                  <p className="mt-1 min-h-[40px] text-sm leading-relaxed text-slate-600">
                    {t.text}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleUseTemplate(t)}
                    className="btn-glow mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110 cursor-pointer shadow-md shadow-blue-500/20 active:scale-[0.98]"
                  >
                    Use template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth Modal for when unauthenticated user clicks Use Template */}
      <AuthModal
        open={authOpen}
        initialTab="login"
        templateData={selectedTemplate}
        onClose={() => setAuthOpen(false)}
      />
    </>
  );
}
