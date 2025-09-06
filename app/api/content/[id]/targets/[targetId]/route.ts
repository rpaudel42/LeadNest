import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// platform-specific soft limits (keep conservative)
const CAP_LIMITS: Record<string, number> = {
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  tiktok: 2200,
  x: 280,
  youtube: 5000,
  youtube_shorts: 5000,
  pinterest: 500
};

const ALLOWED_STATUS = new Set([
  'pending','ready','scheduled','publishing','published','failed','canceled'
]);

export async function PUT(req: Request, { params }: { params: { targetId: string } }) {
  try {
    const sb = createRouteHandlerClient({ cookies });
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const body = await req.json();

    // 1) Load target + content to verify ownership and get platform
    const { data: tgt, error: tErr } = await sb
      .from('content_platform_targets')
      .select('id, platform, content_id, status, scheduled_at')
      .eq('id', params.targetId)
      .maybeSingle();

    if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });
    if (!tgt) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    const { data: content, error: cErr } = await sb
      .from('contents')
      .select('id, user_id')
      .eq('id', tgt.content_id)
      .maybeSingle();

    if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
    if (!content || content.user_id !== session.user.id) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    // 2) Validate payload
    let scheduled_at: string | null = null;
    if (body.scheduled_at != null && body.scheduled_at !== '') {
      const d = new Date(body.scheduled_at);
      if (isNaN(+d)) return NextResponse.json({ error: 'scheduled_at must be ISO datetime' }, { status: 400 });
      scheduled_at = d.toISOString();
    }

    if (body.status && !ALLOWED_STATUS.has(body.status)) {
      return NextResponse.json({ error: `invalid status: ${body.status}` }, { status: 400 });
    }

    if (typeof body.caption_override === 'string' && body.caption_override.length) {
      const limit = CAP_LIMITS[tgt.platform] ?? 5000;
      if (body.caption_override.length > limit) {
        return NextResponse.json({ error: `${tgt.platform} caption exceeds ${limit} characters` }, { status: 400 });
      }
    }

    const payload: any = {};
    if ('caption_override' in body) payload.caption_override = body.caption_override ?? null;
    if ('first_comment' in body)   payload.first_comment   = body.first_comment ?? null;
    if ('hashtags' in body)        payload.hashtags        = Array.isArray(body.hashtags) ? body.hashtags : [];
    if ('mentions' in body)        payload.mentions        = Array.isArray(body.mentions) ? body.mentions : [];
    if ('location_tag' in body)    payload.location_tag    = body.location_tag ?? null;
    if ('cover_asset_id' in body)  payload.cover_asset_id  = body.cover_asset_id ?? null;
    if (scheduled_at !== null || body.scheduled_at === null) payload.scheduled_at = scheduled_at; // allow nulling
    if (body.status)               payload.status          = body.status;

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: 'no fields to update' }, { status: 400 });
    }

    // 3) Update
    const { error: uErr } = await sb
      .from('content_platform_targets')
      .update(payload)
      .eq('id', params.targetId);

    if (uErr) {
      // Bubble up exact postgres/RLS error
      return NextResponse.json({ error: uErr.message }, { status: 400 });
    }

    // Return fresh row
    const { data: fresh, error: fErr } = await sb
      .from('content_platform_targets')
      .select('id,platform,destination_label,caption_override,first_comment,status,scheduled_at,published_at,external_url')
      .eq('id', params.targetId)
      .maybeSingle();

    if (fErr) return NextResponse.json({ error: fErr.message }, { status: 500 });
    return NextResponse.json({ ok: true, target: fresh });
  } catch (e: any) {
    console.error('[targets.update] fatal', e?.message, e);
    return NextResponse.json({ error: e?.message || 'unexpected_error' }, { status: 500 });
  }
}
