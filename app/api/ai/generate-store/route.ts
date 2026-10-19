import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin";
import { createMerchantSession, MERCHANT_SESSION_COOKIE, verifyMerchantSession } from "@/lib/merchant-session";
import { generateStoreFromPrompt } from "@/lib/ai/ai-generator";
import { storeRepo } from "@/lib/store-repository";
import { verifyEmailVerificationToken } from "@/lib/email-otp";
import { getStoreUrl, isReservedSlug } from "@/lib/store-url";

type GeneratedProduct = { name: string; price: number; description: string; category_name: string; image_url?: string | null };
type SocialLinks = Partial<Record<"instagram" | "facebook" | "youtube" | "tiktok" | "x", string>>;
type GeneratedStore = {
  store_name: string;
  slug: string;
  theme_color: string;
  selected_theme: string;
  banner_text: string;
  footer_text: string;
  categories: string[];
  products: GeneratedProduct[];
};

// Slugs become subdomains (<slug>.domain.com). A DNS label can be at most 63 characters,
// so base slugs stop at 54 and a suffix such as "-2" or "-12" is added only if needed.
const MAX_BASE_SLUG_LENGTH = 54;

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_BASE_SLUG_LENGTH)
    .replace(/-+$/g, "");
}

async function getAuthenticatedUser(request: Request, admin: NonNullable<ReturnType<typeof createAdminClient>>) {
  const authorization = request.headers.get("authorization");
  const bearerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (bearerToken) {
    const { data, error } = await admin.auth.getUser(bearerToken);
    if (error || !data.user) return null;
    return data.user;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const cookieStore = await cookies();
  const sessionClient = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });
  const { data, error } = await sessionClient.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

async function generateWithOpenAI(prompt: string): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(45000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "Create a comprehensive, realistic starter storefront from the user's request.",
            "Return only a JSON object with fields: store_name (string), slug (URL-friendly string), theme_color (six-digit hex color), banner_text (string), footer_text (short brand-appropriate footer copy), categories (array of strings), products (array of objects with name, price, description, category_name).",
            "Generate 4 to 6 relevant categories and 30 to 36 plausible, high-quality products spread across these categories. Product prices must be positive numbers in the local PKR currency (e.g. 1500 to 12000), with no currency symbols. Every product category_name must match one of the categories exactly.",
            "Do not include markdown, comments, or additional properties.",
          ].join(" "),
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    console.error("OpenAI store generation failed:", response.status, await response.text());
    throw new Error("The AI provider could not generate your store. Please try again.");
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("The AI provider returned an empty store description.");
  return JSON.parse(content) as unknown;
}

async function generateWithGemini(prompt: string): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("No AI provider API key is configured.");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    signal: AbortSignal.timeout(45000),
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{
        role: "user",
        parts: [{
          text: [
            "Create a comprehensive, realistic starter storefront from this request. Return only valid JSON with fields: store_name (string), slug (URL-friendly string), theme_color (six-digit hex color), banner_text (string), footer_text (short brand-appropriate footer copy), categories (array of strings), products (array of objects with name, price, description, category_name). Generate 4 to 6 relevant categories and 30 to 36 plausible, high-quality products spread across these categories. Prices must be positive numbers in PKR currency without currency symbols. Each product category_name must exactly match one category. Do not add markdown or extra properties.",
            `Store request: ${prompt}`,
          ].join("\n\n"),
        }],
      }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
    }),
  });

  if (!response.ok) {
    console.error("Gemini store generation failed:", response.status, await response.text());
    throw new Error("The AI provider could not generate your store. Please try again.");
  }

  const payload = await response.json();
  const content = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof content !== "string") throw new Error("The AI provider returned an empty store description.");
  return JSON.parse(content) as unknown;
}

