"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/components/landing/logo";
import { PlatformLogo, usePlatformBranding } from "@/components/platform-branding";
import { DEFAULT_PLATFORM_SETTINGS } from "@/lib/platform-settings-defaults";

/* ---------- Buildexom fallback links (used when admin settings are empty) ---------- */
const BUILDEXOM_INSTAGRAM = "https://www.instagram.com/buildexom";
const BUILDEXOM_EMAIL = "buildexom.pixel2page@gmail.com";
const BUILDEXOM_EMAIL_LINK = `https://mail.google.com/mail/?view=cm&fs=1&to=${BUILDEXOM_EMAIL}`;

/* ---------- Pixel2Page (Powered by) ---------- */
const P2P_LOGO = "/logo-p2p.jpg";
const P2P_INSTAGRAM = "https://www.instagram.com/pixel2page";
const P2P_WEBSITE = "https://pixel2page.netlify.app";

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
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Refund Policy", href: "/refund" },
    ],
  },
];

/* Icon paths shared by the Buildexom socials and the Pixel2Page icons */
const INSTAGRAM_ICON = (
  <>
    <path d="M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4z" />
    <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0-6 0" />
    <path d="M16.5 7.5v.01" />
  </>
);

const WEBSITE_ICON = (
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </>
);

type Social = {
  name: string;
  href: string;
  icon: ReactNode;
};

const socials: Social[] = [
  {
    name: "Instagram",
    href: "#",
    icon: INSTAGRAM_ICON,
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
    href: BUILDEXOM_EMAIL_LINK,
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6l9-6" />
      </>
    ),
  },
  {
    name: "Phone",
    href: "tel:+923374257290",
    icon: (
      <>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 11.19 19a19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.07 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.11L8.05 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.84.58 2.8.7A2 2 0 0 1 22 16.92z" />
      </>
    ),
  },
  {
    name: "Website",
    href: "https://www.buildexom.com",
    icon: WEBSITE_ICON,
  },
];

export default function Footer() {
  const { settings } = usePlatformBranding();

  // Admin platform settings win; otherwise fall back to the defaults below
  const socialHrefs: Record<string, string> = {
    Instagram: settings.instagram || BUILDEXOM_INSTAGRAM,
    Facebook: settings.facebook || "#",
    WhatsApp: settings.whatsapp
      ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`
      : `https://wa.me/${DEFAULT_PLATFORM_SETTINGS.whatsapp}`,
    Email: BUILDEXOM_EMAIL_LINK,
    Phone: `tel:${settings.phone || DEFAULT_PLATFORM_SETTINGS.phone}`,
    Website: settings.website || DEFAULT_PLATFORM_SETTINGS.website,
  };

  // Pixel2Page logo opens the website if set, otherwise its Instagram
  const p2pLogoHref = P2P_WEBSITE || P2P_INSTAGRAM;

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-[#071a33] via-[#0b2545] to-[#1556a8] text-white">
      {/* Top accent strip */}
      <div
        aria-hidden="true"
        className="h-1 w-full bg-gradient-to-r from-[#4a9bf0] via-[#1976d2] to-[#4a9bf0]"
      />

      <div className="relative mx-auto max-w-[1200px] px-5 pb-8 pt-16 sm:px-6 lg:px-8">
        {/* 4 columns now (Brand + Product + Resources + Legal), with equal, wider gaps */}
        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-x-16">
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

            {/* Social icons (3 columns, 2 rows) */}
            <div id="contact-socials" className="mt-6 grid w-fit grid-cols-3 gap-3">
              {socials.map((s) => {
                const href = socialHrefs[s.name] ?? s.href;
                // Web links open in a new tab; tel: and "#" stay in the same tab
                const isWebLink = href.startsWith("http");

                return (
                  <a
                    key={s.name}
                    href={href}
                    target={isWebLink ? "_blank" : undefined}
                    rel={isWebLink ? "noopener noreferrer" : undefined}
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
                );
              })}
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

              {/* Powered by Pixel2Page: below the Legal links, with extra spacing (mt-12) */}
              {col.title === "Legal" && (
                <div className="mt-12">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-200">
                    Powered by
                  </span>
                  <a
                    href={p2pLogoHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Pixel2Page"
                    className="mt-3 flex h-20 w-[211px] max-w-full items-center justify-center overflow-hidden rounded-2xl bg-white px-3 py-2 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-0.5"
                  >
                    <Image
                      src={P2P_LOGO}
                      alt="Pixel2Page - Build. Grow. Succeed."
                      width={1776}
                      height={554}
                      className="h-full w-full object-contain"
                    />
                  </a>

                  {/* Pixel2Page social icons */}
                  <div className="mt-4 flex items-center gap-3">
                    <a
                      href={P2P_INSTAGRAM}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Pixel2Page on Instagram"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-transparent hover:bg-gradient-to-br hover:from-[#1976d2] hover:to-[#4a9bf0] hover:shadow-lg hover:shadow-blue-500/40"
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
                        {INSTAGRAM_ICON}
                      </svg>
                    </a>

                    {P2P_WEBSITE && (
                      <a
                        href={P2P_WEBSITE}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Pixel2Page website"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-transparent hover:bg-gradient-to-br hover:from-[#1976d2] hover:to-[#4a9bf0] hover:shadow-lg hover:shadow-blue-500/40"
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
                          {WEBSITE_ICON}
                        </svg>
                      </a>
                    )}
                  </div>
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