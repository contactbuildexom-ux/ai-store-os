"use client";

import Link from "next/link";
import { useState } from "react";
import type { MouseEvent } from "react";
import JsonLd from "@/components/seo/JsonLd";

const faqs = [
  {
    q: "How do I create an online store with AI?",
    a: "Describe your business and Buildexom's AI store builder creates your online store for you. You can customize it afterwards and start selling.",
  },
  {
    q: "Is the free plan really free?",
    a: "Yes. Buildexom has a free plan. Its current product limits and included features are listed in the live pricing section.",
  },
  {
    q: "Is Buildexom a no-code eCommerce platform?",
    a: "Yes. You do not need coding or design skills. Describe your business, let the AI build your store, then customize it your way.",
  },
  {
    q: "Can I build an online store in minutes?",
    a: "Yes. Buildexom is an instant online store builder, so you can go from idea to a live store in minutes.",
  },
  {
    q: "How do customers place orders?",
    a: "They pick products in your store and send the order to your WhatsApp in one tap, with items and total filled in.",
  },
  {
    q: "How do WhatsApp product alerts work?",
    a: "Customers who opt in can receive product updates by WhatsApp. Check the live pricing section for the current availability and features of each plan.",
  },
  {
    q: "What is the store QR code?",
    a: "Every store gets a QR code that opens your store when scanned. You can print it or share it on social media, and customers can order on WhatsApp right away.",
  },
  {
    q: "Is Buildexom an affordable online store builder for small businesses?",
    a: "Yes. You can start with an available free plan and review the live pricing section for current upgrade options.",
  },
  {
    q: "How do I get help?",
    a: "Visit the Help Center and Tutorials, or message our team. Check the live pricing section for current support options.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const VISIBLE = 4;

const CSS = `
@keyframes faqIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.faq-in { animation: faqIn .35s ease-out both; }
@media (prefers-reduced-motion: reduce) { .faq-in { animation: none; } }
`;

/* "Contact us" scrolls to the footer social icons and blinks them */
function goToSocials(e: MouseEvent<HTMLAnchorElement>) {
  const box = document.getElementById("contact-socials");
  if (!box) return;
  e.preventDefault();
  box.scrollIntoView({ behavior: "smooth", block: "center" });
  box.classList.remove("blink-attention");
  void box.offsetWidth;
  box.classList.add("blink-attention");
  window.setTimeout(() => box.classList.remove("blink-attention"), 4500);
}

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? faqs : faqs.slice(0, VISIBLE);
  const hiddenCount = faqs.length - VISIBLE;

  const toggleAll = () => {
    if (showAll && open !== null && open >= VISIBLE) setOpen(null);
    setShowAll((s) => !s);
  };

  return (
    <section
      id="faq"
      className="relative scroll-mt-20 overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <style>{CSS}</style>
      <JsonLd data={faqSchema} />

      <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        {/* Left: heading + help card (centered) */}
        <div className="text-center lg:sticky lg:top-28 lg:self-start">
          <span>FAQ</span>
          <h2 className="text-brand-navy">
            Online store builder questions,{" "}
            <span className="text-gradient">answered</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-600">
            Everything you need to know before you build your online store with our AI store builder.
          </p>

          <div className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-4 rounded-2xl border border-blue-100 bg-white p-5 text-left shadow-[0_12px_32px_-22px_rgba(11,37,69,0.4)]">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b2545] to-[#1976d2] text-white shadow-md shadow-blue-500/30">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
              </svg>
            </span>
            <div className="min-w-[140px] flex-1">
              <p className="text-sm font-bold text-brand-navy">Still have questions?</p>
              <p className="mt-0.5 text-sm text-slate-600">Our team is a message away.</p>
            </div>
            <Link
              href="/#contact-socials"
              onClick={goToSocials}
              className="rounded-xl bg-[#1976d2] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/30 transition hover:bg-[#1565c0]"
            >
              Contact us
            </Link>
          </div>
        </div>

        {/* Right: accordion */}
        <div>
          <div className="space-y-3">
            {visible.map((item, i) => {
              const isOpen = open === i;
              const isExtra = i >= VISIBLE;
              return (
                <div
                  key={item.q}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-[0_10px_28px_-22px_rgba(11,37,69,0.45)] transition duration-300 ${
                    isExtra ? "faq-in" : ""
                  } ${
                    isOpen
                      ? "border-[#1976d2]/60"
                      : "border-blue-100 hover:border-[#1976d2]/40"
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full cursor-pointer items-center gap-4 p-5 text-left"
                  >
                    {/* Question mark icon */}
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
                        isOpen
                          ? "bg-gradient-to-br from-[#0b2545] to-[#1976d2] text-white"
                          : "bg-[#e6f1ff] text-[#1976d2]"
                      }`}
                    >
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8" />
                        <path d="M12 17h.01" />
                      </svg>
                    </span>

                    <span className="flex-1 text-[15px] font-bold text-brand-navy sm:text-base">
                      {item.q}
                    </span>

                    {/* Plus / close indicator: two bars centered with absolute positioning,
                        so it stays exactly in the middle of the circle */}
                    <span
                      className={`relative block h-8 w-8 shrink-0 rounded-full border transition-colors duration-300 ${
                        isOpen
                          ? "border-[#1976d2] bg-[#1976d2]"
                          : "border-blue-200 bg-white"
                      }`}
                      aria-hidden="true"
                    >
                      <span
                        className={`absolute left-1/2 top-1/2 block h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ${
                          isOpen ? "rotate-45" : "rotate-0"
                        }`}
                      >
                        {/* Horizontal bar */}
                        <span
                          className={`absolute left-0 top-1/2 block h-[2px] w-full -translate-y-1/2 rounded-full ${
                            isOpen ? "bg-white" : "bg-[#1976d2]"
                          }`}
                        />
                        {/* Vertical bar */}
                        <span
                          className={`absolute left-1/2 top-0 block h-full w-[2px] -translate-x-1/2 rounded-full ${
                            isOpen ? "bg-white" : "bg-[#1976d2]"
                          }`}
                        />
                      </span>
                    </span>
                  </button>

                  {/* Smooth open/close */}
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 pl-[76px] text-[15px] leading-relaxed text-slate-600">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* More / Less toggle (same idea as Pricing) */}
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={toggleAll}
              aria-expanded={showAll}
              className="mt-5 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-blue-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#1976d2] shadow-sm transition hover:border-[#1976d2] hover:bg-[#1976d2] hover:text-white"
            >
              {showAll ? "Show less" : `+${hiddenCount} more questions`}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={`transition-transform duration-300 ${
                  showAll ? "rotate-180" : ""
                }`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}