import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { storeRepo } from '@/lib/store-repository';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const pendingUpgrades: any[] = [];

    if (supabase) {
      try {
        const { data: stores } = await supabase
          .from('stores')
          .select('id, name, slug, plan, payment_status, payment_details, created_at')
          .eq('payment_status', 'pending_approval')
          .order('created_at', { ascending: false });

        if (stores) {
          for (const s of stores) {
            const details = (s.payment_details as any)?.pending_upgrade || {};
            pendingUpgrades.push({
              store_id: s.id,
              store_name: s.name,
              store_slug: s.slug,
              current_plan: s.plan,
              requested_plan: details.target_plan || 'pro',
              payment_method: details.payment_method || 'bank',
              sender_name: details.sender_name || 'N/A',
              sender_number: details.sender_number || 'N/A',
              transaction_id: details.transaction_id || 'N/A',
              screenshot_url: details.screenshot_url || '',
              amount: details.amount || 3500,
              submitted_at: details.submitted_at || s.created_at,
            });
          }
        }
      } catch (err) {
        console.warn('Supabase fetch pending upgrades warning:', err);
      }
    }

    return NextResponse.json({
      success: true,
      pending_upgrades: pendingUpgrades
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unable to load pending upgrades';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { store_id, action, plan } = body;

    if (!store_id) {
      return NextResponse.json({ error: 'Store ID is required.' }, { status: 400 });
    }

    const targetPlan = (plan || 'pro').toLowerCase();
    const isApproval = action === 'approve';
    const newStatus = isApproval ? 'approved' : 'rejected';

    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data: existingStore } = await supabase
          .from('stores')
          .select('id, payment_details')
          .or(`id.eq.${store_id},slug.eq.${store_id}`)
          .maybeSingle();

        if (existingStore) {
          const currentDetails = typeof existingStore.payment_details === 'object' && existingStore.payment_details !== null
            ? existingStore.payment_details as Record<string, any>
            : {};

          const updatePayload: Record<string, any> = {
            payment_status: newStatus,
            payment_details: {
              ...currentDetails,
              pending_upgrade: null,
              last_upgrade: {
                approved: isApproval,
                plan: targetPlan,
                timestamp: new Date().toISOString()
              }
            }
          };

          if (isApproval) {
            updatePayload.plan = targetPlan;
          }

          await supabase.from('stores').update(updatePayload).eq('id', existingStore.id);
        }
      } catch (sbErr) {
        console.warn('Supabase approval update warning:', sbErr);
      }
    }

    // Also update repo
    const repoStore = await storeRepo.getStore(store_id);
    if (repoStore) {
      await storeRepo.updateStore(repoStore.id, {
        plan: isApproval ? (targetPlan as any) : repoStore.plan,
        payment_status: newStatus
      });
    }

    return NextResponse.json({
      success: true,
      message: isApproval 
        ? `Store upgraded to ${targetPlan.toUpperCase()} plan successfully!` 
        : `Upgrade request was rejected.`
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unable to process upgrade action';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
