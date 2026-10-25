import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";

export const dynamic = "force-dynamic";

function resolvePlanKey(name: string): keyof typeof SUBSCRIPTION_PLANS | null {
  switch (name.trim().toLowerCase()) {
    case "free":
    case "basic":
    case "free starter":
      return "basic";
    case "pro":
      return "pro";
    case "business":
    case "advanced":
    case "advance":
      return "business";
    default:
      return null;
  }
}

export async function GET() {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Pricing is not configured." }, { status: 503 });
  const { data, error } = await supabase
    .from("pricing_plans")
    .select("id, plan_key, name, price, billing_cycle, features")
    .eq("is_active", true)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: "Unable to load pricing plans." }, { status: 500 });
  const plans = (data ?? []).map((plan) => {
    const planKey = plan.plan_key === "basic" || plan.plan_key === "pro" || plan.plan_key === "business"
      ? plan.plan_key
      : resolvePlanKey(plan.name);
    const configured = planKey ? SUBSCRIPTION_PLANS[planKey as keyof typeof SUBSCRIPTION_PLANS] : null;
    return {
      ...plan,
      plan_key: planKey,
      limits: configured ? {
        products: configured.limits.products,
        categories: configured.limits.categories,
        productsPerCategory: configured.limits.productsPerCategory,
      } : null,
      entitlements: configured ? {
        customDomain: configured.features.customDomain,
        paymentIntegration: configured.features.paymentIntegration,
        aiCustomerChatbot: configured.features.aiCustomerChatbot,
        paymentGateways: [...configured.features.paymentGateways],
      } : null,
    };
  });
  return NextResponse.json({ plans }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
