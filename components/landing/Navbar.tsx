"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/landing/logo";
import AuthModal from "@/components/landing/AuthModal";
import SearchPanel from "@/components/landing/SearchPanel";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("signup");

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const openAuth = (tab: "login" | "signup") => {
    setMobileOpen(false);
    setSearchOpen(false);
    setAuthTab(tab);
    setAuthOpen(true);
  };

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock page scroll while the mobile menu is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Esc closes the mobile menu
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // Close the mobile menu if the screen becomes desktop-size
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b border-blue-200 bg-[#e6f4ff] transition-shadow duration-300 ${
          scrolled ? "shadow-md shadow-blue-900/10" : ""
        }`}
      >
        <div className="relative mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6">
          {/* Logo */}
          <Link
            href="/"
            aria-label="Buildexom home"
            onClick={() => {
              closeMobile();
              closeSearch();
            }}
            className="flex shrink-0 items-center"
          >
            <span className="inline-block origin-left scale-[0.85] sm:scale-100">
              <Logo />
            </span>
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
                className="group relative px-3 py-2 text-sm font-semibold text-[#0b2545] transition-colors hover:text-[#1976d2]"
              >
                {n.label}
                <span className="absolute bottom-0 left-3 right-3 h-0.5 origin-left scale-x-0 rounded-full bg-[#1976d2] transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
            <DesktopResources />
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search toggle (icon becomes X when open) */}
            <button
              type="button"
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen((o) => !o);
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                searchOpen
                  ? "bg-[#1976d2] text-white"
                  : "text-[#0b2545] hover:bg-white hover:text-[#1976d2]"
              }`}
            >
              {searchOpen ? (
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
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
              )}
            </button>

            {/* Login + Get Started (md and up) */}
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="hidden whitespace-nowrap rounded-full border border-[#1976d2]/50 bg-white px-5 py-2 text-sm font-semibold text-[#0b2545] transition hover:border-[#1976d2] hover:text-[#1976d2] md:inline-flex"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => openAuth("signup")}
              className="hidden whitespace-nowrap rounded-full bg-[#1976d2] px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-blue-500/30 transition hover:bg-[#1565c0] md:inline-flex"
            >
              Get Started Free
            </button>

            {/* Hamburger */}
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => {
                setSearchOpen(false);
                setMobileOpen((o) => !o);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white lg:hidden"
            >
              <span className="relative block h-4 w-5">
                <span
                  className={`absolute left-0 h-0.5 w-5 rounded bg-[#0b2545] transition-all duration-300 ${
                    mobileOpen ? "top-[7px] rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 top-[7px] h-0.5 w-5 rounded bg-[#0b2545] transition-all duration-300 ${
                    mobileOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 h-0.5 w-5 rounded bg-[#0b2545] transition-all duration-300 ${
                    mobileOpen ? "top-[7px] -rotate-45" : "top-[14px]"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Search bar (with close X) */}
        <SearchPanel open={searchOpen} onClose={closeSearch} />

        {/* Mobile drawer */}
        <div
          className={`absolute inset-x-0 top-full border-b border-blue-200 bg-[#e6f4ff] shadow-xl shadow-blue-900/10 transition-all duration-300 lg:hidden ${
            mobileOpen
              ? "visible translate-y-0 opacity-100"
              : "pointer-events-none invisible -translate-y-2 opacity-0"
          }`}
        >
          <div className="mx-auto max-h-[calc(100vh-72px)] max-w-[1200px] overflow-y-auto px-4 pb-6 pt-3 sm:px-6">
            <nav className="space-y-1" aria-label="Mobile navigation">
              {NAV.map((n) => (
                <Link
                  key={n.label}
                  href={n.href}
                  onClick={closeMobile}
                  className="block rounded-xl px-3 py-3 text-base font-semibold text-[#0b2545] transition hover:bg-white hover:text-[#1976d2]"
                >
                  {n.label}
                </Link>
              ))}

              <MobileResources onNavigate={closeMobile} />
            </nav>

            <div className="mt-4 grid grid-cols-1 gap-3 border-t border-blue-200 pt-4 min-[420px]:grid-cols-2">
              <button
                type="button"
                onClick={() => openAuth("login")}
                className="rounded-full border border-[#1976d2]/50 bg-white px-4 py-3 text-center text-sm font-semibold text-[#0b2545]"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => openAuth("signup")}
                className="rounded-full bg-[#1976d2] px-4 py-3 text-center text-sm font-bold text-white shadow-sm shadow-blue-500/30"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Login / Sign up popup */}
      <AuthModal
        open={authOpen}
        initialTab={authTab}
        onClose={() => setAuthOpen(false)}
      />
    </>
  );
}