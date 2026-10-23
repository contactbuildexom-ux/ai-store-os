import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const setupSecret = process.env.ADMIN_SETUP_SECRET;
    if (!setupSecret || request.headers.get('authorization') !== `Bearer ${setupSecret}`) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      const missing = [!url && 'NEXT_PUBLIC_SUPABASE_URL', !serviceRoleKey && 'SUPABASE_SERVICE_ROLE_KEY'].filter(Boolean);
      return NextResponse.json({ error: `Admin setup configuration is missing: ${missing.join(', ')}.` }, { status: 503 });
    }
    const supabase = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body: unknown = await request.json();
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: 'A valid admin email and password are required.' }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const adminEmail = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    const plainPassword = typeof input.password === 'string' ? input.password : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail) || plainPassword.length < 12 || plainPassword.length > 128) {
      return NextResponse.json({ error: 'Provide a valid admin email and a password between 12 and 128 characters.' }, { status: 400 });
    }

    const { data: existingAdmin, error: lookupError } = await supabase
      .from('super_admins')
      .select('id')
      .eq('email', adminEmail)
      .maybeSingle();
    if (lookupError) {
      return NextResponse.json({ error: lookupError.message }, { status: 500 });
    }

    if (existingAdmin) {
      return NextResponse.json({ error: 'The initial admin has already been created.' }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(plainPassword, 12);

    const { data, error } = await supabase
      .from('super_admins')
      .insert([
        { email: adminEmail, password_hash }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Initial Super Admin created successfully.',
      admin_email: data.email
    }, { status: 200 });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to create the initial admin.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}