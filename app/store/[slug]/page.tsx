import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import StorefrontClient from './StorefrontClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function PublicStorePage({ params }: { params: Promise<{ slug: string }> }) {
  // Next.js dynamic params ko await karna zaroori hai
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // 1. Fetch store by slug
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single();

  if (storeError || !store) {
    notFound();
  }

  // 2. Fetch store settings (Theme & Banner)
  const { data: settings } = await supabase
    .from('store_settings')
    .select('*')
    .eq('store_id', store.id)
    .maybeSingle();

  // 3. Fetch products for this store
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id);

  // 4. Fetch delivery settings
  const { data: delivery } = await supabase
    .from('delivery_settings')
    .select('*')
    .eq('store_id', store.id)
    .maybeSingle();

  return (
    <StorefrontClient 
      store={store} 
      settings={settings} 
      products={products || []} 
      delivery={delivery} 
    />
  );
}