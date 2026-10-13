import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Store database is not configured." }, { status: 503 });

  try {
    const { id } = await params;
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) return NextResponse.json({ error: "Invalid store details." }, { status: 400 });
    const input = body as Record<string, unknown>;
    const updates: Record<string, string | null> = {};
    for (const key of ["name", "slug", "owner_email", "plan", "payment_status", "whatsapp_number"] as const) {
      if (!(key in input)) continue;
      if (typeof input[key] !== "string") return NextResponse.json({ error: `Invalid ${key.replace("_", " ")}.` }, { status: 400 });
      const value = input[key].trim();
      if (key === "name" && (!value || value.length > 100)) return NextResponse.json({ error: "Store name must be between 1 and 100 characters." }, { status: 400 });
      if (key === "slug" && !/^[a-z0-9-]{1,80}$/.test(value)) return NextResponse.json({ error: "Enter a valid store slug." }, { status: 400 });
      if (key === "owner_email" && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value.length > 254)) return NextResponse.json({ error: "Enter a valid owner email." }, { status: 400 });
      if (key === "whatsapp_number" && value.length > 30) return NextResponse.json({ error: "WhatsApp number must be 30 characters or fewer." }, { status: 400 });
      updates[key] = key === "whatsapp_number" && !value ? null : value;
    }
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: "No store fields were provided to update." }, { status: 400 });

    const { data, error } = await supabase.from("stores").update(updates).eq("id", id).select("id").maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Store not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update store.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Store database is not configured." }, { status: 503 });
  const { id } = await params;
  const { data, error } = await supabase.from("stores").delete().eq("id", id).select("id").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Store not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
