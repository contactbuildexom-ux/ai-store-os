"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";

/* User login page */
const USER_LOGIN_HREF = "/user/login";

const SUGGESTIONS = [
  "Clothing store for women",
  "Electronics and mobile accessories",
  "Beauty and skincare products",
  "Home-made food delivery",
];

const PERKS = ["No coding needed", "Free to start", "Ready in minutes"];

const CSS = `
@keyframes gsPop { from { opacity: 0; transform: translateY(14px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
.gs-pop { animation: gsPop .28s cubic-bezier(.2,.8,.2,1) both; }
.gs-cta { font-size: 15px; font-weight: 700; }
.gs-chip { font-size: 13px; font-weight: 600; }
@media (prefers-reduced-motion: reduce) { .gs-pop { animation: none; } }
`;

export default function GenerateStoreModal({
  open,
  onClose,
  onGenerate,
}: {
  open: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  const ready = prompt.trim().length >= 3;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ready) return;
    onGenerate(prompt.trim());
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
        className="gs-pop relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#0b2545] to-[#1976d2] px-6 pb-8 pt-7 text-white sm:px-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg text-white transition hover:bg-white/25"
          >
            ✕
          </button>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
            Free to start
          </p>
          <h2 id="gs-title" className="mt-2 pr-8 text-2xl font-extrabold sm:text-3xl">
            Generate your free store
          </h2>
          <p className="mt-1.5 text-sm text-blue-100/90">
            Tell us about your business and we will set up your online store in minutes.
          </p>
        </div>

        {/* Body */}
        <form onSubmit={submit} className="space-y-5 px-6 pb-7 pt-6 sm:px-8">
          <div>
            <label htmlFor="gs-prompt" className="mb-1.5 block text-sm font-bold text-[#0b2545]">
              What will you sell?
            </label>
            <textarea
              id="gs-prompt"
              ref={inputRef}
              rows={3}
              maxLength={300}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A clothing store for women with a summer collection and cash on delivery"
              className="w-full resize-none rounded-xl border border-[#cfe2fa] bg-[#f6faff] px-4 py-3 text-[15px] text-[#0b2545] outline-none transition placeholder:text-[#8aa3c4] focus:border-[#1976d2] focus:bg-white focus:ring-4 focus:ring-[#1976d2]/15"
            />
            <div className="mt-1 text-right text-[11px] font-medium text-[#5b7aa3]">
              {prompt.length}/300
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#5b7aa3]">
              Or pick an idea
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setPrompt(s);
                    inputRef.current?.focus();
                  }}
                  className="gs-chip cursor-pointer rounded-full border border-[#cfe2fa] bg-white px-3.5 py-1.5 text-[#0b2545] transition hover:border-[#1976d2] hover:bg-[#1976d2] hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 rounded-2xl bg-[#f1f8ff] px-4 py-3">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm font-semibold text-[#2c4a73]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1976d2] text-white">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </span>
                {p}
              </li>
            ))}
          </ul>

          <button
            type="submit"
            disabled={!ready}
            className="gs-cta flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1976d2] to-[#1565c0] text-white shadow-[0_14px_28px_-12px_rgba(25,118,210,0.8)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:hover:translate-y-0"
          >
            Generate my store
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>

          <p className="text-center text-sm text-[#2c4a73]">
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