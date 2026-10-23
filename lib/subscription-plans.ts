export const SUBSCRIPTION_PLAN_PRICES = {
  pro: 2499,
  business: 4999,
} as const;

export type PaidSubscriptionPlan = keyof typeof SUBSCRIPTION_PLAN_PRICES;

const APPROVED_PAYMENT_STATUSES = new Set(["verified", "approved", "active", "paid"]);

export function hasApprovedSubscriptionPayment(status: unknown): boolean {
  return typeof status === "string" && APPROVED_PAYMENT_STATUSES.has(status.toLowerCase());
}
