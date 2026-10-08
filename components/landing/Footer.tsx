import Logo from "@/components/landing/logo";
import Image from "@/components/landing/logo";
import Link from "next/link";
import type { ReactNode } from "react";

/* ============ CONFIG ============ */
const CONFIG = {
  email: "support@yourdomain.com",
  whatsappDisplay: "+92 XXX XXXXXXX",
  whatsappLink: "https://wa.me/92XXXXXXXXXX",
  instagram: "https://instagram.com/yourhandle",
  facebook: "https://facebook.com/yourpage",
  logoSrc: "/logo-icon.png",
};
/* =============================================================== */

type FooterLink = {
  label: string;
  href: string;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

type SocialLink = {
  label: string;
  href: string;
  icon: ReactNode;
};

const columns: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Templates", href: "/#templates" },
      { label: "WhatsApp Ordering", href: "/#whatsapp-ordering" },
      { label: "Smart Notifications", href: "/#notifications" },
      { label: "QR Code", href: "/#qr-code" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Blog", href: "/blog" },
      { label: "Tutorials", href: "/tutorials" },
      { label: "FAQs", href: "/#faq" },
      { label: "E-commerce Guides", href: "/guides" },
      { label: "AI Tools Guide", href: "/ai-tools" },
      { label: "Success Stories", href: "/success-stories" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/refund" },
    ],
  },
];

const socials: SocialLink[] = [
  {
    label: "Instagram",
    href: CONFIG.instagram,
    icon: (
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Zm5.25-3.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25Z" />
    ),
  },
  {
    label: "Facebook",
    href: CONFIG.facebook,
    icon: (
      <path d="M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-.95.4-1.7 1.8-1.7H17V3.8A22 22 0 0 0 14.6 3.7c-2.5 0-4.1 1.5-4.1 4.2v2.6H7.7v3.3h2.8V22h3Z" />
    ),
  },
  {
    label: "WhatsApp",
    href: CONFIG.whatsappLink,
    icon: (
      <path d="M12 2a10 10 0 0 0-8.6 15l-1.4 5 5.1-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4.1c1.7.7 2.4.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" />
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" aria-label="Buildexom home" className="flex w-fit shrink-0 self-start rounded-xl bg-white px-4 py-3"
              >
                <Logo />
              </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              AI-powered store builder. Describe your business and go live in
              minutes.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-200 transition hover:bg-brand-blue hover:text-white"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor"className="h-4 w-4"aria-hidden="true">
                    {s.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact line */}
        <div className="mt-12 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-white/10 pt-6 text-sm text-slate-400">
          <a
            href={`mailto:${CONFIG.email}`}
            className="transition hover:text-white"
          >
            {CONFIG.email}
          </a>
          <span className="text-slate-600">|</span>
          <a
            href={CONFIG.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-white"
          >
            WhatsApp: {CONFIG.whatsappDisplay}
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 Buildexom. All rights reserved.</p>
          <p>Made in Pakistan</p>
        </div>
      </div>
    </footer>
  );
}