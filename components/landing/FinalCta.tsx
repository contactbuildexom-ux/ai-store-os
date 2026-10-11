import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function FinalCta() {
  return (
    <section className="bg-slate-950 py-20 px-4 sm:px-6 border-t border-slate-800 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/20 to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-3xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 mb-4">
          <Sparkles size={13} /> Launch in 30 Seconds
        </span>

        <h2 className="text-3xl font-extrabold text-white sm:text-5xl tracking-tight">
          Ready to Start Selling with Your AI E-Commerce Store?
        </h2>

        <p className="mt-4 text-xs text-slate-400 sm:text-sm max-w-xl mx-auto leading-relaxed">
          Join thousands of modern sellers who turned their business idea into a live, subdomain-hosted, WhatsApp-ready online store with a single prompt.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#hero"
            className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-7 py-3.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition"
          >
            <span>Type Your Prompt & Build Now</span>
            <ArrowRight size={15} />
          </a>

          <Link
            href="/stores/velvet-aura"
            className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-3.5 text-xs font-bold text-white hover:bg-slate-800 transition"
          >
            Explore Live Demo Store
          </Link>
        </div>
      </div>
    </section>
  );
}
