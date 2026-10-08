import Link from "next/link";

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

/* ---------- Content ---------- */
const useCases = [
  "Shop counter or shop window",
  "Product packaging and delivery bags",
  "Business cards and flyers",
  "Instagram bio and Facebook posts",
  "WhatsApp status and groups",
];

const steps = [
  {
    title: "Get your QR code",
    text: "It is generated automatically when your store goes live.",
  },
  {
    title: "Share it anywhere",
    text: "Download it as an image, print it, or post it online.",
  },
  {
    title: "Customers scan and order",
    text: "Their phone opens your store, and they can send the order to your WhatsApp.",
  },
];

const controls = [
  { text: "Download QR in PNG and PDF", badge: "" },
  { text: "Link QR to your store or directly to WhatsApp", badge: "" },
  { text: "Choose QR color and add your logo", badge: "Pro & Business" },
];

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-brand-blue"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export default function QrCodeSection() {
  return (
    <section
      id="qr-code"
      className="scroll-mt-20 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* LEFT: QR visual */}
        <div className="flex justify-center">
          <div className="relative">
            <span className="absolute -right-4 -top-4 z-10 rounded-full bg-brand-blue px-3 py-1 text-xs font-semibold text-white shadow-md">
              Sample QR
            </span>

            <div className="rounded-3xl bg-white p-6 shadow-xl shadow-brand-blue/20 ring-1 ring-slate-100 sm:p-8">
              <div className="relative">
                <svg
                  viewBox={`0 0 ${SIZE} ${SIZE}`}
                  className="h-56 w-56 text-brand-navy sm:h-64 sm:w-64"
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

                <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-white p-1 shadow-md">
                  <span className="flex h-full w-full items-center justify-center rounded-lg bg-brand-blue text-lg font-bold text-white">
                    B
                  </span>
                </div>
              </div>

              <p className="mt-4 text-center text-sm text-slate-500">
                Scan to visit the store
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: text */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">
            QR Code
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            Your store, one scan away
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Every Buildexom store gets its own QR code. Print it, share it, or
            put it on your packaging, and customers can open your store or order
            on WhatsApp instantly.
          </p>

          <h3 className="mt-8 text-sm font-semibold text-brand-navy">
            Where you can use it
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {useCases.map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                {item}
              </span>
            ))}
          </div>

          <h3 className="mt-8 text-sm font-semibold text-brand-navy">
            How it works
          </h3>
          <ol className="mt-4 space-y-4">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand-navy">
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <h3 className="mt-8 text-sm font-semibold text-brand-navy">
            Store owner controls
          </h3>
          <ul className="mt-3 space-y-2">
            {controls.map((item) => (
              <li
                key={item.text}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <CheckIcon />
                <span>{item.text}</span>
                {item.badge && (
                  <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-[11px] font-semibold text-brand-blue">
                    {item.badge}
                  </span>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={CTA_HREF}
              className="inline-flex items-center justify-center rounded-lg bg-brand-blue px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-blue-dark"
            >
              Get your store QR
            </Link>
            <span className="text-sm text-slate-500">
              Store QR is free on all plans. Custom design on Pro and Business.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}