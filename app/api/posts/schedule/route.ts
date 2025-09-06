import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(req: Request) {
  try {
    const sb = createRouteHandlerClient({ cookies });
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { text, scheduled_at } = await req.json();
    if (!text || !scheduled_at) return NextResponse.json({ error: 'text and scheduled_at required' }, { status: 400 });

    // Insert into tenant-scoped posts
    const { data, error } = await sb.from('posts').insert({
      user_id: session.user.id,
      caption: text,
      platform: 'instagram',  // or 'multi' until you wire channels
      status: 'scheduled',
      scheduled_at
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, post: data });
  } catch (e: any) {
    console.error('[schedule] fatal', e?.message);
    return NextResponse.json({ error: e?.message || 'unexpected_error' }, { status: 500 });
  }
}
