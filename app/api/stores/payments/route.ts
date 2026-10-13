import { NextResponse } from 'next/server';
import { canAccessStore } from '@/lib/merchant-api-auth';
import { createAdminClient } from '@/lib/supabase/admin';

// GET: Store payment methods fetch karne ke liye
export async function GET(req: Request) {
  try {
    const supabase = createAdminClient();
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
    if (!(await canAccessStore(store_id))) return NextResponse.json({ error: 'You are not authorized to access this store.' }, { status: 403 });

    const { data, error } = await supabase
      .from('store_payments')
      .select('*')
      .eq('store_id', store_id);

    if (error) throw error;

    return NextResponse.json({ success: true, payments: data });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unable to load payment settings.' }, { status: 500 });
  }
}

// POST: Payment method add karne ke liye
export async function POST(req: Request) {
  try {
    const supabase = createAdminClient();
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
    if (!(await canAccessStore(String(store_id)))) return NextResponse.json({ error: 'You are not authorized to access this store.' }, { status: 403 });

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
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unable to save payment settings.' }, { status: 500 });
  }
}