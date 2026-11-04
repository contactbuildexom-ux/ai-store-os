import { NextResponse } from 'next/server';
import { storeRepo } from '@/lib/store-repository';
import { generateBexiReply, BexiProduct } from '@/lib/ai/bexi-chat-engine';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchStoreByIdOrSlug } from '@/lib/store-id-slug';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const store_id = body.store_id || body.storeSlug || body.store_slug || body.storeId || body.slug;
    const message = body.message;
    const store_name = body.store_name || body.storeName;
    const whatsapp_number = body.whatsapp_number || body.whatsapp;
    const tagline = body.tagline;
    const clientProducts = body.products || body.clientProducts;

    if (!store_id || !message) {
      return NextResponse.json({ error: 'Store ID/slug and message are required.' }, { status: 400 });
    }

    let bexiProducts: BexiProduct[] = [];

    // Prioritize products passed directly from active client session
    if (Array.isArray(clientProducts) && clientProducts.length > 0) {
      bexiProducts = clientProducts.map((p: any) => ({
        id: String(p.id),
        name: String(p.name || 'Product'),
        price: Number(p.price || 0),
        description: typeof p.description === 'string' ? p.description : '',
        category: String(p.category || p.category_name || 'General'),
        image_url: typeof p.image_url === 'string' ? p.image_url : '',
      }));
    }

    // Fallback: Fetch store and products from repository or Supabase
    let store = await storeRepo.getStore(store_id);
    if (bexiProducts.length === 0) {
      const repoProducts = await storeRepo.getProducts(store_id);
      if (repoProducts.length > 0) {
        bexiProducts = repoProducts.map((p) => ({
          id: String(p.id),
          name: p.name,
          price: Number(p.price),
          description: p.description,
          category: p.category,
          image_url: p.image_url,
        }));
      }
    }

    const supabase = createAdminClient();
    if ((!store || bexiProducts.length === 0) && supabase) {
      try {
        const { data: dbStore } = await fetchStoreByIdOrSlug(
          supabase,
          store_id,
          'id, name, slug, whatsapp_number, tagline, description'
        );

        if (dbStore) {
          store = {
            id: dbStore.id,
            name: dbStore.name,
            slug: dbStore.slug,
            whatsapp_number: dbStore.whatsapp_number,
            tagline: dbStore.tagline,
            description: dbStore.description,
          } as any;

          if (bexiProducts.length === 0) {
            const [legacyRes, builderRes] = await Promise.all([
              supabase.from('products').select('id, name, description, price, image_url, category').eq('store_id', dbStore.id),
              supabase.from('store_products').select('id, name, description, price, image_url, category_id').eq('store_id', dbStore.id)
            ]);

            const allProd = [...(legacyRes.data || []), ...(builderRes.data || [])];
            if (allProd.length > 0) {
              bexiProducts = allProd.map((p) => ({
                id: String(p.id),
                name: p.name || 'Product',
                price: Number(p.price || 0),
                description: p.description || '',
                category: (p as any).category || 'General',
                image_url: p.image_url || '',
              }));
            }
          }
        }
      } catch (err) {
        console.warn('Supabase fetch in Bexi chat warning:', err);
      }
    }

    const storeInfo = {
      id: store?.id || String(store_id),
      name: store_name || store?.name || 'our store',
      slug: store?.slug || String(store_id),
      whatsapp_number: whatsapp_number || store?.whatsapp_number || '923001234567',
      tagline: tagline || (store as any)?.tagline,
      description: body?.about_text || body?.description || (store as any)?.description || '',
      niche: body?.niche || (store as any)?.niche,
    };

    const catalogOverview = bexiProducts.slice(0, 30).map(p => `- ${p.name} (Rs. ${p.price} | Category: ${p.category}): ${p.description || ''}`).join('\n');
    const systemPrompt = `You are Bexi AI, the intelligent official customer assistant for "${storeInfo.name}".
Store Details:
- Store Name: ${storeInfo.name}
- Brand Tagline: ${storeInfo.tagline || 'Authentic Premium Store'}
- About Brand: ${storeInfo.description || 'Verified direct-to-consumer online boutique in Pakistan with nationwide delivery and Cash on Delivery.'}
- Official WhatsApp Helpline: ${storeInfo.whatsapp_number}
- Products Catalog (${bexiProducts.length} items):
${catalogOverview || 'Curated high-quality items with Cash on Delivery nationwide.'}

Store Policies:
- 100% Cash on Delivery (COD) available across Pakistan.
- Fast Delivery: 1-2 days for local orders, 2-4 business days for nationwide delivery (Karachi, Islamabad, Lahore, Peshawar, Quetta, Multan, Faisalabad, etc.).
- Free Nationwide Delivery on orders over Rs. 3,000 (Standard shipping Rs. 200 to 250).
- 7-Day Hassle-Free Exchange Policy if any sizing or manufacturing defect occurs.
- Easy Direct WhatsApp Ordering with live tracking number upon dispatch.

Strict Rules:
1. Always respond in the EXACT same language and script as the user:
   - If user asks in Roman Urdu (e.g. "delivery kab hogi?", "sunglasses polarized hain?", "price kya hai?"), reply in natural, fluent Roman Urdu.
   - If user asks in native Urdu script, reply in polite Urdu script.
   - If user asks in English, reply in professional, warm English.
2. Directly answer their specific question with accurate details about the store, products, specifications, and policies.
3. Be friendly and helpful. Encourage them to tap 'Add to Cart' or order directly on WhatsApp.
4. Keep answers concise (2 to 4 sentences). Never make up contradictory information.`;

    // 1. Try OpenAI if configured
    const openAiKey = process.env.OPENAI_API_KEY;
    if (openAiKey) {
      try {
        const oRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          signal: AbortSignal.timeout(8000),
          headers: {
            Authorization: `Bearer ${openAiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            temperature: 0.4,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: String(message) },
            ],
          }),
        });

        if (oRes.ok) {
          const oData = await oRes.json();
          const reply = oData?.choices?.[0]?.message?.content;
          if (typeof reply === 'string' && reply.trim()) {
            return NextResponse.json({
              success: true,
              reply: reply.trim(),
              store_name: storeInfo.name,
              engine: 'openai-gpt4o',
            });
          }
        }
      } catch (openAiErr) {
        console.warn('OpenAI chat lookup warning:', openAiErr);
      }
    }

    // 2. Try Gemini LLM if configured
    const geminiKey = process.env.GEMINI_API_KEY || process.env.AI_GATEWAY_API_KEY;
    if (geminiKey) {
      try {
        const candidateModels = Array.from(new Set([process.env.GEMINI_MODEL, 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash'].filter(Boolean) as string[]));
        for (const model of candidateModels) {
          const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
            method: 'POST',
            signal: AbortSignal.timeout(8000),
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': geminiKey,
            },
            body: JSON.stringify({
              contents: [
                { role: 'user', parts: [{ text: `${systemPrompt}\n\nCustomer message: "${message}"` }] }
              ],
              generationConfig: { temperature: 0.4, maxOutputTokens: 300 }
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
                engine: `gemini-${model}`,
              });
            }
          }
        }
      } catch (gemErr) {
        console.warn('Gemini chat lookup warning:', gemErr);
      }
    }

    // 3. Fallback to specialized linguistic engine
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
