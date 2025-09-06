
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  if(!token) return NextResponse.json({ error: 'token required' }, { status: 400 });
  const sb = supabaseServer();
  const { data, error } = await sb.from('invites').select('*').eq('token', token).single();
  if(error || !data) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ email: data.email, status: data.status });
}
