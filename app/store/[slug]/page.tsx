import { notFound } from 'next/navigation';
import StorefrontClient from './StorefrontClient';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function PublicStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const supabase = createAdminClient();
  if (!supabase) notFound();

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, name, slug, plan, whatsapp_number')
    .eq('slug', slug)
    .single();

  if (storeError || !store) {
    notFound();
  }

  const [settingsResult, builderProducts, legacyProducts, deliveryResult, paymentResult] = await Promise.all([
    supabase.from('store_settings').select('*').eq('store_id', store.id).maybeSingle(),
    supabase.from('store_products').select('id, name, description, price, image_url, category_id, created_at').eq('store_id', store.id).order('created_at', { ascending: false }),
    supabase.from('products').select('id, name, description, price, image_url, category, created_at').eq('store_id', store.id).order('created_at', { ascending: false }),
    supabase.from('delivery_settings').select('*').eq('store_id', store.id).maybeSingle(),
    supabase.from('store_payments').select('provider_name, account_title, account_number').eq('store_id', store.id).eq('is_active', true),
  ]);

  const productById = new Map<string, { id: string; name: string; description: string | null; price: number; image_url: string | null }>();
  for (const product of [...(legacyProducts.data ?? []), ...(builderProducts.data ?? [])]) {
    productById.set(String(product.id), {
      id: String(product.id),
      name: String(product.name ?? ""),
      description: typeof product.description === "string" ? product.description : null,
      price: Number(product.price ?? 0),
      image_url: typeof product.image_url === "string" ? product.image_url : null,
    });
  }
  const products = [...productById.values()];
  const paymentMethods = (paymentResult.data ?? []).map((payment) => ({
    provider_name: String(payment.provider_name ?? ''),
    account_title: String(payment.account_title ?? ''),
    account_number: String(payment.account_number ?? ''),
  }));

  const safeStore = {
    id: store.id,
    name: store.name,
    slug: store.slug,
    plan: store.plan ?? 'basic',
    whatsapp_number: store.whatsapp_number ?? '',
  };

  return (
    <StorefrontClient 
      store={safeStore}
      settings={settingsResult.data ?? null}
      products={products}
      delivery={deliveryResult.data ?? null}
      paymentMethods={paymentMethods}
    />
  );
}