import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-session";
import { MERCHANT_SESSION_COOKIE, verifyMerchantSession } from "@/lib/merchant-session";
import { fetchStoreByIdOrSlug } from "@/lib/store-id-slug";
import { SUBSCRIPTION_PLAN_PRICES, type PaidSubscriptionPlan } from "@/lib/subscription-plans";
import { SUBSCRIPTION_PAYMENT_ACCOUNT_DEFAULTS } from "@/lib/subscription-payment-accounts";

type UpgradeRequestBody = {
  store_id?: unknown;
  plan?: unknown;
  payment_method?: unknown;
  sender_name?: unknown;
  sender_number?: unknown;
  transaction_id?: unknown;
  screenshot_url?: unknown;
};

type AuthorizedStore = {
  id: string;
  slug: string;
  owner_id: string | null;
  user_id: string | null;
  owner_email: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isShortString(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.length <= maxLength;
}

async function getAuthorizedStore(storeLookup: string, supabase: NonNullable<ReturnType<typeof createAdminClient>>) {
  const { data: store, error } = await fetchStoreByIdOrSlug<AuthorizedStore>(
    supabase,
    storeLookup,
    "id, slug, owner_id, user_id, owner_email",
  );
  if (error) throw error;
  if (!store) return { response: NextResponse.json({ error: "Store not found." }, { status: 404 }) };

  const cookieStore = await cookies();
  const merchantSession = verifyMerchantSession(cookieStore.get(MERCHANT_SESSION_COOKIE)?.value);
  const isAdmin = Boolean(verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value));
  let authorized = isAdmin || Boolean(
    merchantSession
    && (merchantSession.storeId === store.id || merchantSession.slug === store.slug),
  );

  if (!authorized && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const authClient = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (!authError && user) {
      authorized = user.app_metadata?.role === "super_admin"
        || store.owner_id === user.id
        || store.user_id === user.id;
    }
  }

  if (!authorized) {
    return { response: NextResponse.json({ error: "You are not authorized to access this store." }, { status: 403 }) };
  }

  return { store };
}

