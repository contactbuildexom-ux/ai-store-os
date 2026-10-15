import { NextResponse } from 'next/server';
import { storeRepo } from '@/lib/store-repository';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Store database is not configured.' }, { status: 503 });
    }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, name, slug, plan, payment_status, whatsapp_number, created_at')
      .eq('slug', slug)
      .maybeSingle();

    if (storeError) throw storeError;
    if (!store) {
      return NextResponse.json({ error: 'Store not found.' }, { status: 404 });
    }

    const products = await storeRepo.getProducts(store.id || store.slug);
    const categories = Array.from(new Set(products.map(product => product.category)));

    return NextResponse.json({ store, categories, products }, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unable to load store.' },
      { status: 500 }
    );
  }
}
