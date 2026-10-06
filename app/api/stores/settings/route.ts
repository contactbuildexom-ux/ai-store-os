import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Store ki customization settings fetch karne ke liye
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const store_id = searchParams.get('store_id');

    if (!store_id) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('store_id', store_id)
      .single();

    if (error) {
      return NextResponse.json({ settings: null, message: 'No custom settings found for this store' });
    }

    return NextResponse.json({ success: true, settings: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Store settings save ya update karne ke liye (Upsert)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { store_id, theme_color, banner_text, font_style, logo_url } = body;

    if (!store_id) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
    }

    // Upsert query: Agar store_id pehle se mojood hai toh update karega, warna new row insert karega
    const { data, error } = await supabase
      .from('store_settings')
      .upsert([
        { 
          store_id, 
          theme_color: theme_color || '#1d7555', 
          banner_text: banner_text || 'Welcome to our store!', 
          font_style: font_style || 'inter',
          logo_url: logo_url || ''
        }
      ], { onConflict: 'store_id' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      settings: data, 
      message: 'Store settings updated successfully' 
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}