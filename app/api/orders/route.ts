import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client initialize karein
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { store_id, customer_name, product_name, total_price } = body;

    // 1. Sab se pehle store ke credits check karein
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('credits_left')
      .eq('id', store_id)
      .single();

    if (storeError || !storeData) {
      return NextResponse.json({ error: 'Store nahi mila!' }, { status: 404 });
    }

    // 2. Check karein ke credits khatam toh nahi ho gaye
    if (storeData.credits_left <= 0) {
      return NextResponse.json(
        { error: 'Aapke free credits khatam ho chuke hain! Mazeed orders ke liye package upgrade karein.' },
        { status: 400 }
      );
    }

    // 3. Order insert karein `orders` table mein
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{ store_id, customer_name, product_name, total_price }])
      .select();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // 4. Store ke credits mein se 1 minus (decrement) kar dein
    const { error: updateError } = await supabase
      .from('stores')
      .update({ credits_left: storeData.credits_left - 1 })
      .eq('id', store_id);

    if (updateError) {
      return NextResponse.json({ error: 'Credit update nahi ho saka' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Order kamyabi se place ho gaya!',
      order: orderData[0],
      remaining_credits: storeData.credits_left - 1
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}