export async function GET(request: Request) {
  try {
    const storeLookup = new URL(request.url).searchParams.get("store_id")?.trim() ?? "";
    if (!storeLookup || storeLookup.length > 200) {
      return NextResponse.json({ error: "A valid store ID or slug is required." }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) return NextResponse.json({ error: "Payment verification is not configured." }, { status: 503 });
    const result = await getAuthorizedStore(storeLookup, supabase);
    if ("response" in result) return result.response;

    const [settingsResult, requestResult] = await Promise.all([
      supabase.from("platform_settings").select("branding").eq("id", "platform").maybeSingle(),
      supabase
        .from("subscription_payment_requests")
        .select("id, plan_id, status, created_at")
        .eq("store_id", result.store.id)
        .eq("status", "pending")
        .maybeSingle(),
    ]);
    if (settingsResult.error) throw settingsResult.error;
    if (requestResult.error) throw requestResult.error;

    const branding = isRecord(settingsResult.data?.branding) ? settingsResult.data.branding : {};
    const pending = requestResult.data;
    return NextResponse.json({
      payment_accounts: {
        easypaisa: {
          title: typeof branding.easypaisaTitle === "string" ? branding.easypaisaTitle : "",
          number: typeof branding.easypaisaNumber === "string" ? branding.easypaisaNumber : "",
        },
        jazzcash: {
          title: SUBSCRIPTION_PAYMENT_ACCOUNT_DEFAULTS.jazzcashTitle
            || (typeof branding.jazzcashTitle === "string" ? branding.jazzcashTitle : ""),
          number: SUBSCRIPTION_PAYMENT_ACCOUNT_DEFAULTS.jazzcashNumber
            || (typeof branding.jazzcashNumber === "string" ? branding.jazzcashNumber : ""),
        },
        sadapay: {
          title: SUBSCRIPTION_PAYMENT_ACCOUNT_DEFAULTS.sadapayTitle
            || (typeof branding.sadapayTitle === "string" ? branding.sadapayTitle : ""),
          number: SUBSCRIPTION_PAYMENT_ACCOUNT_DEFAULTS.sadapayNumber
            || (typeof branding.sadapayNumber === "string" ? branding.sadapayNumber : ""),
        },
      },
      pending_upgrade: pending ? {
        plan: pending.plan_id,
        submitted_at: pending.created_at,
      } : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load payment instructions.";
    return NextResponse.json({ error: message }, { status: 500 });
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
  const gateway = body.payment_method;
  const senderName = body.sender_name ?? "";
  const senderNumber = body.sender_number ?? "";
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
  if (screenshotUrl.length > 2048) {
    return NextResponse.json({ error: "Payment screenshot URL is too long." }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    if (!supabase) return NextResponse.json({ error: "Payment verification is not configured." }, { status: 503 });

    const result = await getAuthorizedStore(storeLookup, supabase);
    if ("response" in result) return result.response;

    let verifiedScreenshotUrl: string | null = null;
    if (screenshotUrl) {
      let proofUrl: URL;
      try {
        proofUrl = new URL(screenshotUrl);
      } catch {
        return NextResponse.json({ error: "Payment screenshot URL is invalid." }, { status: 400 });
      }
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) return NextResponse.json({ error: "Payment screenshot storage is not configured." }, { status: 503 });
      const allowedOrigin = new URL(supabaseUrl).origin;
      const allowedPathPrefix = `/storage/v1/object/public/product-images/${encodeURIComponent(result.store.id)}/`;
      if (proofUrl.origin !== allowedOrigin || !proofUrl.pathname.startsWith(allowedPathPrefix)) {
        return NextResponse.json({ error: "Upload the payment screenshot to this store before submitting it." }, { status: 400 });
      }
      let proofName: string;
      try {
        proofName = decodeURIComponent(proofUrl.pathname.slice(allowedPathPrefix.length));
      } catch {
        return NextResponse.json({ error: "Payment screenshot URL is invalid." }, { status: 400 });
      }
      if (!proofName || proofName.includes("/") || proofName.includes("\\") || proofName === "." || proofName === "..") {
        return NextResponse.json({ error: "Payment screenshot URL is invalid." }, { status: 400 });
      }
      const { data: proofFiles, error: proofLookupError } = await supabase.storage
        .from("product-images")
        .list(result.store.id, { limit: 1000, search: proofName });
      if (proofLookupError) throw proofLookupError;
      if (!proofFiles?.some((file) => file.id !== null && file.name === proofName)) {
        return NextResponse.json({ error: "The uploaded payment screenshot could not be found. Please upload it again." }, { status: 400 });
      }
      verifiedScreenshotUrl = proofUrl.toString();
    }

    const { data: platformSettings, error: platformSettingsError } = await supabase
      .from("platform_settings")
      .select("branding")
      .eq("id", "platform")
      .maybeSingle();
    if (platformSettingsError) throw platformSettingsError;
    const branding = isRecord(platformSettings?.branding) ? platformSettings.branding : {};
    const paymentAccountNumber = gateway === "easypaisa"
      ? branding.easypaisaNumber
      : gateway === "sadapay"
        ? (SUBSCRIPTION_PAYMENT_ACCOUNT_DEFAULTS.sadapayNumber
          || (typeof branding.sadapayNumber === "string" ? branding.sadapayNumber : ""))
        : (SUBSCRIPTION_PAYMENT_ACCOUNT_DEFAULTS.jazzcashNumber
          || (typeof branding.jazzcashNumber === "string" ? branding.jazzcashNumber : ""));
    if (typeof paymentAccountNumber !== "string" || !paymentAccountNumber.trim()) {
      return NextResponse.json({ error: "This payment account is not configured. Contact the Super Admin before sending payment." }, { status: 503 });
    }

    const planId = plan as PaidSubscriptionPlan;
    const { data, error } = await supabase
      .from("subscription_payment_requests")
      .insert({
        store_id: result.store.id,
        user_id: result.store.owner_id || result.store.user_id,
        plan_id: planId,
        gateway,
        amount: SUBSCRIPTION_PLAN_PRICES[planId],
        transaction_id: transactionId,
        sender_name: senderName.trim(),
        sender_number: senderNumber.trim(),
        screenshot_url: verifiedScreenshotUrl,
      })
      .select("id, plan_id, gateway, amount, transaction_id, status, created_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "A payment request already exists for this store, or this transaction ID has already been submitted." }, { status: 409 });
      }
      if (error.code === "42P01" || error.code === "PGRST205") {
        return NextResponse.json({ error: "Apply migration 18_manual_subscription_payments.sql before accepting upgrade payments." }, { status: 503 });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Payment submitted for Super Admin approval. Your paid features will unlock as soon as it is approved.",
      payment_request: data,
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit upgrade payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
