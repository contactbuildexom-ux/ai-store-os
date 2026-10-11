import Link from 'next/link';
import { ExternalLink, Sparkles } from 'lucide-react';
import { THEME_PRESETS } from '@/lib/ai/ai-generator';

export default function Templates() {
  const templates = [
    {
      name: 'Royal Obsidian & Gold',
      niche: 'Luxury Perfumes & Attars',
      demoSlug: 'velvet-aura',
      color: '#0f172a',
      accent: '#d97706',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Emerald Minimal',
      niche: 'Organic Skincare & Serums',
      demoSlug: 'velvet-aura',
      color: '#1d7555',
      accent: '#10b981',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Cyber Slate & Indigo',
      niche: 'Streetwear Apparel & Hoodies',
      demoSlug: 'velvet-aura',
      color: '#1e1b4b',
      accent: '#6366f1',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
    }
  ];

  return (
    <section id="templates" className="bg-slate-950 py-20 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Theme Showcase</span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Stunning Themes Customized by AI
          </h2>
          <p className="mt-3 text-xs text-slate-400 sm:text-sm">
            Whether luxury perfume, trendy clothing, or artisan coffee — each store matches its brand personality.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {templates.map((t, idx) => (
            <div key={idx} className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 transition hover:-translate-y-1 hover:border-slate-700">
              <div className="relative aspect-video w-full overflow-hidden bg-slate-800">
                <img
                  src={t.image}
                  alt={t.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                  {t.niche}
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="size-3.5 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="size-3.5 rounded-full" style={{ backgroundColor: t.accent }} />
                  <h3 className="font-bold text-white text-base">{t.name}</h3>
                </div>
                <p className="text-xs text-slate-400 mb-6">
                  Optimized for fast mobile loading, WhatsApp checkout, and high conversions.
                </p>

                <Link
                  href={`/stores/${t.demoSlug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                >
                  <span>Preview Demo Storefront</span>
                  <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
