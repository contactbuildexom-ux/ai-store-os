import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { store_id, category_id, title, description, price, image_url } = body;

    if (!store_id || !title || price === undefined) {
      return NextResponse.json({ error: 'Store ID, title, and price are required.' }, { status: 400 });
    }

    // 1. Fetch store plan
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('plan')
      .eq('id', store_id)
      .single();

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not found.' }, { status: 404 });
    }

    // 2. Count existing products for this store
    const { count, error: countError } = await supabase
      .from('store_products')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', store_id);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    const currentCount = count || 0;
    const planLimit = store.plan === 'pro' ? 20 : 10;

    // 3. Enforce product limit
    if (currentCount >= planLimit) {
      return NextResponse.json({
        error: `Product limit reached for ${store.plan.toUpperCase()} plan. Max allowed is ${planLimit}.`
      }, { status: 403 });
    }

    // 4. Insert new product
    const { data, error } = await supabase
      .from('store_products')
      .insert([{
        store_id,
        category_id: category_id || null,
        title,
        description,
        price,
        image_url
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Product added successfully!',
      product: data
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}