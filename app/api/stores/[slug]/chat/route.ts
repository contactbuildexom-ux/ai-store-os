import { NextResponse } from "next/server";
import { getPublicStorefront, StorefrontDataError } from "@/lib/storefront-data";
import { generateBexiReply } from "@/lib/ai/bexi-chat-engine";
import { storeRepo } from "@/lib/store-repository";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const messageValue = typeof body === "object" && body !== null && "message" in body
      ? (body as any).message
      : null;
    if (typeof messageValue !== "string" || !messageValue.trim()) {
      return NextResponse.json({ error: "A message is required." }, { status: 400 });
    }
    const message = messageValue.trim();
    if (message.length > 500) {
      return NextResponse.json({ error: "Message must be 500 characters or fewer." }, { status: 400 });
    }

    let storeName = 'our store';
    let whatsappNumber = '923001234567';
    let productsList: any[] = [];
    let tagline = '';
    let description = '';

    const storefront = await getPublicStorefront(slug).catch(() => null);
    if (storefront) {
      storeName = storefront.store.name;
      whatsappNumber = storefront.store.whatsapp_number;
      tagline = storefront.store.tagline || '';
      description = storefront.store.description || '';
      productsList = storefront.products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        description: p.description,
        category: p.category,
        image_url: p.image_url,
      }));
    } else {
      // Fallback to local storeRepo
      const repoStore = await storeRepo.getStore(slug);
      if (repoStore) {
        storeName = repoStore.name;
        whatsappNumber = repoStore.whatsapp_number || '923001234567';
        tagline = repoStore.tagline || '';
        description = repoStore.description || '';
        const repoProducts = await storeRepo.getProducts(repoStore.id);
        productsList = repoProducts.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          description: p.description,
          category: p.category,
          image_url: p.image_url,
        }));
      }
    }

    const catalogOverview = productsList
      .slice(0, 30)
      .map(p => `- ${p.name} (Rs. ${p.price}): ${p.description || p.category || ''}`)
      .join('\n');

    const systemPrompt = `You are Bexi AI, the intelligent, friendly, and expert customer shopping assistant for "${storeName}".
Store details:
- Name: ${storeName}
- Tagline: ${tagline || 'Verified Brand Store'}
- WhatsApp: ${whatsappNumber}
- Catalog:
${catalogOverview || 'A curated collection of quality products with nationwide delivery.'}

Strict Instructions:
1. Always respond in the EXACT same language and script as the customer:
   - If they write in Roman Urdu (e.g. "price kya hai?", "delivery kitne din me hogi?", "shoes dikhao"), reply in fluent, natural Roman Urdu.
   - If they write in Urdu script, reply in natural Urdu script.
   - If they write in English, reply in professional English.
2. Answer accurately based on the catalog and store information. Recommend products with their exact names and prices.
3. If asked about delivery or payment, mention Cash on Delivery (COD) is available nationwide across Pakistan.
4. Keep replies concise (2 to 3 sentences), warm, and helpful.`;

    // 1. Try Gemini
    const geminiKey = process.env.GEMINI_API_KEY || process.env.AI_GATEWAY_API_KEY;
    if (geminiKey) {
      try {
        const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
          method: 'POST',
          signal: AbortSignal.timeout(8000),
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': geminiKey,
          },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: `${systemPrompt}\n\nCustomer question: "${message}"` }] }
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
              store_name: storeName,
              engine: 'gemini',
            }, { headers: { "Cache-Control": "no-store" } });
          }
        }
      } catch (gemErr) {
        console.warn('Gemini chat lookup warning:', gemErr);
      }
    }

    // 2. Try OpenAI
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
              store_name: storeName,
              engine: 'openai-gpt4o',
            }, { headers: { "Cache-Control": "no-store" } });
          }
        }
      } catch (openAiErr) {
        console.warn('OpenAI chat lookup warning:', openAiErr);
      }
    }

    // 3. Fallback: Local Bexi Engine
    const result = generateBexiReply({
      message,
      store: {
        name: storeName,
        slug,
        whatsapp_number: whatsappNumber,
        tagline,
        description,
      },
      products: productsList,
    });

    return NextResponse.json(
      {
        success: true,
        reply: result.reply,
        store_name: storeName,
        language: result.languageDetected,
        ...(result.matchesCount !== undefined ? { matches_count: result.matchesCount } : {}),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    if (error instanceof StorefrontDataError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST /api/stores/[slug]/chat failed:", error);
    return NextResponse.json({ error: "Unable to process your message right now." }, { status: 500 });
  }
}
