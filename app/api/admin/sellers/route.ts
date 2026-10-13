import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Seller database is not configured." }, { status: 503 });
  const query = new URL(request.url).searchParams.get("q")?.trim();
  let sellersQuery = supabase.from("stores").select("id, owner_email, name, slug, plan, payment_status, created_at").order("created_at", { ascending: false });
  if (query) sellersQuery = sellersQuery.ilike("owner_email", `%${query}%`);
  const { data, error } = await sellersQuery;
  if (error) return NextResponse.json({ error: "Unable to load sellers." }, { status: 500 });
  return NextResponse.json({ sellers: data });
}
