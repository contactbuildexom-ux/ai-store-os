import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-session";
import { MERCHANT_SESSION_COOKIE, verifyMerchantSession } from "@/lib/merchant-session";
import { fetchStoreByIdOrSlug } from "@/lib/store-id-slug";

type UpgradeRequestBody = {
  store_id?: unknown;
  plan?: unknown;
  payment_method?: unknown;
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
  const paymentMethod = body.payment_method;
  const senderName = body.sender_name ?? "";
  const senderNumber = body.sender_number ?? "";
  const transactionId = body.transaction_id ?? "";
  const screenshotUrl = typeof body.screenshot_url === "string" ? body.screenshot_url : "";

  if (!storeLookup || storeLookup.length > 200) {
    return NextResponse.json({ error: "A valid store ID or slug is required." }, { status: 400 });
  }
  if (plan !== "pro" && plan !== "business") {
    return NextResponse.json({ error: "Choose an available paid subscription plan." }, { status: 400 });
  }
  if (paymentMethod !== "jazzcash" && paymentMethod !== "easypaisa") {
    return NextResponse.json({ error: "Choose JazzCash or EasyPaisa as the payment method." }, { status: 400 });
  }
  if (!isShortString(senderName, 120) || !isShortString(senderNumber, 50) || !isShortString(transactionId, 200)) {
    return NextResponse.json({ error: "Sender and transaction details exceed the allowed length." }, { status: 400 });
  }
  if (!screenshotUrl || screenshotUrl.length > 2048) {
    return NextResponse.json({ error: "A payment screenshot is required for verification." }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    if (!supabase) return NextResponse.json({ error: "Payment verification is not configured." }, { status: 503 });

    const { data: store, error: storeError } = await fetchStoreByIdOrSlug(
      supabase,
      storeLookup,
      "id, slug, owner_id, user_id, payment_details",
    );
    if (storeError) throw storeError;
    if (!store) return NextResponse.json({ error: "Store not found." }, { status: 404 });

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
      return NextResponse.json({ error: "You are not authorized to submit an upgrade request for this store." }, { status: 403 });
    }

    let proofUrl: URL;
    try {
      proofUrl = new URL(screenshotUrl);
    } catch {
      return NextResponse.json({ error: "Payment screenshot URL is invalid." }, { status: 400 });
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return NextResponse.json({ error: "Payment screenshot storage is not configured." }, { status: 503 });
    const allowedOrigin = new URL(supabaseUrl).origin;
    const allowedPathPrefix = `/storage/v1/object/public/product-images/${encodeURIComponent(store.id)}/`;
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
      .list(store.id, { limit: 1000, search: proofName });
    if (proofLookupError) throw proofLookupError;
    if (!proofFiles?.some((file) => file.id !== null && file.name === proofName)) {
      return NextResponse.json({ error: "The uploaded payment screenshot could not be found. Please upload it again." }, { status: 400 });
    }

    const currentDetails = isRecord(store.payment_details) ? store.payment_details : {};
    const upgradeData = {
      target_plan: plan,
      payment_method: paymentMethod,
      sender_name: senderName.trim(),
      sender_number: senderNumber.trim(),
      transaction_id: transactionId.trim(),
      screenshot_url: proofUrl.toString(),
      amount: plan === "business" ? 4999 : 2499,
      submitted_at: new Date().toISOString(),
      status: "pending_approval",
    };
    const { data: updatedStore, error: updateError } = await supabase
      .from("stores")
      .update({
        payment_status: "pending_approval",
        payment_details: { ...currentDetails, pending_upgrade: upgradeData },
      })
      .eq("id", store.id)
      .select("id")
      .maybeSingle();
    if (updateError) throw updateError;
    if (!updatedStore) {
      return NextResponse.json({ error: "The upgrade request could not be saved because the store no longer exists." }, { status: 404 });
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
