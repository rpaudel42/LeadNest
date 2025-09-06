import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(req: Request) {
  const sb = createRouteHandlerClient({ cookies });
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const b = await req.json();
  // expects: preference_id, content_type ('text' now), platforms[], categories[], idea, caption (selected text), scheduled_at (ISO), timezone
  if (!b.caption || !b.scheduled_at || !Array.isArray(b.platforms) || !b.platforms.length) {
    return NextResponse.json({ error: 'caption, scheduled_at, platforms required' }, { status: 400 });
  }

  // 1) create content row
  const { data: content, error: cErr } = await sb.from('contents').insert({
    user_id: session.user.id,
    preference_id: b.preference_id ?? null,
    content_type: b.content_type ?? 'text',
    platforms: b.platforms,
    categories: b.categories ?? [],
    idea: b.idea ?? null,
    caption: b.caption,
    status: 'scheduled',
    scheduled_at: b.scheduled_at,
    timezone: b.timezone ?? null,
    prompt: b.prompt ?? null,
    source_model: b.source_model ?? 'gpt-4o-mini'
  }).select('id').single();

  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });

  // 2) create per-platform targets
  const targets = (b.platforms as string[]).map(p => ({
    content_id: content.id,
    platform: p,
    destination_id: b.destination_id_map?.[p] || 'default', // supply from your connected accounts
    destination_label: b.destination_label_map?.[p] || p,
    caption_override: null,
    first_comment: null,
    hashtags: [],
    mentions: [],
    status: 'scheduled',
    scheduled_at: b.scheduled_at
  }));

  const { error: tErr } = await sb.from('content_platform_targets').insert(targets);
  if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, id: content.id });
}
