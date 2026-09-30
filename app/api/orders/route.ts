import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase/client';

export async function POST(request: Request) {
  const body = await request.json();
  // Yahan aap delivery fee aur risk score ki logic bhi integrate kar sakti hain
  const { data, error } = await supabase.from('orders').insert([body]).select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0], { status: 201 });
}