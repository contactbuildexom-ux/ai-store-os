"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { resources, type Resource } from "@/lib/resources";

const CSS = `
@keyframes rmUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes rmIn { from { opacity: 0; } to { opacity: 1; } }
.rm-up { animation: rmUp .38s cubic-bezier(.2,.8,.2,1) both; }
.rm-in { animation: rmIn .25s ease both; }
.rm-trigger { font-size: 15px; font-weight: 600; }
.rm-scroll { scrollbar-width: thin; scrollbar-color: #1976d2 transparent; }
@media (prefers-reduced-motion: reduce) { .rm-up, .rm-in { animation: none; } }
`;

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-4 w-4 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/* ───────────────────────── ICONS ───────────────────────── */

function ResourceIcon({
  resource,
  className = "h-5 w-5",
}: {
  resource: Resource;
  className?: string;
}) {
  const key = `${resource.id} ${resource.title}`.toLowerCase();

  let kind = "default";
  if (/help|support/.test(key)) kind = "help";
  else if (/\bai\b|ai-guide/.test(key)) kind = "ai";
  else if (/blog/.test(key)) kind = "blog";
  else if (/tutorial|video/.test(key)) kind = "tutorials";
  else if (/faq|question/.test(key)) kind = "faq";
  else if (/e-?commerce|guide/.test(key)) kind = "ecommerce";
  else if (/success|stories|case/.test(key)) kind = "success";

  let paths: ReactNode;
  switch (kind) {
    case "help":
      paths = (
        <>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" />
          <path d="m4.93 4.93 4.24 4.24" />
          <path d="m14.83 9.17 4.24-4.24" />
          <path d="m14.83 14.83 4.24 4.24" />
          <path d="m9.17 14.83-4.24 4.24" />
        </>
      );
      break;
    case "blog":
      paths = (
        <>
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
          <path d="M18 14h-8" />
          <path d="M15 18h-5" />
          <path d="M10 6h8v4h-8V6Z" />
        </>
      );
      break;
    case "tutorials":
      paths = (
        <>
          <circle cx="12" cy="12" r="10" />
          <polygon points="10 8 16 12 10 16 10 8" />
        </>
      );
      break;
    case "faq":
      paths = (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </>
      );
      break;
    case "ecommerce":
      paths = (
        <>
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </>
      );
      break;
    case "ai":
      paths = (
        <>
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
          <path d="M19 3v4" />
          <path d="M21 5h-4" />
        </>
      );
      break;
    case "success":
      paths = (
        <>
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </>
      );
      break;
    default:
      paths = (
        <>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </>
      );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths}
    </svg>
  );
}

/* ───────────────────────── DESKTOP DROPDOWN ───────────────────────── */

