import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkStoreLimits } from '@/lib/planLimits';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Store ke saare products fetch karne ke liye
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const store_id = searchParams.get('store_id');

    if (!store_id) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('store_products')
      .select('*')
      .eq('store_id', store_id);

    if (error) throw error;

    return NextResponse.json({ success: true, products: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Naya product add karne ke liye (Plan Limit Check ke sath)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { store_id, name, price, description, image_url, category_id } = body;

    if (!store_id || !name || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Plan limit check karein (Maslan Basic plan par max 20 products)
    const limitCheck = await checkStoreLimits(store_id, 'product', category_id);
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.message }, { status: 403 });
    }

    // 2. Product insert karein
    const { data, error } = await supabase
      .from('store_products')
      .insert([{ store_id, name, price, description, image_url, category_id }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, product: data, message: 'Product added successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Existing product ko edit/update karne ke liye
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, store_id, name, price, description, image_url } = body;

    if (!id || !store_id) {
      return NextResponse.json({ error: 'Product ID and Store ID are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('store_products')
      .update({ name, price, description, image_url })
      .eq('id', id)
      .eq('store_id', store_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, product: data, message: 'Product updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Product ko delete karne ke liye
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const store_id = searchParams.get('store_id');

    if (!id || !store_id) {
      return NextResponse.json({ error: 'Product ID and Store ID are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('store_products')
      .delete()
      .eq('id', id)
      .eq('store_id', store_id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}