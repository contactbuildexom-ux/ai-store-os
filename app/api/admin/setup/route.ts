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

    const adminEmail = 'admin@aistore.com';
    const plainPassword = 'superadminpassword123';

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
      message: 'Super Admin successfully create ho gaya hai!',
      admin_email: data.email
    }, { status: 200 });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to create the initial admin.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}