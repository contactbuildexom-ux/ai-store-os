"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal, { type TemplateMetadata } from "@/components/landing/AuthModal";

export interface TemplateItem extends TemplateMetadata {
  slug: string;
  categoryBadge: string;
  headline: string;
  heroImage: string;
  secondaryImage: string;
  priceTag: string;
  primaryColor: string;
  text: string;
}

const templates: TemplateItem[] = [
  {
    id: "fashion",
    name: "Fashion & Apparel",
    slug: "zahra-pret",
    niche: "women-fashion",
    theme: "velvet-rose",
    sampleName: "Zahra Festive Pret",
    categoryBadge: "Lawn & Pret",
    headline: "Luxury Designer Lawn & Chiffon Suits",
    heroImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80",
    priceTag: "Rs. 4,500",
    primaryColor: "#831843",
    text: "Modern clothing, designer lawn, and festive wear.",
    prompt: "A contemporary designer clothing boutique specializing in ready-to-wear printed lawn, luxury chiffon festive 3-piece suits, and embroidered organza dupattas with nationwide cash on delivery.",
  },
  {
    id: "home-decor",
    name: "Home Decor & Living",
    slug: "haven-living",
    niche: "home-candles",
    theme: "artisan-cream",
    sampleName: "Haven Living Atelier",
    categoryBadge: "Candles & Decor",
    headline: "Artisan Soy Candles & Cozy Homeware",
    heroImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80",
    priceTag: "Rs. 2,800",
    primaryColor: "#78350f",
    text: "Furniture, pottery, scented candles, and cozy decor.",
    prompt: "A modern interior boutique featuring artisanal scented soy wax candles, amber jar aromatherapy candles, ceramic wax melters, and room diffusers with nationwide delivery.",
  },
  {
    id: "electronics",
    name: "Electronics & Gaming",
    slug: "nexus-gear",
    niche: "gaming-tech",
    theme: "cyber-slate",
    sampleName: "Nexus Gaming Gear",
    categoryBadge: "Gaming & Audio",
    headline: "Mechanical Keyboards & Pro Esports Gear",
    heroImage: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1612287233207-68698c92a6c8?auto=format&fit=crop&w=600&q=80",
    priceTag: "Rs. 7,200",
    primaryColor: "#1e1b4b",
    text: "Gadgets, mechanical keyboards, audio, and devices.",
    prompt: "A dedicated gaming peripherals brand featuring hot-swappable mechanical keyboards, ultra-lightweight gaming mice, RGB desk mats, and 7.1 surround headsets with cash on delivery.",
  },
  {
    id: "beauty",
    name: "Beauty & Skincare",
    slug: "glow-botanica",
    niche: "skincare",
    theme: "mint-fresh",
    sampleName: "Glow Botanica Organics",
    categoryBadge: "Clean Skincare",
    headline: "Hyaluronic Serums & Barrier Repair Glow",
    heroImage: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80",
    priceTag: "Rs. 2,250",
    primaryColor: "#059669",
    text: "Clean skincare, botanical serums, and wellness.",
    prompt: "A clean skincare brand featuring hyaluronic acid glow serums, barrier repair ceramide creams, gentle green tea cleansers, and broad-spectrum mineral sunscreens.",
  },
  {
    id: "shoes",
    name: "Footwear & Shoes",
    slug: "aura-kicks",
    niche: "shoes",
    theme: "ocean-blue",
    sampleName: "Aura Kicks Atelier",
    categoryBadge: "Kicks & Runners",
    headline: "Performance Running Sneakers & Trainers",
    heroImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80",
    priceTag: "Rs. 5,900",
    primaryColor: "#1976d2",
    text: "Athletic sneakers, running shoes, and lifestyle trainers.",
    prompt: "A modern performance footwear brand featuring cushioned running sneakers, streetwear lifestyle kicks, and everyday comfortable trainers with nationwide delivery and Cash on Delivery.",
  },
  {
    id: "perfume",
    name: "Perfumes & Scents",
    slug: "velvet-oud",
    niche: "perfume",
    theme: "royal-gold",
    sampleName: "Velvet Oud Fragrances",
    categoryBadge: "Oud & Attars",
    headline: "Pure Concentrated Oud & French EDPs",
    heroImage: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80",
    priceTag: "Rs. 3,850",
    primaryColor: "#0f172a",
    text: "Luxury oud, French EDPs, and concentrated attars.",
    prompt: "A luxury fragrance atelier offering artisanal concentrated oud oils, French long-lasting EDP perfumes, and curated gift boxes with nationwide delivery.",
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
                className="glass-card card-lift group flex flex-col justify-between rounded-3xl p-3 bg-white border border-[#bfdcff]/60 shadow-[0_10px_30px_-15px_rgba(25,118,210,0.15)] hover:border-[#1976d2]/50 transition-all duration-300"
              >
                {/* Mini Store Mockup - Realistic Browser Frame */}
                <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs group-hover:shadow-md transition-all duration-300">
                  {/* Browser Chrome Header */}
                  <div className="flex h-6 items-center justify-between border-b border-slate-100 bg-slate-50 px-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-400" />
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[9px] font-medium text-slate-500 border border-slate-200/80">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="truncate max-w-[130px]">{t.slug}.buildexom.store</span>
                    </div>
                    <div className="w-6" />
                  </div>

                  {/* Announcement Ticker Bar */}
                  <div
                    className="flex items-center justify-center py-0.5 px-2 text-[8px] font-bold text-white tracking-wide truncate"
                    style={{ backgroundColor: t.primaryColor }}
                  >
                    <span>⚡ Fast Nationwide Delivery on All Orders</span>
                  </div>

                  {/* Mini Store Hero & Product Area */}
                  <div
                    className="relative flex h-[calc(100%-42px)] p-2.5 gap-2 items-center justify-between"
                    style={{
                      background: `linear-gradient(135deg, ${t.primaryColor}12 0%, ${t.primaryColor}22 100%)`,
                    }}
                  >
                    {/* Left: Store Branding, Headline & CTAs */}
                    <div className="flex flex-1 flex-col justify-between h-full py-0.5 z-10">
                      <div>
                        <span
                          className="inline-block rounded-md px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-white shadow-2xs"
                          style={{ backgroundColor: t.primaryColor }}
                        >
                          {t.categoryBadge}
                        </span>
                        <h4 className="mt-1 text-xs font-black text-slate-900 leading-tight line-clamp-1">
                          {t.sampleName}
                        </h4>
                        <p className="mt-0.5 text-[9px] text-slate-600 line-clamp-2 leading-tight">
                          {t.headline}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <span
                          className="rounded-md px-2 py-0.5 text-[8px] font-bold text-white shadow-2xs"
                          style={{ backgroundColor: t.primaryColor }}
                        >
                          Shop Now
                        </span>
                        <span className="flex items-center gap-0.5 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[8px] font-bold text-white shadow-2xs">
                          WhatsApp
                        </span>
                      </div>
                    </div>

                    {/* Right: High-Definition Product Imagery Collage */}
                    <div className="relative w-28 h-full shrink-0 flex items-center justify-end">
                      {/* Main Hero Product Photo */}
                      <div className="relative h-24 w-20 overflow-hidden rounded-xl border border-white shadow-md transition-transform duration-300 group-hover:scale-105">
                        <img
                          src={t.heroImage}
                          alt={t.sampleName}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute bottom-1 right-1 rounded-sm bg-black/75 px-1 py-0.5 text-[7px] font-bold text-white backdrop-blur-xs">
                          {t.priceTag}
                        </div>
                      </div>

                      {/* Floating Secondary Thumbnail */}
                      <div className="absolute bottom-0 left-0 h-14 w-12 overflow-hidden rounded-lg border-2 border-white shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                        <img
                          src={t.secondaryImage}
                          alt={t.sampleName}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* Verified Store Pill */}
                      <div className="absolute -top-1 right-0 flex items-center gap-1 rounded-full bg-white/95 px-1.5 py-0.5 shadow-xs border border-slate-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[7px] font-bold text-slate-700">Verified</span>
                      </div>
                    </div>
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
