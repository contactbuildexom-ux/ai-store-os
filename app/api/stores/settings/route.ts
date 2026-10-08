import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: unknown) {
  const text = textValue(value);
  return text.length ? text : null;
}

function getSupabase() {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Store database is not configured.");
  return supabase;
}

function hasMissingOptionalColumn(errorMessage: string) {
  const message = errorMessage.toLowerCase();
  return message.includes("footer_text") || message.includes("custom_domain") || message.includes("column");
}

function isMissingPaymentSchema(error: unknown) {
  if (!error || typeof error !== "object" || !("message" in error) || typeof error.message !== "string") return false;
  const message = error.message.toLowerCase();
  const code = "code" in error && typeof error.code === "string" ? error.code : "";
  return (message.includes("store_payments") || code === "PGRST205" || code === "PGRST204") && (
    message.includes("does not exist") || message.includes("schema cache") ||
    message.includes("could not find") || message.includes("column") ||
    message.includes("relation") || code === "PGRST205" || code === "PGRST204"
  );
}

function isMissingSettingsSchema(error: unknown) {
  if (!error || typeof error !== "object" || !("message" in error) || typeof error.message !== "string") return false;
  const message = error.message.toLowerCase();
  const code = "code" in error && typeof error.code === "string" ? error.code : "";
  return (message.includes("store_settings") || code === "PGRST205") && (
    message.includes("does not exist") || message.includes("schema cache") ||
    message.includes("could not find") || message.includes("relation") || code === "PGRST205"
  );
}

function isMissingStoreColumn(error: unknown) {
  if (!error || typeof error !== "object" || !("message" in error) || typeof error.message !== "string") return false;
  const message = error.message.toLowerCase();
  return message.includes("column") && message.includes("stores") && (
    message.includes("does not exist") || message.includes("schema cache") || message.includes("could not find")
  );
}

async function savePaymentAccount(supabase: ReturnType<typeof getSupabase>, storeId: string, provider: string, value: unknown) {
  const accountNumber = optionalText(value) ?? "";
  const { data: existing, error: lookupError } = await supabase
    .from("store_payments")
    .select("id")
    .eq("store_id", storeId)
    .eq("provider_name", provider);
  if (lookupError) throw lookupError;

  if (existing?.length) {
    const { error } = await supabase
      .from("store_payments")
      .update({ account_number: accountNumber, is_active: Boolean(accountNumber), updated_at: new Date().toISOString() })
      .eq("store_id", storeId)
      .eq("provider_name", provider);
    if (error) throw error;
  } else if (accountNumber) {
    const { error } = await supabase.from("store_payments").insert([{
      store_id: storeId,
      provider_name: provider,
      account_title: "",
      account_number: accountNumber,
      is_active: true,
    }]);
    if (error) throw error;
  }
}

