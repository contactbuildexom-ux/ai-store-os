import "server-only";

import type { createAdminClient } from "@/lib/supabase/admin";
import { getActiveSubscriptionPlan, type SubscriptionPlan } from "@/lib/subscription-plans";

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

export async function fetchActiveSubscriptionPlan(
  supabase: AdminClient,
  storeId: string
): Promise<SubscriptionPlan | null> {
  const { data: store, error } = await supabase
    .from("stores")
    .select("plan, payment_status")
    .eq("id", storeId)
    .maybeSingle();

  if (error) throw error;
  if (!store) return null;
  return getActiveSubscriptionPlan(store.plan, store.payment_status);
}
