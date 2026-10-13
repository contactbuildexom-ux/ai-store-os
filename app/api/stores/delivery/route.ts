import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessStore } from '@/lib/merchant-api-auth';

export async function GET(req: Request) {
  try {
    const supabase = createAdminClient();
    if (!supabase) return NextResponse.json({ error: 'Delivery database is not configured.' }, { status: 503 });
    const { searchParams } = new URL(req.url);
    const store_id = searchParams.get('store_id');

    if (!store_id) {
      return NextResponse.json({ error: 'store_id is required' }, { status: 400 });
    }
    if (!(await canAccessStore(store_id))) return NextResponse.json({ error: 'You are not authorized to access this store.' }, { status: 403 });

    const { data } = await supabase
      .from('delivery_settings')
      .select('*')
      .eq('store_id', store_id)
      .maybeSingle();

    return NextResponse.json({ success: true, delivery: data });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unable to load delivery settings.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient();
    if (!supabase) return NextResponse.json({ error: 'Delivery database is not configured.' }, { status: 503 });
    const body = await req.json();
    const { store_id, delivery_fee, free_delivery_above, estimated_days } = body;

    if (!store_id) {
      return NextResponse.json({ error: 'store_id is required' }, { status: 400 });
    }
    if (!(await canAccessStore(store_id))) return NextResponse.json({ error: 'You are not authorized to access this store.' }, { status: 403 });

    // Check if settings already exist for this store
    const { data: existing } = await supabase
      .from('delivery_settings')
      .select('id')
      .eq('store_id', store_id)
      .maybeSingle();

    let result;
    if (existing) {
      // Update
      const { data, error } = await supabase
        .from('delivery_settings')
        .update({ 
          delivery_fee: delivery_fee ?? 200, 
          free_delivery_above: free_delivery_above || null, 
          estimated_days: estimated_days || '2-3 business days' 
        })
        .eq('store_id', store_id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('delivery_settings')
        .insert([{ 
          store_id, 
          delivery_fee: delivery_fee ?? 200, 
          free_delivery_above: free_delivery_above || null, 
          estimated_days: estimated_days || '2-3 business days' 
        }])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json({ success: true, delivery: result, message: 'Delivery settings saved successfully' });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unable to save delivery settings.' }, { status: 500 });
  }
}