import type { ReactNode } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main>{children}</main>
      <Footer />
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