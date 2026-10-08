type FaqItem = {
  question: string;
  answer: string;
};

const faqs: FaqItem[] = [
  {
    question: "Is the free plan really free?",
    answer:
      "Yes. You can list up to 20 products and take orders on WhatsApp at no cost. Buildexom branding stays on the free plan.",
  },
  {
    question: "How do customers place orders?",
    answer:
      "They pick products in your store and send the order to your WhatsApp in one tap, with items, quantity and total filled in automatically. You confirm and deliver.",
  },
  {
    question: "Do I need coding or design skills?",
    answer:
      "No. Describe your business and the AI builds your store, adds products, and sets up the design and pages. You can customize everything afterwards.",
  },
  {
    question: "What is the difference between Free, Pro and Business?",
    answer:
      "Free gives you up to 20 products with WhatsApp ordering. Pro raises the limit to 75 products and adds order tracking, payment integration, coupons, basic analytics, WhatsApp new product alerts and removal of Buildexom branding. Business has unlimited products and categories, smart notifications, advanced analytics, an AI customer chatbot and priority support.",
  },
  {
    question: "Can I upgrade my plan later?",
    answer:
      "Yes. Start free and move to Pro or Business whenever your store grows.",
  },
  {
    question: "How do WhatsApp product alerts work?",
    answer:
      "When you add a new product, customers who opted in get a WhatsApp message with its image, price, a short description and a link. Pro sends the alert automatically. Business adds category targeting, scheduling, delivery and click stats, and subscription management.",
  },
  {
    question: "What is the store QR code?",
    answer:
      "Every store gets its own QR code that opens your store when scanned. Print it, share it on social media or put it on your packaging, and customers can order on WhatsApp right away. Custom QR design with your colors and logo is available on Pro and Business.",
  },
  {
    question: "How do I get help?",
    answer:
      "Visit the Help Center and Tutorials, or message our team. Business plans get priority support.",
  },
];

export default function Faq() {
  return (
    <section
      id="faq"
      className="scroll-mt-20 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-3xl">
        {/* Heading */}
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            Questions? We have answers
          </h2>
        </div>

        {/* Accordion */}
        <div className="mt-10 space-y-3">
          {faqs.map((item) => (
            <details
              key={item.question}
              className="group rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition open:border-brand-blue/40 open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-brand-navy [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-brand-blue transition group-open:rotate-45 group-open:bg-brand-blue group-open:text-white"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="h-4 w-4"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 pr-10 text-sm leading-relaxed text-slate-600">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}