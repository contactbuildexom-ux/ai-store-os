"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { resources } from "@/lib/resources";

type Item = { label: string; href: string; group: string };

const QUICK = [
  { label: "Help Center", href: "/help" },
  { label: "Blog", href: "/blogs" },
  { label: "Tutorials", href: "/tutorials" },
  { label: "E-commerce Guides", href: "/guides" },
  { label: "AI Tools Guide", href: "/ai-guide" },
];

export default function SearchPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Everything searchable, built from the Resources menu data
  const index = useMemo<Item[]>(() => {
    const out: Item[] = [];
    const seen = new Set<string>();
    for (const r of resources) {
      out.push({ label: r.title, href: r.href, group: "Resources" });
      for (const g of r.groups) {
        for (const l of g.links) {
          const key = `${l.label}|${l.href}`;
          if (seen.has(key)) continue;
          seen.add(key);
          out.push({ label: l.label, href: l.href, group: r.title });
        }
      }
    }
    return out;
  }, []);

  const term = q.trim().toLowerCase();
  const results = term
    ? index
        .filter(
          (i) =>
            i.label.toLowerCase().includes(term) ||
            i.group.toLowerCase().includes(term)
        )
        .slice(0, 7)
    : [];

  // Focus the input when the panel opens
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [open]);

  // Clear the text after the panel has closed
  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => setQ(""), 300);
    return () => window.clearTimeout(t);
  }, [open]);

  // Esc closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Click-outside backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 top-[72px] z-40 bg-[#0b2545]/25 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Search"
        aria-hidden={!open}
        className={`absolute inset-x-0 top-full z-50 transition-all duration-300 ease-out ${
          open
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-2 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-[760px] px-4 pt-3 sm:px-6">
          <div className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-2xl shadow-blue-900/20">
            {/* Input row */}
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                if (results[0]) {
                  window.location.href = results[0].href;
                  onClose();
                }
              }}
              className="flex items-center gap-3 px-4 py-3 sm:px-5"
            >
              <svg
                className="h-5 w-5 shrink-0 text-[#1976d2]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>

              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search help, guides, tutorials..."
                aria-label="Search"
                className="min-w-0 flex-1 bg-transparent text-base font-medium text-[#0b2545] outline-none placeholder:text-slate-400"
              />

              {q && (
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    inputRef.current?.focus();
                  }}
                  className="hidden text-xs font-semibold text-slate-500 hover:text-[#1976d2] sm:block"
                >
                  Clear
                </button>
              )}

              {/* CLOSE (X) */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e6f1ff] text-[#0b2545] transition hover:bg-[#1976d2] hover:text-white"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </form>

            <div className="max-h-[60vh] overflow-y-auto border-t border-blue-100 bg-[#f6faff] px-4 py-3 sm:px-5">
              {term ? (
                results.length ? (
                  <ul className="space-y-1">
                    {results.map((r) => (
                      <li key={`${r.label}-${r.href}`}>
                        <Link
                          href={r.href}
                          onClick={onClose}
                          className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-white hover:shadow-sm"
                        >
                          <span className="font-semibold text-[#0b2545]">
                            {r.label}
                          </span>
                          <span className="shrink-0 rounded-full bg-[#e6f1ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1976d2]">
                            {r.group}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-3 py-4 text-sm text-slate-600">
                    No results for “{q}”. Try the{" "}
                    <Link
                      href="/help"
                      onClick={onClose}
                      className="font-semibold text-[#1976d2] underline"
                    >
                      Help Center
                    </Link>
                    .
                  </p>
                )
              ) : (
                <>
                  <p className="px-1 pb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Quick links
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={onClose}
                        className="rounded-full border border-blue-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0b2545] transition hover:border-[#1976d2] hover:text-[#1976d2]"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}