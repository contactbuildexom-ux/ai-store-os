import Link from 'next/link';
import { Boxes } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-12 px-4 sm:px-6 text-xs text-slate-500">
      <div className="mx-auto max-w-7xl grid grid-cols-2 gap-8 md:grid-cols-5">
        <div className="col-span-2 space-y-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-white text-base">
            <span className="grid size-8 place-items-center rounded-lg bg-emerald-500 text-slate-950 font-black">
              <Boxes size={18} />
            </span>
            <span>Buildexom AI</span>
          </Link>
          <p className="max-w-sm text-slate-400 leading-relaxed text-[11px]">
            The intelligent AI Store OS powering next-generation e-commerce. From customer prompt to subdomain storefront, complete with WhatsApp ordering and dedicated store admin.
          </p>
          <p className="text-[10px] text-slate-600">
            Integrated with Model Context Protocol (MCP) standards.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-slate-300 mb-3 text-xs">Product</h4>
          <ul className="space-y-2 text-[11px]">
            <li><a href="#how-it-works" className="hover:text-slate-300">How It Works</a></li>
            <li><a href="#templates" className="hover:text-slate-300">Themes</a></li>
            <li><a href="#pricing" className="hover:text-slate-300">Pricing Plans</a></li>
            <li><Link href="/stores/velvet-aura" className="hover:text-slate-300">Demo Store</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-300 mb-3 text-xs">Portals</h4>
          <ul className="space-y-2 text-[11px]">
            <li><Link href="/store-admin/login" className="hover:text-slate-300">Store Admin Login</Link></li>
            <li><Link href="/login" className="hover:text-slate-300">Super Admin (Dev Team)</Link></li>
            <li><Link href="/api/mcp" className="hover:text-slate-300">MCP API Spec</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-300 mb-3 text-xs">Legal</h4>
          <ul className="space-y-2 text-[11px]">
            <li><span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span></li>
            <li><span className="hover:text-slate-300 cursor-pointer">Terms of Service</span></li>
            <li><span className="hover:text-slate-300 cursor-pointer">Security Overview</span></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl border-t border-slate-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600">
        <p>© {new Date().getFullYear()} Buildexom AI Store OS. All rights reserved.</p>
        <p>Built with Next.js, TypeScript & Tailwind CSS.</p>
      </div>
    </footer>
  );
}
