"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { resources, type Resource } from "@/lib/resources";

const THEME: Record<
  Resource["theme"],
  { grad: string; badge: string; dot: string }
> = {
  blue: {
    grad: "from-sky-500 to-indigo-600",
    badge: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  amber: {
    grad: "from-amber-400 to-orange-600",
    badge: "bg-orange-50 text-orange-700",
    dot: "bg-orange-500",
  },
  violet: {
    grad: "from-violet-500 to-fuchsia-600",
    badge: "bg-violet-50 text-violet-700",
    dot: "bg-violet-500",
  },
  emerald: {
    grad: "from-emerald-400 to-teal-600",
    badge: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  rose: {
    grad: "from-rose-400 to-pink-600",
    badge: "bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
  teal: {
    grad: "from-teal-400 to-cyan-600",
    badge: "bg-teal-50 text-teal-700",
    dot: "bg-teal-500",
  },
  slate: {
    grad: "from-slate-500 to-slate-700",
    badge: "bg-slate-100 text-slate-700",
    dot: "bg-slate-500",
  },
};

const CSS = `
@keyframes rmUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes rmIn { from { opacity: 0; } to { opacity: 1; } }
.rm-up { animation: rmUp .38s cubic-bezier(.2,.8,.2,1) both; }
.rm-in { animation: rmIn .25s ease both; }
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

/* ───────────────────────── DESKTOP MEGA MENU ───────────────────────── */

export function DesktopResources() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(resources[0].id);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const active = resources.find((r) => r.id === activeId) ?? resources[0];
  const theme = THEME[active.theme];
  const single = active.groups.length === 1;
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
    <div ref={root} onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <style>{CSS}</style>

      {/* Trigger */}
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`relative flex h-[72px] items-center gap-1.5 px-3 text-sm font-semibold transition-colors ${
          open || isHere
            ? "text-blue-600"
            : "text-slate-700 hover:text-blue-600"
        }`}
      >
        Resources
        <Chevron
          className={`transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
        <span
          className={`absolute bottom-0 left-3 right-3 h-0.5 origin-left rounded-full bg-blue-600 transition-transform duration-300 ${
            open || isHere ? "scale-x-100" : "scale-x-0"
          }`}
        />
      </button>

      {/* Panel */}
      <div
        className={`absolute left-1/2 top-full z-50 w-[min(980px,calc(100vw-2rem))] -translate-x-1/2 transition-all duration-300 ease-out ${
          open
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-2 opacity-0"
        }`}
      >
        <div className="grid grid-cols-[290px_1fr] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15">
          {/* LEFT: list */}
          <div className="flex flex-col border-r border-slate-100 bg-slate-50/80 p-3">
            <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Resources
            </p>

            <ul className="space-y-1">
              {resources.map((r) => {
                const t = THEME[r.theme];
                const on = r.id === activeId;
                return (
                  <li key={r.id}>
                    <Link
                      href={r.href}
                      onMouseEnter={() => setActiveId(r.id)}
                      onFocus={() => setActiveId(r.id)}
                      onClick={() => setOpen(false)}
                      className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200 ${
                        on
                          ? "bg-white shadow-md ring-1 ring-slate-200"
                          : "hover:bg-white/70"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${t.grad} text-lg shadow-sm transition-transform duration-300 ${
                          on ? "scale-110 -rotate-6" : ""
                        }`}
                      >
                        {r.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-sm font-bold text-[#0f2350]">
                          {r.title}
                          {r.badge && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                              {r.badge}
                            </span>
                          )}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {r.desc}
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={`text-slate-400 transition-all duration-200 ${
                          on
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-1 opacity-0"
                        }`}
                      >
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-3 rounded-2xl bg-gradient-to-br from-[#0b1736] to-blue-700 p-4 text-white">
              <p className="text-sm font-bold">Need help fast?</p>
              <p className="mt-0.5 text-xs text-blue-100/80">
                Ask Bexi AI, the chat bubble at the bottom right.
              </p>
            </div>
          </div>

          {/* RIGHT: content */}
          <div
            key={active.id}
            className="rm-in max-h-[min(72vh,580px)] overflow-y-auto"
          >
            <div
              className={`flex items-center justify-between gap-4 bg-gradient-to-r ${theme.grad} px-6 py-5 text-white`}
            >
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl ring-1 ring-white/30">
                  {active.icon}
                </span>
                <div>
                  <h3 className="text-lg font-extrabold">{active.title}</h3>
                  <p className="text-sm text-white/85">{active.desc}</p>
                </div>
              </div>
              <Link
                href={active.href}
                onClick={() => setOpen(false)}
                className="hidden shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#0f2350] shadow-md transition hover:scale-105 sm:inline-block"
              >
                Explore →
              </Link>
            </div>

            <div className="grid gap-x-8 gap-y-6 p-6 sm:grid-cols-2">
              {active.groups.map((g, gi) => (
                <div key={g.title} className={single ? "sm:col-span-2" : ""}>
                  <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    <span className={`h-2 w-2 rounded-full ${theme.dot}`} />
                    {g.href ? (
                      <Link
                        href={g.href}
                        onClick={() => setOpen(false)}
                        className="transition hover:text-blue-600"
                      >
                        {g.title}
                      </Link>
                    ) : (
                      g.title
                    )}
                  </p>

                  <ul
                    className={
                      single
                        ? "grid gap-x-8 gap-y-1 sm:grid-cols-2"
                        : "space-y-1"
                    }
                  >
                    {g.links.map((l, li) => (
                      <li
                        key={l.label}
                        className="rm-up"
                        style={{
                          animationDelay: `${Math.min(gi * 70 + li * 30, 420)}ms`,
                        }}
                      >
                        <Link
                          href={l.href}
                          onClick={() => setOpen(false)}
                          className="group/link flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-0.5 text-blue-400 transition-transform duration-200 group-hover/link:translate-x-1"
                          >
                            ›
                          </span>
                          <span>
                            <span className="font-medium">{l.label}</span>
                            {l.desc && (
                              <span className="block text-xs text-slate-400">
                                {l.desc}
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
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
        className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50"
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
              const t = THEME[r.theme];
              const expanded = openId === r.id;
              return (
                <li key={r.id} className="rounded-2xl bg-slate-50/70">
                  <div className="flex items-center">
                    <Link
                      href={r.href}
                      onClick={onNavigate}
                      className="flex flex-1 items-center gap-3 px-3 py-3"
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${t.grad} text-base`}
                      >
                        {r.icon}
                      </span>
                      <span>
                        <span className="flex items-center gap-2 text-sm font-bold text-[#0f2350]">
                          {r.title}
                          {r.badge && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                              {r.badge}
                            </span>
                          )}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {r.desc}
                        </span>
                      </span>
                    </Link>
                    <button
                      type="button"
                      aria-label={`Show ${r.title} topics`}
                      aria-expanded={expanded}
                      onClick={() => setOpenId(expanded ? null : r.id)}
                      className="mr-2 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-white"
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
                          <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
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
                                  className="block rounded-lg px-2 py-1.5 text-sm text-slate-600 transition hover:bg-white hover:text-blue-700"
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