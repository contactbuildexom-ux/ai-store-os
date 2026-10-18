import { NextResponse } from 'next/server';
import { storeRepo } from '@/lib/store-repository';
import { generateBexiReply } from '@/lib/ai/bexi-chat-engine';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const { store_id, message } = await req.json();

    if (!store_id || !message) {
      return NextResponse.json({ error: 'Store ID/slug and message are required.' }, { status: 400 });
    }

    // 1. Fetch store from repository or Supabase
    let store = await storeRepo.getStore(store_id);
    let products = await storeRepo.getProducts(store_id);

    const supabase = createAdminClient();
    if ((!store || products.length === 0) && supabase) {
      try {
        const { data: dbStore } = await supabase
          .from('stores')
          .select('id, name, slug, whatsapp_number, tagline, description')
          .or(`id.eq.${store_id},slug.eq.${store_id}`)
          .maybeSingle();

        if (dbStore) {
          store = {
            id: dbStore.id,
            name: dbStore.name,
            slug: dbStore.slug,
            whatsapp_number: dbStore.whatsapp_number,
            tagline: dbStore.tagline,
            description: dbStore.description,
          } as any;

          const [legacyRes, builderRes] = await Promise.all([
            supabase.from('products').select('id, name, description, price, image_url, category').eq('store_id', dbStore.id),
            supabase.from('store_products').select('id, name, description, price, image_url, category_id').eq('store_id', dbStore.id)
          ]);

          const allProd = [...(legacyRes.data || []), ...(builderRes.data || [])];
          if (allProd.length > 0) {
            products = allProd.map((p) => ({
              id: String(p.id),
              name: p.name || 'Product',
              price: Number(p.price || 0),
              description: p.description || '',
              category: (p as any).category || 'General',
              image_url: p.image_url || '',
            })) as any;
          }
        }
      } catch (err) {
        console.warn('Supabase fetch in Bexi chat warning:', err);
      }
    }

    const storeInfo = {
      id: store?.id || String(store_id),
      name: store?.name || 'our store',
      slug: store?.slug || String(store_id),
      whatsapp_number: store?.whatsapp_number || '923001234567',
      tagline: (store as any)?.tagline,
      description: (store as any)?.description,
    };

    const bexiProducts = products.map((p) => ({
      id: String(p.id),
      name: p.name,
      price: Number(p.price),
      description: p.description,
      category: p.category,
      image_url: p.image_url,
    }));

    const result = generateBexiReply({
      message: String(message),
      store: storeInfo,
      products: bexiProducts,
    });

    return NextResponse.json({
      success: true,
      reply: result.reply,
      store_name: storeInfo.name,
      language: result.languageDetected,
      matches_count: result.matchesCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Chat error' }, { status: 500 });
  }
}