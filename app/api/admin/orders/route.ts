import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Order database is not configured." }, { status: 503 });
  const { data, error } = await supabase
    .from("orders")
    .select("id, store_id, customer_name, customer_phone, shipping_address, city, total_amount, delivery_fee, status, items, created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Unable to load orders." }, { status: 500 });
  return NextResponse.json({ orders: data });
}
