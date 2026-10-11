import { QrCode, Smartphone, Sparkles } from 'lucide-react';

export default function QrCodeSection() {
  return (
    <section className="bg-slate-900 py-16 px-4 sm:px-6 border-t border-slate-800">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-950 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Scan & Shop Ready</span>
          <h3 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            In-Person Pop-up & Delivery Box QR Codes
          </h3>
          <p className="mt-2 text-xs text-slate-400 max-w-md leading-relaxed">
            Every store generated gets an instant QR code. Print it on your packaging bags, business cards, or event stalls so customers can scan and reorder instantly.
          </p>
        </div>

        <div className="flex flex-col items-center rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl text-center">
          <div className="size-32 bg-white rounded-xl p-3 flex items-center justify-center">
            <QrCode size={100} className="text-slate-950" />
          </div>
          <span className="mt-3 text-[11px] font-mono text-emerald-400">velvet-aura.buildexom.store</span>
          <span className="text-[10px] text-slate-500">Scan with camera to preview</span>
        </div>
      </div>
    </section>
  );
}
