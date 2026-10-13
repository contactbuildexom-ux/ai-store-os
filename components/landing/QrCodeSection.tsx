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
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3 w-3 text-brand-blue"
        aria-hidden="true"
      >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

/* Floating chip (QR ke aas paas) */
function Chip({
  className,
  icon,
  title,
  text,
}: {
  className: string;
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div
      className={`animate-float absolute z-20 hidden items-center gap-2 rounded-2xl border border-blue-100 bg-white px-3 py-2 sm:flex ${className}`}
      aria-hidden="true"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-sm text-blue-600">
        {icon}
      </span>
      <div>
        <p className="text-[11px] font-bold leading-tight text-brand-navy">{title}</p>
        <p className="text-[10px] leading-tight text-slate-500">{text}</p>
      </div>
    </div>
  );
}

export default function QrCodeSection() {
  return (
    <section
      id="qr-code"
      className="bg-modern relative scroll-mt-20 overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      {/* ---------- Background decoration ---------- */}
      {/* Dot pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(#9dbcf5 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%)",
        }}
      />
      {/* Big glow blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-blue-300/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-20 h-80 w-80 rounded-full bg-sky-300/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* TOP: heading + short text */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-blue-100 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-blue">
            QR Code
          </span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-brand-navy sm:text-5xl">
            Your store, <span className="text-gradient">one scan away</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Every Buildexom store gets its own QR code. Print it, share it, or
            put it on your packaging, and customers can open your store or order
            on WhatsApp instantly.
          </p>
        </div>

        {/* MIDDLE: QR on the left, rest of the text on the right */}
        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[340px_1fr] lg:gap-10">
          {/* LEFT: QR with rings, panel and chips */}
          <div className="relative mx-auto flex h-[400px] w-full max-w-[340px] items-center justify-center">
            {/* Gradient panel behind */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-[2.5rem] border border-blue-100 bg-gradient-to-br from-blue-100/80 via-white/60 to-sky-100/80"
            />

            {/* Concentric rings */}
            <div
              aria-hidden="true"
              className="absolute h-[330px] w-[330px] rounded-full border border-blue-200/70"
            />
            <div
              aria-hidden="true"
              className="absolute h-[270px] w-[270px] rounded-full border border-dashed border-blue-300/70"
            />
            <div
              aria-hidden="true"
              className="absolute h-[210px] w-[210px] rounded-full bg-blue-200/30 blur-xl"
            />

            {/* Chips */}
            <Chip
              className="-left-3 top-6"
              icon="📱"
              title="Scan"
              text="with any phone"
            />
            <Chip
              className="-right-3 top-1/2"
              icon="🛍️"
              title="Store opens"
              text="instantly"
            />
            <Chip
              className="-left-3 bottom-8"
              icon="💬"
              title="Order"
              text="on WhatsApp"
            />

            {/* QR card */}
            <div className="relative z-10">
              <span className="absolute -right-3 -top-3 z-10 rounded-full bg-gradient-to-r from-blue-700 to-blue-500 px-3 py-1 text-[11px] font-semibold text-white">
                Sample QR
              </span>

              <div className="rounded-3xl border border-blue-100 bg-white p-5">
                <div className="relative">
                  <svg
                    viewBox={`0 0 ${SIZE} ${SIZE}`}
                    className="h-36 w-36 text-brand-navy sm:h-40 sm:w-40"
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

                  <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg bg-white p-0.5">
                    <span className="flex h-full w-full items-center justify-center rounded-md bg-gradient-to-br from-blue-700 to-sky-500 text-sm font-bold text-white">
                      B
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-center text-xs font-medium text-slate-500">
                  Scan to visit the store
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: rest of the text */}
          <div>
            <h3 className="text-sm font-bold text-brand-navy">
              Where you can use it
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {useCases.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-blue-100 bg-white/85 px-3.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                >
                  {item}
                </span>
              ))}
            </div>

            <h3 className="mt-7 text-sm font-bold text-brand-navy">
              How it works
            </h3>
            <ol className="mt-3 grid gap-3 sm:grid-cols-3">
              {steps.map((step, i) => (
                <li
                  key={step.title}
                  className="card-lift rounded-2xl border border-blue-100 bg-white/90 p-4"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 to-sky-500 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="mt-3 text-sm font-bold text-brand-navy">
                    {step.title}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>

            <h3 className="mt-7 text-sm font-bold text-brand-navy">
              Store owner controls
            </h3>
            <ul className="mt-3 space-y-2.5">
              {controls.map((item) => (
                <li
                  key={item.text}
                  className="flex flex-wrap items-center gap-2.5 text-sm text-slate-700"
                >
                  <CheckIcon />
                  <span>{item.text}</span>
                  {item.badge && (
                    <span className="rounded-full bg-gradient-to-r from-blue-700 to-blue-500 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                      {item.badge}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={CTA_HREF}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110"
              >
                Get your store QR
              </Link>
              <span className="text-sm text-slate-500">
                Store QR is free on all plans. Custom design on Pro and Business.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}