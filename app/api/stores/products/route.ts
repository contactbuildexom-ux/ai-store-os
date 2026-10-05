import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkStoreLimits } from '@/lib/planLimits';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Dobara 'name' use karein kyunki database column ka naam 'name' hai
    const { store_id, category_id, name, description, price, image_url } = body;

    // 1. Plan Limits Validation
    const limitCheck = await checkStoreLimits(store_id, 'product', category_id);
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.message }, { status: 400 });
    }

    // 2. Insert Product into Database (using 'name')
    const { data: product, error: insertError } = await supabase
      .from('store_products')
      .insert([{ store_id, category_id, name, description, price, image_url }])
      .select()
      .single();

    if (insertError) throw insertError;

    // 3. Fetch Opted-in Customers for WhatsApp Broadcast
    const { data: optIns } = await supabase
      .from('store_customers_optin')
      .select('whatsapp_number')
      .eq('store_id', store_id);

    // 4. Check Favorites / Wishlist match for this category
    const { data: favorites } = await supabase
      .from('store_favorites')
      .select('customer_whatsapp')
      .eq('store_id', store_id)
      .eq('category_id', category_id);

    // Combine unique WhatsApp numbers for broadcast
    const recipientNumbers = Array.from(new Set([
      ...(optIns?.map(o => o.whatsapp_number) || []),
      ...(favorites?.map(f => f.customer_whatsapp) || [])
    ]));

    return NextResponse.json({ 
      success: true, 
      product, 
      broadcastedTo: recipientNumbers.length 
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}