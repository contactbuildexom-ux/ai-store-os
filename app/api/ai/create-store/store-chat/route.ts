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

    // Try Gemini LLM for dynamic contextual conversational response in the user's exact language
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_GATEWAY_API_KEY;
    if (apiKey) {
      try {
        const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const catalogOverview = bexiProducts.slice(0, 30).map(p => `- ${p.name} (Rs. ${p.price}): ${p.description || ''}`).join('\n');
        const systemPrompt = `You are Bexi AI, the expert shopping assistant for "${storeInfo.name}".
Store details:
- Name: ${storeInfo.name}
- Tagline: ${storeInfo.tagline || 'Verified Online Brand'}
- WhatsApp: ${storeInfo.whatsapp_number}
- Products Catalog:
${catalogOverview}

Instructions:
1. Always respond in the EXACT same language and script as the customer:
   - If they write in native Urdu script, reply in Urdu script.
   - If they write in Roman Urdu (e.g. "ye kaisa hai?", "delivery kab hogi?", "size mil jayega?"), reply in natural, fluent Roman Urdu.
   - If they write in English, reply in clear, professional English.
2. Answer the specific question directly, concisely (2 to 3 sentences max), and helpfully.
3. Be warm and encouraging, mentioning that they can order via WhatsApp or Add to Cart.
4. Do not invent products not in the catalog.`;

        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
          method: 'POST',
          signal: AbortSignal.timeout(6000),
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: `${systemPrompt}\n\nCustomer message: "${message}"` }] }
            ],
            generationConfig: { temperature: 0.3, maxOutputTokens: 300 }
          })
        });

        if (resp.ok) {
          const geminiData = await resp.json();
          const cand = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (typeof cand === 'string' && cand.trim()) {
            return NextResponse.json({
              success: true,
              reply: cand.trim(),
              store_name: storeInfo.name,
              engine: 'gemini',
            });
          }
        }
      } catch (gemErr) {
        console.warn('Gemini chat lookup failed, falling back to rule engine:', gemErr);
      }
    }

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
      engine: 'bexi-engine'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Chat error' }, { status: 500 });
  }
}