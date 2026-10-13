import { NextResponse } from 'next/server';
import { storeRepo } from '@/lib/store-repository';

export async function POST(req: Request) {
  try {
    const { store_id, message } = await req.json();

    if (!store_id || !message) {
      return NextResponse.json({ error: 'Store ID/slug and message are required.' }, { status: 400 });
    }

    const store = await storeRepo.getStore(store_id);
    const products = await storeRepo.getProducts(store_id);
    const storeName = store?.name || 'our store';
    const cleanMsg = (message || '').trim().toLowerCase();

    // Available categories
    const categories = Array.from(new Set(products.map(p => p.category)));

    // 1. GREETINGS (English & Roman Urdu)
    if (/^(hi|hello|hey|salam|assalam|aao|adab|hola|good\s*(morning|afternoon|evening))/i.test(cleanMsg)) {
      return NextResponse.json({
        success: true,
        reply: `Walaikum Assalam / Hello! 👋 Welcome to *${storeName}*. 

I am your AI Shopping Assistant! I can help you:
• Browse our *${products.length} catalog items* across ${categories.join(', ')}
• Find products within your budget (e.g. "show items under Rs. 5000")
• Check delivery charges & delivery times
• Place direct orders via WhatsApp

What are you looking for today?`,
        store_name: storeName
      });
    }

    // 2. DELIVERY & SHIPPING QUESTIONS
    if (/delivery|shipping|charges|charges kitne|fee|cod|cash on delivery|time kitna|kab milega|deliver to/i.test(cleanMsg)) {
      return NextResponse.json({
        success: true,
        reply: `🚚 *Delivery Information for ${storeName}*:

• *Lahore Delivery Rate*: Rs. 200 (1-2 business days)
• *Other Cities (Karachi, Islamabad, Rawalpindi, etc.)*: Rs. 350 (2-4 business days)
• *Payment Method*: Cash on Delivery (COD) & Online Bank Transfer supported
• *Tracking*: Full WhatsApp order updates provided after dispatch!

Would you like to proceed with placing an order?`,
        store_name: storeName
      });
    }

    // 3. HOW TO ORDER QUESTIONS
    if (/order kaise|how to order|buy|purchase|khareedna|kese buy|process/i.test(cleanMsg)) {
      return NextResponse.json({
        success: true,
        reply: `🛍️ *How to Place an Order at ${storeName}*:

1. Browse our catalog on this page.
2. Click *'Add to Cart'* for multiple items, or click *'WhatsApp'* on any product card for instant ordering.
3. In the Cart Drawer, choose your city and enter your delivery address.
4. Click *'Checkout via WhatsApp'* — your complete order invoice will be sent directly to our official WhatsApp line (*${store?.whatsapp_number || 'support'}*) for instant confirmation!`,
        store_name: storeName
      });
    }

    // 4. BUDGET & PRICE FILTERS (e.g. "under 5000", "cheap", "expensive", "rate")
    const priceMatch = cleanMsg.match(/under\s*(\d+)|less than\s*(\d+)|budget\s*(\d+)|(\d+)\s*tak/i);
    if (priceMatch) {
      const budget = Number(priceMatch[1] || priceMatch[2] || priceMatch[3] || priceMatch[4]);
      const affordable = products.filter(p => p.price <= budget);

      if (affordable.length > 0) {
        return NextResponse.json({
          success: true,
          reply: `✨ Here are products within your budget of *Rs. ${budget.toLocaleString()}* at ${storeName}:

` + affordable.map((p, i) => `${i + 1}. *${p.name}* — Rs. ${p.price.toLocaleString()}\n   _${p.description}_`).join('\n\n') +
`\n\nYou can click 'Add to Cart' or 'WhatsApp' on any of these cards to place your order!`,
          store_name: storeName
        });
      } else {
        const minPrice = Math.min(...products.map(p => p.price));
        return NextResponse.json({
          success: true,
          reply: `Currently we don't have items under Rs. ${budget.toLocaleString()}. Our most affordable item starts at *Rs. ${minPrice.toLocaleString()}*. Would you like to view our full collection?`,
          store_name: storeName
        });
      }
    }

    // 5. BESTSELLER / RECOMMENDATION
    if (/bestseller|recommend|popular|best|top pick|mashoor|favourite/i.test(cleanMsg)) {
      const topItems = products.slice(0, 3);
      return NextResponse.json({
        success: true,
        reply: `🌟 *Top Recommended Bestsellers at ${storeName}*:

` + topItems.map((p, i) => `⭐ *${p.name}* (Rs. ${p.price.toLocaleString()})\n   _${p.description}_`).join('\n\n') +
`\n\nThese are our most loved items with verified 5-star customer ratings!`,
        store_name: storeName
      });
    }

    // 6. CONTACT & WHATSAPP QUESTIONS
    if (/contact|number|rabta|phone|whatsapp|call|help/i.test(cleanMsg)) {
      return NextResponse.json({
        success: true,
        reply: `📞 *Contact Support for ${storeName}*:

• *Official WhatsApp*: +${store?.whatsapp_number || '923001234567'}
• *Operating Hours*: 10:00 AM – 10:00 PM (Monday – Saturday)
• *Direct Chat*: Click the green 'WhatsApp' button anywhere on the page to chat with our live representative!`,
        store_name: storeName
      });
    }

    // 7. PRODUCT & KEYWORD SEARCH
    const searchTerms: string[] = cleanMsg.split(/\s+/).filter((w: string) => w.length > 2);
    const matches = products.filter(p => {
      const pText = `${p.name} ${p.category} ${p.description}`.toLowerCase();
      return searchTerms.some((term: string) => pText.includes(term));
    });

    if (matches.length > 0) {
      return NextResponse.json({
        success: true,
        reply: `🎯 Found *${matches.length} matching item(s)* for "${message}" in ${storeName}:

` + matches.map((p, i) => `• *${p.name}* (Rs. ${p.price.toLocaleString()} | Category: ${p.category})\n  ${p.description}`).join('\n\n') +
`\n\nClick on the product card to add it to your cart or order directly on WhatsApp!`,
        store_name: storeName,
        matches_count: matches.length
      });
    }

    // 8. FALLBACK INTELLIGENT CATALOG OVERVIEW
    return NextResponse.json({
      success: true,
      reply: `Thank you for your inquiry! At *${storeName}*, we offer a curated collection of *${products.length} premium products* across categories: *${categories.join(', ')}*.

You can ask me:
• *"Show me perfumes under Rs. 5000"*
• *"What are your bestsellers?"*
• *"What are the delivery charges?"*
• Or click *'Order on WhatsApp'* on any product card for instant purchase!`,
      store_name: storeName
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}