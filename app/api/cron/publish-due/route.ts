import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

const SECRET = process.env.PUBLISHER_CRON_SECRET!;

// Fake provider post function
async function postToProvider(provider: string, token: string, payload: { caption: string }) {
  // TODO: replace with real SDK/API calls per provider
  // Return a permalink-like URL
  await new Promise(r=>setTimeout(r, 200)); // simulate latency
  return `https://example.com/${provider}/posts/${Math.random().toString(36).slice(2,8)}`;
}

export async function POST() {
  // Protect with secret
  const h = headers();
  const authz = h.get('x-cron-secret');
  if (!SECRET || authz !== SECRET) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // Service role is best for a system job; but we can still use auth-helpers with cookies omitted for server routes.
  const sb = createRouteHandlerClient({ cookies }); // using anon; queries rely on view without RLS or via policies
  // Pull a small batch to avoid long runs
  const { data: due, error } = await sb.from('v_due_targets').select('*').limit(10);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results: any[] = [];
  for (const row of due || []) {
    try {
      const caption = row.caption_override || row.base_caption || '';
      if (!caption) throw new Error('No caption to post');

      // “Publish”
      const permalink = await postToProvider(row.platform, row.access_token || 'mock', { caption });

      // Update target → published
      const { error: u1 } = await sb
        .from('content_platform_targets')
        .update({ status: 'published', published_at: new Date().toISOString(), external_url: permalink })
        .eq('id', row.target_id);
      if (u1) throw u1;

      // Update content if all targets are published (optional: omitted for brevity)

      results.push({ id: row.target_id, ok: true, url: permalink });
    } catch (e: any) {
      const msg = e?.message || String(e);
      // mark failed
      await sb.from('content_platform_targets')
        .update({ status: 'failed', last_error: msg })
        .eq('id', row.target_id);
      results.push({ id: row.target_id, ok: false, error: msg });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
