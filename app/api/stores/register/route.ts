import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { createMerchantSession, MERCHANT_SESSION_COOKIE } from '@/lib/merchant-session';
import { createAdminClient } from '@/lib/supabase/admin';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && serviceRoleKey ? createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } }) : null;
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: 'Store registration is not configured.' }, { status: 503 });
    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const slug = typeof body?.slug === 'string' ? body.slug.trim().toLowerCase() : '';
    const owner_email = typeof body?.owner_email === 'string' ? body.owner_email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    const whatsapp_number = typeof body?.whatsapp_number === 'string' ? body.whatsapp_number.trim() : null;
    const selected_plan = typeof body?.plan === 'string' ? body.plan.trim().toLowerCase() : 'basic';
    const selected_theme = typeof body?.selected_theme === 'string' ? body.selected_theme.trim().toLowerCase() : 'emerald';
    const tagline = typeof body?.tagline === 'string' ? body.tagline.trim().slice(0, 160) : '';
    const allowedPlans = new Set(['basic', 'free', 'pro', 'business']);
    const allowedThemes = new Set(['emerald', 'ocean', 'rose', 'midnight', 'amber', 'violet', 'fashion', 'home-decor', 'electronics', 'beauty']);

    if (name.length < 2 || name.length > 100 || !/^[a-z0-9-]{1,80}$/.test(slug) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(owner_email) || password.length < 8 || password.length > 128 || (whatsapp_number && whatsapp_number.length > 30) || !allowedPlans.has(selected_plan) || (!allowedThemes.has(selected_theme) && !/^#[0-9a-f]{6}$/i.test(selected_theme))) {
      return NextResponse.json({ error: 'Enter valid store details, a password (8–128 characters), a supported plan, and a supported theme.' }, { status: 400 });
    }

    // Password securely hash karna
    const password_hash = await bcrypt.hash(password, 12);

    // Supabase table mein insert karna (exact column names ke sath)
    const { data, error } = await supabase
      .from('stores')
      .insert([
        {
          name,
          slug: slug.toLowerCase().trim(),
          owner_email: owner_email.toLowerCase().trim(),
          password_hash,
          whatsapp_number,
          plan: 'basic',
          selected_plan: selected_plan === 'free' ? 'basic' : selected_plan,
          payment_status: 'pending'
        }
      ])
      .select('id, name, slug, owner_email, plan, payment_status, created_at')
      .single();

    if (error) {
      const duplicate = error.code === '23505';
      return NextResponse.json({ error: duplicate ? 'A store with this email or slug already exists.' : error.message }, { status: duplicate ? 409 : 500 });
    }

    const supabaseAdmin = createAdminClient();
    if (!supabaseAdmin) {
      await supabase.from('stores').delete().eq('id', data.id);
      return NextResponse.json({ error: 'Store registration is not configured.' }, { status: 503 });
    }
    const themeColor = /^#[0-9a-f]{6}$/i.test(selected_theme)
      ? selected_theme
      : ({ emerald: '#1d7555', ocean: '#2563eb', rose: '#be185d', midnight: '#0f172a', amber: '#b45309', violet: '#6d28d9', fashion: '#4338ca', 'home-decor': '#b45309', electronics: '#1e40af', beauty: '#be185d' } as Record<string, string>)[selected_theme];
    const [{ error: settingsError }, { error: deliveryError }] = await Promise.all([
      supabaseAdmin.from('store_settings').upsert({ store_id: data.id, selected_theme, theme_color: themeColor, banner_text: tagline || `Welcome to ${name}` }, { onConflict: 'store_id' }),
      supabaseAdmin.from('delivery_settings').upsert({ store_id: data.id }, { onConflict: 'store_id' }),
    ]);
    if (settingsError || deliveryError) {
      await supabase.from('stores').delete().eq('id', data.id);
      const failure = settingsError ?? deliveryError;
      return NextResponse.json({ error: failure?.message ?? 'Unable to initialize the store.' }, { status: 500 });
    }

    const response = NextResponse.json({
      message: 'Store successfully register ho gaya hai!',
      store: { ...data, selected_plan: selected_plan === 'free' ? 'basic' : selected_plan, selected_theme }
    }, { status: 201 });
    const { token, maxAge } = createMerchantSession(String(data.id), String(data.slug), String(data.owner_email));
    response.cookies.set(MERCHANT_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge,
    });
    return response;

  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unable to register store.' }, { status: 500 });
  }
}