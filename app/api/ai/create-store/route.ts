import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, owner_email, password_hash, whatsapp_number, plan, prompt } = body;

    // TODO: Agar prompt diya gaya hai toh AI (e.g. Groq/OpenAI) se color, header title, aur niche extract karein
    const primary_color = prompt?.toLowerCase().includes('dark') ? '#0f172a' : '#1d7555';
    const header_title = `Welcome to ${name}`;

    // 1. Insert store into database
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert([{ 
        name, 
        slug, 
        owner_email, 
        password_hash, 
        whatsapp_number, 
        plan: plan || 'basic', 
        primary_color, 
        header_title,
        payment_status: 'pending'
      }])
      .select()
      .single();

    if (storeError) throw storeError;

    return NextResponse.json({ success: true, store, message: 'Store successfully created via AI/Theme workflow!' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}