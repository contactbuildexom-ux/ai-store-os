import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { store_id, customer_name, customer_phone, total_amount, items } = body;

    // 1. Insert Order
    const { data: order, error } = await supabase
      .from('store_orders')
      .insert([{ store_id, customer_name, customer_phone, total_amount, items, status: 'pending' }])
      .select()
      .single();

    if (error) throw error;

    // 2. Fetch Store Owner's WhatsApp Number
    const { data: store } = await supabase
      .from('stores')
      .select('whatsapp_number, name')
      .eq('id', store_id)
      .single();

    return NextResponse.json({ 
      success: true, 
      order, 
      notification_sent_to: store?.whatsapp_number || 'No WhatsApp found' 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}