import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminRequest } from '@/lib/admin-api-auth';
import { storeRepo } from '@/lib/store-repository';

export async function POST(request: Request) {
  try {
    if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    const supabase = createAdminClient();
    if (!supabase) return NextResponse.json({ error: 'Payment database is not configured.' }, { status: 503 });
    const body = await request.json();
    const { payment_id, store_id, action } = body; // action: 'verify' or 'reject'

    if (!payment_id || !store_id || (action !== 'verify' && action !== 'reject')) {
      return NextResponse.json({ error: 'Payment ID, Store ID and action are required.' }, { status: 400 });
    }

    const newStatus = action === 'verify' ? 'verified' : 'rejected';

    // 1. Determine target plan from store's selected_plan
    let storePlan = 'pro';
    try {
      const { data: storeRow } = await supabase
        .from('stores')
        .select('selected_plan')
        .eq('id', store_id)
        .maybeSingle();

      if (storeRow?.selected_plan === 'business') {
        storePlan = 'business';
      } else if (storeRow?.selected_plan === 'pro') {
        storePlan = 'pro';
      }
    } catch {}

    const resolvedPlan = action === 'verify' ? storePlan : 'basic';

    // 2. Update payment request status in store_payments
    const { error: paymentError } = await supabase
      .from('store_payments')
      .update({ status: newStatus })
      .eq('id', payment_id);

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    // 3. If verified, upgrade store plan and payment_status to 'verified'
    const { error: storeError } = await supabase
      .from('stores')
      .update({
        plan: resolvedPlan,
        payment_status: newStatus
      })
      .eq('id', store_id);

    if (storeError) {
      return NextResponse.json({ error: storeError.message }, { status: 500 });
    }

    // 4. Also update store in local repo
    try {
      await storeRepo.updateStore(store_id, {
        plan: resolvedPlan as any,
        payment_status: newStatus
      });
    } catch {}

    return NextResponse.json({
      message: `Payment ${newStatus} successfully! Store plan updated to ${resolvedPlan.toUpperCase()}.`
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
