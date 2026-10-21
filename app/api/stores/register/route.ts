import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { createMerchantSession, MERCHANT_SESSION_COOKIE } from '@/lib/merchant-session';
import { createAdminClient } from '@/lib/supabase/admin';
import { storeRepo } from '@/lib/store-repository';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey || url.includes("placeholder-project") || url.includes("your-project")) {
    return null;
  }
  return createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
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

    // Secure password hashing
    const password_hash = await bcrypt.hash(password, 12);
    const themeColor = /^#[0-9a-f]{6}$/i.test(selected_theme)
      ? selected_theme
      : ({ emerald: '#1d7555', ocean: '#2563eb', rose: '#be185d', midnight: '#0f172a', amber: '#b45309', violet: '#6d28d9', fashion: '#4338ca', 'home-decor': '#b45309', electronics: '#1e40af', beauty: '#be185d' } as Record<string, string>)[selected_theme] || '#1976d2';

    const supabase = getSupabase();
    let data: { id: string; name: string; slug: string; owner_email: string; plan: string; payment_status: string; created_at: string } | null = null;

    if (supabase) {
      try {
        const { data: inserted, error } = await supabase
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
              payment_status: 'pending',
              primary_color: themeColor,
              selected_theme: selected_theme,
            }
          ])
          .select('id, name, slug, owner_email, plan, payment_status, created_at')
          .single();

        if (error) {
          const duplicate = error.code === '23505';
          return NextResponse.json({ error: duplicate ? 'A store with this email or slug already exists.' : error.message }, { status: duplicate ? 409 : 500 });
        }
        data = inserted;

        const supabaseAdmin = createAdminClient();
        if (supabaseAdmin && data) {
          await Promise.allSettled([
            supabaseAdmin.from('store_settings').upsert({ store_id: data.id, selected_theme, theme_color: themeColor, banner_text: tagline || `Welcome to ${name}` }, { onConflict: 'store_id' }),
            supabaseAdmin.from('delivery_settings').upsert({ store_id: data.id }, { onConflict: 'store_id' }),
          ]);
        }
      } catch (sbErr) {
        console.warn('Supabase store registration error, using local repository fallback:', sbErr);
      }
    }

    if (!data) {
      // Local repository registration fallback
      const storeId = `store_${crypto.randomUUID().slice(0, 12)}`;
      data = {
        id: storeId,
        name,
        slug,
        owner_email,
        plan: 'basic',
        payment_status: 'pending',
        created_at: new Date().toISOString(),
      };

      await storeRepo.saveStore({
        id: storeId,
        name,
        slug,
        tagline: tagline || `Welcome to ${name}`,
        description: `Official store for ${name}`,
        header_title: tagline || `Welcome to ${name}`,
        plan: 'basic',
        whatsapp_number: whatsapp_number || '923001234567',
        owner_email,
        password_hash,
        theme: {
          id: selected_theme,
          name: selected_theme,
          primaryColor: themeColor,
          secondaryColor: '#0f172a',
          accentColor: '#10b981',
          textColor: '#1e293b',
          bgHero: 'bg-gradient-to-br from-[#0f172a] to-[#1e293b]',
          cardBg: 'bg-white',
          badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          fontVibe: 'Inter, sans-serif',
        },
        categories: ['General', 'Featured'],
        products: [],
      } as any);
    }

    const response = NextResponse.json({
      message: 'Store successfully registered!',
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