import type { SubscriptionPlanId, PaymentGateway } from "@/lib/subscription-plans";

export type PublicPricingPlan = {
  id: string;
  name: string;
  price: number | string;
  billing_cycle: string;
  features: string[];
  plan_key: SubscriptionPlanId | null;
  limits: {
    products: number;
    categories: number;
    productsPerCategory: number;
  } | null;
  entitlements: {
    customDomain: boolean;
    paymentIntegration: boolean;
    aiCustomerChatbot: boolean;
    paymentGateways: PaymentGateway[];
  } | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isPublicPricingPlan(value: unknown): value is PublicPricingPlan {
  if (!isRecord(value)) return false;
  const price = typeof value.price === "number" ? value.price : Number(value.price);
  const planKey = value.plan_key;
  const validPlanKey = planKey === null || planKey === "basic" || planKey === "pro" || planKey === "business";
  const validLimits = value.limits === null || (
    isRecord(value.limits)
    && Number.isInteger(value.limits.products)
    && Number.isInteger(value.limits.categories)
    && Number.isInteger(value.limits.productsPerCategory)
  );
  const validEntitlements = value.entitlements === null || (
    isRecord(value.entitlements)
    && typeof value.entitlements.customDomain === "boolean"
    && typeof value.entitlements.paymentIntegration === "boolean"
    && typeof value.entitlements.aiCustomerChatbot === "boolean"
    && Array.isArray(value.entitlements.paymentGateways)
    && value.entitlements.paymentGateways.every((gateway) => typeof gateway === "string")
  );

  return typeof value.id === "string"
    && value.id.length > 0
    && typeof value.name === "string"
    && value.name.trim().length > 0
    && (typeof value.price === "number" || (typeof value.price === "string" && value.price.trim().length > 0))
    && Number.isFinite(price)
    && price >= 0
    && typeof value.billing_cycle === "string"
    && value.billing_cycle.trim().length > 0
    && Array.isArray(value.features)
    && value.features.every((feature) => typeof feature === "string" && feature.trim().length > 0)
    && validPlanKey
    && validLimits
    && validEntitlements;
}

export function formatPricingPlanPrice(price: number | string, billingCycle: string): string {
  const amount = Number(price);
  if (amount === 0) return "Free";
  return `PKR ${amount.toLocaleString("en-PK", { maximumFractionDigits: 2 })} / ${billingCycle}`;
}
