// app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { startOfWeek, subWeeks, formatISO } from 'date-fns';

export async function GET() {
  const sb = supabaseServer();

  // Total businesses
  const { count: totalBusinesses } = await sb
    .from('business_profiles')
    .select('*', { count: 'exact', head: true });

  // Latest 10 businesses
  const { data: latest } = await sb
    .from('business_profiles')
    .select('id,business_name,email,created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  // Trend: businesses created per week (last 8 weeks)
  const buckets: { weekStart: string; count: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const start = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
    const end = startOfWeek(subWeeks(new Date(), i - 1), { weekStartsOn: 1 });
    const { count } = await sb
      .from('business_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', formatISO(start))
      .lt('created_at', formatISO(end));
    buckets.push({ weekStart: formatISO(start).slice(0, 10), count: count || 0 });
  }

  return NextResponse.json({
    totalBusinesses: totalBusinesses || 0,
    latest: latest || [],
    trend: buckets,
  });
}
