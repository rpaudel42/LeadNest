import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET() {
  const sb = createRouteHandlerClient({ cookies });
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data, error } = await sb
    .from('contents')
    .select('id,content_type,platforms,categories,idea,caption,status,scheduled_at,created_at,updated_at')
    .eq('user_id', session.user.id)
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}

export async function POST(req: Request) {
  const sb = createRouteHandlerClient({ cookies });
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const b = await req.json();
  const { data, error } = await sb
    .from('contents')
    .insert({
      user_id: session.user.id,
      preference_id: b.preference_id ?? null,
      content_type: b.content_type ?? 'text',
      platforms: b.platforms ?? [],
      categories: b.categories ?? [],
      idea: b.idea ?? null,
      caption: b.caption ?? null,
      status: b.status ?? 'draft',
      scheduled_at: b.scheduled_at ?? null,
      timezone: b.timezone ?? null,
      prompt: b.prompt ?? null,
      source_model: b.source_model ?? null,
      tags: b.tags ?? [],
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}
