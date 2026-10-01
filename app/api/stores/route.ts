import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase/client';

export async function GET(request: Request) {
  const { data, error } = await supabase.from('stores').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { data, error } = await supabase.from('stores').insert([body]).select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0], { status: 201 });
}