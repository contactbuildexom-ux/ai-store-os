import { notFound } from 'next/navigation';
import StorefrontClient from './StorefrontClient';
import { createAdminClient } from '@/lib/supabase/admin';
import { storeRepo } from '@/lib/store-repository';
import { THEME_PALETTES, getStoreNicheColor } from '@/lib/store-theme';
import { fetchStoreByIdOrSlug } from '@/lib/store-id-slug';

export default async function PublicStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const rawSupabase = createAdminClient();
  const isSupabaseValid = rawSupabase && process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-project') && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project');
  const supabase = isSupabaseValid ? rawSupabase : null;

  let store: any = null;
  let settingsData: any = null;
  let products: any[] = [];
  let deliveryData: any = null;
  let paymentMethods: any[] = [];

  if (supabase) {
    try {
      const { data: dbStore } = await fetchStoreByIdOrSlug(
        supabase,
        slug,
        'id, name, slug, plan, selected_plan, payment_status, whatsapp_number, primary_color, selected_theme, accepts_cod, accepts_advance, advance_percentage, payment_details, tagline, description'
      );
      store = dbStore;
    } catch (e) {
      console.warn("Supabase fetch store warning:", e);
    }
  }

  if (store && supabase) {
    try {
      const [settingsResult, builderProducts, legacyProducts, deliveryResult, paymentResult, categoriesResult] = await Promise.all([
        supabase.from('store_settings').select('*').eq('store_id', store.id).maybeSingle(),
        supabase.from('store_products').select('id, name, description, price, image_url, category_id, created_at').eq('store_id', store.id).order('created_at', { ascending: false }),
        supabase.from('products').select('id, name, description, price, image_url, category, created_at').eq('store_id', store.id).order('created_at', { ascending: false }),
        supabase.from('delivery_settings').select('*').eq('store_id', store.id).maybeSingle(),
        supabase.from('store_payments').select('provider_name, account_title, account_number').eq('store_id', store.id).eq('is_active', true),
        supabase.from('store_categories').select('id, name').eq('store_id', store.id),
      ]);
      settingsData = settingsResult.data ?? null;
      deliveryData = deliveryResult.data ?? null;
      const rawStorePlan = String(store.plan || 'basic').toLowerCase();
      const isStorePaid = ['verified', 'approved', 'active', 'paid'].includes(String(store.payment_status || '').toLowerCase());
      const effectiveStorePlan = (!isStorePaid && rawStorePlan !== 'basic' && rawStorePlan !== 'free') ? 'basic' : rawStorePlan;
      const isBasicStore = ['basic', 'free'].includes(effectiveStorePlan);
      const categoryMap = new Map((categoriesResult.data ?? []).map((c: any) => [String(c.id), String(c.name)]));

      const productById = new Map<string, { id: string; name: string; description: string | null; price: number; image_url: string | null; category?: string | null }>();
      for (const product of (legacyProducts.data ?? [])) {
        productById.set(String(product.id), {
          id: String(product.id),
          name: String(product.name ?? ""),
          description: typeof product.description === "string" ? product.description : null,
          price: Number(product.price ?? 0),
          image_url: typeof product.image_url === "string" ? product.image_url : null,
          category: isBasicStore ? null : (typeof product.category === 'string' ? product.category : null),
        });
      }
      for (const product of (builderProducts.data ?? [])) {
        productById.set(String(product.id), {
          id: String(product.id),
          name: String(product.name ?? ""),
          description: typeof product.description === "string" ? product.description : null,
          price: Number(product.price ?? 0),
          image_url: typeof product.image_url === "string" ? product.image_url : null,
          category: isBasicStore ? null : (product.category_id && categoryMap.get(String(product.category_id)) ? categoryMap.get(String(product.category_id)) : null),
        });
      }
      products = [...productById.values()];
      paymentMethods = (paymentResult.data ?? []).map((payment) => ({
        provider_name: String(payment.provider_name ?? ''),
        account_title: String(payment.account_title ?? ''),
        account_number: String(payment.account_number ?? ''),
      }));
    } catch (sbErr) {
      console.warn("Supabase sub-queries error:", sbErr);
    }
  }

  // Fallback to storeRepo if not in Supabase or catalog is empty
  if (!store || products.length === 0) {
    const repoStore = await storeRepo.getStore(slug);
    if (repoStore) {
      store = {
        id: repoStore.id,
        name: repoStore.name,
        slug: repoStore.slug,
        plan: repoStore.plan || 'basic',
        selected_plan: repoStore.selected_plan,
        payment_status: repoStore.payment_status,
        whatsapp_number: repoStore.whatsapp_number || '',
        primary_color: repoStore.theme?.primaryColor || repoStore.primary_color || '#1976d2',
        selected_theme: repoStore.theme?.id || repoStore.selected_theme || 'emerald',
        accepts_cod: true,
        accepts_advance: false,
        advance_percentage: 50,
        tagline: repoStore.tagline,
        description: repoStore.description,
        niche: (repoStore as any).niche,
        payment_details: {}
      };
      if (!settingsData) {
        settingsData = {
          theme_color: repoStore.theme?.primaryColor || repoStore.primary_color,
          selected_theme: repoStore.theme?.id || repoStore.selected_theme,
          banner_text: repoStore.header_title || repoStore.tagline,
          footer_text: repoStore.description,
          social_links: repoStore.social_links || {}
        };
      }
      if (products.length === 0) {
        const repoProducts = await storeRepo.getProducts(repoStore.id);
        products = repoProducts.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          image_url: p.image_url
        }));
      }
    }
  }

  if (!store) {
    notFound();
  }

  const repoStoreFallback = await storeRepo.getStore(slug);
  const nicheColor = getStoreNicheColor(store.name, store.slug);
  const resolvedThemeColor = settingsData?.theme_color 
    || (store as Record<string, unknown>).primary_color as string 
    || ((store as Record<string, unknown>).selected_theme && THEME_PALETTES[(store as Record<string, unknown>).selected_theme as string])
    || (settingsData?.selected_theme && THEME_PALETTES[settingsData.selected_theme])
    || repoStoreFallback?.theme?.primaryColor 
    || repoStoreFallback?.primary_color 
    || nicheColor
    || '#1976d2';

  const resolvedThemeId = settingsData?.selected_theme 
    || (store as Record<string, unknown>).selected_theme as string 
    || repoStoreFallback?.theme?.id 
    || repoStoreFallback?.selected_theme 
    || 'royal-gold';

  const rawPlanValue = String(store.plan ?? repoStoreFallback?.plan ?? 'basic').toLowerCase();
  const paymentStatusValue = String(store.payment_status ?? repoStoreFallback?.payment_status ?? 'pending').toLowerCase();
  const isPaid = ['verified', 'approved', 'active', 'paid'].includes(paymentStatusValue);
  const effectiveFinalPlan = (!isPaid && rawPlanValue !== 'basic' && rawPlanValue !== 'free') ? 'basic' : rawPlanValue;

  const safeStore = {
    id: store.id,
    name: store.name,
    slug: store.slug,
    plan: effectiveFinalPlan,
    selected_plan: store.selected_plan ?? repoStoreFallback?.selected_plan ?? null,
    payment_status: paymentStatusValue,
    whatsapp_number: store.whatsapp_number ?? repoStoreFallback?.whatsapp_number ?? '',
    accepts_cod: store.accepts_cod ?? true,
    accepts_advance: store.accepts_advance ?? false,
    advance_percentage: store.advance_percentage ?? 50,
    tagline: (store as Record<string, unknown>).tagline as string ?? repoStoreFallback?.tagline ?? null,
    description: (store as Record<string, unknown>).description as string ?? repoStoreFallback?.description ?? null,
    niche: store.payment_details?.niche || (store as Record<string, unknown>).niche as string ?? (repoStoreFallback as any)?.niche ?? null,
    primary_color: resolvedThemeColor,
    theme_color: resolvedThemeColor,
    selected_theme: resolvedThemeId,
  };

  const safeSettings = settingsData ? {
    ...settingsData,
    theme_color: resolvedThemeColor,
    selected_theme: resolvedThemeId,
    hero_images: (Array.isArray(settingsData.hero_images) && settingsData.hero_images.length > 0) ? settingsData.hero_images : (Array.isArray(store.payment_details?.hero_images) && store.payment_details.hero_images.length > 0) ? store.payment_details.hero_images : repoStoreFallback?.hero_images || [],
    about_title: settingsData.about_title || (repoStoreFallback as any)?.about_title || "",
    about_text: settingsData.about_text || (repoStoreFallback as any)?.about_text || safeStore.description || "",
    about_image: settingsData.about_image || (repoStoreFallback as any)?.about_image || "",
  } : {
    theme_color: resolvedThemeColor,
    selected_theme: resolvedThemeId,
    banner_text: safeStore.tagline || 'Free delivery nationwide on orders above Rs. 3,000!',
    hero_images: repoStoreFallback?.hero_images || [],
    about_title: (repoStoreFallback as any)?.about_title || "",
    about_text: (repoStoreFallback as any)?.about_text || safeStore.description || "",
    about_image: (repoStoreFallback as any)?.about_image || "",
  };

  const savedPaymentDetails = typeof store.payment_details === 'object' && store.payment_details !== null && !Array.isArray(store.payment_details)
    ? store.payment_details as Record<string, unknown>
    : {};
  const legacyPayment = (provider: string) => paymentMethods.find((method) => method.provider_name.toLowerCase().includes(provider));
  const paymentDetails = {
    bank_name: typeof savedPaymentDetails.bank_name === 'string' ? savedPaymentDetails.bank_name : '',
    account_title: typeof savedPaymentDetails.account_title === 'string' ? savedPaymentDetails.account_title : '',
    account_number: typeof savedPaymentDetails.account_number === 'string' ? savedPaymentDetails.account_number : '',
    iban: typeof savedPaymentDetails.iban === 'string' ? savedPaymentDetails.iban : '',
    jazzcash_number: typeof savedPaymentDetails.jazzcash_number === 'string' ? savedPaymentDetails.jazzcash_number : legacyPayment('jazz')?.account_number ?? '',
    jazzcash_title: typeof savedPaymentDetails.jazzcash_title === 'string' ? savedPaymentDetails.jazzcash_title : legacyPayment('jazz')?.account_title || (typeof savedPaymentDetails.account_title === 'string' ? savedPaymentDetails.account_title : ''),
    easypaisa_number: typeof savedPaymentDetails.easypaisa_number === 'string' ? savedPaymentDetails.easypaisa_number : legacyPayment('easy')?.account_number ?? '',
    easypaisa_title: typeof savedPaymentDetails.easypaisa_title === 'string' ? savedPaymentDetails.easypaisa_title : legacyPayment('easy')?.account_title || (typeof savedPaymentDetails.account_title === 'string' ? savedPaymentDetails.account_title : ''),
  };
  const socialSource = typeof settingsData?.social_links === 'object' && settingsData.social_links !== null && !Array.isArray(settingsData.social_links)
    ? settingsData.social_links as Record<string, unknown>
    : {};
  const socialLinks = Object.fromEntries(
    (['instagram', 'facebook', 'youtube', 'tiktok', 'x'] as const)
      .flatMap((key) => typeof socialSource[key] === 'string' && /^https?:\/\//i.test(socialSource[key] as string)
        ? [[key, socialSource[key] as string]]
        : [])
  ) as Partial<Record<'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'x', string>>;

  return (
    <StorefrontClient
      store={safeStore}
      settings={safeSettings}
      products={products}
      delivery={deliveryData ?? null}
      paymentDetails={paymentDetails}
      socialLinks={socialLinks}
    />
  );
}
