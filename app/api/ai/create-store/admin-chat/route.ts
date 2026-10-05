import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // 1. Gather global platform statistics from Supabase
    const { count: totalStores } = await supabase.from('stores').select('*', { count: 'exact', head: true });
    const { count: totalProducts } = await supabase.from('store_products').select('*', { count: 'exact', head: true });
    const { data: storesList } = await supabase.from('stores').select('name, plan, payment_status');

    const globalContext = {
      totalStores,
      totalProducts,
      storesList
    };

    // TODO: Process platform query using AI LLM with `globalContext`
    const adminReply = `Platform Intelligence Report: Total stores active are ${totalStores} with ${totalProducts} products across the system.`;

    return NextResponse.json({ success: true, reply: adminReply, context: globalContext });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}