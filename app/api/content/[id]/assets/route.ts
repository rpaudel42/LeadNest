import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const sb = createRouteHandlerClient({ cookies });
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // verify ownership via contents
  const { data: c } = await sb.from('contents').select('id').eq('user_id', session.user.id).eq('id', params.id).maybeSingle();
  if (!c) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const { data, error } = await sb.from('content_assets').select('*').eq('content_id', params.id).order('order_index');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ assets: data || [] });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const sb = createRouteHandlerClient({ cookies });
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json();
  // body: { asset_type, storage_path, format, width, height, duration_sec, order_index, metadata }
  const payload = { ...body, content_id: params.id };

  const { data, error } = await sb.from('content_assets').insert(payload).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}
