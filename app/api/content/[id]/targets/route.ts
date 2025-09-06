import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// GET /api/content/:id/targets  → list per-platform targets for a content
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const sb = createRouteHandlerClient({ cookies });
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // ownership check (via join on contents)
  const { data: row, error: cErr } = await sb
    .from('contents')
    .select('id')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
  if (!row) return NextResponse.json({ targets: [] }); // not found or not owned

  const { data, error } = await sb
    .from('content_platform_targets')
    .select('id,platform,destination_label,caption_override,first_comment,status,scheduled_at,published_at,external_url')
    .eq('content_id', params.id)
    .order('scheduled_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ targets: data || [] });
}

// POST /api/content/:id/targets  → add a per-platform target
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const sb = createRouteHandlerClient({ cookies });
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // verify ownership
  const { data: row } = await sb
    .from('contents')
    .select('id,user_id')
    .eq('id', params.id)
    .maybeSingle();
  if (!row || row.user_id !== session.user.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const b = await req.json();
  if (!b.platform || !b.destination_id) {
    return NextResponse.json({ error: 'platform and destination_id required' }, { status: 400 });
  }

  const payload = {
    content_id: params.id,
    platform: b.platform,                       // 'instagram' | 'linkedin' | ...
    destination_id: b.destination_id,          // your connected account/page id
    destination_label: b.destination_label ?? null,
    caption_override: b.caption_override ?? null,
    first_comment: b.first_comment ?? null,
    hashtags: Array.isArray(b.hashtags) ? b.hashtags : [],
    mentions: Array.isArray(b.mentions) ? b.mentions : [],
    location_tag: b.location_tag ?? null,
    cover_asset_id: b.cover_asset_id ?? null,
    status: b.status ?? 'scheduled',
    scheduled_at: b.scheduled_at ?? null,
  };

  const { data, error } = await sb
    .from('content_platform_targets')
    .insert(payload)
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}
