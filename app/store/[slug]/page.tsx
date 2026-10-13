import { notFound } from 'next/navigation';
import StorefrontClient from './StorefrontClient';
import { StoreFooter } from '../../../components/store-footer';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function PublicStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const supabase = createAdminClient();
  if (!supabase) notFound();

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, name, slug, plan, whatsapp_number, accepts_cod, accepts_advance, advance_percentage, payment_details')
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
    accepts_cod: store.accepts_cod ?? true,
    accepts_advance: store.accepts_advance ?? false,
    advance_percentage: store.advance_percentage ?? 50,
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

  return (
    <>
      <StorefrontClient
        store={safeStore}
        settings={settingsResult.data ?? null}
        products={products}
        delivery={deliveryResult.data ?? null}
      />
      <StoreFooter storeName={safeStore.name} paymentDetails={paymentDetails} />
    </>
  );
}