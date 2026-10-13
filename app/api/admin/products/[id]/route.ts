import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Product database is not configured." }, { status: 503 });

  try {
    const { id } = await params;
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) return NextResponse.json({ error: "Invalid product details." }, { status: 400 });
    const input = body as Record<string, unknown>;
    const updates: Record<string, string | number | null> = {};
    if ("name" in input) {
      if (typeof input.name !== "string" || !input.name.trim()) return NextResponse.json({ error: "Product name cannot be empty." }, { status: 400 });
      updates.name = input.name.trim();
    }
    if ("price" in input) {
      const price = typeof input.price === "number" ? input.price : typeof input.price === "string" ? Number(input.price) : NaN;
      if (!Number.isFinite(price) || price < 0) return NextResponse.json({ error: "Enter a valid product price." }, { status: 400 });
      updates.price = price;
    }
    if ("description" in input) {
      if (typeof input.description !== "string") return NextResponse.json({ error: "Invalid product description." }, { status: 400 });
      updates.description = input.description.trim() || null;
    }
    if ("category_id" in input) {
      if (typeof input.category_id !== "string") return NextResponse.json({ error: "Invalid product category." }, { status: 400 });
      updates.category_id = input.category_id.trim() || null;
    }
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: "No product fields were provided to update." }, { status: 400 });

    const { data, error } = await supabase.from("store_products").update(updates).eq("id", id).select("id").maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update product.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Product database is not configured." }, { status: 503 });
  const { id } = await params;
  const { data, error } = await supabase.from("store_products").delete().eq("id", id).select("id").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
