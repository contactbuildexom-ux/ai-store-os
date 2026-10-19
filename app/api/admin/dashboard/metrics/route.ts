import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Dashboard database is not configured." }, { status: 503 });
  const [stores, sellers, products, orders] = await Promise.all([
    supabase.from("stores").select("id", { count: "exact", head: true }),
    supabase.from("merchants").select("id", { count: "exact", head: true }),
    supabase.from("store_products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
  ]);
  const errors = [stores.error, sellers.error, products.error, orders.error].filter((error) => error !== null);
  if (errors.length) return NextResponse.json({ error: "Unable to load dashboard metrics.", details: errors.map((error) => error.message) }, { status: 500 });
  return NextResponse.json({
    metrics: {
      stores: stores.count ?? 0,
      sellers: sellers.count ?? 0,
      products: products.count ?? 0,
      orders: orders.count ?? 0,
    },
  });
}
