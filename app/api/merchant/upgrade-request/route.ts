import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessStore } from '@/lib/merchant-api-auth';
import { storeRepo } from '@/lib/store-repository';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      store_id, 
      plan, 
      payment_method, 
      sender_name, 
      sender_number, 
      transaction_id, 
      screenshot_url,
      amount 
    } = body;

    if (!store_id) {
      return NextResponse.json({ error: 'Store ID or slug is required.' }, { status: 400 });
    }
    if (!plan || !['pro', 'business', 'advanced'].includes(plan.toLowerCase())) {
      return NextResponse.json({ error: 'Valid upgrade plan (Pro or Business) is required.' }, { status: 400 });
    }
    if (!transaction_id && !screenshot_url) {
      return NextResponse.json({ error: 'Transaction ID or screenshot proof is required.' }, { status: 400 });
    }

    const upgradeData = {
      target_plan: plan.toLowerCase(),
      payment_method: payment_method || 'bank',
      sender_name: sender_name || '',
      sender_number: sender_number || '',
      transaction_id: transaction_id || '',
      screenshot_url: screenshot_url || '',
      amount: amount || (plan.toLowerCase() === 'business' ? 7500 : 3500),
      submitted_at: new Date().toISOString(),
      status: 'pending_approval'
    };

    const supabase = createAdminClient();
    let updated = false;

    if (supabase) {
      try {
        // Find store by id or slug
        const { data: existingStore } = await supabase
          .from('stores')
          .select('id, slug, payment_details')
          .or(`id.eq.${store_id},slug.eq.${store_id}`)
          .maybeSingle();

        if (existingStore) {
          const currentDetails = typeof existingStore.payment_details === 'object' && existingStore.payment_details !== null
            ? existingStore.payment_details
            : {};

          const { error: updateError } = await supabase
            .from('stores')
            .update({
              payment_status: 'pending_approval',
              payment_details: {
                ...currentDetails,
                pending_upgrade: upgradeData
              }
            })
            .eq('id', existingStore.id);

          if (!updateError) {
            updated = true;
          }
        }
      } catch (sbErr) {
        console.warn('Supabase upgrade submission warning:', sbErr);
      }
    }

    // Also update in storeRepo
    const repoStore = await storeRepo.getStore(store_id);
    if (repoStore) {
      await storeRepo.updateStore(repoStore.id, {
        payment_status: 'pending_approval',
      });
      updated = true;
    }

    return NextResponse.json({
      success: true,
      message: 'Payment proof submitted successfully! Superadmin will verify your transaction and activate your plan.',
      upgrade: upgradeData
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unable to submit upgrade payment proof';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
