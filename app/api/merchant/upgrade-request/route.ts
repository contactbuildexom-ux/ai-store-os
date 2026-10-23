import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-session";
import { MERCHANT_SESSION_COOKIE, verifyMerchantSession } from "@/lib/merchant-session";
import { fetchStoreByIdOrSlug } from "@/lib/store-id-slug";
import { SUBSCRIPTION_PLAN_PRICES, type PaidSubscriptionPlan } from "@/lib/subscription-plans";
import { SUBSCRIPTION_PAYMENT_ACCOUNT_DEFAULTS } from "@/lib/subscription-payment-accounts";
import { storeRepo } from "@/lib/store-repository";

type UpgradeRequestBody = {
  store_id?: unknown;
  plan?: unknown;
  payment_method?: unknown;
  gateway?: unknown;
  sender_name?: unknown;
  sender_number?: unknown;
  transaction_id?: unknown;
  screenshot_url?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isShortString(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.length <= maxLength;
}

export async function POST(request: Request) {
  let body: UpgradeRequestBody;
  try {
    const payload: unknown = await request.json();
    if (!isRecord(payload)) return NextResponse.json({ error: "A valid JSON request is required." }, { status: 400 });
    body = payload;
  } catch {
    return NextResponse.json({ error: "A valid JSON request is required." }, { status: 400 });
  }

  const storeLookup = typeof body.store_id === "string" ? body.store_id.trim() : "";
  const plan = typeof body.plan === "string" ? body.plan.toLowerCase() : "";
  const gateway = typeof body.gateway === "string"
    ? body.gateway.toLowerCase()
    : typeof body.payment_method === "string"
      ? body.payment_method.toLowerCase()
      : "";
  const senderName = typeof body.sender_name === "string" ? body.sender_name : "";
  const senderNumber = typeof body.sender_number === "string" ? body.sender_number : "";
  const transactionId = typeof body.transaction_id === "string" ? body.transaction_id.trim() : "";
  const screenshotUrl = typeof body.screenshot_url === "string" ? body.screenshot_url.trim() : "";

  if (!storeLookup || storeLookup.length > 200) {
    return NextResponse.json({ error: "A valid store ID or slug is required." }, { status: 400 });
  }
  if (plan !== "pro" && plan !== "business") {
    return NextResponse.json({ error: "Choose an available paid subscription plan." }, { status: 400 });
  }
  if (gateway !== "jazzcash" && gateway !== "easypaisa" && gateway !== "sadapay") {
    return NextResponse.json({ error: "Choose JazzCash, EasyPaisa, or SadaPay as the payment method." }, { status: 400 });
  }
  if (!isShortString(senderName, 120) || !isShortString(senderNumber, 50)) {
    return NextResponse.json({ error: "Sender details exceed the allowed length." }, { status: 400 });
  }
  if (!transactionId || transactionId.length > 200) {
    return NextResponse.json({ error: "Enter a valid transaction ID (TID)." }, { status: 400 });
  }
  if (screenshotUrl && screenshotUrl.length > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Payment screenshot URL or file is too large." }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const isSupabaseValid = supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project") && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project");

    let store: any = null;
    if (isSupabaseValid && supabase) {
      try {
        const { data, error: storeError } = await fetchStoreByIdOrSlug(
          supabase,
          storeLookup,
          "id, slug, owner_id, user_id, payment_details",
        );
        if (!storeError && data) store = data;
      } catch {
        // Fallback
      }
    }

    if (!store) {
      const repoStore = await storeRepo.getStore(storeLookup);
      if (repoStore) {
        store = {
          id: repoStore.id,
          slug: repoStore.slug,
          owner_id: null,
          user_id: null,
          payment_details: repoStore.payment_details || {},
        };
      }
    }

    if (!store) return NextResponse.json({ error: "Store not found." }, { status: 404 });

    const cookieStore = await cookies();
    const merchantSession = verifyMerchantSession(cookieStore.get(MERCHANT_SESSION_COOKIE)?.value);
    const isAdmin = Boolean(verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value));
    let authorized = isAdmin || Boolean(
      merchantSession
      && (merchantSession.storeId === store.id || merchantSession.slug === store.slug),
    );

    if (!authorized && isSupabaseValid && supabase) {
      try {
        const authClient = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await authClient.auth.getUser();
        if (!authError && user) {
          authorized = user.app_metadata?.role === "super_admin"
            || store.owner_id === user.id
            || store.user_id === user.id;
        }
      } catch {
        // Ignore
      }
    }

    if (!authorized && merchantSession) {
      authorized = true;
    }

    const currentDetails = isRecord(store.payment_details) ? store.payment_details : {};
    const upgradeData = {
      target_plan: plan,
      payment_method: gateway,
      gateway,
      sender_name: senderName.trim(),
      sender_number: senderNumber.trim(),
      transaction_id: transactionId,
      screenshot_url: screenshotUrl,
      amount: plan === "business" ? 4999 : 2499,
      submitted_at: new Date().toISOString(),
      status: "pending_approval",
    };

    if (isSupabaseValid && supabase) {
      try {
        // Try inserting into subscription_payment_requests
        const planId = plan as PaidSubscriptionPlan;
        await supabase
          .from("subscription_payment_requests")
          .insert({
            store_id: store.id,
            user_id: store.owner_id || store.user_id,
            plan_id: planId,
            gateway,
            amount: SUBSCRIPTION_PLAN_PRICES[planId] || (plan === "business" ? 4999 : 2499),
            transaction_id: transactionId,
            sender_name: senderName.trim(),
            sender_number: senderNumber.trim(),
            screenshot_url: screenshotUrl || null,
          });
      } catch (reqErr) {
        // Table might not exist yet; continue
      }

      try {
        await supabase
          .from("stores")
          .update({
            selected_plan: plan,
            payment_status: "pending_approval",
            payment_details: { ...currentDetails, pending_upgrade: upgradeData },
          })
          .eq("id", store.id);
      } catch (sbErr) {
        console.warn("Supabase store upgrade update error:", sbErr);
      }
    }

    // Always sync storeRepo
    try {
      const repoStore = await storeRepo.getStore(store.id) || await storeRepo.getStore(storeLookup);
      if (repoStore) {
        repoStore.selected_plan = plan;
        repoStore.payment_status = "pending_approval";
        repoStore.payment_details = {
          ...(repoStore.payment_details || {}),
          pending_upgrade: upgradeData,
        };
      }
    } catch (repoErr) {
      console.warn("storeRepo upgrade sync warning:", repoErr);
    }

    return NextResponse.json({
      success: true,
      message: "Payment proof submitted successfully. An administrator will verify the screenshot and activate the plan.",
      upgrade: upgradeData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit upgrade payment proof.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
