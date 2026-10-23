import "server-only";
import { cookies } from "next/headers";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-session";
import { MERCHANT_SESSION_COOKIE, verifyMerchantSession } from "@/lib/merchant-session";
import { storeRepo } from "@/lib/store-repository";
import { fetchStoreByIdOrSlug } from "@/lib/store-id-slug";

type MerchantStore = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  payment_status: string;
  owner_email: string;
  whatsapp_number: string;
  is_verified: boolean;
  verification_status: string;
};

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(
    createAdminClient()
    && url
    && !url.includes("placeholder-project")
    && !url.includes("your-project"),
  );
}

function normalizeVerification<T extends {
  is_verified?: boolean | null;
  verification_status?: string | null;
}>(store: T) {
  const isVerified = store.is_verified === true || store.verification_status === "verified";
  return {
    ...store,
    is_verified: isVerified,
    verification_status: isVerified ? "verified" : (store.verification_status || "pending"),
  };
}

/** Checks that the current session owns the requested store, or is a Super Admin. */
export async function canAccessStore(storeLookup: string, accessToken?: string) {
  if (!storeLookup) return false;

  const cookieStore = await cookies();
  if (verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) return true;

  const merchantSession = verifyMerchantSession(cookieStore.get(MERCHANT_SESSION_COOKIE)?.value);
  const admin = createAdminClient();
  const configured = isSupabaseConfigured();

  if (merchantSession) {
    const repoStore = await storeRepo.getStore(storeLookup);
    const sessionMatches = merchantSession.storeId === storeLookup
      || merchantSession.slug === storeLookup
      || Boolean(repoStore && (
        merchantSession.storeId === repoStore.id
        || merchantSession.slug === repoStore.slug
      ));
    if (sessionMatches && !configured && repoStore) return true;
    if (sessionMatches && configured && admin) {
      const { data, error } = await fetchStoreByIdOrSlug(admin, storeLookup, "id, slug");
      if (error) throw error;
      if (data) return true;
    }
  }

  if (!configured || !admin) return false;

  let user;
  if (accessToken) {
    const { data, error } = await admin.auth.getUser(accessToken);
    if (error) return false;
    user = data.user;
  } else {
    const authClient = await createSupabaseServerClient();
    const { data, error } = await authClient.auth.getUser();
    if (error) return false;
    user = data.user;
  }
  if (!user) return false;
  if (user.app_metadata?.role === "super_admin") return true;

  const { data: store, error } = await fetchStoreByIdOrSlug<{
    owner_id: string | null;
    user_id: string | null;
  }>(admin, storeLookup, "id, slug, owner_id, user_id");
  if (error) throw error;
  return Boolean(store && (store.owner_id === user.id || store.user_id === user.id));
}

export async function getMerchantSessionStore(requestedId?: string): Promise<MerchantStore | null> {
  const cookieStore = await cookies();
  const merchantSession = verifyMerchantSession(cookieStore.get(MERCHANT_SESSION_COOKIE)?.value);
  const admin = createAdminClient();
  const configured = isSupabaseConfigured();

  if (merchantSession) {
    const lookup = requestedId || merchantSession.storeId;
    if (!(await canAccessStore(lookup))) return null;

    if (configured && admin) {
      const { data, error } = await fetchStoreByIdOrSlug<MerchantStore>(
        admin,
        lookup,
        "id, name, slug, plan, payment_status, owner_email, whatsapp_number, is_verified, verification_status",
      );
      if (error) throw error;
      return data ? normalizeVerification(data) : null;
    }

    const store = await storeRepo.getStore(lookup);
    if (!store) return null;
    return normalizeVerification({
      id: store.id,
      name: store.name,
      slug: store.slug,
      plan: store.plan || "basic",
      payment_status: store.payment_status || "active",
      owner_email: store.owner_email,
      whatsapp_number: store.whatsapp_number,
      is_verified: store.is_verified,
      verification_status: store.verification_status,
    });
  }

  if (!configured || !admin || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const authClient = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user || user.app_metadata?.role === "super_admin") return null;

  const { data, error } = await admin.from("stores")
    .select("id, name, slug, plan, payment_status, owner_email, whatsapp_number, is_verified, verification_status")
    .or(`owner_id.eq.${user.id},user_id.eq.${user.id}`)
    .maybeSingle();
  if (error) throw error;
  if (!data || (requestedId && requestedId !== data.id && requestedId !== data.slug)) return null;
  return normalizeVerification(data as MerchantStore);
}