export function DesktopResources() {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isHere = resources.some((r) => pathname?.startsWith(r.href));

  const openNow = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 160);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <div
      ref={root}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <style>{CSS}</style>

      {/* Trigger */}
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`rm-trigger relative flex h-[72px] items-center gap-1.5 px-3 transition-colors ${
          open || isHere
            ? "text-[#1976d2]"
            : "text-[#0b2545] hover:text-[#1976d2]"
        }`}
      >
        Resources
        <Chevron
          className={`transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
        <span
          className={`absolute bottom-0 left-3 right-3 h-0.5 origin-left rounded-full bg-[#1976d2] transition-transform duration-300 ${
            open || isHere ? "scale-x-100" : "scale-x-0"
          }`}
        />
      </button>

      {/* Panel */}
      <div
        className={`absolute left-1/2 top-full z-50 w-[350px] max-w-[calc(100vw-2rem)] -translate-x-1/2 transition-all duration-300 ease-out ${
          open
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-2 opacity-0"
        }`}
      >
        <div className="rm-scroll max-h-[calc(100vh-88px)] overflow-y-auto overscroll-contain rounded-3xl border border-[#cfe2fa] bg-white p-3 shadow-[0_30px_60px_-24px_rgba(11,37,69,0.35)]">
          <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-widest text-[#1976d2]">
            Resources
          </p>

          <ul className="space-y-1">
            {resources.map((r, i) => {
              const current = pathname?.startsWith(r.href);
              return (
                <li
                  key={r.id}
                  className="rm-up"
                  style={{ animationDelay: `${i * 35}ms` }}
                >
                  <Link
                    href={r.href}
                    onClick={() => setOpen(false)}
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200 hover:bg-[#f1f8ff] hover:ring-1 hover:ring-[#cfe2fa] ${
                      current ? "bg-[#f1f8ff] ring-1 ring-[#cfe2fa]" : ""
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:bg-[#1976d2] group-hover:text-white ${
                        current
                          ? "bg-[#1976d2] text-white"
                          : "bg-[#e6f4ff] text-[#1976d2]"
                      }`}
                    >
                      <ResourceIcon resource={r} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-sm font-bold text-[#0b2545]">
                        {r.title}
                        {r.badge && (
                          <span className="rounded-full bg-[#e6f4ff] px-2 py-0.5 text-[10px] font-bold text-[#1976d2]">
                            {r.badge}
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-xs text-[#5b7aa3]">
                        {r.desc}
                      </span>
                    </span>
                    <svg
                      className="h-4 w-4 shrink-0 -translate-x-1 text-[#1976d2] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-3 rounded-2xl bg-gradient-to-br from-[#0b2545] to-[#1976d2] p-4 text-white">
            <p className="text-sm font-bold text-white">Need help fast?</p>
            <p className="mt-0.5 text-xs text-[#d6e9ff]">
              Ask Bexi AI, the chat bubble at the bottom right.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── MOBILE ACCORDION ───────────────────────── */

export function MobileResources({ onNavigate }: { onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      <style>{CSS}</style>

      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-base font-semibold text-[#0b2545] transition hover:bg-white hover:text-[#1976d2]"
      >
        Resources
        <Chevron
          className={`h-5 w-5 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ${
          open
            ? "visible grid-rows-[1fr] opacity-100"
            : "invisible grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="space-y-1 pb-2 pl-2">
            {resources.map((r) => {
              const expanded = openId === r.id;
              return (
                <li key={r.id} className="rounded-2xl bg-white/70">
                  <div className="flex items-center">
                    <Link
                      href={r.href}
                      onClick={onNavigate}
                      className="flex flex-1 items-center gap-3 px-3 py-3"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f4ff] text-[#1976d2]">
                        <ResourceIcon resource={r} className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="flex items-center gap-2 text-sm font-bold text-[#0b2545]">
                          {r.title}
                          {r.badge && (
                            <span className="rounded-full bg-[#e6f4ff] px-2 py-0.5 text-[10px] font-bold text-[#1976d2]">
                              {r.badge}
                            </span>
                          )}
                        </span>
                        <span className="block text-xs text-[#5b7aa3]">
                          {r.desc}
                        </span>
                      </span>
                    </Link>
                    <button
                      type="button"
                      aria-label={`Show ${r.title} topics`}
                      aria-expanded={expanded}
                      onClick={() => setOpenId(expanded ? null : r.id)}
                      className="mr-2 flex h-9 w-9 items-center justify-center rounded-full text-[#1976d2] transition hover:bg-[#e6f4ff]"
                    >
                      <Chevron
                        className={`transition-transform duration-300 ${
                          expanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {expanded && (
                    <div className="rm-in space-y-4 px-4 pb-4 pt-1">
                      {r.groups.map((g) => (
                        <div key={g.title}>
                          <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#1976d2]">
                            {g.title}
                          </p>
                          <ul className="space-y-0.5">
                            {g.links.map((l, i) => (
                              <li
                                key={l.label}
                                className="rm-up"
                                style={{
                                  animationDelay: `${Math.min(i * 30, 300)}ms`,
                                }}
                              >
                                <Link
                                  href={l.href}
                                  onClick={onNavigate}
                                  className="block rounded-lg px-2 py-1.5 text-sm text-[#2c4a73] transition hover:bg-[#e6f4ff] hover:text-[#1976d2]"
                                >
                                  {l.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}