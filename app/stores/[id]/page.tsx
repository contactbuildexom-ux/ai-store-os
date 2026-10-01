import { createClient } from '@supabase/supabase-js';
import StoreLayout from '../../../components/StoreLayout';
import { notFound } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StorePage({ params }: PageProps) {
  const { id } = await params;

  // 1. Database se store details fetch karein
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('id', id)
    .single();

  if (storeError || !store) {
    notFound();
  }

  // 2. Us store ki products fetch karein
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', id);

  return (
    <StoreLayout 
      storeName={store.store_name}
      tagline={store.tagline || "Welcome to our exclusive online collection."}
      whatsappNumber={store.whatsapp_number}
      products={products || []}
    />
  );
}