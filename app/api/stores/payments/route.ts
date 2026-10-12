import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

// GET: Store payment methods fetch karne ke liye
export async function GET(req: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase service-role configuration is missing. Add SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL to .env.local.' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const store_id = searchParams.get('store_id');

    if (!store_id) {
      return NextResponse.json({ error: 'store_id is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('store_payments')
      .select('*')
      .eq('store_id', store_id);

    if (error) throw error;

    return NextResponse.json({ success: true, payments: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Payment method add karne ke liye
export async function POST(req: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase service-role configuration is missing. Add SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL to .env.local.' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { store_id, payment_method, transaction_id, amount, status = 'pending' } = body;

    if (!store_id || !payment_method || !transaction_id || !amount) {
      return NextResponse.json(
        { error: 'store_id, payment_method, transaction_id, and amount are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('store_payments')
      .insert([{
        store_id,
        payment_method,
        transaction_id: String(transaction_id).trim(),
        amount,
        status
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      payment: data,
      message: 'Payment method configured successfully'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}