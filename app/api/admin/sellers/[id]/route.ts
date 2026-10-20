import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Seller database is not configured." }, { status: 503 });

  try {
    const { id } = await params;
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid seller details." }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const updates: Record<string, string> = {};
    for (const key of ["name", "email", "address", "whatsapp_number", "contact_phone"] as const) {
      if (!(key in input)) continue;
      if (typeof input[key] !== "string") {
        return NextResponse.json({ error: `Invalid ${key.replaceAll("_", " ")}.` }, { status: 400 });
      }
      const value = input[key].trim();
      if (key === "name" && (!value || value.length > 100)) {
        return NextResponse.json({ error: "Seller name must be between 1 and 100 characters." }, { status: 400 });
      }
      if (key === "email" && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value.length > 254)) {
        return NextResponse.json({ error: "Enter a valid seller email." }, { status: 400 });
      }
      if ((key === "whatsapp_number" || key === "contact_phone") && value.length > 30) {
        return NextResponse.json({ error: "Phone numbers must be 30 characters or fewer." }, { status: 400 });
      }
      if (key === "address" && value.length > 500) {
        return NextResponse.json({ error: "Address must be 500 characters or fewer." }, { status: 400 });
      }
      updates[key] = value;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No seller fields were provided to update." }, { status: 400 });
    }

    const { data, error } = await supabase.from("merchants").update(updates).eq("id", id).select("id").maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Seller not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update seller.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Seller database is not configured." }, { status: 503 });

  const { id } = await params;
  const { data, error } = await supabase.from("merchants").delete().eq("id", id).select("id").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Seller not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
