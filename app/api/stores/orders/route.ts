import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkStoreLimits } from '@/lib/planLimits';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST: Create Order with Plan Limit Validation for WhatsApp
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { store_id, customer_name, customer_phone, items, total_amount, is_whatsapp_order } = body;

    if (!store_id || !customer_name || !customer_phone || !items) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Agar order WhatsApp ke zariye ho raha hai, toh plan check validate karein
    if (is_whatsapp_order) {
      const whatsappLimitCheck = await checkStoreLimits(store_id, 'whatsapp_order');
      if (!whatsappLimitCheck.allowed) {
        return NextResponse.json({ error: whatsappLimitCheck.message }, { status: 403 });
      }
    }

    // Database mein order insert karein
    const { data: order, error: insertError } = await supabase
      .from('store_orders')
      .insert([
        { 
          store_id, 
          customer_name, 
          customer_phone, 
          items, 
          total_amount, 
          status: 'pending' 
        }
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ 
      success: true, 
      order, 
      message: is_whatsapp_order ? 'WhatsApp order placed successfully' : 'Standard order placed successfully' 
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}