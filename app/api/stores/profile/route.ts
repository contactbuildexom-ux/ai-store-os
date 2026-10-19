import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMerchantSessionStore } from "@/lib/merchant-api-auth";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  const store = await getMerchantSessionStore();
  if (!store) return NextResponse.json({ error: "Merchant authentication is required." }, { status: 401 });
  return NextResponse.json({ store });
}

export async function PATCH(request: Request) {
  const store = await getMerchantSessionStore();
  if (!store) return NextResponse.json({ error: "Merchant authentication is required." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const updates: Record<string, string | null> = {};
  if ("name" in input) {
    const name = text(input.name);
    if (name.length < 2 || name.length > 100) return NextResponse.json({ error: "Store name must contain 2 to 100 characters." }, { status: 400 });
    updates.name = name;
  }
  if ("slug" in input) {
    const slug = text(input.slug).toLowerCase();
    if (!/^[a-z0-9-]{1,80}$/.test(slug)) return NextResponse.json({ error: "Enter a valid URL slug." }, { status: 400 });
    updates.slug = slug;
  }
  if ("whatsapp_number" in input) {
    const phone = text(input.whatsapp_number);
    if (phone.length > 30) return NextResponse.json({ error: "WhatsApp number must be 30 characters or fewer." }, { status: 400 });
    updates.whatsapp_number = phone || null;
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Provide at least one supported store field." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const isSupabaseValid = supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project") && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project");

  if (!isSupabaseValid || !supabase) {
    const { storeRepo } = await import("@/lib/store-repository");
    const repoStore = await storeRepo.getStore(store.id);
    if (repoStore) {
      if (updates.name) repoStore.name = updates.name;
      if (updates.slug) repoStore.slug = updates.slug;
      if (updates.whatsapp_number !== undefined) repoStore.whatsapp_number = updates.whatsapp_number || "";
    }
    return NextResponse.json({
      success: true,
      store: {
        ...store,
        ...updates,
      },
    });
  }

  const { data, error } = await supabase.from("stores")
    .update(updates)
    .eq("id", store.id)
    .select("id, name, slug, owner_email, plan, selected_plan, payment_status, whatsapp_number, created_at")
    .single();
  if (error) {
    const duplicate = error.code === "23505";
    return NextResponse.json({ error: duplicate ? "That store slug is already in use." : error.message }, { status: duplicate ? 409 : 500 });
  }
  return NextResponse.json({ success: true, store: data });
}

export async function DELETE(request: Request) {
  const store = await getMerchantSessionStore();
  if (!store) return NextResponse.json({ error: "Merchant authentication is required." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Confirm deletion by sending the store slug in the request body." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body) || (body as Record<string, unknown>).confirm_slug !== store.slug) {
    return NextResponse.json({ error: "confirm_slug must exactly match your store slug." }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (supabase) {
    try {
      await supabase.from("stores").delete().eq("id", store.id);
    } catch {
      // Ignore
    }
  }
  const response = NextResponse.json({ success: true, deleted: true });
  response.cookies.set("ai_store_merchant_session", "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  return response;
}
