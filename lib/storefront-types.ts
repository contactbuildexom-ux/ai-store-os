export interface PublicStore {
  id: string;
  name: string;
  slug: string;
  plan: string;
  tagline: string;
  description: string;
  whatsapp_number: string;
  selected_theme: string;
  primary_color: string;
  secondary_color: string;
}

export interface PublicStoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

export interface PublicStorefrontResponse {
  success: true;
  store: PublicStore;
  categories: string[];
  products: PublicStoreProduct[];
}

export interface StoreAssistantRequest {
  message: string;
}

export interface StoreAssistantResponse {
  success: true;
  reply: string;
  store_name: string;
  matches_count?: number;
}

export interface PlatformAssistantRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface PlatformAssistantResponse {
  success: true;
  reply: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isPublicStorefrontResponse(value: unknown): value is PublicStorefrontResponse {
  if (!isRecord(value) || value.success !== true) return false;
  const store = value.store;
  if (!isRecord(store)) return false;

  const storeFields: (keyof PublicStore)[] = [
    "id",
    "name",
    "slug",
    "plan",
    "tagline",
    "description",
    "whatsapp_number",
    "selected_theme",
    "primary_color",
    "secondary_color",
  ];
  if (!storeFields.every((field) => typeof store[field] === "string")) return false;
  if (!Array.isArray(value.categories) || !value.categories.every((category) => typeof category === "string")) return false;
  return Array.isArray(value.products) && value.products.every((product) =>
    isRecord(product)
    && typeof product.id === "string"
    && typeof product.name === "string"
    && typeof product.description === "string"
    && typeof product.price === "number"
    && Number.isFinite(product.price)
    && typeof product.image_url === "string"
    && typeof product.category === "string"
  );
}

export function isStoreAssistantResponse(value: unknown): value is StoreAssistantResponse {
  return isRecord(value)
    && value.success === true
    && typeof value.reply === "string"
    && typeof value.store_name === "string"
    && (value.matches_count === undefined || typeof value.matches_count === "number");
}

export function isPlatformAssistantResponse(value: unknown): value is PlatformAssistantResponse {
  return isRecord(value) && value.success === true && typeof value.reply === "string";
}
