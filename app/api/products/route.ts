import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkStoreLimits } from '@/lib/planLimits';
import { fetchStoreByIdOrSlug } from '@/lib/store-id-slug';

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 });
    }

    const body = await request.json();
    const { store_id, name, description, price, category } = body;

    if (!store_id || !name || price === undefined || !category) {
      return NextResponse.json({ error: 'Tamam zaroori fields (store_id, name, price, category) lazmi hain.' }, { status: 400 });
    }

    const { data: storeRow } = await fetchStoreByIdOrSlug<{ id: string }>(supabase, String(store_id), 'id');
    const resolvedStoreId = storeRow?.id || String(store_id);

    const limitCheck = await checkStoreLimits(resolvedStoreId, 'product');
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.message }, { status: 403 });
    }
    if (String(category).trim().toLowerCase() !== 'general') {
      const categoryLimitCheck = await checkStoreLimits(resolvedStoreId, 'category', undefined, {
        categoryName: String(category),
      });
      if (!categoryLimitCheck.allowed) {
        return NextResponse.json({ error: categoryLimitCheck.message }, { status: 403 });
      }
    }

    // 4. Product database mein insert kar dein
    const { data: newProduct, error: insertError } = await supabase
      .from('products')
      .insert([{ store_id: resolvedStoreId, name, description, price, category }])
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