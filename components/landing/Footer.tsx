"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/landing/logo";
import { PlatformLogo, usePlatformBranding } from "@/components/platform-branding";

/* ---------- Pixel2Page (Powered by) ---------- */
const P2P_URL = "https://yahan-pixel2page-ki-website.com";
const P2P_LOGO = "/logo-p2p.jpg";

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
      { name: "Blog", href: "/blogs" },
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
  const { settings } = usePlatformBranding();
  const socialHrefs: Record<string, string> = {
    Instagram: settings.instagram || "#",
    Facebook: settings.facebook || "#",
    WhatsApp: settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}` : "#",
    Email: settings.email ? `mailto:${settings.email}` : "mailto:support@yourdomain.com",
  };

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
              aria-label={`${settings.title} home`}
              className="inline-flex rounded-2xl bg-white px-4 py-3 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-0.5"
            >
              <PlatformLogo fallback={<Logo />} className="h-10 max-w-[200px] object-contain" />
            </Link>

            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-200">
              AI Powered Store Builder
            </p>

            <p className="mt-5 max-w-xs text-[15px] leading-7 text-blue-100/80">
              {settings.description}
            </p>

            {/* Social icons: 2 upar, 2 neeche */}
            <div id="contact-socials" className="mt-6 grid w-fit grid-cols-2 gap-3">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={socialHrefs[s.name] ?? s.href}
                  target={["Instagram", "Facebook", "WhatsApp"].includes(s.name) ? "_blank" : undefined}
                  rel={["Instagram", "Facebook", "WhatsApp"].includes(s.name) ? "noreferrer" : undefined}
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

              {/* Powered by Pixel2Page: Legal column ke neeche (size Buildexom logo box jitna) */}
              {col.title === "Legal" && (
                <div className="mt-8">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-200">
                    Powered by
                  </span>
                  <a
                    href={P2P_URL}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Pixel2Page"
                    className="mt-2 flex h-20 w-[211px] max-w-full items-center justify-center overflow-hidden rounded-2xl bg-white px-3 py-2 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-0.5"
                  >
                    <Image
                      src={P2P_LOGO}
                      alt="Pixel2Page - Build. Grow. Succeed."
                      width={1776}
                      height={554}
                      className="h-full w-full object-contain"
                    />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-6 text-sm text-blue-200/80">
          <p>© {new Date().getFullYear()} {settings.title}. All rights reserved.</p>
          <p className="font-medium">
            Made in Pakistan <span aria-hidden>🇵🇰</span>
          </p>
        </div>
      </div>
    </footer>
  );
}