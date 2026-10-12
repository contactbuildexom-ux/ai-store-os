import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessStore } from '@/lib/merchant-api-auth';

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    if (!supabase) return NextResponse.json({ error: 'Payment database is not configured.' }, { status: 503 });
    const body = await request.json();
    const { store_id, payment_method, transaction_id, amount } = body;

    if (!store_id || !payment_method || !transaction_id || !amount) {
      return NextResponse.json({ error: 'All payment fields are required.' }, { status: 400 });
    }
    if (!(await canAccessStore(String(store_id)))) return NextResponse.json({ error: 'You are not authorized to access this store.' }, { status: 403 });

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

  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unable to submit the upgrade payment.' }, { status: 500 });
  }
}