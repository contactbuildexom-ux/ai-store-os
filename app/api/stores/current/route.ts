import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMerchantSessionStore } from "@/lib/merchant-api-auth";

type StoreRow = {
  id: string;
  name: string | null;
  slug: string | null;
  plan: string | null;
  payment_status: string | null;
  primary_color?: string | null;
  selected_theme?: string | null;
  whatsapp_number?: string | null;
};

async function findStoreForUser(supabase: NonNullable<ReturnType<typeof createAdminClient>>, userId: string) {
  const baseSelect = "id, name, slug, plan, payment_status, primary_color, selected_theme, whatsapp_number";
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
    const { searchParams } = new URL(request.url);
    const requestedId = searchParams.get("store_id") || searchParams.get("id") || searchParams.get("slug");

    const merchantStore = await getMerchantSessionStore(requestedId || undefined);
    if (merchantStore) return NextResponse.json({ store: merchantStore as StoreRow });

    if (requestedId) {
      const { storeRepo } = await import("@/lib/store-repository");
      const { getStoreNicheColor, THEME_PALETTES } = await import("@/lib/store-theme");
      const repoStore = await storeRepo.getStore(requestedId);
      if (repoStore) {
        const nicheColor = getStoreNicheColor(repoStore.name, repoStore.slug);
        const resolvedColor = repoStore.theme?.primaryColor || repoStore.primary_color || (repoStore.selected_theme && THEME_PALETTES[repoStore.selected_theme]) || nicheColor;
        return NextResponse.json({
          store: {
            id: repoStore.id,
            name: repoStore.name,
            slug: repoStore.slug,
            plan: repoStore.plan || "basic",
            payment_status: repoStore.payment_status || "active",
            whatsapp_number: repoStore.whatsapp_number,
            primary_color: resolvedColor,
            selected_theme: repoStore.theme?.id || repoStore.selected_theme || "emerald",
          } as StoreRow,
        });
      }
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return NextResponse.json({ error: "Store not found or authentication required." }, { status: 404 });
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
