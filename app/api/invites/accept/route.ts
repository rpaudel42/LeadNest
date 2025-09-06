
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req: Request){
  const body = await req.json();
  const token = body.token as string;
  if(!token) return NextResponse.json({ error: 'token required' }, { status: 400 });
  const sb = supabaseServer();
  const { data, error } = await sb.from('invites').select('*').eq('token', token).single();
  if(error || !data) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  if(data.status === 'accepted') return NextResponse.json({ ok: true });
  const { error: updErr } = await sb.from('invites').update({ status: 'accepted' }).eq('id', data.id);
  if(updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
