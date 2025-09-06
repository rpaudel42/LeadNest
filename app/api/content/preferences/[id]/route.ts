import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const sb = createRouteHandlerClient({ cookies });
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data, error } = await sb
    .from('content_preferences')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('id', params.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ prefs: data || null });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const sb = createRouteHandlerClient({ cookies });
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const b = await req.json();
  const arr = (v: any) => Array.isArray(v) ? v.filter(Boolean) : [];
  const platforms = arr(b.platforms).filter((p: string) => ['instagram','facebook','linkedin','tiktok','x'].includes(p));
  const categories = arr(b.categories);
  const preferred_hashtags = arr(b.preferred_hashtags).map((s: string)=>s.trim().replace(/^#/, ''));
  const banned_hashtags = arr(b.banned_hashtags).map((s: string)=>s.trim().replace(/^#/, ''));

  const payload = {
    name: b.name || 'Untitled Preference',
    content_type: b.content_type || 'text',
    categories,
    idea: b.idea || null,
    tone: b.tone || null,
    audience: b.audience || null,
    geo_focus: b.geo_focus || null,
    preferred_hashtags,
    banned_hashtags,
    platforms,
    emoji_style: (['none','minimal','heavy'] as const).includes(b.emoji_style) ? b.emoji_style : 'minimal',
    frequency: Number.isFinite(+b.frequency) ? +b.frequency : null,
    preferred_times: arr(b.preferred_times),
    timezone: typeof b.timezone === 'string' ? b.timezone : null,
    approval_required: b.approval_required ?? true,
  };

  const { error } = await sb
    .from('content_preferences')
    .update(payload)
    .eq('user_id', session.user.id)
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
