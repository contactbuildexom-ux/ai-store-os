import Link from "next/link";
import type { ReactNode } from "react";
import { BUILDEXOM_ICON_DATA_URL } from "@/components/store-qr-code";

/* ============ CONFIG ============ */
const CTA_HREF = "/login"; // signup page ka path
/* ================================== */

/* ---------- Sample QR (demo only, not scannable) ---------- */
const SIZE = 25;
const FINDER_ORIGINS: Array<[number, number]> = [
  [0, 0],
  [SIZE - 7, 0],
  [0, SIZE - 7],
];

function finderCell(x: number, y: number): boolean | undefined {
  for (const [ox, oy] of FINDER_ORIGINS) {
    const lx = x - ox;
    const ly = y - oy;
    if (lx >= -1 && lx <= 7 && ly >= -1 && ly <= 7) {
      if (lx < 0 || ly < 0 || lx > 6 || ly > 6) return false;
      if (lx === 0 || lx === 6 || ly === 0 || ly === 6) return true;
      if (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4) return true;
      return false;
    }
  }
  return undefined;
}

function buildCells() {
  const cells: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const finder = finderCell(x, y);
      let dark: boolean;
      if (finder !== undefined) {
        dark = finder;
      } else if (x >= 9 && x <= 15 && y >= 9 && y <= 15) {
        dark = false; // space for center logo
      } else {
        dark = (x * 7 + y * 13 + x * y * 3) % 5 < 2;
      }
      if (dark) cells.push({ x, y });
    }
  }
  return cells;
}

const qrCells = buildCells();

