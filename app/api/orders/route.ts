import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchStoreByIdOrSlug } from '@/lib/store-id-slug';

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 });
    }

    const body = await request.json();
    const { store_id, customer_name, product_name, total_price } = body;

    if (!store_id) {
      return NextResponse.json({ error: 'Store ID is required.' }, { status: 400 });
    }

    // 1. Sab se pehle store fetch karein (supports UUID and slug)
    const { data: storeData, error: storeError } = await fetchStoreByIdOrSlug<{ id: string; credits_left?: number | null }>(
      supabase,
      String(store_id),
      'id, credits_left'
    );

    if (storeError || !storeData) {
      return NextResponse.json({ error: 'Store nahi mila!' }, { status: 404 });
    }

    const resolvedStoreId = storeData.id;

    // 2. Check karein ke credits khatam toh nahi ho gaye (if credits system is active)
    if (typeof storeData.credits_left === 'number' && storeData.credits_left <= 0) {
      return NextResponse.json(
        { error: 'Aapke free credits khatam ho chuke hain! Mazeed orders ke liye package upgrade karein.' },
        { status: 400 }
      );
    }

    // 3. Order insert karein `orders` table mein
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{ store_id: resolvedStoreId, customer_name, product_name, total_price }])
      .select();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // 4. Store ke credits update karein agar credits set hain
    let remainingCredits: number | null = null;
    if (typeof storeData.credits_left === 'number') {
      remainingCredits = Math.max(0, storeData.credits_left - 1);
      await supabase
        .from('stores')
        .update({ credits_left: remainingCredits })
        .eq('id', resolvedStoreId);
    }

    return NextResponse.json({
      message: 'Order kamyabi se place ho gaya!',
      order: orderData ? orderData[0] : null,
      remaining_credits: remainingCredits
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}