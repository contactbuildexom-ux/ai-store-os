import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { storeRepo } from '@/lib/store-repository';

export async function GET() {
  const pendingStores: any[] = [];
  const supabase = createAdminClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, slug, plan, owner_email, whatsapp_number, created_at, is_verified, verification_status')
        .or('is_verified.eq.false,verification_status.eq.pending,verification_status.is.null')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        for (const s of data) {
          pendingStores.push({
            id: String(s.id ?? ""),
            name: String(s.name ?? ""),
            slug: String(s.slug ?? ""),
            plan: String(s.plan ?? "basic"),
            owner_email: String(s.owner_email ?? ""),
            whatsapp_number: String(s.whatsapp_number ?? ""),
            created_at: String(s.created_at ?? ""),
            verification_status: String(s.verification_status || 'pending'),
          });
        }
      }
    } catch (err) {
      console.warn('Supabase fetch pending stores warning:', err);
    }
  }

  // Also check local store repository
  try {
    const allRepoStores = await storeRepo.getAllStores();
    for (const s of allRepoStores) {
      if (s.is_verified === false || s.verification_status === 'pending' || !s.verification_status) {
        if (!pendingStores.some((p) => p.id === s.id || p.slug === s.slug)) {
          pendingStores.push({
            id: String(s.id ?? ""),
            name: String(s.name ?? ""),
            slug: String(s.slug ?? ""),
            plan: String(s.plan ?? "basic"),
            owner_email: String(s.owner_email ?? ""),
            whatsapp_number: String(s.whatsapp_number ?? ""),
            created_at: String(s.created_at ?? ""),
            verification_status: String(s.verification_status || 'pending'),
          });
        }
      }
    }
  } catch (err) {
    console.warn('Repo fetch pending stores warning:', err);
  }

  return NextResponse.json({
    success: true,
    pending_stores: pendingStores,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { store_id, action } = body;

    if (!store_id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'store_id and valid action (approve/reject) are required' }, { status: 400 });
    }

    const isVerified = action === 'approve';
    const status = action === 'approve' ? 'verified' : 'rejected';

    const supabase = createAdminClient();
    if (supabase) {
      try {
        await supabase
          .from('stores')
          .update({
            is_verified: isVerified,
            verification_status: status,
          })
          .eq('id', store_id);
      } catch (err) {
        console.warn('Supabase store verification update warning:', err);
      }
    }

    try {
      if (isVerified) {
        await storeRepo.verifyStore(store_id);
      }
    } catch (err) {
      console.warn('Repo store verification update warning:', err);
    }

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'Store verified successfully! Merchant rights unlocked.' : 'Store verification rejected.',
      is_verified: isVerified,
      status,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Verification update failed' }, { status: 500 });
  }
}