/* ---------- Icons ---------- */
function Icon({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const qrIcon = (
  <>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h3v3h-3zM20 14v.01M14 20h3M20 17v4" />
  </>
);
const shareIcon = (
  <>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
  </>
);
const phoneIcon = (
  <>
    <rect x="7" y="2.5" width="10" height="19" rx="2" />
    <path d="M11 18.5h2" />
  </>
);
const bagIcon = (
  <>
    <path d="M6 7h12l1 13H5L6 7z" />
    <path d="M9 7a3 3 0 0 1 6 0" />
  </>
);
const chatIcon = <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.3A8 8 0 1 1 21 12z" />;

/* ---------- Content ---------- */
const useCases = [
  "Shop counter or shop window",
  "Product packaging and delivery bags",
  "Business cards and flyers",
  "Instagram bio and Facebook posts",
  "WhatsApp status and groups",
];

const quick = [
  { title: "Scan", text: "with any phone", icon: phoneIcon },
  { title: "Store opens", text: "instantly", icon: bagIcon },
  { title: "Order", text: "on WhatsApp", icon: chatIcon },
];

const steps = [
  {
    title: "Get your QR code",
    text: "It is generated automatically when your store goes live.",
    icon: qrIcon,
  },
  {
    title: "Share it anywhere",
    text: "Download it as an image, print it, or post it online.",
    icon: shareIcon,
  },
  {
    title: "Customers scan and order",
    text: "Their phone opens your store, and they can send the order to your WhatsApp.",
    icon: chatIcon,
  },
];

const controls = [
  { text: "Download QR in PNG and PDF", badge: "" },
  { text: "Link QR to your store or directly to WhatsApp", badge: "" },
  { text: "Choose QR color and add your logo", badge: "Pro & Business" },
];

function CheckIcon() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1976d2]/10">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3 w-3 text-[#1976d2]"
        aria-hidden="true"
      >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

export default function QrCodeSection() {
  return (
    <section
      id="qr-code"
      className="relative scroll-mt-20 overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="relative mx-auto max-w-6xl">
        {/* TOP: heading + short text */}
        <div className="mx-auto max-w-2xl text-center">
          <span>QR Code</span>
          <h2 className="text-brand-navy">
            Your store, <span className="text-gradient">one scan away</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Every Buildexom store gets its own QR code. Print it, share it, or
            put it on your packaging, and customers can open your store or order
            on WhatsApp instantly.
          </p>
        </div>

        {/* MIDDLE */}
        <div className="mt-14 grid items-start gap-10 lg:grid-cols-[360px_1fr] lg:gap-12">
          {/* LEFT: static QR card */}
          <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-[0_24px_50px_-24px_rgba(25,118,210,0.5)]">
            {/* Top strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#0b2545] via-[#1976d2] to-[#4a9bf0]" />

            <div className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-brand-navy">Your store QR</p>
                <span className="rounded-full bg-[#e6f1ff] px-2.5 py-1 text-[11px] font-bold text-[#1976d2]">
                  Sample
                </span>
              </div>

              {/* QR */}
              <div className="mt-4 rounded-2xl bg-[#f1f7ff] p-5 ring-1 ring-blue-100">
                <div className="relative mx-auto w-fit rounded-xl bg-white p-3 shadow-sm">
                  <svg
                    viewBox={`0 0 ${SIZE} ${SIZE}`}
                    className="h-40 w-40 text-brand-navy sm:h-44 sm:w-44"
                    shapeRendering="crispEdges"
                    role="img"
                    aria-label="Sample store QR code"
                  >
                    <rect width={SIZE} height={SIZE} fill="white" />
                    {qrCells.map((c) => (
                      <rect
                        key={`${c.x}-${c.y}`}
                        x={c.x}
                        y={c.y}
                        width="1"
                        height="1"
                        fill="currentColor"
                      />
                    ))}
                  </svg>

                  <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-white p-1 shadow-md ring-1 ring-slate-100">
                    <img
                      src={BUILDEXOM_ICON_DATA_URL}
                      alt="Buildexom Logo"
                      className="size-full object-contain"
                    />
                  </div>
                </div>

                <p className="mt-3 text-center text-xs font-semibold text-slate-600">
                  Scan to visit the store
                </p>
              </div>

              {/* Static quick facts */}
              <div className="mt-5 grid grid-cols-3 gap-2">
                {quick.map((q) => (
                  <div
                    key={q.title}
                    className="rounded-xl border border-blue-100 bg-white px-2 py-3 text-center"
                  >
                    <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[#e6f1ff] text-[#1976d2]">
                      <Icon size={18}>{q.icon}</Icon>
                    </span>
                    <p className="mt-2 text-[12px] font-bold leading-tight text-brand-navy">
                      {q.title}
                    </p>
                    <p className="text-[10.5px] leading-tight text-slate-500">
                      {q.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <h3 className="text-sm font-bold text-brand-navy">
              Where you can use it
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {useCases.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-blue-100 bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-navy shadow-sm transition hover:border-[#1976d2] hover:text-[#1976d2]"
                >
                  {item}
                </span>
              ))}
            </div>

            <h3 className="mt-8 text-sm font-bold text-brand-navy">
              How it works
            </h3>
            <ul className="mt-3 grid gap-3 sm:grid-cols-3">
              {steps.map((step) => (
                <li
                  key={step.title}
                  className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_10px_30px_-20px_rgba(25,118,210,0.5)] transition duration-300 hover:-translate-y-1 hover:border-[#1976d2]/40 hover:shadow-[0_20px_40px_-20px_rgba(25,118,210,0.55)]"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-[#0b2545] via-[#1976d2] to-[#4a9bf0] transition-transform duration-500 group-hover:scale-x-100"
                  />
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f1ff] text-[#1976d2] transition duration-300 group-hover:bg-gradient-to-br group-hover:from-[#0b2545] group-hover:to-[#1976d2] group-hover:text-white">
                    <Icon>{step.icon}</Icon>
                  </span>
                  <p className="mt-3 text-sm font-bold text-brand-navy">
                    {step.title}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                    {step.text}
                  </p>
                </li>
              ))}
            </ul>

            <h3 className="mt-8 text-sm font-bold text-brand-navy">
              Store owner controls
            </h3>
            <ul className="mt-3 space-y-2.5">
              {controls.map((item) => (
                <li
                  key={item.text}
                  className="flex flex-wrap items-center gap-2.5 text-sm font-medium text-brand-navy"
                >
                  <CheckIcon />
                  <span>{item.text}</span>
                  {item.badge && (
                    <span className="rounded-full bg-gradient-to-r from-[#0b2545] to-[#1976d2] px-2.5 py-0.5 text-[11px] font-semibold text-white">
                      {item.badge}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={CTA_HREF}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0b2545] via-[#1556a8] to-[#1976d2] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40"
              >
                Get your store QR
              </Link>
              <span className="text-sm text-slate-600">
                Store QR is free on all plans. Custom design on Pro and Business.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}