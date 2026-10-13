import { NextResponse } from 'next/server';
    // 1. Fetch store details by slug
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, name, slug, plan, payment_status, whatsapp_number, created_at')
      .eq('slug', slug)
      .single();

    if (!store) {
      return NextResponse.json({ error: 'Store not found.' }, { status: 404 });
    }

    const products = await storeRepo.getProducts(store.id || store.slug);
    const categories = Array.from(new Set(products.map(p => p.category)));

    return NextResponse.json({
      store,
      categories,
      products
    }, { status: 200 });

  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unable to load store.' }, { status: 500 });
  }
}