import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin";
import { createMerchantSession, MERCHANT_SESSION_COOKIE, verifyMerchantSession } from "@/lib/merchant-session";
import { generateStoreFromPrompt, detectNiche, NICHE_IMAGES } from "@/lib/ai/ai-generator";
import { storeRepo } from "@/lib/store-repository";
import { NICHE_HERO_ASSETS } from "@/lib/ai/hero-niche-resolver";
import { verifyEmailVerificationToken } from "@/lib/email-otp";
import { EMAIL_OTP_REQUIRED } from "@/lib/email-otp-config";
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

// Payment screenshot arrives as a base64 data URL (a 2 MB image is about 2.8M characters).
const MAX_SCREENSHOT_CHARS = 3_000_000;

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
            "Return only a JSON object with fields: store_name (string), slug (URL-friendly string), theme_color (six-digit hex color), banner_text (string), footer_text (short brand-appropriate footer copy), categories (array of strings).",
            "Generate 4 to 6 relevant categories based strictly on the user's store idea. Do not generate products; slots will be empty for the merchant to upload authentic products.",
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
            "Create a comprehensive, realistic starter storefront from this request. Return only valid JSON with fields: store_name (string), slug (URL-friendly string), theme_color (six-digit hex color), banner_text (string), footer_text (short brand-appropriate footer copy), categories (array of strings). Generate 4 to 6 relevant categories based strictly on the store idea. Do not generate products; product slots remain empty for the merchant to upload authentic inventory. Do not add markdown or extra properties.",
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
  niche = "clothing"
): GeneratedStore {
  if (!value || typeof value !== "object") throw new Error("The AI returned invalid store data.");
  const source = value as Record<string, unknown>;
  const rawReqName = text(requestedName, 100).replace(/^welcome\s+to\s+/i, "").trim();
  const rawSrcName = text(source.store_name, 100).replace(/^welcome\s+to\s+/i, "").trim();
  const storeName = rawReqName || rawSrcName || "My Store";
  const slug = slugify(text(requestedName, 100) || text(source.slug, 100) || storeName);
  if (storeName.length < 2 || !slug) throw new Error("The AI could not create a valid store name.");

  const nicheCatalog = (NICHE_IMAGES as Record<string, any>)[niche] || (NICHE_IMAGES as Record<string, any>).clothing;
  const nicheImgs: string[] = nicheCatalog?.images || [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80"
  ];

  const rawCategories = Array.isArray(source.categories) ? source.categories : [];
  let categories = categoryLimit === 0 ? [] : [...new Set(rawCategories.map((item) => text(item, 60)).filter(Boolean))].slice(0, categoryLimit);
  if (categoryLimit > 0 && !categories.length) {
    categories = (nicheCatalog?.categories || ["Featured", "Best Sellers", "New Arrivals", "Trending"]).slice(0, categoryLimit);
  }

  // User explicitly requested: AI must NOT generate dummy products into the store catalog at creation.
  // The catalog must start with empty slots ready for the merchant to add authentic products personally from the Merchant Dashboard.
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
    banner_text: (rawReqName && (!source.banner_text || String(source.banner_text).toLowerCase().includes("welcome"))) ? `Welcome to ${storeName}` : (text(source.banner_text, 160) || `Welcome to ${storeName}`),
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
  if (plan === "pro") return { plan: "pro", categories: 5, products: 75 };
  if (plan === "business" || plan === "advanced" || plan === "advance") return { plan: "business", categories: 20, products: 100 };
  return { plan: "basic", categories: 0, products: 20 };
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
  let input: Record<string, unknown> = {};
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
    input = body as Record<string, unknown>;
    const rawPrompt = typeof input.prompt === "string" ? input.prompt.trim() : "";
    if (rawPrompt.length > 2000) {
      return NextResponse.json({ error: "Enter a store description of no more than 2,000 characters." }, { status: 400 });
    }
    const rawReqName = text(input.name ?? input.store_name, 100);
    const requestedStoreName = rawReqName.replace(/^welcome\s+to\s+/i, "").trim();
    const prompt = rawPrompt.length >= 8
      ? rawPrompt
      : `A modern e-commerce storefront for ${requestedStoreName || "My Online Store"} featuring quality products and nationwide cash on delivery.`;
    const requestedUserId = text(input.user_id, 100);
    const requestedStoreId = text(input.store_id, 100);
    const requestedTheme = text(input.theme ?? input.selected_theme ?? "", 40);
    const requestedNiche = text(input.niche, 40).toLowerCase();
    const requestedPlan = text(input.plan, 20).toLowerCase();
    const isMerchantRegistration =
      input.registration === "merchant" ||
      (typeof input.password === "string" && Boolean(input.owner_email ?? input.email));
    if (requestedPlan && !["basic", "free", "pro", "business", "advanced", "advance"].includes(requestedPlan)) {
      return NextResponse.json({ error: "Choose a supported store plan." }, { status: 400 });
    }
    const selectedPlan = requestedPlan === "pro"
      ? "pro"
      : ["business", "advanced", "advance"].includes(requestedPlan)
        ? "business"
        : "basic";
    const isPaidPlan = selectedPlan === "pro" || selectedPlan === "business";
    const paymentMethodInput = text(input.payment_method, 50).toLowerCase();
    const paymentMethod = paymentMethodInput === "easypaisa" ? "easypaisa" : "jazzcash";
    const senderName = text(input.sender_name, 120);
    const senderNumber = text(input.sender_number, 50);
    const transactionId = text(input.transaction_id, 200);
    const screenshotBase64 = typeof input.screenshot_base64 === "string" ? input.screenshot_base64 : "";

    // A new merchant signing up for a paid plan must send complete payment details.
    // (The modal checks this too, but the server must never trust the browser.)
    if (isPaidPlan && isMerchantRegistration) {
      const senderDigits = senderNumber.replace(/\D/g, "");
      if (senderName.length < 3) {
        return NextResponse.json({ error: "Enter the account title (name) of the account you paid from." }, { status: 400 });
      }
      if (senderDigits.length < 10 || senderDigits.length > 13) {
        return NextResponse.json({ error: "Enter a valid sender mobile / account number." }, { status: 400 });
      }
      if (!/^[A-Za-z0-9]{6,40}$/.test(transactionId)) {
        return NextResponse.json({ error: "Enter the Transaction ID from your payment message (letters and numbers only, at least 6 characters)." }, { status: 400 });
      }
      if (screenshotBase64) {
        if (!/^data:image\/(jpeg|png|webp|gif);base64,/i.test(screenshotBase64)) {
          return NextResponse.json({ error: "The payment screenshot must be a JPG, PNG, WEBP or GIF image." }, { status: 400 });
        }
        if (screenshotBase64.length > MAX_SCREENSHOT_CHARS) {
          return NextResponse.json({ error: "The payment screenshot is too large. Please upload an image smaller than 2 MB." }, { status: 400 });
        }
      }
      // The same Transaction ID must not be used for two different stores (best-effort check).
      if (supabase) {
        try {
          const { data: duplicatePayments, error: duplicateError } = await supabase
            .from("stores")
            .select("id")
            .filter("payment_details->pending_upgrade->>transaction_id", "eq", transactionId)
            .limit(1);
          if (!duplicateError && duplicatePayments && duplicatePayments.length > 0) {
            return NextResponse.json({ error: "This Transaction ID has already been used. Please enter the Transaction ID of your own payment." }, { status: 409 });
          }
        } catch {
          // Ignore: the duplicate check is best-effort
        }
      }
    }

    const pendingUpgradeData = isPaidPlan ? {
      target_plan: selectedPlan,
      payment_method: paymentMethod,
      sender_name: senderName,
      sender_number: senderNumber,
      transaction_id: transactionId,
      screenshot_url: screenshotBase64 || "",
      amount: selectedPlan === "business" ? 4999 : 2499,
      submitted_at: new Date().toISOString(),
      status: "pending_approval",
    } : null;
    const rawThemeInput = text(input.theme ?? input.selected_theme ?? "", 60);
    const themeKey = rawThemeInput.toLowerCase().replace(/\s+/g, "-");
    const cookieStore = await cookies();
    const merchantSession = verifyMerchantSession(cookieStore.get(MERCHANT_SESSION_COOKIE)?.value);
    let user = null;
    let targetStore: { id: string; name: string; slug: string; owner_email: string | null; plan: string | null; whatsapp_number?: string | null } | null = null;
    // Only bind to targetStore if requestedStoreId is explicitly passed and this is NOT a new store registration
    if (requestedStoreId && !isMerchantRegistration) {
      if (merchantSession && supabase) {
        try {
          const { data, error } = await supabase.from("stores")
            .select("id, name, slug, owner_email, plan, whatsapp_number")
            .eq("id", requestedStoreId)
            .maybeSingle();
          if (!error && data) {
            targetStore = data;
          }
        } catch {
          // Fallback
        }
      }
      if (!targetStore) {
        const repoStore = await storeRepo.getStore(requestedStoreId);
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
    }
    if (!isMerchantRegistration && !merchantSession && supabase) {
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
        if (EMAIL_OTP_REQUIRED) {
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
    const targetNiche = detectNiche(prompt, requestedNiche, requestedStoreName);
    const heroAssetForRepo = (NICHE_HERO_ASSETS as Record<string, any>)[targetNiche] || NICHE_HERO_ASSETS.eyewear;
    const resolvedHeroImagesForRepo = [heroAssetForRepo.image, heroAssetForRepo.secondaryImage, heroAssetForRepo.tertiaryImage];
    const generationPrompt = [
      requestedStoreName ? `Use this exact store name: "${requestedStoreName}".` : "",
      targetNiche ? `Store Niche: "${targetNiche}". The store must specialize STRICTLY in this niche. All product names, descriptions, categories, banner text, and footer text must be exclusively for "${targetNiche}". Do not generate products outside of this niche.` : "",
      `Store request details: ${prompt}`
    ].filter(Boolean).join("\n\n");
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
      const planValue = text(targetStore?.plan ?? selectedPlan, 20).toLowerCase();
      const planCategory: 'free' | 'pro' | 'advanced' = planValue === 'pro' ? 'pro' : (planValue === 'business' || planValue === 'advance' || planValue === 'advanced') ? 'advanced' : 'free';
      const fallback = await generateStoreFromPrompt({
        prompt,
        niche: requestedNiche || targetNiche || undefined,
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
        products: [], // AI must NOT generate products; only slots are available
      };
    }

    // For new stores, initial generation limits follow basic plan (0 categories, 20 products) until payment approval
    const effectivePlanForCatalog = targetStore ? (targetStore.plan || "basic") : "basic";
    const limits = planLimits(effectivePlanForCatalog);
    const generated = normalizeGeneratedStore(rawGenerated, themeKey || requestedTheme, limits.categories, limits.products, requestedStoreName, targetNiche);
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
      const requestedPlan = text(input.plan ?? input.selected_plan, 20).toLowerCase();
      const normalizedPlan = (requestedPlan === "business" || requestedPlan === "advanced" || requestedPlan === "advance") 
        ? "business" 
        : requestedPlan === "pro" 
          ? "pro" 
          : "basic";
      const isPaidPlan = normalizedPlan === "pro" || normalizedPlan === "business";
      // Active plan must be "basic" until payment is approved by superadmin
      const planToStore = "basic";
      const selectedPlanToStore = normalizedPlan;

      const heroAssetForRepo = (NICHE_HERO_ASSETS as Record<string, any>)[targetNiche] || NICHE_HERO_ASSETS.eyewear;
      const resolvedHeroImagesForRepo = [heroAssetForRepo.image, heroAssetForRepo.secondaryImage, heroAssetForRepo.tertiaryImage];

      if (supabase) {
        // Supabase is configured: attempt robust insertion with automatic fallback
        let insertData: any = null;
        try {
          const attempt1 = await supabase.from("stores").insert([{
            name: requestedStoreName || generated.store_name,
            slug,
            owner_id: user?.id ?? null,
            user_id: user?.id ?? null,
            owner_email: merchantEmail,
            password_hash,
            whatsapp_number: requestedWhatsapp || null,
            plan: planToStore,
            selected_plan: selectedPlanToStore,
            payment_status: isPaidPlan ? "pending_approval" : "active",
            payment_details: { ...(pendingUpgradeData ? { pending_upgrade: pendingUpgradeData } : {}), niche: targetNiche, hero_images: resolvedHeroImagesForRepo },
            is_verified: false,
            verification_status: "pending",
            primary_color: generated.theme_color,
            selected_theme: generated.selected_theme,
          }]).select("id, name, slug, owner_email, plan, whatsapp_number").single();

          if (!attempt1.error && attempt1.data) {
            insertData = attempt1.data;
          } else {
            console.warn("Full stores insert returned error, trying minimal columns:", attempt1.error);
            // A paid signup must never fall back to the minimal insert: it would create the
            // store but silently drop the payment details the merchant just submitted.
            if (isPaidPlan) {
              throw attempt1.error ?? new Error("Unable to save the store and payment details.");
            }
            const attempt2 = await supabase.from("stores").insert([{
              name: requestedStoreName || generated.store_name,
              slug,
              owner_id: user?.id ?? null,
              user_id: user?.id ?? null,
              owner_email: merchantEmail,
              password_hash,
              whatsapp_number: requestedWhatsapp || null,
              plan: planToStore,
            }]).select("id, name, slug, owner_email, plan, whatsapp_number").single();
            if (!attempt2.error && attempt2.data) {
              insertData = attempt2.data;
            } else if (attempt1.error && String(attempt1.error.code) === '23505') {
              throw attempt1.error;
            }
          }
        } catch (dbErr: any) {
          if (dbErr && String(dbErr.code) === '23505') throw dbErr;
          // Paid signup: do not fall back to a local-only store, report the failure instead
          if (isPaidPlan) throw dbErr;
          console.warn("Supabase store insertion fallback to local repo:", dbErr);
        }

        if (insertData) {
          createdStoreId = String(insertData.id);
          targetStoreId = String(insertData.id);
          store = insertData;

          // Non-fatal auxiliary merchants table upsert
          try {
            await supabase.from("merchants").upsert({
              store_id: insertData.id,
              name: insertData.name,
              email: merchantEmail,
              whatsapp_number: requestedWhatsapp || "",
              address: "",
              contact_phone: text(input.owner_phone, 30) || requestedWhatsapp || null,
            }, { onConflict: "store_id" });
          } catch (mErr) {
            console.warn("Merchants table upsert warning (non-fatal):", mErr);
          }
        }
      }

      if (!store) {
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
        if (generated.categories.length > 0) {
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
        } else if (generated.products.length > 0) {
          const productRows = generated.products.map((product) => ({
            store_id: resolvedStore.id,
            category_id: null,
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
              category: null,
            })));
          } catch {}
        }

        const heroAsset = (NICHE_HERO_ASSETS as Record<string, any>)[targetNiche] || NICHE_HERO_ASSETS.eyewear;
        const resolvedHeroImages = [heroAsset.image, heroAsset.secondaryImage, heroAsset.tertiaryImage];

        await supabase.from("store_settings").upsert([{
          store_id: resolvedStore.id,
          theme_color: generated.theme_color,
          selected_theme: generated.selected_theme,
          banner_text: generated.banner_text,
          footer_text: generated.footer_text,
          hero_images: resolvedHeroImages,
          social_links: socialLinks,
          updated_at: new Date().toISOString(),
        }], { onConflict: "store_id" });

        await supabase.from("stores").update({
          tagline: generated.banner_text,
          description: generated.footer_text,
        }).eq("id", resolvedStore.id);

        const storeSyncPayload: Record<string, any> = {
          primary_color: generated.theme_color,
          selected_theme: generated.selected_theme,
        };
        if (targetStore && targetStore.name !== generated.store_name) {
          storeSyncPayload.name = generated.store_name;
        }
        await supabase.from("stores").update(storeSyncPayload).eq("id", resolvedStore.id);
      } catch (sbCatalogErr) {
        console.warn("Supabase catalog sync warning:", sbCatalogErr);
      }
    }

    // The active plan stays on the store's real plan (basic for a new paid signup) until the
    // admin approves the payment. The plan the merchant asked for is kept in selected_plan.
    const activeRepoPlan = (() => {
      const activePlan = text(resolvedStore.plan, 20).toLowerCase();
      if (activePlan === "pro") return "pro";
      if (activePlan === "business" || activePlan === "advanced" || activePlan === "advance") return "advanced";
      return "basic";
    })();

    try {
      await storeRepo.saveStore({
        id: resolvedStore.id,
        name: resolvedStore.name,
        slug: resolvedStore.slug,
        niche: targetNiche,
        tagline: generated.banner_text,
        description: generated.footer_text,
        header_title: generated.banner_text,
        hero_images: resolvedHeroImagesForRepo,
        plan: activeRepoPlan as any,
        selected_plan: selectedPlan,
        payment_status: isPaidPlan ? "pending_approval" : "active",
        payment_details: pendingUpgradeData ? { pending_upgrade: pendingUpgradeData } : {},
        is_verified: false,
        verification_status: 'pending',
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
        niche: targetNiche,
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

    // Merchant must sign in with email and password to access dashboard
    response.cookies.set(MERCHANT_SESSION_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("AI store generation encountered error, initiating bulletproof auto-recovery:", error);

    // A new merchant who submitted a paid-plan payment must not get a "recovered" local store:
    // that store would not carry the payment details and could end up on a paid plan for free.
    const failedPlan = text(input?.plan ?? input?.selected_plan, 20).toLowerCase();
    if (input?.registration === "merchant" && ["pro", "business", "advanced", "advance"].includes(failedPlan)) {
      return NextResponse.json(
        { error: "We could not save your store and payment details. Please try again. If you already sent the payment, keep your Transaction ID and contact support." },
        { status: 500 }
      );
    }

    try {
      const rawPrompt = typeof input?.prompt === "string" ? input.prompt.trim() : "";
      const requestedStoreName = text(input?.name ?? input?.store_name, 100) || "My Online Store";
      const prompt = rawPrompt.length >= 8
        ? rawPrompt
        : `A modern e-commerce storefront for ${requestedStoreName} featuring quality products and nationwide cash on delivery.`;
      const requestedNiche = text(input?.niche, 40).toLowerCase();
      const detectedNiche = detectNiche(prompt, requestedNiche, requestedStoreName);
      const requestedPlan = text(input?.plan ?? input?.selected_plan, 20).toLowerCase();
      const planCategory: 'free' | 'pro' | 'advanced' = requestedPlan === 'pro' ? 'pro' : (requestedPlan === 'business' || requestedPlan === 'advance' || requestedPlan === 'advanced') ? 'advanced' : 'free';
      const merchantEmail = text(input?.owner_email ?? input?.email, 120).toLowerCase() || `merchant_${Date.now()}@buildexom.store`;
      const requestedWhatsapp = text(input?.whatsapp_number, 50) || "923001234567";

      let password_hash: string | undefined = undefined;
      if (typeof input?.password === "string" && input.password.length >= 8) {
        try {
          password_hash = await bcrypt.hash(input.password, 10);
        } catch {}
      }

      const emergencyStore = await generateStoreFromPrompt({
        prompt,
        niche: detectedNiche,
        plan: planCategory,
        customStoreName: requestedStoreName,
        whatsappNumber: requestedWhatsapp,
        ownerEmail: merchantEmail,
      });

      if (password_hash) {
        (emergencyStore as any).password_hash = password_hash;
      }

      const saved = await storeRepo.saveStore(emergencyStore);
      const response = NextResponse.json({
        success: true,
        slug: saved.slug,
        store: {
          id: saved.id,
          name: saved.name,
          slug: saved.slug,
          plan: saved.plan,
          whatsapp_number: saved.whatsapp_number,
        },
        theme_color: saved.primary_color,
        selected_theme: saved.selected_theme,
        banner_text: saved.header_title || saved.tagline,
        footer_text: saved.description,
        storefront_url: `/store/${encodeURIComponent(saved.slug)}`,
        store_url: getStoreUrl(saved.slug),
        dashboard_url: `/merchant/${saved.slug}/dashboard`,
      }, { status: 201 });

      response.cookies.set(MERCHANT_SESSION_COOKIE, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
      });

      return response;
    } catch (fatalErr) {
      console.error("Fatal emergency recovery failed:", fatalErr);
      return NextResponse.json({ error: "Unable to generate your store. Please try again." }, { status: 500 });
    }
  }
}