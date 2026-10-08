import Link from "next/link";
import Logo from "@/components/landing/logo";

const columns = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Templates", href: "#templates" },
      { name: "WhatsApp Ordering", href: "#whatsapp-ordering" },
      { name: "Smart Notifications", href: "#notifications" },
      { name: "QR Code", href: "#qr-code" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Help Center", href: "/help" },
      { name: "Blog", href: "/blog" },
      { name: "Tutorials", href: "/tutorials" },
      { name: "FAQs", href: "#faq" },
      { name: "E-commerce Guides", href: "/guides" },
      { name: "AI Tools Guide", href: "/ai-guide" },
      { name: "Success Stories", href: "/stories" },
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
    <footer className="border-t border-blue-100 bg-[#eef4ff]">
      <div className="mx-auto max-w-[1200px] px-5 pb-8 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" aria-label="Buildexom home" className="inline-flex flex-col">
              <Logo />
              <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700">
                AI Powered Store Builder
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-[15px] leading-7 text-slate-600">
              AI-powered store builder. Describe your business and go live in minutes.
            </p>

            <div className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-700 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white"
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
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0f1b4d]">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.name}>
                    <Link
                      href={l.href}
                      className="text-[15px] font-medium text-slate-600 transition-colors hover:text-blue-700"
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
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-blue-100 pt-6 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Buildexom. All rights reserved.</p>
          <p>Made in Pakistan</p>
        </div>
      </div>
    </footer>
  );
}