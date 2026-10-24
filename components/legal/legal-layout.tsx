import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/components/landing/logo";
import Footer from "@/components/landing/Footer";

export const CONTACT_EMAIL = "buildexom.pixel2page@gmail.com";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

type LegalLayoutProps = {
  title: string;
  subtitle: string;
  updated: string;
  sections: LegalSection[];
};

export default function LegalLayout({ title, subtitle, updated, sections }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="border-b border-blue-100 bg-[#e3f2ff]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Buildexom home" className="inline-flex">
            <Logo />
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[#1976d2] px-5 py-2 text-sm font-semibold text-[#1976d2] transition duration-300 hover:bg-[#1976d2] hover:text-white"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#071a33] via-[#0b2545] to-[#1556a8] text-white">
        <div className="mx-auto max-w-[1200px] px-5 py-14 sm:px-6 sm:py-16 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-200">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100/85 sm:text-lg">
            {subtitle}
          </p>
          <p className="mt-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-blue-100 backdrop-blur">
            Last updated: {updated}
          </p>
        </div>
      </section>

      {/* Body */}
      <main className="mx-auto max-w-[1200px] px-5 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          {/* Table of contents */}
          <aside className="hidden lg:block">
            <nav
              aria-label="On this page"
              className="sticky top-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1976d2]">
                On this page
              </p>
              <ol className="mt-4 space-y-2.5">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="flex gap-2 text-sm font-medium text-slate-600 transition duration-200 hover:text-[#1976d2]"
                    >
                      <span className="text-slate-400">{i + 1}.</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          {/* Content */}
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <div>
              {sections.map((s, i) => (
                <section
                  key={s.id}
                  id={s.id}
                  className="scroll-mt-8 border-b border-slate-100 py-8 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <h2 className="flex items-center gap-3 text-xl font-extrabold text-[#0b2545]">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1976d2] to-[#4a9bf0] text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    {s.title}
                  </h2>
                  <div className="mt-4 space-y-4 text-[15px] leading-7 text-slate-600 [&_a]:font-semibold [&_a]:text-[#1976d2] [&_a]:underline [&_strong]:font-semibold [&_strong]:text-slate-900 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
                    {s.content}
                  </div>
                </section>
              ))}
            </div>

            {/* Contact box */}
            <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50 p-6">
              <h3 className="text-lg font-extrabold text-[#0b2545]">Questions about this page?</h3>
              <p className="mt-2 text-[15px] leading-7 text-slate-600">
                Write to us at{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-semibold text-[#1976d2] underline"
                >
                  {CONTACT_EMAIL}
                </a>{" "}
                and we will get back to you as soon as we can.
              </p>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}