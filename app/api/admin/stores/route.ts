import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { storeRepo } from "@/lib/store-repository";

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Store database is not configured." }, { status: 503 });

  const { data, error } = await supabase
    .from("stores")
    .select("id, name, slug, owner_email, whatsapp_number, plan, payment_status, created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ stores: data }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const supabase = createAdminClient();
    if (!supabase) return NextResponse.json({ error: "Store database is not configured." }, { status: 503 });

    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null) return NextResponse.json({ error: "Invalid store details." }, { status: 400 });
    const input = body as Record<string, unknown>;
    const name = typeof input.name === "string" ? input.name.trim() : "";
    const slug = typeof input.slug === "string" ? input.slug.trim().toLowerCase() : "";
    const ownerEmail = typeof input.owner_email === "string" ? input.owner_email.trim().toLowerCase() : "";
    const password = typeof input.password === "string" ? input.password : "";
    const whatsappNumber = typeof input.whatsapp_number === "string" ? input.whatsapp_number.trim() : "";

    if (!name || name.length > 100 || !/^[a-z0-9-]{1,80}$/.test(slug) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail) || ownerEmail.length > 254 || password.length < 8 || password.length > 128 || whatsappNumber.length > 30) {
      return NextResponse.json({ error: "Enter a valid store name, URL slug, owner email, password (at least 8 characters), and WhatsApp number." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { data, error } = await supabase.from("stores").insert({
      name,
      slug,
      owner_email: ownerEmail,
      password_hash: passwordHash,
      whatsapp_number: whatsappNumber || null,
      plan: "free",
      payment_status: "pending",
    }).select("id, name, slug, owner_email, plan, payment_status, created_at").single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const { error: merchantError } = await supabase.from("merchants").upsert({
      store_id: data.id,
      name: data.name,
      email: data.owner_email,
      whatsapp_number: whatsappNumber,
      address: "",
      contact_phone: whatsappNumber || null,
    }, { onConflict: "store_id" });
    if (merchantError) {
      const { error: cleanupError } = await supabase.from("stores").delete().eq("id", data.id);
      const message = cleanupError
        ? `Unable to create seller profile (${merchantError.message}); store cleanup also failed (${cleanupError.message}).`
        : `Unable to create seller profile: ${merchantError.message}`;
      return NextResponse.json({ error: message }, { status: 500 });
    }
    return NextResponse.json({ store: data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create store.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Store database is not configured." }, { status: 503 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Store ID is required." }, { status: 400 });

  const { data, error } = await supabase.from("stores").delete().eq("id", id).select("id, slug").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Store not found." }, { status: 404 });
  await storeRepo.invalidateStore(data.id, data.slug);
  return NextResponse.json({ success: true });
}
