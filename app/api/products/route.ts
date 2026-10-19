import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { store_id, name, description, price, category } = body;

    if (!store_id || !name || !price || !category) {
      return NextResponse.json({ error: 'Tamam zaroori fields (store_id, name, price, category) lazmi hain.' }, { status: 400 });
    }

    // 1. Store ka plan check karein
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('plan_type')
      .eq('id', store_id)
      .single();

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store nahi mila.' }, { status: 404 });
    }

    // 2. Is store ki mojooda products fetch karein (categories aur total count ke liye)
    const { data: existingProducts, error: prodError } = await supabase
      .from('products')
      .select('category')
      .eq('store_id', store_id);

    if (prodError) {
      return NextResponse.json({ error: prodError.message }, { status: 500 });
    }

    const totalProducts = existingProducts.length;
    const uniqueCategories = new Set(existingProducts.map(p => p.category));
    const isNewCategory = !uniqueCategories.has(category);

    // 3. Plan ke mutabiq limits ki validation
    if (store.plan_type === 'free' || store.plan_type === 'basic') {
      if (totalProducts >= 40) {
        return NextResponse.json({ error: 'Plan limit reached! Aap maximum 40 products add kar sakte hain. Pro plan upgrade karein.' }, { status: 403 });
      }
      if (isNewCategory && uniqueCategories.size >= 8) {
        return NextResponse.json({ error: 'Plan limit reached! Aap maximum 8 categories add kar sakte hain.' }, { status: 403 });
      }
    } else if (store.plan_type === 'pro') {
      if (totalProducts >= 80) {
        return NextResponse.json({ error: 'Pro plan limit reached! Aap maximum 80 products add kar sakte hain.' }, { status: 403 });
      }
      if (isNewCategory && uniqueCategories.size >= 12) {
        return NextResponse.json({ error: 'Pro plan limit reached! Aap maximum 12 categories add kar sakte hain.' }, { status: 403 });
      }
    }

    // 4. Product database mein insert kar dein
    const { data: newProduct, error: insertError } = await supabase
      .from('products')
      .insert([{ store_id, name, description, price, category }])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Product successfully added!',
      product: newProduct
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}