function normalizeGeneratedStore(
  value: unknown,
  requestedTheme = "",
  categoryLimit = 20,
  productLimit = 50,
  requestedName = "",
): GeneratedStore {
  if (!value || typeof value !== "object") throw new Error("The AI returned invalid store data.");
  const source = value as Record<string, unknown>;
  const storeName = text(requestedName, 100) || text(source.store_name, 100);
  const slug = slugify(text(requestedName, 100) || text(source.slug, 100) || storeName);
  if (storeName.length < 2 || !slug) throw new Error("The AI could not create a valid store name.");

  const rawCategories = Array.isArray(source.categories) ? source.categories : [];
  let categories = [...new Set(rawCategories.map((item) => text(item, 60)).filter(Boolean))].slice(0, categoryLimit);
  if (!categories.length) categories = ["Featured", "Best Sellers", "New Arrivals", "Trending"];

  // As requested by user: Products are not AI generated at store creation.
  // The merchant personally adds and manages products from their merchant dashboard.
  const products: GeneratedProduct[] = [];

  const themePresets: Record<string, string> = {
    emerald: "#1d7555",
    "emerald-minimal": "#1d7555",
    ocean: "#1976d2",
    "ocean-blue": "#1976d2",
    rose: "#be185d",
    "velvet-rose": "#831843",
    midnight: "#09090b",
    "midnight-minimal": "#09090b",
    amber: "#ea580c",
    "sunset-amber": "#ea580c",
    violet: "#7c3aed",
    "aurora-violet": "#7c3aed",
    "mint-fresh": "#059669",
    mint: "#059669",
    fashion: "#4338ca",
    "home-decor": "#b45309",
    electronics: "#1e40af",
    beauty: "#be185d",
    "royal-gold": "#0f172a",
    "cyber-slate": "#1e1b4b",
    "artisan-cream": "#78350f",
  };
  const themeKey = requestedTheme.toLowerCase().replace(/\s+/g, "-");
  const requestedColor = /^#[0-9a-f]{6}$/i.test(requestedTheme)
    ? requestedTheme
    : themePresets[themeKey] || themePresets[requestedTheme.toLowerCase()];
  const themeColor = requestedColor || text(source.theme_color, 20);
  const selectedThemeCandidate = (Object.prototype.hasOwnProperty.call(themePresets, themeKey) ? themeKey : requestedTheme) || text(source.selected_theme, 40) || "ocean-blue";
  const selectedTheme = /^#[0-9a-f]{6}$/i.test(selectedThemeCandidate) ||
    Object.prototype.hasOwnProperty.call(themePresets, themeKey) ||
    Object.prototype.hasOwnProperty.call(themePresets, selectedThemeCandidate.toLowerCase())
    ? (Object.prototype.hasOwnProperty.call(themePresets, themeKey) ? themeKey : selectedThemeCandidate)
    : "ocean-blue";
  return {
    store_name: storeName,
    slug,
    theme_color: /^#[0-9a-f]{6}$/i.test(themeColor) ? themeColor : "#1976d2",
    selected_theme: selectedTheme,
    banner_text: text(source.banner_text, 160) || `Welcome to ${storeName}`,
    footer_text: text(source.footer_text, 500) || `Thank you for visiting ${storeName}.`,
    categories,
    products,
  };
}

function normalizeSocialLinks(value: unknown): SocialLinks {
  const keys = ["instagram", "facebook", "youtube", "tiktok", "x"] as const;
  const source = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const links: SocialLinks = {};
  for (const key of keys) {
    const candidate = text(source[key], 2048);
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (url.protocol === "https:" || url.protocol === "http:") links[key] = url.toString();
    } catch {
      throw new Error(`social_links.${key} must be a valid HTTP or HTTPS URL.`);
    }
  }
  return links;
}

function planLimits(planValue: unknown) {
  const plan = text(planValue, 20).toLowerCase();
  if (plan === "pro") return { plan: "pro", categories: 10, products: 80 };
  if (plan === "business" || plan === "advanced" || plan === "advance") return { plan: "business", categories: 25, products: 150 };
  return { plan: "basic", categories: 8, products: 40 };
}

function isConfiguredSupabase(client: ReturnType<typeof createAdminClient>): client is NonNullable<ReturnType<typeof createAdminClient>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!client || !url || url.includes("placeholder-project") || url.includes("your-project")) {
    return false;
  }
  return true;
}

