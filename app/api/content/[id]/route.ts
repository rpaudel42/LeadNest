import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const sb = createRouteHandlerClient({ cookies });
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data, error } = await sb
    .from('contents')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('id', params.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ content: data || null });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const sb = createRouteHandlerClient({ cookies });
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const b = await req.json();
  const { error } = await sb
    .from('contents')
    .update({
      preference_id: b.preference_id ?? null,
      content_type: b.content_type,
      platforms: b.platforms,
      categories: b.categories,
      idea: b.idea,
      caption: b.caption,
      first_comment: b.first_comment,
      status: b.status,
      scheduled_at: b.scheduled_at,
      timezone: b.timezone,
      aspect_ratio: b.aspect_ratio,
      duration_sec: b.duration_sec,
      requires_audio: b.requires_audio ?? null,
      alt_text: b.alt_text,
      link_url: b.link_url,
      visibility: b.visibility,
      moderation_status: b.moderation_status,
      moderation_notes: b.moderation_notes,
      tags: b.tags,
      prompt: b.prompt,
      source_model: b.source_model,
    })
    .eq('user_id', session.user.id)
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const sb = createRouteHandlerClient({ cookies });
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { error } = await sb.from('contents')
    .delete()
    .eq('user_id', session.user.id)
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
