import { NextResponse } from 'next/server';
import { storeRepo } from '@/lib/store-repository';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Store slug is required.' }, { status: 400 });
    }

    const store = await storeRepo.getStore(slug);

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

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}