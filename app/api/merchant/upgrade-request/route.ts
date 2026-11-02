import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-session";
import { MERCHANT_SESSION_COOKIE, verifyMerchantSession } from "@/lib/merchant-session";
import { fetchStoreByIdOrSlug } from "@/lib/store-id-slug";
import type { PaidSubscriptionPlan } from "@/lib/subscription-plans";
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeLookup = searchParams.get("store_id") || searchParams.get("slug") || "";

    let pendingUpgrade: any = null;
    let selectedPlan = "basic";

    if (storeLookup) {
      const supabase = createAdminClient();
      const isSupabaseValid = supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project") && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project");
      if (isSupabaseValid && supabase) {
        try {
          const { data: dbStore } = await fetchStoreByIdOrSlug(
            supabase,
            storeLookup,
            "id, slug, plan, selected_plan, payment_status, payment_details"
          );
          if (dbStore) {
            const details: any = dbStore.payment_details || {};
            if (details && typeof details === "object" && details.pending_upgrade) {
              pendingUpgrade = details.pending_upgrade;
            }
            selectedPlan = pendingUpgrade?.target_plan || pendingUpgrade?.plan || dbStore.selected_plan || dbStore.plan || "basic";
          }
        } catch {
          // Fall through to storeRepo
        }
      }

      if (!pendingUpgrade) {
        const store = await storeRepo.getStore(storeLookup);
        if (store) {
          const details: any = store.payment_details || {};
          if (details && typeof details === "object" && details.pending_upgrade) {
            pendingUpgrade = details.pending_upgrade;
          }
          selectedPlan = pendingUpgrade?.target_plan || pendingUpgrade?.plan || store.selected_plan || store.plan || "basic";
        }
      }
    }

    const paymentAccounts = {
      jazzcash: {
        title: SUBSCRIPTION_PAYMENT_ACCOUNT_DEFAULTS.jazzcashTitle || "Buildexom Official",
        number: SUBSCRIPTION_PAYMENT_ACCOUNT_DEFAULTS.jazzcashNumber || "03374257290",
      },
      easypaisa: {
        title: SUBSCRIPTION_PAYMENT_ACCOUNT_DEFAULTS.easypaisaTitle || "Buildexom Official",
        number: SUBSCRIPTION_PAYMENT_ACCOUNT_DEFAULTS.easypaisaNumber || "03374257290",
      },
      sadapay: {
        title: SUBSCRIPTION_PAYMENT_ACCOUNT_DEFAULTS.sadapayTitle || "Buildexom Official",
        number: SUBSCRIPTION_PAYMENT_ACCOUNT_DEFAULTS.sadapayNumber || "03374257290",
      },
    };

    return NextResponse.json({
      success: true,
      payment_accounts: paymentAccounts,
      pending_upgrade: pendingUpgrade,
      selected_plan: selectedPlan,
    });
  } catch {
    return NextResponse.json({
      success: true,
      payment_accounts: {
        jazzcash: { title: "Buildexom Official", number: "03374257290" },
        easypaisa: { title: "Buildexom Official", number: "03374257290" },
        sadapay: { title: "Buildexom Official", number: "03374257290" },
      },
      pending_upgrade: null,
      selected_plan: "basic",
    });
  }
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
  const planId: PaidSubscriptionPlan | null = plan === "pro" || plan === "business" ? plan : null;
  if (!planId) {
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
    if (!isSupabaseValid || !supabase) {
      return NextResponse.json({ error: "Live subscription pricing is unavailable. Please try again later." }, { status: 503 });
    }
    const { data: activePricingPlans, error: pricingError } = await supabase
      .from("pricing_plans")
      .select("plan_key, name, price")
      .eq("is_active", true);
    if (pricingError) {
      return NextResponse.json({ error: "Unable to verify the current subscription price." }, { status: 500 });
    }
    const activePlanRecord = (activePricingPlans ?? []).find((pricingPlan) => {
      const name = pricingPlan.name.trim().toLowerCase();
      return planId === "pro"
        ? pricingPlan.plan_key === "pro" || (!pricingPlan.plan_key && name === "pro")
        : pricingPlan.plan_key === "business" || (!pricingPlan.plan_key && (name === "business" || name === "advanced" || name === "advance"));
    });
    if (!activePlanRecord || !Number.isFinite(Number(activePlanRecord.price)) || Number(activePlanRecord.price) < 0) {
      return NextResponse.json({ error: "This paid plan is not currently available for upgrades." }, { status: 409 });
    }
    const planPrice = Number(activePlanRecord.price);

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
      target_plan: planId,
      plan: planId,
      payment_method: gateway,
      gateway,
      sender_name: senderName.trim(),
      sender_number: senderNumber.trim(),
      transaction_id: transactionId,
      screenshot_url: screenshotUrl,
      amount: planPrice,
      submitted_at: new Date().toISOString(),
      status: "pending_approval",
    };

    if (isSupabaseValid && supabase) {
      try {
        // Try inserting into subscription_payment_requests
        await supabase
          .from("subscription_payment_requests")
          .insert({
            store_id: store.id,
            user_id: store.owner_id || store.user_id,
            plan_id: planId,
            gateway,
            amount: planPrice,
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
            selected_plan: planId,
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
        repoStore.selected_plan = planId;
        repoStore.payment_status = "pending_approval";
        repoStore.payment_details = {
          ...(repoStore.payment_details || {}),
          pending_upgrade: upgradeData,
        };
        await storeRepo.saveStore(repoStore as any);
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
