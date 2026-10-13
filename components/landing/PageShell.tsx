import type { ReactNode } from "react";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

function BackToHome() {
  return (
    <Link
      href="/"
      aria-label="Back to home page"
      className="group fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2.5 text-sm font-semibold text-[#0f2350] shadow-xl shadow-slate-900/10 ring-1 ring-slate-200 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-2xl sm:bottom-6 sm:left-6"
    >
      <svg
        className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
      <span className="hidden sm:inline">Back to Home</span>
      <span className="sm:hidden">Home</span>
    </Link>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main>{children}</main>
      <Footer />
      <BackToHome />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#eef4ff] to-white">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="relative mx-auto max-w-[1200px] px-4 pb-10 pt-12 text-center sm:px-6 sm:pb-14 sm:pt-16">
        {eyebrow && (
          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#0f2350] sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
            {subtitle}
          </p>
        )}
        {children && <div className="mx-auto mt-6 max-w-xl">{children}</div>}
      </div>
    </section>
  );
}