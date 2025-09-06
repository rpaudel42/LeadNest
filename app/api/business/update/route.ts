import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request){
  const body = await req.json();
  const sb = createRouteHandlerClient({ cookies });

  const { data: { session } } = await sb.auth.getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: existing } = await sb
    .from('business_profiles')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  const payload = {
    user_id: session.user.id,
    email: body.email || session.user.email,
    business_name: body.business_name || '',
    ein: body.ein || null,
    address: body.address || null,
    phone: body.phone || null,
    contact_person: body.contact_person || null,
    industry: body.industry || null,
  };

  if (existing) {
    const { error } = await sb.from('business_profiles').update(payload).eq('id', existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await sb.from('business_profiles').insert(payload);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
