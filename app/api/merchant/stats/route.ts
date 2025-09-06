import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const s = createRouteHandlerClient({ cookies });

  // current user
  const { data: { session } } = await s.auth.getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const uid = session.user.id;

  // totals
  const { count: totalPosts } = await s.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', uid);
  const { count: scheduledPosts } = await s.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('status','scheduled');

  // engagement aggregates (last 8 points by date)
  const { data: recent } = await s
    .from('post_engagements')
    .select('likes, comments, shares, impressions, captured_at, post_id')
    .order('captured_at', { ascending: true })
    .limit(200); // client-side will group; RLS limits to user's posts via policy

  // roll up by day
  const byDay: Record<string, { likes:number; comments:number; shares:number; impressions:number }> = {};
  (recent || []).forEach(r => {
    const key = (r.captured_at || '').slice(0,10);
    if (!byDay[key]) byDay[key] = { likes:0, comments:0, shares:0, impressions:0 };
    byDay[key].likes += r.likes||0;
    byDay[key].comments += r.comments||0;
    byDay[key].shares += r.shares||0;
    byDay[key].impressions += r.impressions||0;
  });

  const chart = Object.entries(byDay).map(([date, vals]) => ({ date, ...vals }));

  return NextResponse.json({
    totalPosts: totalPosts || 0,
    scheduledPosts: scheduledPosts || 0,
    chart
  });
}
