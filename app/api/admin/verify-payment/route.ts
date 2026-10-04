import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { payment_id, store_id, action } = body; // action: 'verify' or 'reject'

    if (!payment_id || !store_id || !action) {
      return NextResponse.json({ error: 'Payment ID, Store ID and action are required.' }, { status: 400 });
    }

    const newStatus = action === 'verify' ? 'verified' : 'rejected';
    const storePlan = action === 'verify' ? 'pro' : 'free';

    // 1. Update payment request status
    const { error: paymentError } = await supabase
      .from('store_payments')
      .update({ status: newStatus })
      .eq('id', payment_id);

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    // 2. If verified, upgrade store plan to 'pro' and payment_status to 'verified'
    const { error: storeError } = await supabase
      .from('stores')
      .update({
        plan: storePlan,
        payment_status: newStatus
      })
      .eq('id', store_id);

    if (storeError) {
      return NextResponse.json({ error: storeError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Payment ${newStatus} successfully! Store plan updated to ${storePlan.toUpperCase()}.`
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}