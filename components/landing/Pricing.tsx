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
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
