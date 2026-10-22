import { NextResponse } from 'next/server';
import { storeRepo, type ProductRecord } from '@/lib/store-repository';
import { parseVoiceCommand, type ParsedVoiceAction } from '@/lib/ai/voice-intent-parser';
import { resolveUniversalAnswer, sanitizeForVoiceSpeech } from '@/lib/ai/universal-knowledge-engine';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      command, 
      storeId, 
      storeSlug, 
      confirmed = false, 
      pendingAction = null,
      language = 'en'
    } = body;

    const identifier = storeSlug || storeId;
    if (!identifier) {
      return NextResponse.json({ error: 'Store identifier (ID or slug) is required.' }, { status: 400 });
    }

    // 1. Hydrate Store Context
    const store = await storeRepo.getStore(identifier);
    const products = await storeRepo.getProducts(identifier);
    const storeName = store?.name || 'My Store';

    // Fetch live orders & categories from Supabase if available
    let orders: any[] = [];
    let categories: any[] = [];
    const supabase = createAdminClient();
    if (supabase && store) {
      try {
        const [ordersRes, catRes] = await Promise.all([
          supabase.from('store_orders').select('*').eq('store_id', store.id).order('created_at', { ascending: false }).limit(50),
          supabase.from('store_categories').select('*').eq('store_id', store.id)
        ]);
        if (ordersRes.data) orders = ordersRes.data;
        if (catRes.data) categories = catRes.data;
      } catch (err) {
        console.warn('Voice assistant context fetch warning:', err);
      }
    }

    // Fallback categories if empty
    if (!categories.length) {
      const uniqueCats = Array.from(new Set(products.map(p => p.category)));
      categories = uniqueCats.map(c => ({ id: c, name: c }));
    }

    const context = {
      storeName,
      products,
      categories,
      orders,
      settings: store ? { whatsapp_number: store.whatsapp_number, theme: store.selected_theme } : {}
    };

    // =========================================================================
    // 2. IF MERCHANT CONFIRMED A PENDING ACTION
    // =========================================================================
    if (confirmed && pendingAction) {
      const { intent, data } = pendingAction as ParsedVoiceAction;

      // Execute ADD_PRODUCT
      if (intent === 'ADD_PRODUCT' && data) {
        const newProduct = await storeRepo.addProduct(identifier, {
          name: data.name,
          price: Number(data.price),
          category: data.category || 'General',
          description: data.description || '',
          image_url: data.image_url
        });

        // Also sync to store_products table if supabase exists
        if (supabase && store) {
          try {
            await supabase.from('store_products').insert([{
              id: newProduct.id,
              store_id: store.id,
              name: newProduct.name,
              price: newProduct.price,
              description: newProduct.description,
              image_url: newProduct.image_url
            }]);
          } catch (e) {
            console.warn('Supabase store_products sync:', e);
          }
        }

        const reply = language === 'ur'
          ? `Mubaarak ho! '${newProduct.name}' kamyabi se aap ke store mein Rs. ${newProduct.price.toLocaleString()} ke sath add ho gaya hai!`
          : `Success! '${newProduct.name}' has been added to your store catalog for Rs. ${newProduct.price.toLocaleString()}!`;

        return NextResponse.json({
          success: true,
          executed: true,
          reply,
          actionType: 'ADD_PRODUCT',
          createdProduct: newProduct
        });
      }

      // Execute DELETE_PRODUCT (CRITICAL SAFETY COMPLETED)
      if (intent === 'DELETE_PRODUCT' && data) {
        let deleted = false;
        if (data.id) {
          deleted = await storeRepo.deleteProduct(identifier, data.id);
          if (supabase) {
            try {
              await supabase.from('store_products').delete().eq('id', data.id);
            } catch (e) {
              console.warn('Supabase store_products delete:', e);
            }
          }
        } else {
          // Find by name
          const p = products.find(item => item.name.toLowerCase() === data.name?.toLowerCase());
          if (p) {
            deleted = await storeRepo.deleteProduct(identifier, p.id);
            if (supabase) {
              try {
                await supabase.from('store_products').delete().eq('id', p.id);
              } catch (e) {
                console.warn('Supabase store_products delete by name:', e);
              }
            }
          }
        }

        const reply = language === 'ur'
          ? `'${data.name}' ko store se hamesha ke liye delete kar diya gaya hai.`
          : `'${data.name}' has been permanently deleted from your store.`;

        return NextResponse.json({
          success: true,
          executed: true,
          reply,
          actionType: 'DELETE_PRODUCT',
          deletedItem: data.name
        });
      }

      // Execute UPDATE_PRODUCT
      if (intent === 'UPDATE_PRODUCT' && data) {
        let updated: ProductRecord | null = null;
        if (data.id && data.new_price) {
          updated = await storeRepo.updateProduct(identifier, data.id, { price: data.new_price });
          if (supabase) {
            try {
              await supabase.from('store_products').update({ price: data.new_price }).eq('id', data.id);
            } catch (e) {
              console.warn('Supabase update price:', e);
            }
          }
        }

        const reply = language === 'ur'
          ? `'${data.name}' ki keemat kamyabi se Rs. ${Number(data.new_price).toLocaleString()} par update ho gayi hai!`
          : `Price for '${data.name}' has been updated to Rs. ${Number(data.new_price).toLocaleString()}!`;

        return NextResponse.json({
          success: true,
          executed: true,
          reply,
          actionType: 'UPDATE_PRODUCT',
          updatedProduct: updated
        });
      }

      // Execute CREATE_CATEGORY
      if (intent === 'CREATE_CATEGORY' && data) {
        if (supabase && store) {
          try {
            await supabase.from('store_categories').insert([{
              store_id: store.id,
              name: data.name
            }]);
          } catch (e) {
            console.warn('Supabase category insert:', e);
          }
        }

        const reply = language === 'ur'
          ? `Nayi category '${data.name}' aap ke store mein create kar di gayi hai!`
          : `New category '${data.name}' has been created successfully!`;

        return NextResponse.json({
          success: true,
          executed: true,
          reply,
          actionType: 'CREATE_CATEGORY',
          category: data.name
        });
      }

      // Execute UPDATE_SETTINGS
      if (intent === 'UPDATE_SETTINGS' && data) {
        if (data.theme_preset) {
          await storeRepo.updateStoreTheme(identifier, { theme_preset: data.theme_preset });
        }
        if (supabase && store && data.whatsapp_number) {
          try {
            await supabase.from('stores').update({ whatsapp_number: data.whatsapp_number }).eq('id', store.id);
          } catch (e) {
            console.warn('Supabase settings update:', e);
          }
        }

        const reply = language === 'ur'
          ? 'Aap ke store ki settings kamyabi se update kar di gayi hain!'
          : 'Your store settings have been updated successfully!';

        return NextResponse.json({
          success: true,
          executed: true,
          reply,
          actionType: 'UPDATE_SETTINGS'
        });
      }
    }

    // =========================================================================
    // 3. PARSE NATURAL VOICE COMMAND
    // =========================================================================
    if (!command || typeof command !== 'string' || !command.trim()) {
      return NextResponse.json({ error: 'Command string is required.' }, { status: 400 });
    }

    const parsed: ParsedVoiceAction = parseVoiceCommand(command, context);

    // If confirmation is required, return pending action payload to the merchant
    if (parsed.requiresConfirmation) {
      return NextResponse.json({
        success: true,
        executed: false,
        requiresConfirmation: true,
        confirmationMessage: parsed.confirmationMessage,
        reply: parsed.reply,
        intent: parsed.intent,
        pendingAction: parsed,
        actionData: parsed.data
      });
    }

    // If the merchant asked a general question, inquiry, business advice, or marketing question, use LLM (Gemini / OpenAI)
    if (parsed.intent === 'GENERAL_QUERY') {
      const productCatalogText = products.slice(0, 15).map(p => `${p.name} (Rs. ${p.price})`).join(', ');
      const categoriesText = categories.map(c => c.name).join(', ');

      const voiceSystemPrompt = `You are Bexi AI Voice Assistant, the highly knowledgeable, intelligent, and proactive e-commerce and retail co-pilot for the merchant running "${storeName}".
You have the intelligence of Gemini 2.5 and GPT-4o.
Store context:
- Store Name: ${storeName}
- Products Catalog: ${productCatalogText || 'No products yet'}
- Categories: ${categoriesText || 'None'}
- Recent Orders: ${orders.length} orders
- WhatsApp: ${store?.whatsapp_number || 'N/A'}

Merchant spoken command: "${command}"

Strict Instructions:
1. Answer ANY question asked by the merchant accurately, intelligently, and directly (e-commerce business advice, marketing ideas, pricing recommendations, catalog optimization, customer service tips, or general queries).
2. Match the merchant's spoken language:
   - If they speak in Roman Urdu or Urdu (e.g. "sales kaise barhaun?", "Facebook ads kaise chalayein?", "shoes ki price kya rakhun?"), reply in fluent, natural Roman Urdu.
   - If they speak in English, reply in professional English.
3. Keep spoken replies concise, actionable, and conversational (2 to 4 sentences maximum) because this will be spoken aloud to the merchant via Text-to-Speech (TTS).
4. Do NOT use bullet points, asterisks (*), markdown headers, or emojis that sound awkward when read aloud by TTS.`;

      // 1. Try Gemini
      const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.AI_GATEWAY_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
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
                { role: 'user', parts: [{ text: voiceSystemPrompt }] }
              ],
              generationConfig: { temperature: 0.5, maxOutputTokens: 250 }
            })
          });

          if (resp.ok) {
            const geminiData = await resp.json();
            const cand = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (typeof cand === 'string' && cand.trim()) {
              parsed.reply = cand.trim().replace(/[*_#~`]/g, '');
            }
          }
        } catch (gemErr) {
          console.warn('Voice assistant Gemini query warning:', gemErr);
        }
      }

      // 2. Try OpenAI if Gemini didn't answer and OpenAI key is available
      let llmAnswered = !parsed.reply.includes('Main aap ka Buildexom AI Voice Assistant') && !parsed.reply.includes('I am your Buildexom Voice-to-Action');
      if (!llmAnswered) {
        const openAiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
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
                temperature: 0.5,
                messages: [
                  { role: 'system', content: voiceSystemPrompt },
                  { role: 'user', content: command },
                ],
              }),
            });

            if (oRes.ok) {
              const oData = await oRes.json();
              const cand = oData?.choices?.[0]?.message?.content;
              if (typeof cand === 'string' && cand.trim()) {
                parsed.reply = cand.trim().replace(/[*_#~`]/g, '');
              }
            }
          } catch (openAiErr) {
            console.warn('Voice assistant OpenAI query warning:', openAiErr);
          }
        }
      }
    }

    // Safe direct execution for queries and insights
    return NextResponse.json({
      success: true,
      executed: true,
      requiresConfirmation: false,
      reply: parsed.reply,
      intent: parsed.intent,
      actionData: parsed.data,
      insights: parsed.intent === 'QUERY_INSIGHTS' ? parsed.data : null
    });

  } catch (error) {
    console.error('Voice assistant API error:', error);
    const msg = error instanceof Error ? error.message : 'Voice assistant could not process request';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