export async function GET(req: Request) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(req.url);
    const storeId = textValue(searchParams.get("store_id"));

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required." }, { status: 400 });
    }

    const [settingsResult, storeResult, paymentResult] = await Promise.all([
      supabase.from("store_settings").select("*").eq("store_id", storeId).maybeSingle(),
      supabase.from("stores").select("id, name, slug, plan, whatsapp_number").eq("id", storeId).maybeSingle(),
      supabase.from("store_payments").select("provider_name, account_number, is_active").eq("store_id", storeId).eq("is_active", true),
    ]);

    const { data: settings, error: settingsError } = settingsResult;
    let { data: store, error: storeError } = storeResult;
    const { data: paymentMethods, error: paymentError } = paymentResult;

    if (isMissingSettingsSchema(settingsError)) {
      return NextResponse.json({
        error: "Store settings are not initialized in Supabase. Apply migrations 04_store_builder_features.sql and 06_storefront_settings.sql, then retry.",
      }, { status: 503 });
    }
    if (settingsError && settingsError.code !== "PGRST116") throw settingsError;
    if (isMissingStoreColumn(storeError)) {
      const fallback = await supabase.from("stores").select("id, name, slug").eq("id", storeId).maybeSingle();
      store = fallback.data ? { ...fallback.data, plan: "basic", whatsapp_number: null } : null;
      storeError = fallback.error;
    }
    if (storeError) throw storeError;
    if (paymentError && !isMissingPaymentSchema(paymentError)) throw paymentError;

    const accountNumber = (provider: string) => paymentMethods?.find((method) => method.provider_name.toLowerCase().includes(provider) && method.account_number)?.account_number ?? "";

    return NextResponse.json({
      success: true,
      settings: settings ? {
        ...settings,
        whatsapp_number: store?.whatsapp_number ?? settings.whatsapp_number ?? "",
        jazzcash_number: accountNumber("jazz") || settings.jazzcash_number || "",
        easypaisa_number: accountNumber("easy") || settings.easypaisa_number || "",
      } : {
        whatsapp_number: store?.whatsapp_number ?? "",
        jazzcash_number: accountNumber("jazz"),
        easypaisa_number: accountNumber("easy"),
      },
      store,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load store settings.";
    console.error("GET /api/stores/settings failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase();
    const body = await req.json();
    const storeId = textValue(body?.store_id);

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required." }, { status: 400 });
    }

    if (typeof body?.whatsapp_number === "string" && body.whatsapp_number.trim()) {
      const { error: storeError } = await supabase
        .from("stores")
        .update({ whatsapp_number: optionalText(body.whatsapp_number) })
        .eq("id", storeId);
      if (storeError && !isMissingStoreColumn(storeError)) throw storeError;
    }

    const basePayload = {
      store_id: storeId,
      theme_color: optionalText(body?.theme_color) ?? "#1d7555",
      banner_text: optionalText(body?.banner_text) ?? "Welcome to our store!",
      font_style: optionalText(body?.font_style) ?? "inter",
      logo_url: optionalText(body?.logo_url) ?? "",
    };
    const extendedPayload = {
      ...basePayload,
      footer_text: optionalText(body?.footer_text) ?? "",
      custom_domain: optionalText(body?.custom_domain),
      jazzcash_number: optionalText(body?.jazzcash_number) ?? "",
      easypaisa_number: optionalText(body?.easypaisa_number) ?? "",
    };

    let result = await supabase
      .from("store_settings")
      .upsert([extendedPayload], { onConflict: "store_id" })
      .select()
      .single();

    let warning: string | undefined;
    if (result.error && hasMissingOptionalColumn(result.error.message)) {
      result = await supabase
        .from("store_settings")
        .upsert([basePayload], { onConflict: "store_id" })
        .select()
        .single();
      if ("jazzcash_number" in body || "easypaisa_number" in body) {
        warning = "Store appearance was saved, but payment account numbers require the latest storefront settings migration.";
      }
    }

    if (result.error && isMissingSettingsSchema(result.error)) {
      return NextResponse.json({
        error: "Store settings are not initialized in Supabase. Apply migrations 04_store_builder_features.sql and 06_storefront_settings.sql, then retry.",
      }, { status: 503 });
    }
    if (result.error) throw result.error;

    if ("jazzcash_number" in body || "easypaisa_number" in body) {
      try {
        await Promise.all([
          savePaymentAccount(supabase, storeId, "JazzCash", body?.jazzcash_number),
          savePaymentAccount(supabase, storeId, "Easypaisa", body?.easypaisa_number),
        ]);
      } catch (paymentError) {
        if (!isMissingPaymentSchema(paymentError)) throw paymentError;
        warning ??= "Store appearance was saved, but payment accounts need the store_payments database migration.";
      }
    }

    return NextResponse.json({
      success: true,
      settings: {
        ...result.data,
        jazzcash_number: optionalText(body?.jazzcash_number) ?? "",
        easypaisa_number: optionalText(body?.easypaisa_number) ?? "",
      },
      warning,
      message: "Store settings updated successfully.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update store settings.";
    console.error("POST /api/stores/settings failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}