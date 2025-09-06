import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(req: Request) {
  const sb = createRouteHandlerClient({ cookies });
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(()=>({}));
  const handle = body.handle || '@mock_account';
  const display = body.display_name || 'Mock Account';

  const { data, error } = await sb.from('social_accounts').insert({
    user_id: session.user.id,
    provider: 'mock',
    account_id: `mock_${Math.random().toString(36).slice(2,10)}`,
    handle,
    display_name: display,
    picture_url: 'https://avatars.githubusercontent.com/u/9919?s=200&v=4',
    access_token: 'mock_access_token',
    refresh_token: null,
    expires_at: null,
    scopes: ['post:write'],
    status: 'connected'
  }).select('id').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}
