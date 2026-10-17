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
    if ("sku" in input) {
      if (typeof input.sku !== "string" || input.sku.trim().length > 100) return NextResponse.json({ error: "SKU must be 100 characters or fewer." }, { status: 400 });
      updates.sku = input.sku.trim() || null;
    }
    if ("stock" in input) {
      const stock = input.stock === "" || input.stock === null
        ? null
        : typeof input.stock === "number"
          ? input.stock
          : typeof input.stock === "string"
            ? Number(input.stock)
            : NaN;
      if (stock === null) {
        updates.stock = null;
      } else if (!Number.isSafeInteger(stock) || stock < 0 || stock > 2147483647) {
        return NextResponse.json({ error: "Enter a valid non-negative whole-number stock quantity." }, { status: 400 });
      } else {
        updates.stock = stock;
      }
    }
    if ("category_id" in input) {
      if (typeof input.category_id !== "string") return NextResponse.json({ error: "Invalid product category." }, { status: 400 });
      updates.category_id = input.category_id.trim() || null;
    }
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: "No product fields were provided to update." }, { status: 400 });

    const { data, error } = await supabase.from("store_products").update(updates).eq("id", id).select("id").maybeSingle();
    if (error?.code === "23505") return NextResponse.json({ error: "That SKU is already in use for this store." }, { status: 409 });
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
