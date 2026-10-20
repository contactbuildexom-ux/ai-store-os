"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Store, Sparkles, Palette, ArrowRight } from "lucide-react";
import { THEME_OPTIONS, type ThemeOption } from "@/lib/store-theme";

/* User login page */
const USER_LOGIN_HREF = "/user/login";

const PERKS = ["E-Commerce Ready", "WhatsApp Checkout", "Live in 2 Minutes"];

const CSS = `
@keyframes gsPop { from { opacity: 0; transform: translateY(14px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
.gs-pop { animation: gsPop .28s cubic-bezier(.2,.8,.2,1) both; }
.gs-cta { font-size: 15px; font-weight: 700; }
@media (prefers-reduced-motion: reduce) { .gs-pop { animation: none; } }
`;

export default function GenerateStoreModal({
  open,
  onClose,
  onGenerate,
}: {
  open: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, storeName?: string, theme?: string) => void;
}) {
  const [storeName, setStoreName] = useState("");
  const [customIdea, setCustomIdea] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("ocean-blue");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const ready = storeName.trim().length >= 2 || customIdea.trim().length >= 3;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ready) return;
    const name = storeName.trim() || "My Online Store";
    const finalPrompt = customIdea.trim() || `An online store called ${name} offering premium items with nationwide delivery and Cash on Delivery.`;
    onGenerate(finalPrompt, name, selectedTheme);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b2545]/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <style>{CSS}</style>

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gs-title"
        onClick={(e) => e.stopPropagation()}
        className="gs-pop relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl border border-[#cfe2fa]"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#0b2545] to-[#1976d2] px-6 pb-6 pt-6 text-white sm:px-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg text-white transition hover:bg-white/25"
          >
            ✕
          </button>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-sky-200">
              <Store size={13} /> Only E-Commerce Store
            </span>
          </div>
          <h2 id="gs-title" className="mt-2 pr-8 text-2xl font-extrabold sm:text-3xl">
            Generate Your Store
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-blue-100/90">
            Write your store idea and name. Our AI will build your exact custom store instantly.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={submit} className="space-y-4 px-6 pb-7 pt-5 sm:px-8">
          
          {/* 1. Store Name */}
          <div>
            <label htmlFor="gs-name" className="mb-1 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#0b2545]">
              <span>Store Name</span>
              <span className="text-[11px] font-normal text-slate-500">e.g. Apex Kicks, Velvet Aura</span>
            </label>
            <input
              id="gs-name"
              type="text"
              autoFocus
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Enter your store name..."
              className="w-full rounded-xl border border-[#cfe2fa] bg-[#f6faff] px-4 py-3 text-sm font-semibold text-[#0b2545] outline-none transition placeholder:text-[#8aa3c4] focus:border-[#1976d2] focus:bg-white focus:ring-3 focus:ring-[#1976d2]/15"
            />
          </div>

          {/* 2. Custom Store Idea / Niche Input (Clean text area where user freely writes their idea) */}
          <div>
            <label htmlFor="gs-idea" className="mb-1 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#0b2545]">
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#1976d2]" /> What do you want to sell?
              </span>
              <span className="text-[11px] font-normal text-slate-500">Write your custom idea</span>
            </label>
            <textarea
              id="gs-idea"
              rows={3}
              value={customIdea}
              onChange={(e) => setCustomIdea(e.target.value)}
              placeholder="Describe your exact store idea (e.g. Luxury leather boots and sneakers, oversized graphic hoodies, organic herbal teas, handmade jewelry with Cash on Delivery)..."
              className="w-full rounded-xl border border-[#cfe2fa] bg-[#f6faff] px-4 py-2.5 text-xs font-medium text-[#0b2545] outline-none transition placeholder:text-[#8aa3c4] focus:border-[#1976d2] focus:bg-white focus:ring-3 focus:ring-[#1976d2]/15 resize-none"
            />
          </div>

          {/* 3. Theme Selection */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0b2545]">
              <Palette size={13} className="text-[#1976d2]" /> Choose Store Theme
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {THEME_OPTIONS.slice(0, 6).map((t: ThemeOption) => {
                const isSelected = selectedTheme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTheme(t.id)}
                    className={`flex items-center gap-2 rounded-xl border p-2 text-left transition ${
                      isSelected
                        ? "border-[#1976d2] bg-blue-50/70 font-bold text-[#0b2545] ring-2 ring-[#1976d2]/20"
                        : "border-[#cfe2fa] bg-white text-slate-600 hover:border-blue-300"
                    }`}
                  >
                    <span
                      className="size-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="truncate text-xs">{t.name.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Perks list */}
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 rounded-xl bg-[#f1f8ff] px-3.5 py-2.5">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-1.5 text-xs font-semibold text-[#2c4a73]">
                <span className="flex size-4 items-center justify-center rounded-full bg-[#1976d2] text-white text-[9px] font-bold">
                  ✓
                </span>
                {p}
              </li>
            ))}
          </ul>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!ready}
            className="gs-cta flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1976d2] to-[#1565c0] text-white shadow-[0_12px_24px_-10px_rgba(25,118,210,0.8)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:hover:translate-y-0"
          >
            <span>Continue to Store Setup</span>
            <ArrowRight size={17} />
          </button>

          <p className="text-center text-xs text-[#2c4a73]">
            Already have an account?{" "}
            <Link
              href={USER_LOGIN_HREF}
              onClick={onClose}
              className="font-bold text-[#1976d2] hover:underline"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
