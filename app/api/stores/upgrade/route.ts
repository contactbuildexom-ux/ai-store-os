import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { store_id, payment_method, transaction_id, amount } = body;

    if (!store_id || !payment_method || !transaction_id || !amount) {
      return NextResponse.json({ error: 'All payment fields are required.' }, { status: 400 });
    }

    // Insert payment request into store_payments table
    const { data, error } = await supabase
      .from('store_payments')
      .insert([
        {
          store_id,
          payment_method,
          transaction_id: transaction_id.trim(),
          amount,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update store payment status to pending
    await supabase
      .from('stores')
      .update({ payment_status: 'pending' })
      .eq('id', store_id);

    return NextResponse.json({
      message: 'Payment request submitted successfully! Waiting for admin verification.',
      payment: data
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}