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
    const { name, slug, owner_email, password, whatsapp_number } = body;

    if (!name || !slug || !owner_email || !password) {
      return NextResponse.json({ error: 'All required fields must be filled.' }, { status: 400 });
    }

    // Password securely hash karna
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

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
          plan: 'free',
          payment_status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Store successfully register ho gaya hai!',
      store: data
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}