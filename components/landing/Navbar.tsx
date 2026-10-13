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

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/landing/logo";
import AuthModal from "@/components/landing/AuthModal";
import {
  DesktopResources,
  MobileResources,
} from "@/components/landing/ResourcesMenu";

const NAV = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Templates", href: "/#templates" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lock page scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // close mobile menu on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const close = () => setMobileOpen(false);

  // "Get Started Free" dabane par popup khulta hai
  const openAuth = () => {
    setMobileOpen(false);
    setAuthOpen(true);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b bg-white/85 backdrop-blur-xl transition-shadow duration-300 ${
          scrolled
            ? "border-slate-200 shadow-md shadow-slate-200/60"
            : "border-slate-200/70"
        }`}
      >
        <div className="relative mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" aria-label="Buildexom home" onClick={close}>
            <Logo />
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Main navigation"
          >
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className="group relative px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-blue-600"
              >
                {n.label}
                <span className="absolute bottom-0 left-3 right-3 h-0.5 origin-left scale-x-0 rounded-full bg-blue-600 transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
            <DesktopResources />
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/help"
              aria-label="Search help"
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </Link>

            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600 sm:inline-block"
            >
              Login
            </Link>

            <button
              type="button"
              onClick={openAuth}
              className="hidden rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-300/50 transition hover:scale-105 hover:shadow-xl sm:inline-block"
            >
              Get Started Free
            </button>

            {/* Hamburger */}
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100 lg:hidden"
            >
              <span className="relative block h-4 w-5">
                <span
                  className={`absolute left-0 h-0.5 w-5 rounded bg-slate-800 transition-all duration-300 ${
                    mobileOpen ? "top-[7px] rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 top-[7px] h-0.5 w-5 rounded bg-slate-800 transition-all duration-300 ${
                    mobileOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 h-0.5 w-5 rounded bg-slate-800 transition-all duration-300 ${
                    mobileOpen ? "top-[7px] -rotate-45" : "top-[14px]"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={`overflow-hidden border-t border-slate-200 bg-white transition-all duration-300 lg:hidden ${
            mobileOpen
              ? "visible max-h-[calc(100vh-72px)] opacity-100"
              : "invisible max-h-0 border-t-0 opacity-0"
          }`}
        >
          <div className="max-h-[calc(100vh-72px)] overflow-y-auto p-4">
            <nav className="space-y-1" aria-label="Mobile navigation">
              {NAV.map((n) => (
                <Link
                  key={n.label}
                  href={n.href}
                  onClick={close}
                  className="block rounded-xl px-3 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  {n.label}
                </Link>
              ))}

              <MobileResources onNavigate={close} />
            </nav>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <Link
                href="/login"
                onClick={close}
                className="rounded-full border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-800"
              >
                Login
              </Link>
              <button
                type="button"
                onClick={openAuth}
                className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-center text-sm font-bold text-white shadow-lg shadow-blue-300/50"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Popup header ke bahar rakha hai taake blur ki wajah se position na bigde */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}