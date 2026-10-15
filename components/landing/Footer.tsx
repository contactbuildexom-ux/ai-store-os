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
import Link from "next/link";
import Logo from "@/components/landing/logo";

const columns = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "/#features" },
      { name: "Pricing", href: "/#pricing" },
      { name: "Templates", href: "/#templates" },
      { name: "WhatsApp Ordering", href: "/#whatsapp-ordering" },
      { name: "Smart Notifications", href: "/#notifications" },
      { name: "QR Code", href: "/#qr-code" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Help Center", href: "/help" },
      { name: "Blog", href: "/blog" },
      { name: "Tutorials", href: "/tutorials" },
      { name: "FAQs", href: "/#faq" },
      { name: "E-commerce Guides", href: "/guides" },
      { name: "AI Tools Guide", href: "/ai-guide" },
      { name: "Success Stories", href: "/success-stories" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Refund Policy", href: "/refund" },
    ],
  },
];

const socials = [
  {
    name: "Instagram",
    href: "#",
    icon: (
      <>
        <path d="M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4z" />
        <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0-6 0" />
        <path d="M16.5 7.5v.01" />
      </>
    ),
  },
  {
    name: "Facebook",
    href: "#",
    icon: <path d="M7 10v4h3v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3V3h-3a5 5 0 0 0-5 5v2H7" />,
  },
  {
    name: "WhatsApp",
    href: "#",
    icon: (
      <>
        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
        <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
      </>
    ),
  },
  {
    name: "Email",
    href: "mailto:support@yourdomain.com",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6l9-6" />
      </>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-[#071a33] via-[#0b2545] to-[#1556a8] text-white">
      {/* Top accent strip */}
      <div
        aria-hidden="true"
        className="h-1 w-full bg-gradient-to-r from-[#4a9bf0] via-[#1976d2] to-[#4a9bf0]"
      />

      <div className="relative mx-auto max-w-[1200px] px-5 pb-8 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link
              href="/#top"
              aria-label="Buildexom home"
              className="inline-flex rounded-2xl bg-white px-4 py-3 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-0.5"
            >
              <Logo />
            </Link>

            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-200">
              AI Powered Store Builder
            </p>

            <p className="mt-5 max-w-xs text-[15px] leading-7 text-blue-100/80">
              AI-powered store builder. Describe your business and go live in minutes.
            </p>

            {/* Social icons */}
            <div id="contact-socials" className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-transparent hover:bg-gradient-to-br hover:from-[#1976d2] hover:to-[#4a9bf0] hover:shadow-lg hover:shadow-blue-500/40"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {s.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.name}>
                    <Link
                      href={l.href}
                      className="inline-block text-[15px] font-medium text-blue-100/80 transition duration-200 hover:translate-x-1 hover:text-white"
                    >
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-6 text-sm text-blue-200/80">
          <p>© {new Date().getFullYear()} Buildexom. All rights reserved.</p>
          <p className="font-medium">
            Made in Pakistan <span aria-hidden>🇵🇰</span>
          </p>
        </div>
      </div>
    </footer>
  );
}