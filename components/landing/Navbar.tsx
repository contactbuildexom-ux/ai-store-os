import Link from 'next/link';
import { Boxes, Sparkles, Store, Shield } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-white tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-500 text-slate-950 font-black">
            <Boxes size={20} />
          </span>
          <span className="text-lg">
            Buildexom <span className="font-semibold text-emerald-400">AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 text-xs font-semibold text-slate-300 md:flex">
          <a href="#how-it-works" className="hover:text-emerald-400 transition">How it Works</a>
          <a href="#features" className="hover:text-emerald-400 transition">Features</a>
          <a href="#templates" className="hover:text-emerald-400 transition">Themes</a>
          <a href="#pricing" className="hover:text-emerald-400 transition">Pricing</a>
          <Link href="/stores/velvet-aura" className="text-emerald-400 hover:text-emerald-300 transition">Live Demo Store</Link>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/store-admin/login"
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-700 hover:bg-slate-850"
          >
            <Store size={14} className="text-emerald-400" />
            <span>Store Admin</span>
          </Link>

          <Link
            href="/login"
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:text-white"
          >
            <Shield size={13} />
            <span>Super Admin</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
