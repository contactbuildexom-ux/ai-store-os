import "server-only";

export const SUBSCRIPTION_PAYMENT_ACCOUNT_DEFAULTS = {
  jazzcashTitle: process.env.SUBSCRIPTION_JAZZCASH_TITLE?.trim() || "Buildexom Official",
  jazzcashNumber: process.env.SUBSCRIPTION_JAZZCASH_NUMBER?.trim() || "03374257290",
  easypaisaTitle: process.env.SUBSCRIPTION_EASYPAISA_TITLE?.trim() || "Buildexom Official",
  easypaisaNumber: process.env.SUBSCRIPTION_EASYPAISA_NUMBER?.trim() || "03374257290",
  sadapayTitle: process.env.SUBSCRIPTION_SADAPAY_TITLE?.trim() || "Buildexom Official",
  sadapayNumber: process.env.SUBSCRIPTION_SADAPAY_NUMBER?.trim() || "03374257290",
};
