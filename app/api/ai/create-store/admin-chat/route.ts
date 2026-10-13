import { NextResponse } from 'next/server';
import { storeRepo } from '@/lib/store-repository';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const stores = await storeRepo.getAllStores();
    let totalProducts = 0;
    for (const s of stores) {
      const p = await storeRepo.getProducts(s.id);
      totalProducts += p.length;
    }

    const freeCount = stores.filter(s => s.plan === 'free').length;
    const proCount = stores.filter(s => s.plan === 'pro').length;
    const advCount = stores.filter(s => s.plan === 'advanced').length;

    const globalContext = {
      totalStores: stores.length,
      totalProducts,
      breakdown: { free: freeCount, pro: proCount, advanced: advCount },
      recentStores: stores.slice(0, 5).map(s => ({ name: s.name, slug: s.slug, plan: s.plan }))
    };

    const reply = `Buildexom Platform Intelligence: Currently hosting ${stores.length} stores across the platform with ${totalProducts} total catalog products. Plan distribution: ${freeCount} Free, ${proCount} Pro, and ${advCount} Advanced. Recent active store: "${stores[0]?.name || 'Velvet Aura'}".`;

    return NextResponse.json({
      success: true,
      reply,
      context: globalContext
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}