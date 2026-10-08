"use client";

import { Check } from "lucide-react";

const plans = [
  {
    name: "BASIC",
    description: "Perfect for starting your online store.",
    features: [
      "Up to 20 Products",
      "WhatsApp Ordering",
      "Basic Store Customization",
      "Product Management",
      "Product Images & Descriptions",
      "Basic Dashboard",
      "Basic Order Management",
      "Store Categories",
      "Buildexom Branding",
    ],
    button: "Get Started Free",
    popular: false,
  },
  {
    name: "PRO",
    description: "For growing stores that need more flexibility.",
    features: [
      "Up to 75 Products",
      "Up to 5 Categories",
      "Up to 15 Products per Category",
      "Advanced Store Customization",
      "WhatsApp Ordering",
      "WhatsApp New Product Alerts (NEW)",
      "Order Tracking",
      "Payment Integration",
      "Coupons & Discounts",
      "Basic Analytics",
      "Remove Buildexom Branding",
    ],
    button: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "BUSINESS",
    description: "For businesses ready to scale their online store.",
    features: [
      "Unlimited Products",
      "Unlimited Categories",
      "Advanced Store Customization",
      "WhatsApp Ordering",
      "Smart WhatsApp Product Alerts (NEW)",
      "Category-based customer targeting (NEW)",
      "Scheduled notifications (NEW)",
      "Notification delivery and click stats (NEW)",
      "Customer subscription management (NEW)",
      "Order Tracking",
      "Payment Integration",
      "AI Customer Chatbot",
      "Advanced Analytics",
      "Remove Buildexom Branding",
      "Priority Support",
    ],
    button: "Go Business",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="w-full bg-[#f7faff] px-4 py-16 font-[Arial,Helvetica,sans-serif] sm:px-6 lg:px-8"
    >
      {/* Section Heading */}
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="mb-2 text-[16px] font-bold uppercase tracking-[0.18em] text-[#2457d6]">
          PRICING
        </p>

        <h2 className="text-3xl font-bold tracking-tight text-[#17243a] sm:text-4xl">
          Choose the Plan That Fits Your Store
        </h2>

        <p className="mt-2 text-[15px] leading-6 text-[#707b8d]">
          Start for free and upgrade as your business grows.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto grid max-w-6xl items-stretch gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex h-full flex-col rounded-xl bg-white ${
              plan.popular
                ? "border border-[#82a9e6] shadow-[0_12px_35px_rgba(36,87,214,0.15)]"
                : "border border-[#edf0f5] shadow-[0_5px_20px_rgba(30,60,100,0.05)]"
            }`}
          >
            {/* Most Popular */}
            {plan.popular && (
              <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
                <span className="whitespace-nowrap rounded-full bg-[#2160d9] px-4 py-1 text-[9px] font-bold text-white shadow-sm">
                  Most popular
                </span>
              </div>
            )}

            {/* Card Header */}
            <div className="border-b border-[#edf1f6] px-6 pb-4 pt-6">
              <p className="text-[14px] font-bold tracking-[0.14em] text-[#2160d9]">
                {plan.name}
              </p>

              <p className="mt-2 min-h-[40px] text-[14px] font-normal leading-[20px] text-[#707b8d]">
                {plan.description}
              </p>
            </div>

            {/* Features */}
            <div className="flex-1 px-6 py-4">
              <ul className="space-y-2.5">
                {plan.features.map((feature, index) => {
                  const isNew = feature.endsWith("(NEW)");
                  const cleanFeature = feature.replace(" (NEW)", "");

                  return (
                    <li
                      key={`${plan.name}-${index}`}
                      className="flex items-start gap-2.5 text-[14px] leading-[20px] text-[#667386]"
                    >
                      <Check
                        size={15}
                        strokeWidth={2}
                        className="mt-[2px] shrink-0 text-[#3165c9]"
                      />

                      <span>
                        {cleanFeature}

                        {isNew && (
                          <span className="ml-1.5 rounded bg-[#eaf1ff] px-1.5 py-[2px] text-[8px] font-bold uppercase tracking-wide text-[#2160d9]">
                            NEW
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Button */}
            <div className="px-6 pb-6 pt-2">
              <button
                type="button"
                className="w-full rounded-lg bg-[#2057d7] py-2.5 text-[12px] font-bold text-white shadow-[0_5px_12px_rgba(32,87,215,0.2)] transition-all duration-200 hover:bg-[#1749c1] hover:shadow-[0_7px_16px_rgba(32,87,215,0.3)]"
              >
                {plan.button}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}