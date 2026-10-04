import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch all orders for the Super Admin dashboard
export async function GET(request: Request) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}

// POST: Create a new order (when a customer places an order on any store)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { store_id, customer_name, customer_phone, total_amount, items } = body;

    if (!store_id || !customer_name || !total_amount) {
      return NextResponse.json({ error: 'Required order fields are missing.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          store_id,
          customer_name,
          customer_phone,
          total_amount,
          items,
          status: 'Pending'
        }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Order placed successfully!',
      order: data
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}