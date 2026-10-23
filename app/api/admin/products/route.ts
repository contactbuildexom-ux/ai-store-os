import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdminRequest } from '@/lib/admin-api-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch all products for the Super Admin dashboard
export async function GET(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}

// POST: Add a new product from the Super Admin dashboard
export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const body = await request.json();
    const { product, store, category, price, status } = body;

    if (!product || !store || !category || price === undefined) {
      return NextResponse.json({ error: 'All required fields must be filled.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          product,
          store,
          category,
          price,
          status: status || 'Active'
        }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Product added successfully!',
      product: data
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}