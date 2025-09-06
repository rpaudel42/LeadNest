'use client';
import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';

type Stats = { totalPosts:number; scheduledPosts:number; chart: { date:string; likes:number; comments:number; shares:number; impressions:number }[] };

export default function MerchantDashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/merchant/stats', { cache: 'no-store' });
      if (res.ok) setStats(await res.json());
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Your Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded p-4 bg-white">
          <div className="text-sm text-zinc-500">Total Posts</div>
          <div className="text-2xl font-semibold">{stats?.totalPosts ?? '—'}</div>
        </div>
        <div className="border rounded p-4 bg-white">
          <div className="text-sm text-zinc-500">Scheduled</div>
          <div className="text-2xl font-semibold">{stats?.scheduledPosts ?? '—'}</div>
        </div>
        <div className="border rounded p-4 bg-white">
          <div className="text-sm text-zinc-500">Total Likes (last period)</div>
          <div className="text-2xl font-semibold">
            {(stats?.chart || []).reduce((a,b)=>a + (b.likes||0), 0)}
          </div>
        </div>
      </div>

      <div className="border rounded p-4 bg-white">
        <div className="mb-2 font-semibold">Engagement Over Time</div>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.chart || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="likes" strokeWidth={2} dot />
              <Line type="monotone" dataKey="comments" strokeWidth={2} dot />
              <Line type="monotone" dataKey="shares" strokeWidth={2} dot />
              <Line type="monotone" dataKey="impressions" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Shortcut tiles
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="/onboarding/business-info" className="border rounded p-4 bg-white hover:bg-zinc-50">Update Business Info</a>
        <a href="/onboarding/subscription" className="border rounded p-4 bg-white hover:bg-zinc-50">Manage Subscription</a>
      </div> */}
    </div>
  );
}
