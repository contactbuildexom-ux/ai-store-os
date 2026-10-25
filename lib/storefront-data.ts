import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { storeRepo } from "@/lib/store-repository";
import { THEME_PALETTES } from "@/lib/store-theme";
import { fetchStoreByIdOrSlug } from "@/lib/store-id-slug";
import { getActiveSubscriptionPlan } from "@/lib/subscription-plans";
import type {
  PublicStore,
  PublicStoreProduct,
  PublicStorefrontResponse,
} from "@/lib/storefront-types";

export class StorefrontDataError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "StorefrontDataError";
  }
}

export async function getPublicStorefront(slug: string): Promise<PublicStorefrontResponse | null> {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug || normalizedSlug.length > 100) {
    throw new StorefrontDataError("A valid store slug is required.", 400);
  }

  const supabase = createAdminClient();
  if (supabase) {
    try {
      const { data: store, error: storeError } = await fetchStoreByIdOrSlug(
        supabase,
        normalizedSlug,
        "*"
      );

      if (!storeError && store) {
        const [legacyResult, builderResult, categoryResult, settingsResult] = await Promise.all([
          supabase
            .from("products")
            .select("id, name, description, price, image_url, category, created_at")
            .eq("store_id", store.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("store_products")
            .select("id, name, description, price, image_url, category_id, created_at")
            .eq("store_id", store.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("store_categories")
            .select("id, name")
            .eq("store_id", store.id),
          supabase
            .from("store_settings")
            .select("theme_color, selected_theme")
            .eq("store_id", store.id)
            .maybeSingle(),
        ]);

        const categoryById = new Map(
          (categoryResult.data ?? []).map((category) => [category.id, category.name])
        );
        const productsById = new Map<string, PublicStoreProduct>();

        for (const product of legacyResult.data ?? []) {
          productsById.set(String(product.id), {
            id: String(product.id),
            name: String(product.name ?? ""),
            description: typeof product.description === "string" ? product.description : "",
            price: Number(product.price ?? 0),
            image_url: typeof product.image_url === "string" ? product.image_url : "",
            category: typeof product.category === "string" && product.category.trim()
              ? product.category.trim()
              : "General",
          });
        }

        for (const product of builderResult.data ?? []) {
          productsById.set(String(product.id), {
            id: String(product.id),
            name: String(product.name ?? ""),
            description: typeof product.description === "string" ? product.description : "",
            price: Number(product.price ?? 0),
            image_url: typeof product.image_url === "string" ? product.image_url : "",
            category: (product.category_id && categoryById.get(product.category_id)) || "General",
          });
        }

        const products = [...productsById.values()];
        const activePlan = getActiveSubscriptionPlan(store.plan ?? store.plan_type, store.payment_status);

        const resolvedThemeColor = settingsResult.data?.theme_color
          || store.primary_color
          || (store.selected_theme && THEME_PALETTES[store.selected_theme])
          || (settingsResult.data?.selected_theme && THEME_PALETTES[settingsResult.data.selected_theme])
          || "#1d7555";
        const resolvedSelectedTheme = settingsResult.data?.selected_theme || store.selected_theme || "emerald";

        const publicStore: PublicStore = {
          id: String(store.id),
          name: String(store.name ?? store.store_name ?? ""),
          slug: String(store.slug),
          plan: activePlan.id,
          tagline: String(store.tagline ?? store.header_title ?? "Welcome to our store."),
          description: String(store.description ?? ""),
          whatsapp_number: String(store.whatsapp_number ?? ""),
          selected_theme: String(resolvedSelectedTheme),
          primary_color: String(resolvedThemeColor),
          secondary_color: String(store.secondary_color ?? "#0f172a"),
        };

        const resolvedCategories = activePlan.limits.categories === 0
          ? []
          : (categoryResult.data && categoryResult.data.length > 0)
            ? categoryResult.data.slice(0, activePlan.limits.categories).map((category) => category.name)
            : [...new Set(products.map((product) => product.category).filter((c) => c && c !== "General"))]
                .slice(0, activePlan.limits.categories);

        const planProducts = products.slice(0, activePlan.limits.products);
        const cleanProducts = activePlan.limits.categories === 0
          ? planProducts.map((product) => ({ ...product, category: "" }))
          : planProducts;

        return {
          success: true,
          store: publicStore,
          categories: resolvedCategories,
          products: cleanProducts,
        };
      }
    } catch (e) {
      console.warn("Supabase fetch public storefront failed, checking storeRepo:", e);
    }
  }

  // Fallback to in-memory store repository
  const repoStore = await storeRepo.getStore(normalizedSlug);
  if (repoStore) {
    const repoProducts = await storeRepo.getProducts(repoStore.id);
    const publicProducts: PublicStoreProduct[] = repoProducts.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || "",
      price: p.price,
      image_url: p.image_url || "",
      category: p.category || "General",
    }));

    const repoThemeColor = repoStore.theme?.primaryColor
      || repoStore.primary_color
      || (repoStore.selected_theme && THEME_PALETTES[repoStore.selected_theme])
      || "#1d7555";
    const repoSelectedTheme = repoStore.theme?.id || repoStore.selected_theme || "emerald";

    const activePlan = getActiveSubscriptionPlan(repoStore.plan, repoStore.payment_status);
    const resolvedRepoCategories = activePlan.limits.categories === 0
      ? [] 
      : [...new Set(publicProducts.map((p) => p.category).filter((c) => c && c !== "General"))]
          .slice(0, activePlan.limits.categories);
    const planProducts = publicProducts.slice(0, activePlan.limits.products);
    const cleanRepoProducts = activePlan.limits.categories === 0
      ? planProducts.map((product) => ({ ...product, category: "" }))
      : planProducts;

    return {
      success: true,
      store: {
        id: repoStore.id,
        name: repoStore.name,
        slug: repoStore.slug,
        plan: activePlan.id,
        tagline: repoStore.tagline || "Welcome to our store.",
        description: repoStore.description || "",
        whatsapp_number: repoStore.whatsapp_number || "",
        selected_theme: repoSelectedTheme,
        primary_color: repoThemeColor,
        secondary_color: "#0f172a",
      },
      categories: resolvedRepoCategories,
      products: cleanRepoProducts,
    };
  }

  return null;
}
