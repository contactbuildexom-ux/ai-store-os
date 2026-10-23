"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/landing/logo";
import { PlatformLogo, usePlatformBranding } from "@/components/platform-branding";
import AuthModal from "@/components/landing/AuthModal";
import SearchPanel from "@/components/landing/SearchPanel";
import GenerateStoreModal from "@/components/landing/GenerateStoreModal";
import MerchantStoreSetupModal from "@/components/landing/MerchantStoreSetupModal";
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
  const { settings } = usePlatformBranding();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  // "Generate your free store" popup -> AI store builder
  const [generateOpen, setGenerateOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderPrompt, setBuilderPrompt] = useState("");
  const [builderName, setBuilderName] = useState("");
  const [builderTheme, setBuilderTheme] = useState("ocean-blue");

  const openAuth = (tab: "login" | "signup") => {
    setAuthTab(tab);
    setMobileOpen(false);
    setSearchOpen(false);
    setAuthOpen(true);
  };

  const openGenerate = () => {
    setMobileOpen(false);
    setSearchOpen(false);
    setBuilderPrompt("");
    setBuilderName("");
    setBuilderOpen(true);
  };

  const handleGenerate = (prompt: string, name?: string, theme?: string) => {
    setBuilderPrompt(prompt);
    setBuilderName(name || "");
    if (theme) setBuilderTheme(theme);
    setGenerateOpen(false);
    setBuilderOpen(true);
  };

  // shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Esc closes mobile menu
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // close mobile menu on desktop width
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b border-blue-200 bg-[#e6f4ff] transition-shadow duration-300 ${
          scrolled ? "shadow-[0_6px_24px_-8px_rgba(11,37,69,0.25)]" : ""
        }`}
      >
        <div className="relative mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo only (no title text next to it) */}
          <Link
            href="/"
            aria-label={`${settings.title} home`}
            className="flex shrink-0 items-center transition-transform duration-300 hover:scale-[1.03]"
          >
            <span className="block mix-blend-multiply">
              <PlatformLogo fallback={<Logo />} className="h-10 max-w-[200px] object-contain" />
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group relative py-2 text-[15px] font-semibold text-[#0b2545] transition-colors hover:text-[#1976d2]"
              >
                {item.label}
                <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 rounded-full bg-[#1976d2] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
            <DesktopResources />
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search toggle (icon becomes X when open) */}
            <button
              type="button"
              onClick={() => {
                setSearchOpen((v) => !v);
                setMobileOpen(false);
              }}
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#0b2545] transition-all duration-200 hover:bg-white hover:text-[#1976d2]"
            >
              {searchOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={() => openAuth("login")}
              className="hidden rounded-full border border-[#1976d2] bg-white px-5 py-2 text-sm font-semibold text-[#0b2545] transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md md:inline-flex"
            >
              Login
            </button>

            <button
              type="button"
              onClick={openGenerate}
              className="hidden rounded-full bg-gradient-to-r from-[#1976d2] to-[#1565c0] px-5 py-2.5 text-sm font-bold text-white shadow-[0_6px_16px_-4px_rgba(25,118,210,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-6px_rgba(25,118,210,0.75)] md:inline-flex"
            >
              Get Started Free
            </button>

            {/* Hamburger */}
            <button
              type="button"
              onClick={() => {
                setMobileOpen((v) => !v);
                setSearchOpen(false);
              }}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[#0b2545] transition-colors hover:bg-white lg:hidden"
            >
              {mobileOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="absolute inset-x-0 top-full max-h-[calc(100vh-72px)] overflow-y-auto border-b border-blue-200 bg-[#e6f4ff] shadow-xl lg:hidden">
            <div className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-4 py-3 text-base font-semibold text-[#0b2545] transition-colors hover:bg-white hover:text-[#1976d2]"
                >
                  {item.label}
                </Link>
              ))}

              <MobileResources onNavigate={() => setMobileOpen(false)} />

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className="rounded-full border border-[#1976d2] bg-white py-3 text-sm font-semibold text-[#0b2545]"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={openGenerate}
                  className="rounded-full bg-gradient-to-r from-[#1976d2] to-[#1565c0] py-3 text-sm font-bold text-white"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
      <AuthModal
        open={authOpen}
        initialTab={authTab}
        onClose={() => setAuthOpen(false)}
      />
      <GenerateStoreModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onGenerate={handleGenerate}
      />
      <MerchantStoreSetupModal
        isOpen={builderOpen}
        onClose={() => setBuilderOpen(false)}
        initialPrompt={builderPrompt}
        initialStoreName={builderName}
        initialTheme={builderTheme}
      />
    </>
  );
}