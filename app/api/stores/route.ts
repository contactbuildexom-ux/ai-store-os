import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { store_name, tagline, whatsapp_number } = body;

    // Store insert karein sath mein 3 free credits default
    const { data, error } = await supabase
      .from('stores')
      .insert([
        {
          store_name,
          tagline,
          whatsapp_number,
          credits_left: 3 // 3 free credits policy
        }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Store successfully created!',
      store: data
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}