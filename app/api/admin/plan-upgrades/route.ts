import { storeRepo } from "@/lib/store-repository";
import { NextResponse } from "next/server";
import { isAdminRequest, getAdminRequestActor } from "@/lib/admin-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Payment database is not configured." }, { status: 503 });

  const { data: requests, error } = await supabase
    .from("subscription_payment_requests")
    .select("id, store_id, user_id, plan_id, gateway, amount, transaction_id, status, sender_name, sender_number, screenshot_url, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) {
    const migrationMissing = error.code === "42P01" || error.code === "PGRST205";
    return NextResponse.json({
      error: migrationMissing
        ? "Apply migration 18_manual_subscription_payments.sql to enable subscription payment approvals."
        : "Unable to load pending subscription payments.",
    }, { status: migrationMissing ? 503 : 500 });
  }

  const storeIds = [...new Set((requests ?? []).map((payment) => payment.store_id))];
  const { data: stores, error: storeError } = storeIds.length
    ? await supabase.from("stores").select("id, name, slug, plan, owner_email").in("id", storeIds)
    : { data: [], error: null };
  if (storeError) return NextResponse.json({ error: "Unable to load payment request owners." }, { status: 500 });
  const storeById = new Map((stores ?? []).map((store) => [store.id, store]));

  return NextResponse.json({
    success: true,
    pending_upgrades: (requests ?? []).flatMap((payment) => {
      const store = storeById.get(payment.store_id);
      if (!store) return [];
      return [{
        request_id: payment.id,
        store_id: payment.store_id,
        store_name: String(store.name ?? ""),
        store_slug: String(store.slug ?? ""),
        user_email: String(store.owner_email ?? ""),
        current_plan: String(store.plan ?? "basic"),
        requested_plan: payment.plan_id,
        payment_method: payment.gateway,
        sender_name: payment.sender_name ?? "",
        sender_number: payment.sender_number ?? "",
        transaction_id: payment.transaction_id,
        screenshot_url: payment.screenshot_url ?? "",
        amount: Number(payment.amount),
        submitted_at: payment.created_at,
      }];
    }),
  });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Payment database is not configured." }, { status: 503 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "A valid payment review action is required." }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  const requestId = typeof input.request_id === "string" ? input.request_id : "";
  const action = input.action;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    return NextResponse.json({ error: "A valid payment request ID is required." }, { status: 400 });
  }
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Choose approve or reject." }, { status: 400 });
  }

  try {
    const adminEmail = await getAdminRequestActor();
    let approvedPlan = "pro";

    // First attempt Supabase RPC
    const { data, error } = await supabase.rpc("review_subscription_payment_request", {
      p_request_id: requestId,
      p_action: action,
      p_admin_email: adminEmail,
    });

    if (!error && data) {
      const reviewed = Array.isArray(data) ? data[0] : data;
      approvedPlan = String(reviewed.plan_id || "pro");
    } else {
      // Fallback: lookup request in subscription_payment_requests or stores
      const { data: reqData } = await supabase
        .from("subscription_payment_requests")
        .select("store_id, plan_id")
        .eq("id", requestId)
        .maybeSingle();

      const targetStoreId = reqData?.store_id || requestId;
      approvedPlan = reqData?.plan_id || "pro";

      if (action === "approve") {
        await supabase
          .from("stores")
          .update({
            plan: approvedPlan,
            selected_plan: approvedPlan,
            payment_status: "active",
          })
          .or(`id.eq.${targetStoreId},slug.eq.${targetStoreId}`);

        const repoStore = await storeRepo.getStore(targetStoreId);
        if (repoStore) {
          repoStore.plan = approvedPlan as any;
          repoStore.selected_plan = approvedPlan;
          repoStore.payment_status = "active";
          await storeRepo.saveStore(repoStore as any);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: action === "approve"
        ? `Payment approved. Store upgraded to ${approvedPlan.toUpperCase()}.`
        : "Payment request rejected.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process payment review.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
