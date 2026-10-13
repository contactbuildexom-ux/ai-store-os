
"use client";

import Link from "next/link";
import { useState } from "react";
import type { MouseEvent } from "react";

const faqs = [
  {
    q: "Is the free plan really free?",
    a: "Yes. You can list up to 20 products and take orders on WhatsApp at no cost. Buildexom branding stays on the free plan.",
  },
  {
    q: "How do customers place orders?",
    a: "They pick products in your store and send the order to your WhatsApp in one tap, with items and total filled in.",
  },
  {
    q: "Do I need coding or design skills?",
    a: "No. Describe your business and the AI builds your store. You can customize it afterwards.",
  },
  {
    q: "How do WhatsApp product alerts work?",
    a: "Customers who opt in get a WhatsApp message when you add a new product, with its image, price, a short description, and a link. On Business, you can target by category and schedule messages.",
  },
  {
    q: "What is the store QR code?",
    a: "Every store gets a QR code that opens your store when scanned. You can print it or share it on social media, and customers can order on WhatsApp right away.",
  },
  {
    q: "Can I upgrade my plan later?",
    a: "Yes. Start free and move to Pro or Business whenever your store grows.",
  },
  {
    q: "How do I get help?",
    a: "Visit the Help Center and Tutorials, or message our team. Business plans get priority support.",
  },
];

/* "Talk to our team" -> Footer ke social icons tak scroll + blink */
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

  return (
    <section
      id="faq"
      className="bg-soft-gradient relative scroll-mt-20 overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      {/* Decorative glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        {/* Left: heading + help card */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <span className="inline-flex items-center rounded-full border border-blue-100 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-blue">
            FAQ
          </span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-brand-navy sm:text-5xl">
            Questions? <span className="text-gradient">We have answers</span>
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">
            Everything you need to know before you launch your store.
          </p>

          <div className="mt-8 flex items-center gap-4 rounded-2xl border border-blue-100 bg-white/80 p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-sky-500 text-white">
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
            <div className="flex-1">
              <p className="text-sm font-bold text-brand-navy">Still have questions?</p>
              <p className="mt-0.5 text-sm text-slate-600">Our team is a message away.</p>
            </div>
            <Link
              href="/#contact-socials"
              onClick={goToSocials}
              className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:brightness-110"
            >
              Contact us
            </Link>
          </div>
        </div>

        {/* Right: accordion */}
        <div className="space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className={`rounded-2xl border bg-white/85 transition-colors duration-300 ${
                  isOpen ? "border-blue-300" : "border-blue-100 hover:border-blue-200"
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full cursor-pointer items-center gap-4 p-5 text-left"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300 ${
                      isOpen
                        ? "bg-gradient-to-br from-blue-700 to-sky-500 text-white"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span className="flex-1 text-[15px] font-bold text-brand-navy sm:text-base">
                    {item.q}
                  </span>

                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      isOpen
                        ? "rotate-45 border-blue-600 bg-blue-600 text-white"
                        : "border-blue-100 text-blue-700"
                    }`}
                    aria-hidden="true"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </button>

                {/* Smooth open/close */}
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 pl-[68px] text-[15px] leading-relaxed text-slate-600">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}