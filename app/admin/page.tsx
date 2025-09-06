// app/admin/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card'; // see quick Card below or swap with a div
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

type Stats = {
  totalBusinesses: number;
  latest: { id: string; business_name: string; email: string; created_at: string }[];
  trend: { weekStart: string; count: number }[];
};

type Invite = {
  id: string;
  email: string;
  status: string;
  invite_type: string;
  created_at: string;
  action_link: string;
};


export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/stats');
      if (res.ok) setStats(await res.json());
    })();
  }, []);

  const [invites, setInvites] = useState<Invite[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/merchants/invites');
      if (res.ok) {
        const data = await res.json();
        setInvites(data.invites || []);
      }
    })();
  }, []);
  

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm text-zinc-500">Total Businesses</div>
          <div className="text-2xl font-semibold">{stats?.totalBusinesses ?? '—'}</div>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm text-zinc-500">New This Week</div>
          <div className="text-2xl font-semibold">
            {stats?.trend?.at(-1)?.count ?? '—'}
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm text-zinc-500">Last 8 Weeks Total</div>
          <div className="text-2xl font-semibold">
            {stats?.trend?.reduce((a, b) => a + b.count, 0) ?? '—'}
          </div>
        </div>
      </div>

      {/* Trend chart */}
      <div className="border rounded-lg p-4 bg-white">
        <div className="mb-3 font-semibold">Businesses per Week</div>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.trend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="weekStart" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Latest signups */}
      <div className="border rounded-lg p-4 bg-white">
        <div className="mb-3 font-semibold">Latest Businesses</div>
        <div className="divide-y">
          {(stats?.latest || []).map((b) => (
            <div key={b.id} className="py-2 flex items-center justify-between">
              <div>
                <div className="font-medium">{b.business_name || '(Unnamed)'}</div>
                <div className="text-sm text-zinc-500">{b.email}</div>
              </div>
              <div className="text-sm text-zinc-500">
                {new Date(b.created_at).toLocaleString()}
              </div>
            </div>
          ))}
          {!stats?.latest?.length && <div className="text-sm text-zinc-500">No data yet.</div>}
        </div>
      </div>

      {/* Latest invite */}
      <div className="border rounded-lg p-4 bg-white mt-6">
        <h2 className="text-lg font-semibold mb-3">Latest Merchant Invites</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Email</th>
              <th className="py-2">Status</th>
              <th className="py-2">Date</th>
              <th className="py-2">Link</th>
            </tr>
          </thead>
          <tbody>
            {invites.map((inv) => (
              <tr key={inv.id} className="border-b last:border-none">
                <td className="py-2">{inv.email}</td>
                <td className="py-2">{inv.status}</td>
                <td className="py-2">{new Date(inv.created_at).toLocaleString()}</td>
                <td className="py-2">
                  <a
                    href={inv.action_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Open
                  </a>
                </td>
              </tr>
            ))}
            {!invites.length && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-zinc-500">
                  No invites yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}