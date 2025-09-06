'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Row = {
  id: string;
  content_type: string;
  platforms: string[];
  categories: string[];
  idea: string | null;
  status: 'draft'|'scheduled'|'published';
  scheduled_at: string | null;
  created_at: string;
  updated_at: string | null;
};

export default function ContentIndex() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/content', { cache: 'no-store' });
      const data = await res.json();
      setRows(data.items || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Content</h1>
        <Link href="/content/new" className="btn btn-primary">New Content</Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Platforms</th>
              <th className="py-2 pr-4">Categories</th>
              <th className="py-2 pr-4">Idea</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Scheduled</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-b last:border-none hover:bg-[rgb(var(--bg-muted))]">
                <td className="py-2 pr-4 capitalize">
                  <Link href={`/content/${r.id}`} className="underline">{r.content_type}</Link>
                </td>
                <td className="py-2 pr-4 capitalize">{(r.platforms || []).join(', ') || '—'}</td>
                <td className="py-2 pr-4">{(r.categories || []).join(', ') || '—'}</td>
                <td className="py-2 pr-4 truncate max-w-[260px]">{r.idea || '—'}</td>
                <td className="py-2 pr-4">{r.status}</td>
                <td className="py-2">{r.scheduled_at ? new Date(r.scheduled_at).toLocaleString() : '—'}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={6} className="py-6 text-center text-[rgb(var(--muted))]">No content yet. Create one!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
