import "server-only";
import { cookies } from "next/headers";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-session";
import { MERCHANT_SESSION_COOKIE, verifyMerchantSession } from "@/lib/merchant-session";
import { storeRepo } from "@/lib/store-repository";

/** Checks that the current browser session owns the requested store. */
export async function canAccessStore(storeId: string) {
  if (!storeId) return false;

  const cookieStore = await cookies();
  const merchantSession = verifyMerchantSession(cookieStore.get(MERCHANT_SESSION_COOKIE)?.value);
  if (merchantSession) {
    if (merchantSession.storeId === storeId || merchantSession.slug === storeId) return true;
    const repoStore = await storeRepo.getStore(storeId);
    if (repoStore && (merchantSession.storeId === repoStore.id || merchantSession.slug === repoStore.slug)) return true;
  }

  if (verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) return true;

  const admin = createAdminClient();
  const isSupabaseValid = admin && process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project") && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project");

  if (!isSupabaseValid) {
    // In local dev/fallback mode without Supabase, check if store exists in repo
    const repoStore = await storeRepo.getStore(storeId);
    if (repoStore) return true;
    return false;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return false;
    if (user.app_metadata?.role === "super_admin") return true;

    const { data: store, error: storeError } = await admin
      .from("stores")
      .select("id, owner_id, user_id, slug")
      .or(`id.eq.${storeId},slug.eq.${storeId}`)
      .maybeSingle();
    if (storeError || !store) return false;
    return store.owner_id === user.id || store.user_id === user.id;
  } catch {
    return false;
  }
}

export async function getMerchantSessionStore(requestedId?: string) {
  const cookieStore = await cookies();
  const merchantSession = verifyMerchantSession(cookieStore.get(MERCHANT_SESSION_COOKIE)?.value);
  const targetLookup = requestedId || merchantSession?.storeId || merchantSession?.slug;

  if (merchantSession) {
    const admin = createAdminClient();
    const isSupabaseValid = admin && process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project") && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project");
    if (isSupabaseValid && admin) {
      try {
        const { data, error } = await admin
          .from("stores")
          .select("id, name, slug, plan, payment_status, owner_email, whatsapp_number")
          .or(`id.eq.${merchantSession.storeId},slug.eq.${merchantSession.slug}`)
          .maybeSingle();
        if (!error && data) return data;
      } catch {
        // Fallback to storeRepo
      }
    }
    const repoStore = await storeRepo.getStore(merchantSession.storeId) || await storeRepo.getStore(merchantSession.slug);
    if (repoStore) {
      return {
        id: repoStore.id,
        name: repoStore.name,
        slug: repoStore.slug,
        plan: repoStore.plan || "basic",
        payment_status: repoStore.payment_status || "active",
        owner_email: repoStore.owner_email,
        whatsapp_number: repoStore.whatsapp_number,
      };
    }
  }

  // If no merchantSession cookie, but requestedId is passed (or session fallback didn't hit)
  if (targetLookup) {
    const repoStore = await storeRepo.getStore(targetLookup);
    if (repoStore) {
      return {
        id: repoStore.id,
        name: repoStore.name,
        slug: repoStore.slug,
        plan: repoStore.plan || "basic",
        payment_status: repoStore.payment_status || "active",
        owner_email: repoStore.owner_email,
        whatsapp_number: repoStore.whatsapp_number,
      };
    }
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  const admin = createAdminClient();
  if (!admin) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    if (user.app_metadata?.role === "super_admin") return null;
    const { data, error: storeError } = await admin
      .from("stores")
      .select("id, name, slug, plan, payment_status, owner_email, whatsapp_number")
      .or(`owner_id.eq.${user.id},user_id.eq.${user.id}`)
      .maybeSingle();
    return storeError ? null : data;
  } catch {
    return null;
  }
}
