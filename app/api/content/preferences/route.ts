import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

const PLATFORM_OPTS = ['instagram','facebook','linkedin','tiktok','x'] as const;
const EMOJI_OPTS = ['none','minimal','heavy'] as const;
function isPlatform(p: string): p is typeof PLATFORM_OPTS[number] {
  return PLATFORM_OPTS.includes(p as any);
}


export async function GET() {
  try {
    const sb = createRouteHandlerClient({ cookies });
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { data, error } = await sb
      .from('content_preferences')
      .select('id,name,content_type,categories,tone,audience,idea,platforms,emoji_style,created_at,updated_at')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data || [], meta: { PLATFORM_OPTS, EMOJI_OPTS } });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'unexpected_error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sb = createRouteHandlerClient({ cookies });
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const b = await req.json();
    const arr = (v:any) => Array.isArray(v) ? v.filter(Boolean) : [];

    const payload = {
      user_id: session.user.id,                                 // <-- required for RLS
      name: b.name || 'Untitled Preference',
      content_type: b.content_type || 'text',
      categories: arr(b.categories),
      idea: b.idea || null,
      tone: b.tone || null,
      audience: b.audience || null,
      geo_focus: b.geo_focus || null,
      preferred_hashtags: arr(b.preferred_hashtags).map((s:string)=>s.trim().replace(/^#/,'')),
      banned_hashtags: arr(b.banned_hashtags).map((s:string)=>s.trim().replace(/^#/,'')),
      platforms: arr(b.platforms).filter(isPlatform),
      emoji_style: EMOJI_OPTS.includes(b.emoji_style) ? b.emoji_style : 'minimal',
      frequency: Number.isFinite(+b.frequency) ? +b.frequency : null,
      preferred_times: arr(b.preferred_times),
      timezone: typeof b.timezone === 'string' ? b.timezone : null,
      approval_required: b.approval_required ?? true,
    };

    const { data, error } = await sb
      .from('content_preferences')
      .insert(payload)
      .select('id')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, id: data.id });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'unexpected_error' }, { status: 500 });
  }
}
