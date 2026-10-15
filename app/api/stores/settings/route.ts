import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canAccessStore } from "@/lib/merchant-api-auth";

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: unknown) {
  const text = textValue(value);
  return text.length ? text : null;
}

const PAYMENT_DETAIL_KEYS = ["bank_name", "account_title", "account_number", "iban", "jazzcash_number", "easypaisa_number"] as const;

function parsePaymentDetails(value: unknown) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  const details: Record<(typeof PAYMENT_DETAIL_KEYS)[number], string> = {
    bank_name: "",
    account_title: "",
    account_number: "",
    iban: "",
    jazzcash_number: "",
    easypaisa_number: "",
  };
  for (const key of PAYMENT_DETAIL_KEYS) {
    const candidate = source[key];
    if (candidate === undefined || candidate === null || candidate === "") continue;
    if (typeof candidate !== "string" || candidate.length > 120) return null;
    details[key] = candidate.trim();
  }
  return details;
}

const SOCIAL_KEYS = ["instagram", "facebook", "youtube", "tiktok", "x"] as const;
const THEME_COLORS: Record<string, string> = {
  emerald: "#1d7555",
  ocean: "#2563eb",
  rose: "#be185d",
  midnight: "#0f172a",
  amber: "#b45309",
  violet: "#6d28d9",
  fashion: "#4338ca",
  "home-decor": "#b45309",
  electronics: "#1e40af",
  beauty: "#be185d",
};

function parseSocialLinks(value: unknown): Record<string, string> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  const links: Record<string, string> = {};
  for (const key of SOCIAL_KEYS) {
    const candidate = source[key];
    if (candidate === undefined || candidate === "") {
      links[key] = "";
      continue;
    }
    if (typeof candidate !== "string" || candidate.length > 2048) return null;
    try {
      const url = new URL(candidate);
      if (url.protocol !== "https:" && url.protocol !== "http:") return null;
      links[key] = url.toString();
    } catch {
      return null;
    }
  }
  return links;
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
    if (!(await canAccessStore(storeId))) return NextResponse.json({ error: "You are not authorized to access this store." }, { status: 403 });

    const [settingsResult, storeResult, paymentResult] = await Promise.all([
      supabase.from("store_settings").select("*").eq("store_id", storeId).maybeSingle(),
      supabase.from("stores").select("id, name, slug, plan, whatsapp_number, accepts_cod, accepts_advance, advance_percentage, payment_details").eq("id", storeId).maybeSingle(),
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
      store = fallback.data ? { ...fallback.data, plan: "basic", whatsapp_number: null, accepts_cod: true, accepts_advance: false, advance_percentage: 50, payment_details: {} } : null;
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
        accepts_cod: store?.accepts_cod ?? true,
        accepts_advance: store?.accepts_advance ?? false,
        advance_percentage: store?.advance_percentage ?? 50,
        payment_details: store?.payment_details ?? {},
        jazzcash_number: accountNumber("jazz") || settings.jazzcash_number || "",
        easypaisa_number: accountNumber("easy") || settings.easypaisa_number || "",
      } : {
        whatsapp_number: store?.whatsapp_number ?? "",
        accepts_cod: store?.accepts_cod ?? true,
        accepts_advance: store?.accepts_advance ?? false,
        advance_percentage: store?.advance_percentage ?? 50,
        payment_details: store?.payment_details ?? {},
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
    if (!(await canAccessStore(storeId))) return NextResponse.json({ error: "You are not authorized to access this store." }, { status: 403 });

    let savedPaymentDetails: Record<string, string> | undefined;
    if (["accepts_cod", "accepts_advance", "advance_percentage", "payment_details"].some((key) => key in body)) {
      if (typeof body.accepts_cod !== "boolean" || typeof body.accepts_advance !== "boolean") {
        return NextResponse.json({ error: "Choose whether to accept Cash on Delivery and advance payments." }, { status: 400 });
      }
      const advancePercentage = Number(body.advance_percentage);
      if (!Number.isInteger(advancePercentage) || advancePercentage < 1 || advancePercentage > 100) {
        return NextResponse.json({ error: "Advance percentage must be a whole number between 1 and 100." }, { status: 400 });
      }
      const paymentDetails = parsePaymentDetails(body.payment_details);
      if (!paymentDetails) return NextResponse.json({ error: "Payment account details are invalid." }, { status: 400 });
      if (body.accepts_advance && ![
        paymentDetails.account_number,
        paymentDetails.iban,
        paymentDetails.jazzcash_number,
        paymentDetails.easypaisa_number,
      ].some(Boolean)) {
        return NextResponse.json({ error: "Add a bank account, IBAN, JazzCash, or EasyPaisa destination before enabling advance payment." }, { status: 400 });
      }
      const { error: paymentSettingsError } = await supabase.from("stores").update({
        accepts_cod: body.accepts_cod,
        accepts_advance: body.accepts_advance,
        advance_percentage: advancePercentage,
        payment_details: paymentDetails,
      }).eq("id", storeId);
      if (paymentSettingsError) throw paymentSettingsError;
      savedPaymentDetails = paymentDetails;
    }

    if (typeof body?.whatsapp_number === "string" && body.whatsapp_number.trim()) {
      const { error: storeError } = await supabase
        .from("stores")
        .update({ whatsapp_number: optionalText(body.whatsapp_number) })
        .eq("id", storeId);
      if (storeError && !isMissingStoreColumn(storeError)) throw storeError;
    }

    const selectedTheme = textValue(body?.selected_theme).toLowerCase().replace(/\s+/g, "-");
    const themeColor = textValue(body?.theme_color);
    const validTheme = !selectedTheme || /^#[0-9a-f]{6}$/i.test(selectedTheme) || selectedTheme in THEME_COLORS;
    if (!validTheme) return NextResponse.json({ error: "Choose a supported theme or six-digit hex color." }, { status: 400 });
    if (themeColor && !/^#[0-9a-f]{6}$/i.test(themeColor)) return NextResponse.json({ error: "Theme color must be a six-digit hex value." }, { status: 400 });

    const basePayload = {
      store_id: storeId,
      theme_color: themeColor || (selectedTheme ? THEME_COLORS[selectedTheme] ?? selectedTheme : "#1d7555"),
      banner_text: optionalText(body?.banner_text) ?? "Welcome to our store!",
      font_style: optionalText(body?.font_style) ?? "inter",
      logo_url: optionalText(body?.logo_url) ?? "",
    };
    if (selectedTheme) Object.assign(basePayload, { selected_theme: selectedTheme });
    const extendedPayload = {
      ...basePayload,
      footer_text: optionalText(body?.footer_text) ?? "",
      custom_domain: optionalText(body?.custom_domain),
      jazzcash_number: optionalText(body?.jazzcash_number) ?? "",
      easypaisa_number: optionalText(body?.easypaisa_number) ?? "",
    };

    if ("social_links" in body) {
      const socialLinks = parseSocialLinks(body.social_links);
      if (!socialLinks) return NextResponse.json({ error: "Provide valid HTTP or HTTPS social profile URLs." }, { status: 400 });
      Object.assign(extendedPayload, { social_links: socialLinks });
    }

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
        ...(savedPaymentDetails ? { payment_details: savedPaymentDetails } : {}),
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