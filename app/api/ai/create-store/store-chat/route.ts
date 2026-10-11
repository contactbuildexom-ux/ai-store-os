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

    const query = message.toLowerCase();
    const matches = products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );

    let reply = '';
    if (matches.length > 0) {
      reply = `I found ${matches.length} matching item(s) for "${message}":\n` +
        matches.map(p => `• *${p.name}* (Rs. ${p.price}): ${p.description}`).join('\n') +
        `\n\nWould you like to order any of these directly via WhatsApp?`;
    } else {
      reply = `Thank you for reaching out to ${store?.name || 'our store'}! We offer ${products.length} exclusive items in our catalog. You can ask about our categories (${Array.from(new Set(products.map(p => p.category))).join(', ')}), pricing, or click 'Order via WhatsApp' to place a direct order!`;
    }

    return NextResponse.json({
      success: true,
      reply,
      matches_count: matches.length,
      store_name: store?.name
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}