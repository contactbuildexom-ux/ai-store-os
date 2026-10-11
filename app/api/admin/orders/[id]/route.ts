import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };
const allowedStatuses = new Set(["pending", "processing", "shipped", "delivered", "completed", "cancelled", "canceled", "rejected"]);

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Order database is not configured." }, { status: 503 });

  try {
    const { id } = await params;
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) return NextResponse.json({ error: "Invalid order details." }, { status: 400 });
    const input = body as Record<string, unknown>;
    const updates: Record<string, string> = {};
    for (const key of ["customer_name", "customer_phone"] as const) {
      if (!(key in input)) continue;
      if (typeof input[key] !== "string" || !input[key].trim()) return NextResponse.json({ error: `Order ${key.replace("_", " ")} cannot be empty.` }, { status: 400 });
      updates[key] = input[key].trim();
    }
    if ("status" in input) {
      if (typeof input.status !== "string" || !allowedStatuses.has(input.status.trim().toLowerCase())) return NextResponse.json({ error: "Enter a valid order status." }, { status: 400 });
      updates.status = input.status.trim().toLowerCase();
    }
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: "No order fields were provided to update." }, { status: 400 });

    const { data, error } = await supabase.from("orders").update(updates).eq("id", id).select("id").maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Order database is not configured." }, { status: 503 });
  const { id } = await params;
  const { data, error } = await supabase.from("orders").delete().eq("id", id).select("id").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
