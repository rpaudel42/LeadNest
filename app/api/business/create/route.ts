
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req: Request){
  const body = await req.json();
  const email = body.email as string;
  const sb = supabaseServer();
  // look up auth user by email (requires service role key with select on auth.users) - or defer until update
  // For MVP, create placeholder profile row with email (user linkage can be updated after client signs in)
  const { data, error } = await sb.from('business_profiles').insert({ email, business_name: '' }).select().single();
  if(error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
