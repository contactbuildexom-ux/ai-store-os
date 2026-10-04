import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { store_name, tagline, plan_type, selected_theme, whatsapp_number } = body;

    // Validation: Agar plan 'free' hai toh WhatsApp number save nahi hoga / allow nahi hoga
    let finalWhatsApp = null;
    if (plan_type === 'pro') {
      if (!whatsapp_number) {
        return NextResponse.json({ error: 'Pro plan ke liye WhatsApp number lazmi hai.' }, { status: 400 });
      }
      finalWhatsApp = whatsapp_number;
    }

    // Store insert karein database mein
    const { data, error } = await supabase
      .from('stores')
      .insert([
        {
          store_name,
          tagline,
          plan_type: plan_type || 'free',
          selected_theme: selected_theme || 'basic_theme_1',
          whatsapp_number: finalWhatsApp // Free mein null, Pro mein number
        }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Store successfully created with plan rules!',
      store: data
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}