import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveSubscriptionPlan } from "@/lib/subscription-plans";

type StoreLimitType = "product" | "category" | "whatsapp_order";

function isMissingLegacyProductsTable(error: { code?: string; message?: string } | null) {
  return Boolean(error && (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    error.message?.toLowerCase().includes("public.products")
  ));
}

export async function checkStoreLimits(
  storeId: string,
  type: StoreLimitType,
  categoryId?: string,
  options: { checkProductCount?: boolean; categoryName?: string } = {}
) {
  const supabase = createAdminClient();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabase || !url || url.includes("placeholder-project") || url.includes("your-project")) {
    return { allowed: false, message: "Plan limits cannot be verified because the database is not configured." };
  }

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("plan, payment_status, is_verified, verification_status")
    .eq("id", storeId)
    .maybeSingle();

  if (storeError) throw storeError;
  if (!store) return { allowed: false, message: "Store not found." };

  const isVerified = store.is_verified === true || store.verification_status === "verified";
  if (!isVerified) {
    return {
      allowed: false,
      message: "Store verification is in progress. Catalog and store operations will unlock once verified.",
    };
  }

  const plan = getActiveSubscriptionPlan(store.plan, store.payment_status);
  if (type === "whatsapp_order") return { allowed: true };
  if (type === "product" && categoryId && plan.limits.categories === 0) {
    return {
      allowed: false,
      message: `Products cannot be assigned to categories on the ${plan.name} plan.`,
    };
  }

  if (type === "category" || type === "product") {
    const limit = type === "category" ? plan.limits.categories : plan.limits.products;
    if (limit === 0) {
      return {
        allowed: false,
        message: type === "category"
          ? `Categories are not available on the ${plan.name} plan. Upgrade to add categories.`
          : `Products are not available on the ${plan.name} plan.`,
      };
    }

    if (type === "category" && options.categoryName?.trim() && options.categoryName.trim().toLowerCase() !== "general") {
      const requestedCategory = options.categoryName.trim().toLowerCase();
      const [catalogCategories, legacyCategories] = await Promise.all([
        supabase.from("store_categories").select("name").eq("store_id", storeId),
        supabase.from("products").select("category").eq("store_id", storeId),
      ]);
      if (catalogCategories.error) throw catalogCategories.error;
      if (legacyCategories.error && !isMissingLegacyProductsTable(legacyCategories.error)) {
        throw legacyCategories.error;
      }

      const existingCategoryNames = new Set([
        ...(catalogCategories.data ?? []).map((category) => String(category.name ?? "").trim().toLowerCase()),
        ...(legacyCategories.error ? [] : (legacyCategories.data ?? []).map((product) => String(product.category ?? "").trim().toLowerCase())),
      ].filter(Boolean));
      if (existingCategoryNames.has(requestedCategory)) return { allowed: true };
      if (existingCategoryNames.size >= limit) {
        return {
          allowed: false,
          message: `${plan.name} plan limit reached (maximum ${limit} categories).`,
        };
      }
      return { allowed: true };
    }

    const { count, error } = type === "category"
      ? await supabase
          .from("store_categories")
          .select("id", { count: "exact", head: true })
          .eq("store_id", storeId)
      : options.checkProductCount === false
        ? { count: 0, error: null }
        : await (async () => {
          const [catalogCount, legacyCount] = await Promise.all([
            supabase.from("store_products").select("id", { count: "exact", head: true }).eq("store_id", storeId),
            supabase.from("products").select("id", { count: "exact", head: true }).eq("store_id", storeId),
          ]);
          if (catalogCount.error) throw catalogCount.error;
          if (legacyCount.error && !isMissingLegacyProductsTable(legacyCount.error)) throw legacyCount.error;
          return {
            count: Math.max(catalogCount.count ?? 0, legacyCount.error ? 0 : legacyCount.count ?? 0),
            error: null,
          };
        })();

    if (error) throw error;
    if ((count ?? 0) >= limit) {
      const label = type === "category" ? "categories" : "products";
      return {
        allowed: false,
        message: `${plan.name} plan limit reached (maximum ${limit} ${label}).`,
      };
    }

    if (type === "product" && categoryId && plan.limits.productsPerCategory < plan.limits.products) {
      const { count: categoryProductCount, error: categoryProductError } = await supabase
        .from("store_products")
        .select("id", { count: "exact", head: true })
        .eq("store_id", storeId)
        .eq("category_id", categoryId);

      if (categoryProductError) throw categoryProductError;
      if ((categoryProductCount ?? 0) >= plan.limits.productsPerCategory) {
        return {
          allowed: false,
          message: `${plan.name} plan allows a maximum of ${plan.limits.productsPerCategory} products per category.`,
        };
      }
    }
  }

  return { allowed: true };
}
