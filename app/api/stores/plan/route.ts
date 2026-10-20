import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canAccessStore } from "@/lib/merchant-api-auth";
import { storeRepo } from "@/lib/store-repository";
import { updateStoreByIdOrSlug } from "@/lib/store-id-slug";

const VALID_PLANS = ["basic", "pro", "business"] as const;
type PlanType = (typeof VALID_PLANS)[number];

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

    if (!VALID_PLANS.includes(requestedPlan as PlanType)) {
      return NextResponse.json(
        { error: "Invalid plan. Choose 'basic', 'pro', or 'business'." },
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

    const plan = requestedPlan as PlanType;
    let updatedInDb = false;

    // 1. Update in Supabase if configured
    const admin = createAdminClient();
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
