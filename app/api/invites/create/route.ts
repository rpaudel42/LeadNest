
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { randomUUID } from 'crypto';

async function sendInviteEmail(email: string, name: string, token: string) {
  const url = process.env.NEXT_PUBLIC_APP_URL + '/signup?token=' + encodeURIComponent(token);
  // TODO: integrate Resend/SMTP. For now, log server-side.
  console.log('Invite email to', email, '→', url);
  return true;
}

export async function POST(req: Request) {
  const body = await req.json();
  const email = body.email as string;
  const name = body.name as string;
  if(!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const token = randomUUID();
  const sb = supabaseServer();
  const { error } = await sb.from('invites').insert({ email, token, status: 'pending' });
  if(error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sendInviteEmail(email, name, token);
  return NextResponse.json({ ok: true });
}
