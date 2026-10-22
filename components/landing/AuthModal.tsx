"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Tab = "login" | "signup";

/* User login / signup pages (admin /login se alag) */
const USER_LOGIN_HREF = "/user/login";
const USER_SIGNUP_HREF = "/user/signup";

export interface TemplateMetadata {
  id: string;
  name: string;
  niche?: string;
  theme?: string;
  sampleName?: string;
  prompt?: string;
}

export default function AuthModal({
  open,
  onClose,
  initialTab = "signup",
  templateData,
}: {
  open: boolean;
  onClose: () => void;
  initialTab?: Tab;
  templateData?: TemplateMetadata | null;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [wasOpen, setWasOpen] = useState(open);

  // Modal khulne par tab ko initialTab par reset karo
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setTab(initialTab);
  }

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

  // Build target query URLs carrying forward the selected template & theme
  const signupParams = new URLSearchParams();
  if (templateData) {
    if (templateData.id) signupParams.set("template", templateData.id);
    if (templateData.niche) signupParams.set("niche", templateData.niche);
    if (templateData.theme) signupParams.set("theme", templateData.theme);
    if (templateData.sampleName) signupParams.set("name", templateData.sampleName);
    if (templateData.prompt) signupParams.set("prompt", templateData.prompt);
  }
  const signupHref = signupParams.toString() ? `${USER_SIGNUP_HREF}?${signupParams.toString()}` : USER_SIGNUP_HREF;

  const loginParams = new URLSearchParams();
  if (templateData) {
    if (templateData.id) loginParams.set("template", templateData.id);
    if (templateData.niche) loginParams.set("niche", templateData.niche);
    if (templateData.theme) loginParams.set("theme", templateData.theme);
  }
  const loginHref = loginParams.toString() ? `${USER_LOGIN_HREF}?${loginParams.toString()}` : USER_LOGIN_HREF;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b2545]/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Login or sign up"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#0b2545] to-[#1976d2] px-6 pb-8 pt-7 text-white">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg text-white transition hover:bg-white/25"
          >
            ✕
          </button>
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-200">
            Buildexom AI
          </p>
          <h2 className="mt-2 pr-8 text-2xl font-extrabold">
            {tab === "signup" ? "Create your free account" : "Welcome back"}
          </h2>
          <p className="mt-1 text-sm text-blue-100/90">
            {tab === "signup"
              ? "Describe your business and let AI build your store."
              : "Log in to manage your store."}
          </p>
        </div>

        {/* Selected Template Badge (if arrived from Use Template) */}
        {templateData && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-2xl border border-blue-200/80 bg-blue-50/70 px-4 py-2.5 text-xs text-[#0b2545]">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#1976d2] animate-pulse" />
            <span>Selected Template: <strong className="font-bold text-[#1976d2]">{templateData.name}</strong></span>
          </div>
        )}

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 gap-1 rounded-full bg-[#e6f1ff] p-1">
            <button
              type="button"
              onClick={() => setTab("signup")}
              className={`rounded-full py-2.5 text-sm font-bold transition ${
                tab === "signup"
                  ? "bg-white text-[#0b2545] shadow"
                  : "text-slate-500 hover:text-[#1976d2]"
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`rounded-full py-2.5 text-sm font-bold transition ${
                tab === "login"
                  ? "bg-white text-[#0b2545] shadow"
                  : "text-slate-500 hover:text-[#1976d2]"
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
                href={signupHref}
                onClick={onClose}
                className="block rounded-full bg-[#1976d2] px-6 py-3.5 text-center text-sm font-bold text-white shadow-md shadow-blue-500/30 transition hover:bg-[#1565c0]"
              >
                Create free account
              </Link>
              <p className="text-center text-xs text-slate-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className="font-semibold text-[#1976d2] hover:underline"
                >
                  Login
                </button>
              </p>
            </>
          ) : (
            <>
              <Link
                href={loginHref}
                onClick={onClose}
                className="block rounded-full bg-[#1976d2] px-6 py-3.5 text-center text-sm font-bold text-white shadow-md shadow-blue-500/30 transition hover:bg-[#1565c0]"
              >
                Continue to Login
              </Link>
              <p className="text-center text-xs text-slate-500">
                New to Buildexom?{" "}
                <button
                  type="button"
                  onClick={() => setTab("signup")}
                  className="font-semibold text-[#1976d2] hover:underline"
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
