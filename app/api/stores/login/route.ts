import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    // Fetch store data using owner email
    const { data: store, error } = await supabase
      .from('stores')
      .select('id, name, slug, owner_email, password_hash, plan, payment_status')
      .eq('owner_email', email)
      .single();

    if (error || !store) {
      return NextResponse.json({ error: 'Invalid store credentials.' }, { status: 401 });
    }

    // Verify hashed password
    const isPasswordValid = await bcrypt.compare(password, store.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid store credentials.' }, { status: 401 });
    }

    return NextResponse.json({
      message: 'Store login successful!',
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        owner_email: store.owner_email,
        plan: store.plan,
        payment_status: store.payment_status
      }
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}