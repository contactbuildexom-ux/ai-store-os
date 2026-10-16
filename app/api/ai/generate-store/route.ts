import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin";
import { createMerchantSession, MERCHANT_SESSION_COOKIE, verifyMerchantSession } from "@/lib/merchant-session";
import { generateStoreFromPrompt } from "@/lib/ai/ai-generator";
import { storeRepo } from "@/lib/store-repository";

type GeneratedProduct = { name: string; price: number; description: string; category_name: string; image_url?: string | null };
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
    .slice(0, 70)
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
            "Create a concise, realistic starter storefront from the user's request.",
            "Return only a JSON object with fields: store_name (string), slug (URL-friendly string), theme_color (six-digit hex color), banner_text (string), footer_text (short brand-appropriate footer copy), categories (array of strings), products (array of objects with name, price, description, category_name).",
            "Generate 3 to 6 relevant categories and 6 to 10 plausible products. Product prices must be positive numbers in the local currency, with no currency symbols. Every product category_name must match one of the categories exactly.",
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
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{
        role: "user",
        parts: [{
          text: [
            "Create a concise, realistic starter storefront from this request. Return only valid JSON with fields: store_name (string), slug (URL-friendly string), theme_color (six-digit hex color), banner_text (string), footer_text (short brand-appropriate footer copy), categories (array of strings), products (array of objects with name, price, description, category_name). Generate relevant categories and plausible products. Prices must be positive numbers without currency symbols. Each product category_name must exactly match one category. Do not add markdown or extra properties.",
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

function normalizeGeneratedStore(value: unknown, requestedTheme = "", categoryLimit = 20, productLimit = 50): GeneratedStore {
  if (!value || typeof value !== "object") throw new Error("The AI returned invalid store data.");
  const source = value as Record<string, unknown>;
  const storeName = text(source.store_name, 100);
  const slug = slugify(text(source.slug, 100) || storeName);
  if (storeName.length < 2 || !slug) throw new Error("The AI could not create a valid store name.");

  const rawCategories = Array.isArray(source.categories) ? source.categories : [];
  let categories = [...new Set(rawCategories.map((item) => text(item, 60)).filter(Boolean))].slice(0, 20);
  const rawProducts = Array.isArray(source.products) ? source.products : [];
  const products: GeneratedProduct[] = rawProducts.slice(0, productLimit).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const product = item as Record<string, unknown>;
    const name = text(product.name, 100);
    const price = Number(product.price);
    if (!name || !Number.isFinite(price) || price < 0) return [];
    return [{
      name,
      price: Math.round(price * 100) / 100,
      description: text(product.description, 500),
      category_name: text(product.category_name, 60),
      image_url: text(product.image_url, 1000) || null,
    }];
  });

  if (!products.length) throw new Error("The AI did not return any valid products. Please try a more specific prompt.");
  categories = categories.slice(0, categoryLimit);
  for (const product of products) {
    if (product.category_name && !categories.some((category) => category.toLowerCase() === product.category_name.toLowerCase())) {
      if (categories.length >= categoryLimit) product.category_name = categories[0];
      else categories.push(product.category_name);
    }
  }
  if (!categories.length) categories.push("Featured");
  for (const product of products) {
    if (!product.category_name) product.category_name = categories[0];
    const matchingCategory = categories.find((category) => category.toLowerCase() === product.category_name.toLowerCase());
    product.category_name = matchingCategory ?? categories[0];
  }

  const themePresets: Record<string, string> = {
    emerald: "#1d7555",
    ocean: "#2563eb",
    rose: "#be185d",
    midnight: "#0f172a",
    amber: "#b45309",
    violet: "#6d28d9",
    fashion: "#4338ca",
    "home-decor": "#b45309",
    electronics: "#1e40af",
    beauty: "#be185d",
  };
  const requestedColor = /^#[0-9a-f]{6}$/i.test(requestedTheme)
    ? requestedTheme
    : themePresets[requestedTheme.toLowerCase()];
  const themeColor = requestedColor || text(source.theme_color, 20);
  return {
    store_name: storeName,
    slug,
    theme_color: /^#[0-9a-f]{6}$/i.test(themeColor) ? themeColor : "#1d7555",
    selected_theme: requestedTheme || "emerald",
    banner_text: text(source.banner_text, 160) || `Welcome to ${storeName}`,
    footer_text: text(source.footer_text, 500) || `Thank you for visiting ${storeName}.`,
    categories,
    products,
  };
}

function normalizeSocialLinks(value: unknown) {
  const keys = ["instagram", "facebook", "youtube", "tiktok", "x"] as const;
  const source = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const links: Record<string, string> = {};
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
  if (plan === "pro") return { plan: "pro", categories: 5, products: 75 };
  if (plan === "business") return { plan: "business", categories: 20, products: 50 };
  return { plan: "basic", categories: 2, products: 20 };
}

async function uniqueStoreSlug(supabase: NonNullable<ReturnType<typeof createAdminClient>>, requestedSlug: string) {
  const { data, error } = await supabase.from("stores").select("id").ilike("slug", requestedSlug).maybeSingle();
  if (error) throw error;
  return data ? `${requestedSlug.slice(0, 61)}-${crypto.randomUUID().slice(0, 8)}` : requestedSlug;
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Store database is not configured." }, { status: 503 });
  }

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
    const prompt = text(input.prompt, 2000);
    const requestedUserId = text(input.user_id, 100);
    const requestedStoreId = text(input.store_id, 100);
    const requestedTheme = text(input.theme ?? input.selected_theme ?? "", 40);
    if (prompt.length < 8) {
      return NextResponse.json({ error: "Enter a store description with at least 8 characters." }, { status: 400 });
    }
    const themeKey = requestedTheme.toLowerCase().replace(/\s+/g, "-");
    const supportedThemes = new Set(["", "emerald", "ocean", "rose", "midnight", "amber", "violet", "fashion", "home-decor", "electronics", "beauty"]);
    if (requestedTheme && !/^#[0-9a-f]{6}$/i.test(requestedTheme) && !supportedThemes.has(themeKey)) {
      return NextResponse.json({ error: "Choose a supported theme preset or provide a six-digit hex color." }, { status: 400 });
    }
    const cookieStore = await cookies();
    const merchantSession = verifyMerchantSession(cookieStore.get(MERCHANT_SESSION_COOKIE)?.value);
    let user = null;
    let targetStore: { id: string; name: string; slug: string; owner_email: string | null; plan: string | null; whatsapp_number?: string | null } | null = null;
    if (merchantSession) {
      const { data, error } = await supabase.from("stores")
        .select("id, name, slug, owner_email, plan, whatsapp_number")
        .eq("id", merchantSession.storeId)
        .maybeSingle();
      if (error) throw error;
      if (!data || String(data.owner_email ?? "").toLowerCase() !== merchantSession.email.toLowerCase()) {
        return NextResponse.json({ error: "Merchant session is no longer linked to a store." }, { status: 401 });
      }
      targetStore = data;
    } else {
      user = await getAuthenticatedUser(request, supabase);
      if (!user) {
        // Direct merchant creation or API call with owner_email
        const candidateEmail = text(input.owner_email ?? input.email, 120);
        if (candidateEmail) {
          const { data } = await supabase.from("stores")
            .select("id, name, slug, owner_email, plan, whatsapp_number")
            .eq("owner_email", candidateEmail.toLowerCase())
            .maybeSingle();
          targetStore = data;
        }
      } else {
        if (requestedUserId && requestedUserId !== user.id) {
          return NextResponse.json({ error: "The requested user does not match the authenticated account." }, { status: 403 });
        }
        const { data, error } = await supabase.from("stores")
          .select("id, name, slug, owner_email, plan, whatsapp_number")
          .or(`owner_id.eq.${user.id},user_id.eq.${user.id}`)
          .maybeSingle();
        if (error) throw error;
        targetStore = data;
      }
    }
    if (requestedStoreId && requestedStoreId !== targetStore?.id) {
      return NextResponse.json({ error: "The requested store does not match the authenticated account." }, { status: 403 });
    }
    targetStoreId = targetStore?.id ?? null;

    if (targetStore) {
      const [productsResult, categoriesResult] = await Promise.all([
        supabase.from("store_products").select("id", { count: "exact", head: true }).eq("store_id", targetStore.id),
        supabase.from("store_categories").select("id", { count: "exact", head: true }).eq("store_id", targetStore.id),
      ]);
      if (productsResult.error) throw productsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      if ((productsResult.count ?? 0) > 0 || (categoriesResult.count ?? 0) > 0) {
        return NextResponse.json({ error: "This store already has catalog data. Generation will not overwrite it.", store: { id: targetStore.id, slug: targetStore.slug } }, { status: 409 });
      }
    }

    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    let rawGenerated: unknown = null;
    if (openAiKey) {
      try {
        rawGenerated = await generateWithOpenAI(prompt);
      } catch (openAiError) {
        console.warn("OpenAI store generation failed, falling back:", openAiError);
      }
    }
    if (!rawGenerated && geminiKey) {
      try {
        rawGenerated = await generateWithGemini(prompt);
      } catch (geminiError) {
        console.warn("Gemini store generation failed, falling back:", geminiError);
      }
    }
    if (!rawGenerated) {
      const planValue = text(input.plan ?? targetStore?.plan, 20).toLowerCase();
      const planCategory: 'free' | 'pro' | 'advanced' = planValue === 'pro' ? 'pro' : (planValue === 'business' || planValue === 'advance' || planValue === 'advanced') ? 'advanced' : 'free';
      const fallback = await generateStoreFromPrompt({
        prompt,
        plan: planCategory,
        selectedTheme: themeKey || requestedTheme,
        customStoreName: text(input.name ?? input.store_name, 100),
        whatsappNumber: text(input.whatsapp_number, 40),
        ownerEmail: text(input.owner_email ?? input.email ?? targetStore?.owner_email, 120),
        socialLinks: typeof input.social_links === 'object' ? input.social_links as any : {},
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

    const limits = planLimits(targetStore?.plan ?? input.plan);
    const generated = normalizeGeneratedStore(rawGenerated, themeKey || requestedTheme, limits.categories, limits.products);
    const socialLinks = normalizeSocialLinks(input.social_links);
    const requestedWhatsapp = text(input.whatsapp_number, 50);

    let store = targetStore;
    if (!store) {
      const slug = await uniqueStoreSlug(supabase, text(input.slug, 80) || generated.slug);
      const merchantEmail = text(input.owner_email ?? input.email, 120) || user?.email || `merchant-${slug.slice(0, 8)}@buildexom.store`;
      let password_hash: string | null = null;
      if (input.password && typeof input.password === 'string' && input.password.length >= 6) {
        password_hash = await bcrypt.hash(input.password, 12);
      } else if (input.password_hash && typeof input.password_hash === 'string') {
        password_hash = input.password_hash;
      }
      const requestedPlan = text(input.plan, 20).toLowerCase();
      const planToStore = requestedPlan === "pro" ? "pro" : (requestedPlan === "business" || requestedPlan === "advanced" || requestedPlan === "advance") ? "business" : "basic";

      const { data, error } = await supabase.from("stores").insert([{
        name: text(input.name ?? input.store_name, 100) || generated.store_name,
        slug,
        owner_id: user?.id ?? null,
        user_id: user?.id ?? null,
        owner_email: merchantEmail,
        password_hash,
        whatsapp_number: requestedWhatsapp || null,
        plan: planToStore,
        selected_plan: requestedPlan || "basic",
        payment_status: "pending",
      }]).select("id, name, slug, owner_email, plan, whatsapp_number").single();
      if (error) throw error;
      store = data;
      createdStoreId = String(data.id);
      targetStoreId = String(data.id);
    }
    if (!store) throw new Error("Unable to resolve the store to generate.");
    let resolvedStore = store;

    if (requestedWhatsapp && targetStore && targetStore.whatsapp_number !== requestedWhatsapp) {
      await supabase.from("stores").update({ whatsapp_number: requestedWhatsapp }).eq("id", resolvedStore.id);
      resolvedStore.whatsapp_number = requestedWhatsapp;
    }

    const { data: categories, error: categoryError } = await supabase.from("store_categories")
      .insert(generated.categories.map((name) => ({ store_id: resolvedStore.id, name })))
      .select("id, name");
    if (categoryError) throw categoryError;
    insertedCategoryIds = (categories ?? []).map((category) => String(category.id));

    const categoryIds = new Map((categories ?? []).map((category) => [category.name.toLowerCase(), category.id]));
    const productRows = generated.products.map((product) => ({
      store_id: resolvedStore.id,
      category_id: categoryIds.get(product.category_name.toLowerCase()) ?? categories?.[0]?.id ?? null,
      name: product.name,
      price: product.price,
      description: product.description || null,
      image_url: product.image_url || null,
    }));
    const { data: insertedProducts, error: productsError } = await supabase.from("store_products").insert(productRows).select("id");
    if (productsError) throw productsError;
    insertedProductIds = (insertedProducts ?? []).map((product) => String(product.id));

    try {
      await supabase.from("products").insert(productRows.map((p) => ({
        store_id: p.store_id,
        name: p.name,
        price: p.price,
        description: p.description,
        image_url: p.image_url,
        category: categories?.find((c) => c.id === p.category_id)?.name || null,
      })));
    } catch {
      // Legacy products table optional
    }

    const { error: settingsError } = await supabase.from("store_settings").upsert([{
      store_id: resolvedStore.id,
      theme_color: generated.theme_color,
      selected_theme: generated.selected_theme,
      banner_text: generated.banner_text,
      footer_text: generated.footer_text,
      social_links: socialLinks,
      updated_at: new Date().toISOString(),
    }], { onConflict: "store_id" });
    if (settingsError) throw settingsError;

    if (targetStore && targetStore.name !== generated.store_name) {
      const { error: storeUpdateError } = await supabase.from("stores").update({ name: generated.store_name }).eq("id", resolvedStore.id);
      if (storeUpdateError) throw storeUpdateError;
      resolvedStore = { ...resolvedStore, name: generated.store_name };
    }

    try {
      await storeRepo.saveStore({
        name: resolvedStore.name,
        slug: resolvedStore.slug,
        tagline: generated.banner_text,
        description: generated.footer_text,
        header_title: generated.banner_text,
        plan: (resolvedStore.plan === "pro" ? "pro" : resolvedStore.plan === "business" ? "advanced" : "free") as any,
        whatsapp_number: resolvedStore.whatsapp_number || requestedWhatsapp || "923001234567",
        owner_email: resolvedStore.owner_email || "merchant@buildexom.store",
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
      store: { id: resolvedStore.id, name: resolvedStore.name, slug: resolvedStore.slug, plan: limits.plan, whatsapp_number: resolvedStore.whatsapp_number },
      theme_color: generated.theme_color,
      selected_theme: generated.selected_theme,
      banner_text: generated.banner_text,
      footer_text: generated.footer_text,
      social_links: socialLinks,
      product_count: generated.products.length,
      category_count: generated.categories.length,
      storefront_url: `/store/${encodeURIComponent(resolvedStore.slug)}`,
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
    if (createdStoreId) {
      const { error: cleanupError } = await supabase.from("stores").delete().eq("id", createdStoreId);
      if (cleanupError) console.error("Unable to clean up incomplete generated store:", cleanupError.message);
    } else if (targetStoreId) {
      if (insertedProductIds.length) {
        const { error: productCleanupError } = await supabase.from("store_products").delete().in("id", insertedProductIds);
        if (productCleanupError) console.error("Unable to clean up generated products:", productCleanupError.message);
      }
      if (insertedCategoryIds.length) {
        const { error: categoryCleanupError } = await supabase.from("store_categories").delete().in("id", insertedCategoryIds);
        if (categoryCleanupError) console.error("Unable to clean up generated categories:", categoryCleanupError.message);
      }
    }
    const message = error instanceof Error ? error.message : "Unable to generate your store.";
    const status = message.includes("API key is not configured") ? 503 : message.includes("invalid store") ? 422 : 500;
    console.error("AI store generation failed:", message);
    return NextResponse.json({ error: status === 500 ? "Unable to generate your store. Please try again." : message }, { status });
  }
}
