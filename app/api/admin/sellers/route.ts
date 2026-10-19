import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Seller database is not configured." }, { status: 503 });
  const query = new URL(request.url).searchParams.get("q")?.trim();
  let sellersQuery = supabase.from("merchants")
    .select("id, store_id, name, email, address, whatsapp_number, contact_phone, created_at")
    .order("created_at", { ascending: false });
  if (query) sellersQuery = sellersQuery.ilike("email", `%${query}%`);
  const { data, error } = await sellersQuery;
  if (error) return NextResponse.json({ error: "Unable to load sellers." }, { status: 500 });
  const storeIds = [...new Set((data ?? []).map((seller) => seller.store_id).filter((id): id is string => Boolean(id)))];
  const storesResult = storeIds.length
    ? await supabase.from("stores").select("id, name, slug, plan, payment_status").in("id", storeIds)
    : { data: [], error: null };
  if (storesResult.error) return NextResponse.json({ error: "Unable to load seller storefronts." }, { status: 500 });
  const storesById = new Map((storesResult.data ?? []).map((store) => [String(store.id), store]));
  const sellers = (data ?? []).map((seller) => ({
    ...seller,
    store: seller.store_id ? storesById.get(String(seller.store_id)) ?? null : null,
  }));
  return NextResponse.json({ sellers });
}
