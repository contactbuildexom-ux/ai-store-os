import { NextResponse } from 'next/server';
import { getPublicStorefront, StorefrontDataError } from '@/lib/storefront-data';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const storefront = await getPublicStorefront(slug);
    if (!storefront) {
      return NextResponse.json({ error: 'Store not found.' }, { status: 404 });
    }

    return NextResponse.json(storefront, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err: unknown) {
    if (err instanceof StorefrontDataError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('GET /api/stores/[slug] failed:', err);
    return NextResponse.json(
      { error: 'Unable to load store data.' },
      { status: 500 }
    );
  }
}
