import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type StoreRow = {
  id: string;
  name: string | null;
  slug: string | null;
  plan: string | null;
  payment_status: string | null;
};

async function findStoreForUser(supabase: NonNullable<ReturnType<typeof createAdminClient>>, userId: string) {
  const baseSelect = "id, name, slug, plan, payment_status";
  const byOwner = await supabase
    .from("stores")
    .select(baseSelect)
    .eq("owner_id", userId)
    .maybeSingle();

  if (!byOwner.error || byOwner.data) return byOwner;

  const missingOwnerColumn = byOwner.error.message.toLowerCase().includes("owner_id");
  if (!missingOwnerColumn) return byOwner;

  return supabase
    .from("stores")
    .select(baseSelect)
    .eq("user_id", userId)
    .maybeSingle();
}

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Store database is not configured." }, { status: 503 });
    }

    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return NextResponse.json({ error: "Authentication token is required." }, { status: 401 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    const { data: store, error } = await findStoreForUser(supabase, user.id);
    if (error) throw error;
    if (!store) {
      return NextResponse.json({ error: "No store is linked to this user." }, { status: 404 });
    }

    return NextResponse.json({ store: store as StoreRow });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to resolve merchant store.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
