import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
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
  if (!supabase) {
    throw new StorefrontDataError("Store database is not configured.", 503);
  }

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", normalizedSlug)
    .maybeSingle();

  if (storeError) throw storeError;
  if (!store) return null;

  const [legacyResult, builderResult, categoryResult] = await Promise.all([
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
  ]);

  if (legacyResult.error) throw legacyResult.error;
  if (builderResult.error) throw builderResult.error;
  if (categoryResult.error) throw categoryResult.error;

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
  const publicStore: PublicStore = {
    id: String(store.id),
    name: String(store.name ?? store.store_name ?? ""),
    slug: String(store.slug),
    plan: String(store.plan ?? store.plan_type ?? "free"),
    tagline: String(store.tagline ?? store.header_title ?? "Welcome to our store."),
    description: String(store.description ?? ""),
    whatsapp_number: String(store.whatsapp_number ?? ""),
    selected_theme: String(store.selected_theme ?? "emerald"),
    primary_color: String(store.primary_color ?? "#1d7555"),
    secondary_color: String(store.secondary_color ?? "#0f172a"),
  };

  return {
    success: true,
    store: publicStore,
    categories: [...new Set(products.map((product) => product.category))],
    products,
  };
}
