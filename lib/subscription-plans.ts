export const SUBSCRIPTION_PLANS = {
  basic: {
    id: "basic",
    name: "Free Starter",
    price: 0,
    limits: {
      products: 20,
      categories: 0,
      productsPerCategory: 20,
      aiGeneratedCategories: 0,
      aiGeneratedProducts: 0,
    },
    features: {
      customDomain: false,
      paymentIntegration: false,
      aiCustomerChatbot: false,
      paymentGateways: ["whatsapp", "cod"] as const,
      descriptions: [
        "WhatsApp Ordering",
        "Personal Branded Subdomain",
        "Store QR Code",
        "Basic Store Customization",
        "Product Management",
        "Product Images & Descriptions",
        "Basic Dashboard",
        "Basic Order Management",
      ],
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 2499,
    limits: {
      products: 75,
      categories: 5,
      productsPerCategory: 15,
      aiGeneratedCategories: 5,
      aiGeneratedProducts: 0,
    },
    features: {
      customDomain: true,
      paymentIntegration: true,
      aiCustomerChatbot: false,
      paymentGateways: ["whatsapp", "cod", "bank_transfer", "jazzcash", "easypaisa", "sadapay"] as const,
      descriptions: [
        "Advanced Store Customization",
        "Order Tracking",
        "Payment Integration",
        "Coupons & Discounts",
        "Basic Analytics",
      ],
    },
  },
  business: {
    id: "business",
    name: "Business",
    price: 4999,
    limits: {
      products: 100,
      categories: 20,
      productsPerCategory: 100,
      aiGeneratedCategories: 20,
      aiGeneratedProducts: 0,
    },
    features: {
      customDomain: true,
      paymentIntegration: true,
      aiCustomerChatbot: true,
      paymentGateways: ["whatsapp", "cod", "bank_transfer", "jazzcash", "easypaisa", "sadapay"] as const,
      descriptions: [
        "Advanced Store Customization",
        "Order Tracking",
        "Payment Integration",
        "AI Customer Chatbot",
        "Advanced Analytics",
        "Priority Support",
      ],
    },
  },
} as const;

export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS;
export type PaidSubscriptionPlan = Exclude<SubscriptionPlanId, "basic">;
export type PaymentGateway = "whatsapp" | "cod" | "bank_transfer" | "jazzcash" | "easypaisa" | "sadapay";
export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  name: string;
  price: number;
  limits: {
    products: number;
    categories: number;
    productsPerCategory: number;
    aiGeneratedCategories: number;
    aiGeneratedProducts: number;
  };
  features: {
    customDomain: boolean;
    paymentIntegration: boolean;
    aiCustomerChatbot: boolean;
    paymentGateways: readonly PaymentGateway[];
    descriptions: readonly string[];
  };
};

export const PAYMENT_GATEWAY_LABELS: Record<PaymentGateway, string> = {
  whatsapp: "WhatsApp Ordering",
  cod: "Cash on Delivery",
  bank_transfer: "Bank Transfer",
  jazzcash: "JazzCash",
  easypaisa: "EasyPaisa",
  sadapay: "SadaPay",
};

export const SUBSCRIPTION_PLAN_PRICES: Record<PaidSubscriptionPlan, number> = {
  pro: SUBSCRIPTION_PLANS.pro.price,
  business: SUBSCRIPTION_PLANS.business.price,
};

const APPROVED_PAYMENT_STATUSES = new Set(["verified", "approved", "active", "paid"]);

export function hasApprovedSubscriptionPayment(status: unknown): boolean {
  return typeof status === "string" && APPROVED_PAYMENT_STATUSES.has(status.toLowerCase());
}

export function normalizeSubscriptionPlan(value: unknown): SubscriptionPlanId {
  if (typeof value !== "string") return "basic";
  const plan = value.trim().toLowerCase();
  if (plan === "free" || plan === "basic") return "basic";
  if (plan === "pro") return "pro";
  if (plan === "business" || plan === "advanced" || plan === "advance") return "business";
  return "basic";
}

export function getSubscriptionPlan(value: unknown): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[normalizeSubscriptionPlan(value)];
}

export function getActiveSubscriptionPlan(planValue: unknown, paymentStatus: unknown): SubscriptionPlan {
  const requestedPlan = normalizeSubscriptionPlan(planValue);
  if (requestedPlan !== "basic" && !hasApprovedSubscriptionPayment(paymentStatus)) {
    return SUBSCRIPTION_PLANS.basic;
  }
  return SUBSCRIPTION_PLANS[requestedPlan];
}

export function getSubscriptionPlanFeatures(planValue: unknown): string[] {
  const plan = getSubscriptionPlan(planValue);
  const features = [
    `Up to ${plan.limits.products} Products`,
    plan.limits.categories === 0
      ? "Products can be listed without categories"
      : `Up to ${plan.limits.categories} Categories`,
  ];
  if (plan.limits.categories > 0) {
    features.push(`Up to ${plan.limits.productsPerCategory} Products per Category`);
  }
  if (plan.features.customDomain) features.push("Custom Domain");
  const gateways = plan.features.paymentGateways.map((gateway) => PAYMENT_GATEWAY_LABELS[gateway]);
  return [...features, ...plan.features.descriptions, `Payment options: ${gateways.join(", ")}`];
}

export function getSubscriptionPlanSummary(): string {
  return Object.values(SUBSCRIPTION_PLANS)
    .map((plan) => {
      const price = plan.price === 0 ? "Free" : `PKR ${plan.price.toLocaleString()} / month`;
      return `• ${plan.name} (${price}): ${getSubscriptionPlanFeatures(plan.id).join(", ")}.`;
    })
    .join("\n");
}
