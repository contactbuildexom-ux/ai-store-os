import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canAccessStore } from "@/lib/merchant-api-auth";
import { getStoreNicheColor, THEME_PALETTES } from "@/lib/store-theme";
import { fetchStoreByIdOrSlug, isUuid } from "@/lib/store-id-slug";

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
  ...THEME_PALETTES,
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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabase || !url || url.includes("placeholder-project") || url.includes("your-project")) return null;
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

async function savePaymentAccount(supabase: NonNullable<ReturnType<typeof getSupabase>>, storeId: string, provider: string, value: unknown) {
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
    const { searchParams } = new URL(req.url);
    const storeId = textValue(searchParams.get("store_id"));

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required." }, { status: 400 });
    }
    if (!(await canAccessStore(storeId))) return NextResponse.json({ error: "You are not authorized to access this store." }, { status: 403 });

    const supabase = getSupabase();
    if (!supabase) {
      const { storeRepo } = await import("@/lib/store-repository");
      const repoStore = await storeRepo.getStore(storeId);
      const nicheColor = getStoreNicheColor(repoStore?.name, repoStore?.slug);
      const themeColor = repoStore?.theme?.primaryColor || repoStore?.primary_color || (repoStore?.selected_theme && THEME_PALETTES[repoStore.selected_theme]) || nicheColor;
      return NextResponse.json({
        success: true,
        settings: {
          store_id: storeId,
          theme_color: themeColor,
          selected_theme: repoStore?.theme?.id || repoStore?.selected_theme || "emerald",
          banner_text: repoStore?.header_title || repoStore?.tagline || "",
          footer_text: repoStore?.description || "",
          logo_url: repoStore?.logo_url || "",
          whatsapp_number: repoStore?.whatsapp_number || "",
          accepts_cod: true,
          accepts_advance: false,
          advance_percentage: 50,
          payment_details: {},
          jazzcash_number: "",
          easypaisa_number: "",
        },
        store: repoStore ? {
          id: repoStore.id,
          name: repoStore.name,
          slug: repoStore.slug,
          plan: repoStore.plan || "basic",
          primary_color: themeColor,
          selected_theme: repoStore?.theme?.id || repoStore?.selected_theme || "emerald",
          whatsapp_number: repoStore.whatsapp_number,
          accepts_cod: true,
          accepts_advance: false,
          advance_percentage: 50,
          payment_details: {},
        } : null,
      });
    }

    const storeResult = await fetchStoreByIdOrSlug(
      supabase,
      storeId,
      "id, name, slug, plan, whatsapp_number, primary_color, selected_theme, accepts_cod, accepts_advance, advance_percentage, payment_details"
    );
    let { data: store, error: storeError } = storeResult;
    const resolvedStoreId = store?.id || storeId;

    const [settingsResult, paymentResult] = await Promise.all([
      supabase.from("store_settings").select("*").eq("store_id", resolvedStoreId).maybeSingle(),
      supabase.from("store_payments").select("provider_name, account_number, is_active").eq("store_id", resolvedStoreId).eq("is_active", true),
    ]);

    const { data: settings, error: settingsError } = settingsResult;
    const { data: paymentMethods, error: paymentError } = paymentResult;

    if (isMissingSettingsSchema(settingsError)) {
      return NextResponse.json({
        error: "Store settings are not initialized in Supabase. Apply migrations 04_store_builder_features.sql and 06_storefront_settings.sql, then retry.",
      }, { status: 503 });
    }
    if (settingsError && settingsError.code !== "PGRST116") throw settingsError;
    if (isMissingStoreColumn(storeError)) {
      const fallback = await supabase.from("stores").select("id, name, slug").eq("id", storeId).maybeSingle();
      store = fallback.data ? { ...fallback.data, plan: "basic", whatsapp_number: null, primary_color: null, selected_theme: null, accepts_cod: true, accepts_advance: false, advance_percentage: 50, payment_details: {} } : null;
      storeError = fallback.error;
    }
    if (storeError) throw storeError;
    if (paymentError && !isMissingPaymentSchema(paymentError)) throw paymentError;

    const accountNumber = (provider: string) => paymentMethods?.find((method) => method.provider_name.toLowerCase().includes(provider) && method.account_number)?.account_number ?? "";

    const nicheColor = getStoreNicheColor(store?.name, store?.slug);
    const resolvedThemeColor = settings?.theme_color 
      || (store as any)?.primary_color 
      || ((store as any)?.selected_theme && THEME_PALETTES[(store as any).selected_theme])
      || (settings?.selected_theme && THEME_PALETTES[settings.selected_theme])
      || nicheColor;

    return NextResponse.json({
      success: true,
      settings: settings ? {
        ...settings,
        hero_images: (settings as any)?.hero_images || (store as any)?.hero_images || [],
        about_title: (settings as any)?.about_title || (store as any)?.about_title || "",
        about_text: (settings as any)?.about_text || (store as any)?.about_text || (store as any)?.description || "",
        about_image: (settings as any)?.about_image || (store as any)?.about_image || "",
        theme_color: resolvedThemeColor,
        selected_theme: settings.selected_theme || (store as any)?.selected_theme || "emerald",
        whatsapp_number: store?.whatsapp_number ?? settings.whatsapp_number ?? "",
        accepts_cod: store?.accepts_cod ?? true,
        accepts_advance: store?.accepts_advance ?? false,
        advance_percentage: store?.advance_percentage ?? 50,
        payment_details: store?.payment_details ?? {},
        jazzcash_number: accountNumber("jazz") || settings.jazzcash_number || "",
        easypaisa_number: accountNumber("easy") || settings.easypaisa_number || "",
      } : {
        hero_images: (store as any)?.hero_images || [],
        about_title: (store as any)?.about_title || "",
        about_text: (store as any)?.about_text || (store as any)?.description || "",
        about_image: (store as any)?.about_image || "",
        theme_color: resolvedThemeColor,
        selected_theme: (store as any)?.selected_theme || "emerald",
        whatsapp_number: store?.whatsapp_number ?? "",
        accepts_cod: store?.accepts_cod ?? true,
        accepts_advance: store?.accepts_advance ?? false,
        advance_percentage: store?.advance_percentage ?? 50,
        payment_details: store?.payment_details ?? {},
        jazzcash_number: accountNumber("jazz"),
        easypaisa_number: accountNumber("easy"),
      },
      store: store ? {
        ...store,
        primary_color: resolvedThemeColor,
      } : null,
    });
  } catch (error) {
    try {
      const { searchParams } = new URL(req.url);
      const storeId = textValue(searchParams.get("store_id"));
      if (storeId) {
        const { storeRepo } = await import("@/lib/store-repository");
        const repoStore = await storeRepo.getStore(storeId);
        if (repoStore) {
          const themeColor = repoStore?.theme?.primaryColor || repoStore?.primary_color || "#1d7555";
          return NextResponse.json({
            success: true,
            settings: {
              store_id: storeId,
              theme_color: themeColor,
              selected_theme: repoStore?.theme?.id || repoStore?.selected_theme || "emerald",
              banner_text: repoStore?.header_title || repoStore?.tagline || "",
              footer_text: repoStore?.description || "",
              logo_url: repoStore?.logo_url || "",
              whatsapp_number: repoStore?.whatsapp_number || "",
              accepts_cod: true,
              accepts_advance: false,
              advance_percentage: 50,
              payment_details: {},
              jazzcash_number: "",
              easypaisa_number: "",
            },
            store: {
              id: repoStore.id,
              name: repoStore.name,
              slug: repoStore.slug,
              plan: repoStore.plan || "basic",
              whatsapp_number: repoStore.whatsapp_number,
              accepts_cod: true,
              accepts_advance: false,
              advance_percentage: 50,
              payment_details: {},
            },
          });
        }
      }
    } catch {
      // Ignore
    }
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
    if (typeof body?.plan === "string" && !["basic", "free"].includes(body.plan.toLowerCase())) {
      return NextResponse.json({ error: "Paid plans require a manual payment request and Super Admin approval." }, { status: 409 });
    }
    if (!(await canAccessStore(storeId))) return NextResponse.json({ error: "You are not authorized to access this store." }, { status: 403 });

    let targetStoreId = storeId;
    if (supabase) {
      if (!isUuid(storeId)) {
        const { data: storeRow } = await supabase.from("stores").select("id").eq("slug", storeId).maybeSingle();
        if (storeRow?.id) targetStoreId = storeRow.id;
      }
    }

    if (!supabase) {
      const { storeRepo } = await import("@/lib/store-repository");
      const repoStore = await storeRepo.getStore(storeId);
      if (repoStore) {
        if (body.banner_text) repoStore.header_title = String(body.banner_text);
        if (body.theme_color) {
          repoStore.primary_color = String(body.theme_color);
          if (repoStore.theme) repoStore.theme.primaryColor = String(body.theme_color);
        }
        if (body.whatsapp_number) repoStore.whatsapp_number = String(body.whatsapp_number);
        if (body.logo_url) repoStore.logo_url = String(body.logo_url);
        if (typeof body.plan === "string" && ["basic", "free"].includes(body.plan.toLowerCase())) {
          repoStore.plan = "basic";
          repoStore.payment_status = "active";
        }
      }
      return NextResponse.json({
        success: true,
        settings: {
          store_id: storeId,
          theme_color: body?.theme_color || repoStore?.primary_color || "#1d7555",
          banner_text: body?.banner_text || repoStore?.header_title || "",
          logo_url: body?.logo_url || repoStore?.logo_url || "",
          whatsapp_number: body?.whatsapp_number || repoStore?.whatsapp_number || "",
          accepts_cod: body?.accepts_cod ?? true,
          accepts_advance: body?.accepts_advance ?? false,
          advance_percentage: body?.advance_percentage ?? 50,
          payment_details: body?.payment_details ?? {},
          jazzcash_number: body?.jazzcash_number || "",
          easypaisa_number: body?.easypaisa_number || "",
        },
        message: "Store settings updated successfully.",
      });
    }

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
      }).eq("id", targetStoreId);
      if (paymentSettingsError) throw paymentSettingsError;
      savedPaymentDetails = paymentDetails;
    }

    if (typeof body?.whatsapp_number === "string" && body.whatsapp_number.trim()) {
      const { error: storeError } = await supabase
        .from("stores")
        .update({ whatsapp_number: optionalText(body.whatsapp_number) })
        .eq("id", targetStoreId);
      if (storeError && !isMissingStoreColumn(storeError)) throw storeError;
    }

    if (typeof body?.plan === "string" && ["basic", "free"].includes(body.plan.toLowerCase())) {
      const updatedPlan = "basic";
      const { error: planError } = await supabase
        .from("stores")
        .update({ plan: updatedPlan, payment_status: "active" })
        .eq("id", targetStoreId);
      if (planError && !isMissingStoreColumn(planError)) console.warn("Plan update error:", planError);
    }

    const selectedTheme = textValue(body?.selected_theme).toLowerCase().replace(/\s+/g, "-");
    let themeColor = textValue(body?.theme_color);
    if (!themeColor || !/^#[0-9a-f]{6}$/i.test(themeColor)) {
      themeColor = (selectedTheme && THEME_COLORS[selectedTheme]) || "#1d7555";
    }

    const basePayload = {
      store_id: targetStoreId,
      theme_color: themeColor,
      banner_text: optionalText(body?.banner_text) ?? "Welcome to our store!",
      font_style: optionalText(body?.font_style) ?? "inter",
      logo_url: optionalText(body?.logo_url) ?? "",
    };
    if (selectedTheme) Object.assign(basePayload, { selected_theme: selectedTheme });
    const heroImages = Array.isArray(body?.hero_images)
      ? body.hero_images.filter((img: unknown) => typeof img === "string" && img.trim().length > 0).slice(0, 3)
      : undefined;

    const extendedPayload: any = {
      ...basePayload,
      footer_text: optionalText(body?.footer_text) ?? "",
      custom_domain: optionalText(body?.custom_domain),
      jazzcash_number: optionalText(body?.jazzcash_number) ?? "",
      easypaisa_number: optionalText(body?.easypaisa_number) ?? "",
    };
    if (heroImages) {
      extendedPayload.hero_images = heroImages;
    }
    if (typeof body?.about_title === "string") extendedPayload.about_title = body.about_title;
    if (typeof body?.about_text === "string") extendedPayload.about_text = body.about_text;
    if (typeof body?.about_image === "string") extendedPayload.about_image = body.about_image;

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

    // Sync primary_color and selected_theme into the stores table so storefront always reflects live branding
    try {
      const storeUpdates: Record<string, unknown> = {};
      if (basePayload.theme_color) storeUpdates.primary_color = basePayload.theme_color;
      if (selectedTheme) storeUpdates.selected_theme = selectedTheme;
      if (body.banner_text) storeUpdates.header_title = String(body.banner_text);
      if (Object.keys(storeUpdates).length > 0) {
        await supabase.from("stores").update(storeUpdates).eq("id", targetStoreId);
      }
    } catch (syncErr) {
      console.warn("Could not sync stores table branding columns:", syncErr);
    }

    // Always update storeRepo memory/cache for immediate consistency
    try {
      const { storeRepo } = await import("@/lib/store-repository");
      const repoStore = await storeRepo.getStore(storeId);
      if (repoStore) {
        if (basePayload.theme_color) {
          repoStore.primary_color = basePayload.theme_color;
          if (repoStore.theme) repoStore.theme.primaryColor = basePayload.theme_color;
        }
        if (selectedTheme) {
          repoStore.selected_theme = selectedTheme;
          if (repoStore.theme) repoStore.theme.id = selectedTheme;
        }
        if (body.banner_text) repoStore.header_title = String(body.banner_text);
        if (body.whatsapp_number) repoStore.whatsapp_number = String(body.whatsapp_number);
        if (body.logo_url) repoStore.logo_url = String(body.logo_url);
        if (heroImages) repoStore.hero_images = heroImages;
        if (typeof body?.about_title === "string") repoStore.about_title = body.about_title;
        if (typeof body?.about_text === "string") repoStore.about_text = body.about_text;
        if (typeof body?.about_image === "string") repoStore.about_image = body.about_image;
      }
    } catch (repoErr) {
      console.warn("Could not sync storeRepo cache:", repoErr);
    }

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