import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkStoreLimits } from '@/lib/planLimits';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { store_id, name, description, price, category } = body;

    if (!store_id || !name || !price || !category) {
      return NextResponse.json({ error: 'Tamam zaroori fields (store_id, name, price, category) lazmi hain.' }, { status: 400 });
    }

    const limitCheck = await checkStoreLimits(String(store_id), 'product');
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.message }, { status: 403 });
    }
    if (String(category).trim().toLowerCase() !== 'general') {
      const categoryLimitCheck = await checkStoreLimits(String(store_id), 'category', undefined, {
        categoryName: String(category),
      });
      if (!categoryLimitCheck.allowed) {
        return NextResponse.json({ error: categoryLimitCheck.message }, { status: 403 });
      }
    }

    // 4. Product database mein insert kar dein
    const { data: newProduct, error: insertError } = await supabase
      .from('products')
      .insert([{ store_id, name, description, price, category }])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Product successfully added!',
      product: newProduct
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}