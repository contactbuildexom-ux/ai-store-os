import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessStore } from '@/lib/merchant-api-auth';
import { storeRepo } from '@/lib/store-repository';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { store_id, plan, payment_method, transaction_id, amount } = body;

    if (!store_id) {
      return NextResponse.json({ error: 'Store identifier is required.' }, { status: 400 });
    }
    if (!(await canAccessStore(String(store_id)))) {
      return NextResponse.json({ error: 'You are not authorized to access this store.' }, { status: 403 });
    }

    const supabase = createAdminClient();

    // 1. Direct Plan Change (Basic, Pro, Advanced) from Dashboard
    if (plan && ['free', 'basic', 'pro', 'advanced'].includes(String(plan).toLowerCase())) {
      const planVal = String(plan).toLowerCase();
      if (supabase) {
        try {
          await supabase
            .from('stores')
            .update({ plan: planVal, plan_type: planVal })
            .or(`id.eq.${store_id},slug.eq.${store_id}`);
        } catch (e) {
          console.warn('Supabase plan update warning:', e);
        }
      }
      await storeRepo.updateStore(String(store_id), { plan: planVal as any });
      return NextResponse.json({
        success: true,
        message: `Store plan updated successfully to ${planVal.toUpperCase()}!`,
        plan: planVal,
      });
    }

    // 2. Offline Payment Submission Verification
    if (!payment_method || !transaction_id || !amount) {
      return NextResponse.json({ error: 'All payment fields are required.' }, { status: 400 });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('store_payments')
        .insert([
          {
            store_id,
            payment_method,
            transaction_id: String(transaction_id).trim(),
            amount,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      await supabase
        .from('stores')
        .update({ payment_status: 'pending' })
        .eq('id', store_id);

      return NextResponse.json(
        {
          message: 'Payment request submitted successfully! Waiting for admin verification.',
          payment: data,
        },
        { status: 201 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Plan change recorded.',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unable to submit the upgrade payment.' },
      { status: 500 }
    );
  }
}