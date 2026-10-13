import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Store slug is required.' }, { status: 400 });
    }
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Store database is not configured.' }, { status: 503 });
    }

    // 1. Fetch store details by slug
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, name, slug, plan, payment_status, whatsapp_number, created_at')
      .eq('slug', slug)
      .single();

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not found.' }, { status: 404 });
    }

    // 2. Fetch categories for this store
    const { data: categories, error: catError } = await supabase
      .from('store_categories')
      .select('*')
      .eq('store_id', store.id);

    // 3. Fetch products for this store
    const { data: products, error: prodError } = await supabase
      .from('store_products')
      .select('*')
      .eq('store_id', store.id);

    if (catError || prodError) {
      return NextResponse.json({ error: 'Failed to fetch store inventory.' }, { status: 500 });
    }

    return NextResponse.json({
      store,
      categories,
      products
    }, { status: 200 });

  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unable to load store.' }, { status: 500 });
  }
}