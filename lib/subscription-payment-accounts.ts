import "server-only";

export const SUBSCRIPTION_PAYMENT_ACCOUNT_DEFAULTS = {
  jazzcashTitle: process.env.SUBSCRIPTION_JAZZCASH_TITLE?.trim() ?? "",
  jazzcashNumber: process.env.SUBSCRIPTION_JAZZCASH_NUMBER?.trim() ?? "",
  sadapayTitle: process.env.SUBSCRIPTION_SADAPAY_TITLE?.trim() ?? "",
  sadapayNumber: process.env.SUBSCRIPTION_SADAPAY_NUMBER?.trim() ?? "",
};
