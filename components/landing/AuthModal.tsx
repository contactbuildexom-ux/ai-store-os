"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Tab = "login" | "signup";

export default function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("signup");

  // Escape se band ho + page scroll lock
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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1736]/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Login or sign up"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0b1736] via-[#12297a] to-blue-700 px-6 pb-8 pt-7 text-white">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-400/30 blur-3xl" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-white transition hover:bg-white/20"
          >
            ✕
          </button>
          <p className="relative text-xs font-semibold uppercase tracking-wider text-sky-200">
            Buildexom AI
          </p>
          <h2 className="relative mt-2 text-2xl font-extrabold">
            {tab === "signup" ? "Create your free account" : "Welcome back"}
          </h2>
          <p className="relative mt-1 text-sm text-blue-100/80">
            {tab === "signup"
              ? "Describe your business and let AI build your store."
              : "Log in to manage your store."}
          </p>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 gap-1 rounded-full bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setTab("signup")}
              className={`rounded-full py-2.5 text-sm font-bold transition ${
                tab === "signup"
                  ? "bg-white text-[#0f2350] shadow"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`rounded-full py-2.5 text-sm font-bold transition ${
                tab === "login"
                  ? "bg-white text-[#0f2350] shadow"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Login
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-3 px-6 pb-7 pt-5">
          {tab === "signup" ? (
            <>
              <Link
                href="/login?mode=signup"
                onClick={onClose}
                className="block rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-blue-300/50 transition hover:scale-[1.02]"
              >
                Create free account
              </Link>
              <p className="text-center text-xs text-slate-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Login
                </button>
              </p>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={onClose}
                className="block rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-blue-300/50 transition hover:scale-[1.02]"
              >
                Continue to Login
              </Link>
              <p className="text-center text-xs text-slate-500">
                New to Buildexom?{" "}
                <button
                  type="button"
                  onClick={() => setTab("signup")}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Create a free account
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}