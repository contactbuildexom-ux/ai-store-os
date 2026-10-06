import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkStoreLimits } from '@/lib/planLimits';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch all categories for a specific store
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const store_id = searchParams.get('store_id');

    if (!store_id) {
      return NextResponse.json({ error: 'store_id is required' }, { status: 400 });
    }

    const { data: categories, error } = await supabase
      .from('store_categories')
      .select('*')
      .eq('store_id', store_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, categories });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create a new category with plan limit validation
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { store_id, name } = body;

    if (!store_id || !name) {
      return NextResponse.json({ error: 'store_id and name are required' }, { status: 400 });
    }

    // 1. Plan Limits Validation for Category
    const limitCheck = await checkStoreLimits(store_id, 'category');
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.message }, { status: 400 });
    }

    // 2. Insert Category into Database
    const { data: category, error: insertError } = await supabase
      .from('store_categories')
      .insert([{ store_id, name }])
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ 
      success: true, 
      category, 
      message: 'Category created successfully' 
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}