// Returns a slug that is free and safe to use as a subdomain:
// shoe-store, then shoe-store-2, shoe-store-3, ... Reserved names (www, admin, api, ...) are never returned as-is.
// Works with Supabase when it is configured, and always also checks the local store repository.
async function uniqueStoreSlug(supabase: ReturnType<typeof createAdminClient>, requestedSlug: string) {
  const base = requestedSlug.slice(0, MAX_BASE_SLUG_LENGTH).replace(/-+$/g, "") || "store";
  const taken = new Set<string>();

  if (isConfiguredSupabase(supabase)) {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("slug")
        .ilike("slug", `${base}%`)
        .limit(200);
      if (error) throw error;
      for (const row of data ?? []) taken.add(String(row.slug ?? "").toLowerCase());
    } catch {
      // Fallback to the local repository below
    }
  }

  try {
    const allStores = await storeRepo.getAllStores();
    for (const s of allStores) taken.add(String(s.slug ?? "").toLowerCase());
  } catch {
    // Ignore
  }

  if (!isReservedSlug(base) && !taken.has(base)) return base;

  for (let n = 2; n < 200; n += 1) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function POST(request: Request) {
  const rawSupabase = createAdminClient();
  const supabase = isConfiguredSupabase(rawSupabase) ? rawSupabase : null;

  let createdStoreId: string | null = null;
  let targetStoreId: string | null = null;
  let insertedCategoryIds: string[] = [];
  let insertedProductIds: string[] = [];
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const rawPrompt = typeof input.prompt === "string" ? input.prompt.trim() : "";
    if (rawPrompt.length > 2000) {
      return NextResponse.json({ error: "Enter a store description of no more than 2,000 characters." }, { status: 400 });
    }
    const requestedStoreName = text(input.name ?? input.store_name, 100);
    const prompt = rawPrompt.length >= 8
      ? rawPrompt
      : `A modern e-commerce storefront for ${requestedStoreName || "My Online Store"} featuring curated quality products and nationwide cash on delivery.`;
    const requestedUserId = text(input.user_id, 100);
    const requestedStoreId = text(input.store_id, 100);
    const requestedTheme = text(input.theme ?? input.selected_theme ?? "", 40);
    const requestedPlan = text(input.plan, 20).toLowerCase();
    if (requestedPlan && !["basic", "free", "pro", "business", "advanced", "advance"].includes(requestedPlan)) {
      return NextResponse.json({ error: "Choose a supported store plan." }, { status: 400 });
    }
    const selectedPlan = requestedPlan === "pro"
      ? "pro"
      : ["business", "advanced", "advance"].includes(requestedPlan)
        ? "business"
        : "basic";
    const rawThemeInput = text(input.theme ?? input.selected_theme ?? "", 60);
    const themeKey = rawThemeInput.toLowerCase().replace(/\s+/g, "-");
    const cookieStore = await cookies();
    const isNewSignup = typeof input.password === "string" && input.password.length >= 8;
    const merchantSession = isNewSignup ? null : verifyMerchantSession(cookieStore.get(MERCHANT_SESSION_COOKIE)?.value);
    let user = null;
    let targetStore: { id: string; name: string; slug: string; owner_email: string | null; plan: string | null; whatsapp_number?: string | null } | null = null;
    if (merchantSession && supabase) {
      try {
        const { data, error } = await supabase.from("stores")
          .select("id, name, slug, owner_email, plan, whatsapp_number")
          .eq("id", merchantSession.storeId)
          .maybeSingle();
        if (!error && data && String(data.owner_email ?? "").toLowerCase() === merchantSession.email.toLowerCase()) {
          targetStore = data;
        }
      } catch {
        // Fallback
      }
    }
    if (!targetStore && merchantSession) {
      const repoStore = await storeRepo.getStore(merchantSession.storeId);
      if (repoStore) {
        targetStore = {
          id: repoStore.id,
          name: repoStore.name,
          slug: repoStore.slug,
          owner_email: repoStore.owner_email,
          plan: repoStore.plan,
          whatsapp_number: repoStore.whatsapp_number,
        };
      }
    }
    if (!merchantSession && supabase) {
      user = await getAuthenticatedUser(request, supabase);
    }
    if (!targetStore) {
      if (!user) {
        if (requestedUserId) {
          return NextResponse.json({ error: "Sign in before generating a store for a user account." }, { status: 401 });
        }
        const candidateEmail = text(input.owner_email ?? input.email, 120).toLowerCase();
        const password = typeof input.password === "string" ? input.password : "";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidateEmail)) {
          return NextResponse.json({ error: "Enter a valid merchant email address." }, { status: 400 });
        }
        if (password.length < 8 || password.length > 128) {
          return NextResponse.json({ error: "Choose a password between 8 and 128 characters." }, { status: 400 });
        }
        let existingStore = false;
        if (supabase) {
          try {
            const { data } = await supabase.from("stores")
              .select("id")
              .eq("owner_email", candidateEmail)
              .maybeSingle();
            if (data) existingStore = true;
          } catch {
            // Ignore
          }
        }
        if (!existingStore) {
          try {
            const match = await storeRepo.getStoreByEmail(candidateEmail);
            if (match) {
              existingStore = true;
            }
          } catch {
            // Ignore
          }
        }
        if (existingStore) {
          return NextResponse.json({ error: "An account already exists for this email. Sign in before generating another store." }, { status: 409 });
        }
        // Email OTP check. It runs for every new signup (it must not sit inside the `existingStore` branch).
        if (process.env.NEXT_PUBLIC_REQUIRE_EMAIL_OTP === "true") {
          const verificationToken = text(input.verification_token, 600);
          if (!verifyEmailVerificationToken(verificationToken, candidateEmail)) {
            return NextResponse.json({ error: "Please verify your email with the code we sent before creating your store." }, { status: 403 });
          }
        }
      } else {
        if (requestedUserId && requestedUserId !== user.id) {
          return NextResponse.json({ error: "The requested user does not match the authenticated account." }, { status: 403 });
        }
        if (supabase) {
          try {
            const { data } = await supabase.from("stores")
              .select("id, name, slug, owner_email, plan, whatsapp_number")
              .or(`owner_id.eq.${user.id},user_id.eq.${user.id}`)
              .maybeSingle();
            targetStore = data;
          } catch {
            // Fallback
          }
        }
      }
    }
    if (requestedStoreId && requestedStoreId !== targetStore?.id) {
      return NextResponse.json({ error: "The requested store does not match the authenticated account." }, { status: 403 });
    }
    targetStoreId = targetStore?.id ?? null;

    if (targetStore && supabase) {
      const [productsResult, categoriesResult] = await Promise.all([
        supabase.from("store_products").select("id", { count: "exact", head: true }).eq("store_id", targetStore.id),
        supabase.from("store_categories").select("id", { count: "exact", head: true }).eq("store_id", targetStore.id),
      ]);
      if (productsResult.error) throw productsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      const hasCatalog = (productsResult.count ?? 0) > 0 || (categoriesResult.count ?? 0) > 0;
      if (hasCatalog) {
        // Clear previous catalog items so the new generation succeeds without duplication or blocking error
        try {
          await Promise.all([
            supabase.from("store_products").delete().eq("store_id", targetStore.id),
            supabase.from("store_categories").delete().eq("store_id", targetStore.id),
            supabase.from("products").delete().eq("store_id", targetStore.id),
          ]);
        } catch (delErr) {
          console.warn("Could not clear previous catalog in Supabase:", delErr);
        }
      }
    }

    const socialLinks = normalizeSocialLinks(input.social_links);
    const generationPrompt = requestedStoreName
      ? `Use this exact store name: ${requestedStoreName}\n\nStore request: ${prompt}`
      : prompt;
    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    let rawGenerated: unknown = null;
    if (openAiKey) {
      try {
        rawGenerated = await generateWithOpenAI(generationPrompt);
      } catch (openAiError) {
        console.warn("OpenAI store generation failed, falling back:", openAiError);
      }
    }
    if (!rawGenerated && geminiKey) {
      try {
        rawGenerated = await generateWithGemini(generationPrompt);
      } catch (geminiError) {
        console.warn("Gemini store generation failed, falling back:", geminiError);
      }
    }
    if (!rawGenerated) {
      const planValue = text(targetStore?.plan, 20).toLowerCase();
      const planCategory: 'free' | 'pro' | 'advanced' = planValue === 'pro' ? 'pro' : (planValue === 'business' || planValue === 'advance' || planValue === 'advanced') ? 'advanced' : 'free';
      const fallback = await generateStoreFromPrompt({
        prompt,
        plan: planCategory,
        selectedTheme: themeKey || requestedTheme,
        customStoreName: requestedStoreName,
        whatsappNumber: text(input.whatsapp_number, 40),
        ownerEmail: text(input.owner_email ?? input.email ?? targetStore?.owner_email ?? user?.email, 120),
        socialLinks,
      });
      rawGenerated = {
        store_name: fallback.name,
        slug: fallback.slug,
        theme_color: fallback.theme.primaryColor,
        selected_theme: fallback.theme.id,
        banner_text: fallback.header_title || fallback.tagline,
        footer_text: fallback.description,
        categories: fallback.categories,
        products: fallback.products.map((p) => ({
          name: p.name,
          price: p.price,
          description: p.description,
          category_name: p.category,
          image_url: p.image_url,
        })),
      };
    }

    const limits = planLimits(targetStore?.plan ?? "basic");
    const generated = normalizeGeneratedStore(rawGenerated, themeKey || requestedTheme, limits.categories, limits.products, requestedStoreName);
    const requestedWhatsapp = text(input.whatsapp_number, 50);

    let store = targetStore;
    let password_hash: string | null = null;
    if (!store) {
      const requestedSlug = slugify(text(input.slug, 80));
      const slug = await uniqueStoreSlug(supabase, requestedSlug || generated.slug);
      const merchantEmail = (user?.email || text(input.owner_email ?? input.email, 120)).toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(merchantEmail)) {
        throw new Error("A valid merchant email address is required to create a store.");
      }
      if (!user && typeof input.password === "string") {
        password_hash = await bcrypt.hash(input.password, 12);
      }
      const planToStore = "basic";

      if (supabase) {
        // Supabase is configured: a failed insert must surface (for example duplicate -> 409).
        const { data, error } = await supabase.from("stores").insert([{
          name: requestedStoreName || generated.store_name,
          slug,
          owner_id: user?.id ?? null,
          user_id: user?.id ?? null,
          owner_email: merchantEmail,
          password_hash,
          whatsapp_number: requestedWhatsapp || null,
          ...(text(input.owner_phone, 30) ? { owner_phone: text(input.owner_phone, 30) } : {}),
          plan: planToStore,
          selected_plan: selectedPlan,
          payment_status: "pending",
        }]).select("id, name, slug, owner_email, plan, whatsapp_number").single();
        if (error) throw error;
        store = data;
        createdStoreId = String(data.id);
        targetStoreId = String(data.id);
      } else {
        // Supabase is not configured (local development): use the local store repository.
        const fallbackStoreId = `store_${crypto.randomUUID().slice(0, 12)}`;
        store = {
          id: fallbackStoreId,
          name: requestedStoreName || generated.store_name,
          slug,
          owner_email: merchantEmail,
          plan: planToStore,
          whatsapp_number: requestedWhatsapp || null,
        };
        targetStoreId = fallbackStoreId;
      }
    }
    if (!store) throw new Error("Unable to resolve the store to generate.");
    let resolvedStore = store;

    if (requestedWhatsapp && targetStore && targetStore.whatsapp_number !== requestedWhatsapp) {
      if (supabase) {
        try {
          await supabase.from("stores").update({ whatsapp_number: requestedWhatsapp }).eq("id", resolvedStore.id);
        } catch {
          // Fallback
        }
      }
      resolvedStore.whatsapp_number = requestedWhatsapp;
    }

    if (supabase && createdStoreId) {
      try {
        const { data: categories } = await supabase.from("store_categories")
          .insert(generated.categories.map((name) => ({ store_id: resolvedStore.id, name })))
          .select("id, name");
        if (categories && categories.length > 0) {
          insertedCategoryIds = categories.map((category) => String(category.id));
          const categoryIds = new Map(categories.map((category) => [category.name.toLowerCase(), category.id]));
          const productRows = generated.products.map((product) => ({
            store_id: resolvedStore.id,
            category_id: categoryIds.get(product.category_name.toLowerCase()) ?? categories[0]?.id ?? null,
            name: product.name,
            price: product.price,
            description: product.description || null,
            image_url: product.image_url || null,
          }));
          const { data: insertedProducts } = await supabase.from("store_products").insert(productRows).select("id");
          if (insertedProducts) insertedProductIds = insertedProducts.map((p) => String(p.id));

          try {
            await supabase.from("products").insert(productRows.map((p) => ({
              store_id: p.store_id,
              name: p.name,
              price: p.price,
              description: p.description,
              image_url: p.image_url,
              category: categories.find((c) => c.id === p.category_id)?.name || null,
            })));
          } catch {
            // Legacy products table optional
          }
        }

        await supabase.from("store_settings").upsert([{
          store_id: resolvedStore.id,
          theme_color: generated.theme_color,
          selected_theme: generated.selected_theme,
          banner_text: generated.banner_text,
          footer_text: generated.footer_text,
          social_links: socialLinks,
          updated_at: new Date().toISOString(),
        }], { onConflict: "store_id" });

        if (targetStore && targetStore.name !== generated.store_name) {
          await supabase.from("stores").update({ name: generated.store_name }).eq("id", resolvedStore.id);
        }
      } catch (sbCatalogErr) {
        console.warn("Supabase catalog sync warning:", sbCatalogErr);
      }
    }

    try {
      await storeRepo.saveStore({
        id: resolvedStore.id,
        name: resolvedStore.name,
        slug: resolvedStore.slug,
        tagline: generated.banner_text,
        description: generated.footer_text,
        header_title: generated.banner_text,
        plan: (resolvedStore.plan === "pro" ? "pro" : resolvedStore.plan === "business" ? "advanced" : "free") as any,
        whatsapp_number: resolvedStore.whatsapp_number || requestedWhatsapp || "923001234567",
        owner_email: resolvedStore.owner_email || "merchant@buildexom.store",
        password_hash: password_hash || undefined,
        theme: {
          id: generated.selected_theme,
          name: generated.selected_theme,
          primaryColor: generated.theme_color,
          secondaryColor: "#0f172a",
          accentColor: "#10b981",
          textColor: "#1e293b",
          bgHero: "bg-gradient-to-br from-[#0f172a] to-[#1e293b]",
          cardBg: "bg-white",
          badgeStyle: "bg-emerald-100 text-emerald-800 border-emerald-200",
          fontVibe: "Inter, sans-serif"
        },
        categories: generated.categories,
        products: generated.products.map((p, idx) => ({
          id: `prod_${idx + 1}_${resolvedStore.id.slice(0, 6)}`,
          name: p.name,
          description: p.description,
          price: p.price,
          category: p.category_name,
          image_url: p.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
          stock_status: "in_stock",
          badge: idx === 0 ? "Bestseller" : "New",
        })),
        social_links: socialLinks,
        delivery: {
          store_city: "Lahore",
          city_rate: 200,
          other_city_rate: 350
        }
      });
    } catch (repoErr) {
      console.warn("storeRepo cache update:", repoErr);
    }

    const response = NextResponse.json({
      success: true,
      slug: resolvedStore.slug,
      store: {
        id: resolvedStore.id,
        name: resolvedStore.name,
        slug: resolvedStore.slug,
        plan: limits.plan,
        selected_plan: selectedPlan,
        payment_status: createdStoreId ? "pending" : undefined,
        whatsapp_number: resolvedStore.whatsapp_number,
      },
      theme_color: generated.theme_color,
      selected_theme: generated.selected_theme,
      banner_text: generated.banner_text,
      footer_text: generated.footer_text,
      social_links: socialLinks,
      preview: {
        store_name: generated.store_name,
        theme_color: generated.theme_color,
        banner_text: generated.banner_text,
        categories: generated.categories,
        products: generated.products,
      },
      product_count: generated.products.length,
      category_count: generated.categories.length,
      // storefront_url is kept as before so existing screens keep working.
      // store_url is the public subdomain address (falls back to the /store/<slug> path
      // when NEXT_PUBLIC_ROOT_DOMAIN is not set).
      storefront_url: `/store/${encodeURIComponent(resolvedStore.slug)}`,
      store_url: getStoreUrl(resolvedStore.slug),
      dashboard_url: `/merchant/${resolvedStore.slug}/dashboard`,
    }, { status: 201 });

    if (resolvedStore.owner_email) {
      const { token, maxAge } = createMerchantSession(String(resolvedStore.id), String(resolvedStore.slug), String(resolvedStore.owner_email));
      response.cookies.set(MERCHANT_SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge,
      });
    }

    return response;
  } catch (error) {
    if (createdStoreId && supabase) {
      try {
        await supabase.from("stores").delete().eq("id", createdStoreId);
      } catch {
        // Ignore
      }
    } else if (targetStoreId && supabase) {
      try {
        if (insertedProductIds.length) {
          await supabase.from("store_products").delete().in("id", insertedProductIds);
        }
        if (insertedCategoryIds.length) {
          await supabase.from("store_categories").delete().in("id", insertedCategoryIds);
        }
      } catch {
        // Ignore
      }
    }
    const message = error instanceof Error ? error.message : "Unable to generate your store.";
    const errorCode =
      typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
        ? error.code
        : "";
    if (errorCode === "23505") {
      return NextResponse.json({ error: "An account or store with these details already exists." }, { status: 409 });
    }
    const status = message.includes("API key is not configured") ? 503 : message.includes("invalid store") ? 422 : 400;
    console.error("AI store generation failed:", message);
    return NextResponse.json({ error: message }, { status });
  }
}