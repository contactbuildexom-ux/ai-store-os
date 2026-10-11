import { Terminal, Wand2, Rocket } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      icon: Terminal,
      title: 'Enter Prompt & Pick Plan',
      desc: 'Describe what you want to sell (e.g. luxury perfumes, streetwear, or organic skincare), pick your plan tier (Free, Pro, Advanced), and select your favorite theme palette.'
    },
    {
      num: '02',
      icon: Wand2,
      title: 'AI Designs Entire Storefront',
      desc: 'In seconds, our AI engine provisions your unique subdomain, designs high-converting hero copy, assigns themes, and generates realistic products with imagery and local pricing.'
    },
    {
      num: '03',
      icon: Rocket,
      title: 'Sell & Manage via Store Admin',
      desc: 'You receive instant admin access. Log into your dashboard to add/edit products, tweak themes, and start receiving direct customer orders straight on your WhatsApp!'
    }
  ];

  return (
    <section id="how-it-works" className="bg-slate-900 py-20 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Step-by-Step Workflow</span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            From Prompt to Live Commerce in 3 Steps
          </h2>
          <p className="mt-3 text-xs text-slate-400 sm:text-sm">
            Zero coding, zero designer fees, and zero setup delays.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="relative rounded-3xl border border-slate-800 bg-slate-950 p-8">
                <span className="text-4xl font-black text-slate-800 absolute top-6 right-6 font-mono">
                  {s.num}
                </span>
                <span className="grid size-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-6">
                  <Icon size={24} />
                </span>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
