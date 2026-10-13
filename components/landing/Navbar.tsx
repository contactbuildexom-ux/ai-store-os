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
﻿"use client";

import Logo from "@/components/landing/logo";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { name: "Features", href: "/#features" },
  { name: "Pricing", href: "/#pricing" },
  { name: "Templates", href: "/#templates" },
];

const resources = [
  { name: "Help Center", text: "Guides to build and manage your store", href: "/help" },
  { name: "Blog", text: "E-commerce, online selling, and business tips", href: "/blog" },
  { name: "Tutorials", text: "Short how-to guides and videos", href: "/tutorials" },
  { name: "FAQs", text: "Answers to common questions", href: "/#faq" },
  { name: "E-commerce Guides", text: "Products, orders, WhatsApp selling, and more", href: "/guides" },
  { name: "AI Tools Guide", text: "How to use the AI chatbot and AI features", href: "/ai-guide" },
  { name: "Success Stories", text: "Real stores built with Buildexom", href: "/stories" },
];

function Chevron({ open }: { open?: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M5 7.5L10 12.5L15 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function goToGenerate(e: React.MouseEvent<HTMLAnchorElement>, after?: () => void) {
  after?.();
  const card = document.getElementById("generate-store");
  if (!card) return; // doosre page par ho to Link khud /#generate-store par le jayega
  e.preventDefault();
  card.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => {
    (document.getElementById("store-prompt") as HTMLTextAreaElement | null)?.focus({
      preventScroll: true,
    });
  }, 700);
}
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [resOpen, setResOpen] = useState(false);
  const [mobileRes, setMobileRes] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const resRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (resRef.current && !resRef.current.contains(e.target as Node)) setResOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setResOpen(false);
    const onScroll = () => setScrolled(window.scrollY > 8);

    onScroll();
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      id="top"
      className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${
        scrolled
          ? "border-blue-100 bg-white/80 shadow-[0_8px_30px_-12px_rgba(29,78,216,0.25)]"
          : "border-transparent bg-white/60"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-5 sm:px-6 lg:px-8">
        {/* Logo + links */}
        <div className="flex items-center gap-10">
          <Link href="/" aria-label="Buildexom home" className="flex shrink-0 items-center">
              <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
              >
                {item.name}
              </a>
            ))}

            {/* Resources dropdown */}
            <div ref={resRef} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={resOpen}
                onClick={() => setResOpen(!resOpen)}
                className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-50 hover:text-blue-700 ${
                  resOpen ? "bg-blue-50 text-blue-700" : "text-slate-700"
                }`}
              >
                Resources
                <Chevron open={resOpen} />
              </button>

              {resOpen && (
                <div
                  role="menu"
                  className="glass-card absolute left-1/2 top-full z-50 mt-4 w-[360px] -translate-x-1/2 rounded-3xl p-2"
                >
                  {resources.map((r) => (
                    <Link
                      key={r.name}
                      href={r.href}
                      role="menuitem"
                      onClick={() => setResOpen(false)}
                      className="block rounded-2xl px-4 py-3 transition-colors hover:bg-blue-50"
                    >
                      <p className="text-sm font-semibold text-brand-navy">{r.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{r.text}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-5 md:flex">
          <button
            type="button"
            aria-label="Search"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
          </button>

          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 transition-colors hover:text-blue-700"
          >
            Login
          </Link>

          <Link
            href="/#generate-store"
            onClick={(e) => goToGenerate(e)}
            className="btn-glow rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110"
          >
            Get Started Free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-blue-100 bg-white/70 text-brand-navy md:hidden"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-blue-100 bg-white/95 px-5 py-5 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              >
                {item.name}
              </a>
            ))}

            <button
              type="button"
              aria-expanded={mobileRes}
              onClick={() => setMobileRes(!mobileRes)}
              className="flex items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
            >
              Resources
              <Chevron open={mobileRes} />
            </button>

            {mobileRes && (
              <div className="mb-1 ml-3 flex flex-col border-l-2 border-blue-100 pl-3">
                {resources.map((r) => (
                  <Link
                    key={r.name}
                    href={r.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {r.name}
                  </Link>
                ))}
              </div>
            )}

            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
            >
              Login
            </Link>

            <Link
              href="/#generate-store"
              onClick={(e) => goToGenerate(e, () => setMenuOpen(false))}
              className="btn-glow mt-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Get Started Free
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}