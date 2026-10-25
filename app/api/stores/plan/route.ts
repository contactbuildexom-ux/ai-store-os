import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canAccessStore } from "@/lib/merchant-api-auth";
import { storeRepo } from "@/lib/store-repository";
import { updateStoreByIdOrSlug } from "@/lib/store-id-slug";
import type { SubscriptionPlanId } from "@/lib/subscription-plans";

const VALID_PLANS: readonly SubscriptionPlanId[] = ["basic", "pro", "business"];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const storeId = typeof body?.store_id === "string" ? body.store_id.trim() : "";
    const requestedPlan = typeof body?.plan === "string" ? body.plan.toLowerCase().trim() : "";
    const paymentMethod = typeof body?.payment_method === "string" ? body.payment_method.trim() : "card";
    const transactionRef = typeof body?.transaction_ref === "string" ? body.transaction_ref.trim() : "";

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required." }, { status: 400 });
    }

    if (!VALID_PLANS.includes(requestedPlan as SubscriptionPlanId)) {
      return NextResponse.json(
        { error: "Choose a supported subscription plan." },
        { status: 400 }
      );
    }

    const hasAccess = await canAccessStore(storeId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You are not authorized to upgrade this store." },
        { status: 403 }
      );
    }

    const plan = requestedPlan as SubscriptionPlanId;
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Live subscription pricing is unavailable." }, { status: 503 });
    }
    const { data: pricingPlan, error: pricingError } = await admin
      .from("pricing_plans")
      .select("plan_key, price")
      .eq("plan_key", plan)
      .eq("is_active", true)
      .maybeSingle();
    if (pricingError) {
      return NextResponse.json({ error: "Unable to verify the current subscription price." }, { status: 500 });
    }
    if (!pricingPlan || Number(pricingPlan.price) !== 0) {
      return NextResponse.json({ error: "Only a currently free plan can be activated without payment." }, { status: 409 });
    }
    let updatedInDb = false;

    // 1. Update in Supabase if configured
    const isSupabaseValid =
      admin &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project") &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project");

    if (isSupabaseValid && admin) {
      try {
        const { error: storeError } = await updateStoreByIdOrSlug(admin, storeId, {
          plan,
          payment_status: "active",
        });







        if (!storeError) {
          updatedInDb = true;
        } else {
          console.warn("Supabase plan update failed, falling back to local repository:", storeError);
        }
      } catch (dbErr) {
        console.warn("Supabase exception on plan update:", dbErr);
      }
    }

    // 2. Update in storeRepo (in-memory + local storage cache)
    const repoStore = await storeRepo.getStore(storeId);
    if (repoStore) {
      repoStore.plan = plan as any;
      repoStore.payment_status = "active";
      // Persist local store cache if available
      try {
        await (storeRepo as any).persistLocalCache?.();
      } catch {
        // Cache persist optional
      }
    }

    return NextResponse.json({
      success: true,
      plan,
      payment_method: paymentMethod,
      transaction_ref: transactionRef || undefined,
      message: `Your store subscription has been updated to the ${plan.toUpperCase()} plan! All features are now active.`,
    });
  } catch (error) {
    console.error("POST /api/stores/plan failed:", error);
    const message = error instanceof Error ? error.message : "Failed to update store plan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
