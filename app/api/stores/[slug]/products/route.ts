import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { store_id, category_id, name, description, price, image_url } = body;

    // 1. Store ka plan check karein
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('plan')
      .eq('id', store_id)
      .single();

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // 2. Product count check karein (Basic plan max 20, Pro max 75)
    const { count: totalProducts } = await supabase
      .from('store_products')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', store_id);

    if (store.plan === 'basic' && (totalProducts || 0) >= 20) {
      return NextResponse.json({ error: 'Basic plan limit reached (Max 20 products).' }, { status: 400 });
    }
    if (store.plan === 'pro' && (totalProducts || 0) >= 75) {
      return NextResponse.json({ error: 'Pro plan limit reached (Max 75 products).' }, { status: 400 });
    }

    // 3. Insert Product
    const { data: product, error: insertError } = await supabase
      .from('store_products')
      .insert([{ store_id, category_id, name, description, price, image_url }])
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}