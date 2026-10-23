import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canAccessStore, getMerchantSessionStore } from "@/lib/merchant-api-auth";
import { fetchStoreByIdOrSlug } from "@/lib/store-id-slug";

type StoreRow = {
  id: string;
  name: string | null;
  slug: string | null;
  plan: string | null;
  payment_status: string | null;
  primary_color?: string | null;
  selected_theme?: string | null;
  whatsapp_number?: string | null;
  created_at?: string | null;
  is_verified?: boolean;
  verification_status?: string | null;
  niche?: string | null;
  tagline?: string | null;
  description?: string | null;
};

async function findStoreForUser(supabase: NonNullable<ReturnType<typeof createAdminClient>>, userId: string) {
  const baseSelect = "id, name, slug, plan, payment_status, primary_color, selected_theme, whatsapp_number, created_at, is_verified, verification_status";
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
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();

    if (requestedId && !(await canAccessStore(requestedId, token))) {
      return NextResponse.json({ error: "You are not authorized to access this store." }, { status: 403 });
    }

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
            created_at: repoStore.created_at || new Date().toISOString(),
            is_verified: repoStore.is_verified ?? false,
            verification_status: repoStore.verification_status || "pending",
            niche: (repoStore as any).niche || null,
            tagline: repoStore.tagline || null,
            description: repoStore.description || null,
          } as StoreRow,
        });
      }
    }

    const supabase = createAdminClient();
    const isSupabaseValid = supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project") && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project");

    if (isSupabaseValid && supabase && requestedId) {
      const { data: dbStore } = await fetchStoreByIdOrSlug<StoreRow>(
        supabase,
        requestedId,
        "id, name, slug, plan, payment_status, primary_color, selected_theme, whatsapp_number, created_at, is_verified, verification_status"
      );





      if (dbStore) {
        const { getStoreNicheColor, THEME_PALETTES } = await import("@/lib/store-theme");
        const nicheColor = getStoreNicheColor(dbStore.name, dbStore.slug);
        const resolvedColor = dbStore.primary_color || (dbStore.selected_theme && THEME_PALETTES[dbStore.selected_theme]) || nicheColor;
        return NextResponse.json({
          store: {
            id: dbStore.id,
            name: dbStore.name,
            slug: dbStore.slug,
            plan: dbStore.plan || "basic",
            payment_status: dbStore.payment_status || "active",
            whatsapp_number: dbStore.whatsapp_number,
            primary_color: resolvedColor,
            selected_theme: dbStore.selected_theme || "ocean-blue",
            created_at: dbStore.created_at || new Date().toISOString(),
            is_verified: Boolean((dbStore as any).is_verified === true || (dbStore as any).verification_status === "verified"),
            verification_status: (dbStore as any).verification_status || ((dbStore as any).is_verified ? "verified" : "pending"),
          } as StoreRow,
        });
      }
    }

    if (!supabase) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

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
