import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { store_id, name } = body;

    if (!store_id || !name) {
      return NextResponse.json({ error: 'Store ID and category name are required.' }, { status: 400 });
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

    // 2. Count existing categories for this store
    const { count, error: countError } = await supabase
      .from('store_categories')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', store_id);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    const currentCount = count || 0;
    const planLimit = store.plan === 'pro' ? 6 : 3;

    // 3. Enforce plan limit
    if (currentCount >= planLimit) {
      return NextResponse.json({
        error: `Category limit reached for ${store.plan.toUpperCase()} plan. Max allowed is ${planLimit}.`
      }, { status: 403 });
    }

    // 4. Insert new category
    const { data, error } = await supabase
      .from('store_categories')
      .insert([{ store_id, name }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Category added successfully!',
      category: data
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}