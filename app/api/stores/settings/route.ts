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

export async function GET(req: Request) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(req.url);
    const storeId = textValue(searchParams.get("store_id"));

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required." }, { status: 400 });
    }

    const [{ data: settings, error: settingsError }, { data: store, error: storeError }] = await Promise.all([
      supabase.from("store_settings").select("*").eq("store_id", storeId).maybeSingle(),
      supabase.from("stores").select("id, name, slug, plan, whatsapp_number").eq("id", storeId).maybeSingle(),
    ]);

    if (settingsError && settingsError.code !== "PGRST116") throw settingsError;
    if (storeError) throw storeError;

    return NextResponse.json({
      success: true,
      settings: settings ? { ...settings, whatsapp_number: store?.whatsapp_number ?? settings.whatsapp_number ?? "" } : null,
      store,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load store settings.";
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

    if ("whatsapp_number" in body) {
      const { error: storeError } = await supabase
        .from("stores")
        .update({ whatsapp_number: optionalText(body.whatsapp_number) })
        .eq("id", storeId);
      if (storeError) throw storeError;
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
    };

    let result = await supabase
      .from("store_settings")
      .upsert([extendedPayload], { onConflict: "store_id" })
      .select()
      .single();

    if (result.error && hasMissingOptionalColumn(result.error.message)) {
      result = await supabase
        .from("store_settings")
        .upsert([basePayload], { onConflict: "store_id" })
        .select()
        .single();
    }

    if (result.error) throw result.error;

    return NextResponse.json({
      success: true,
      settings: result.data,
      message: "Store settings updated successfully.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update store settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}