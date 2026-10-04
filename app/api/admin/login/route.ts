import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { ADMIN_SESSION_COOKIE, createAdminSession } from '@/lib/admin-session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email aur password dono lazmi hain.' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;
    const missingConfig = [
      !url && 'NEXT_PUBLIC_SUPABASE_URL',
      !serviceRoleKey && 'SUPABASE_SERVICE_ROLE_KEY',
      !sessionSecret && 'ADMIN_SESSION_SECRET',
    ].filter(Boolean);
    if (!url || !serviceRoleKey || !sessionSecret) {
      return NextResponse.json({ error: `Admin login configuration is missing: ${missingConfig.join(', ')}.` }, { status: 503 });
    }
    const supabase = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

    const { data: admin, error } = await supabase
      .from('super_admins')
      .select('id, email, password_hash')
      .eq('email', email)
      .single();

    if (error || !admin) {
      return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
    }

    const { token, maxAge } = createAdminSession(String(admin.id), admin.email);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge,
    });
    return response;

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to sign in.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}