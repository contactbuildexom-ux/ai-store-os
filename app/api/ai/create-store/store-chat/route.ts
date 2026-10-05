import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { store_id, message } = await req.json();

    // 1. Fetch store's products to give context to AI
    const { data: products } = await supabase
      .from('store_products')
      .select('*')
      .eq('store_id', store_id);

    const catalogContext = JSON.stringify(products || []);

    // TODO: Send `message` and `catalogContext` to AI LLM (Groq/OpenAI) 
    // with a strict system prompt to only answer using this catalog data.
    
    const aiResponse = `Here is what we found based on your store inquiry regarding: "${message}". Our catalog has ${products?.length || 0} items available.`;

    return NextResponse.json({ success: true, reply: aiResponse });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}