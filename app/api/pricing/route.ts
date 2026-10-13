import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Pricing is not configured." }, { status: 503 });
  const { data, error } = await supabase
    .from("pricing_plans")
    .select("id, name, price, billing_cycle, features")
    .eq("is_active", true)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: "Unable to load pricing plans." }, { status: 500 });
  return NextResponse.json({ plans: data });
}
