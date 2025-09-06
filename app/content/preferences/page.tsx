'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Row = {
  id: string;
  name: string | null;
  content_type: string;
  categories: string[] | null;
  tone: string | null;
  audience: string | null;
  idea: string | null;
  platforms: string[] | null;
  emoji_style: string | null;
  created_at: string;
  updated_at: string | null;
};

export default function PreferencesIndex() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/content/preferences', { cache: 'no-store' });
      const data = await res.json();
      setRows(data.items || []);
      setLoading(false);
    })();
  }, []);

  async function createNew() {
    setCreating(true);
    const res = await fetch('/api/content/preferences', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ name: 'New Preference', platforms: ['instagram'], content_type: 'text' })
    });
    setCreating(false);
    if (res.ok) {
      const { id } = await res.json();
      window.location.href = `/content/preferences/${id}`;
    } else {
      alert('Failed to create preference');
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Content Preferences</h1>
        {/* <button onClick={createNew} className="btn btn-primary" disabled={creating}>
          {creating ? 'Creating…' : 'New Preference'}
        </button> */}
        <Link href="/content/preferences/new" className="btn btn-primary">New Preference</Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Platforms</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Tone</th>
              <th className="py-2 pr-4">Persona</th>
              <th className="py-2 pr-4">Idea</th>
              <th className="py-2">Categories</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-b last:border-none hover:bg-[rgb(var(--bg-muted))]">
                <td className="py-2 pr-4">
                  <Link href={`/content/preferences/${r.id}`} className="underline">
                    {r.name || 'Untitled'}
                  </Link>
                </td>
                <td className="py-2 pr-4 capitalize">{(r.platforms || []).join(', ') || '—'}</td>
                <td className="py-2 pr-4">{r.content_type}</td>
                <td className="py-2 pr-4">{r.tone || '—'}</td>
                <td className="py-2 pr-4">{r.audience || '—'}</td>
                <td className="py-2 pr-4 truncate max-w-[260px]">{r.idea || '—'}</td>
                <td className="py-2">{(r.categories || []).join(', ') || '—'}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={7} className="py-6 text-center text-[rgb(var(--muted))]">No preferences yet. Create one!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
