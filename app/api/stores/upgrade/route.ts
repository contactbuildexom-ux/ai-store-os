import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessStore } from '@/lib/merchant-api-auth';
import { storeRepo } from '@/lib/store-repository';
import { updateStoreByIdOrSlug } from '@/lib/store-id-slug';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { store_id, plan } = body;

    if (!store_id) {
      return NextResponse.json({ error: 'Store identifier is required.' }, { status: 400 });
    }
    if (!(await canAccessStore(String(store_id)))) {
      return NextResponse.json({ error: 'You are not authorized to access this store.' }, { status: 403 });
    }

    if (!plan || typeof plan !== "string") {
      return NextResponse.json({ error: "Choose a plan. Paid upgrades must be submitted for Super Admin approval." }, { status: 400 });
    }
    const planVal = plan.toLowerCase();
    if (planVal !== "basic" && planVal !== "free") {
      return NextResponse.json({ error: "Paid plans require a manual payment request and Super Admin approval from the Merchant Dashboard." }, { status: 409 });
    }

    const supabase = createAdminClient();
    if (supabase) {
      const { error } = await updateStoreByIdOrSlug(supabase, String(store_id), {
        plan: "basic",
        plan_type: "basic",
        selected_plan: "basic",
        payment_status: "active",
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    await storeRepo.updateStore(String(store_id), { plan: "basic", payment_status: "active" });
    return NextResponse.json({ success: true, message: "Store switched to the Basic plan.", plan: "basic" });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unable to submit the upgrade payment.' },
      { status: 500 }
    );
  }
}