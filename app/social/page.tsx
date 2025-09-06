'use client';
import { useEffect, useState } from 'react';
import { Trash2, Link2, Instagram, Linkedin, Twitter, Youtube, Facebook, PlaySquare, ImagePlus } from 'lucide-react';

type Row = {
  id: string;
  provider: 'instagram'|'facebook'|'linkedin'|'tiktok'|'x'|'youtube'|'pinterest'|'mock';
  account_id: string;
  handle: string | null;
  display_name: string | null;
  picture_url: string | null;
  status: 'connected'|'expired'|'revoked'|'error';
  expires_at: string | null;
  last_error?: string | null;
};

const ICON: Record<string, JSX.Element> = {
  instagram: <Instagram className="w-5 h-5 text-pink-500" />,
  facebook:  <Facebook className="w-5 h-5 text-blue-600" />,
  linkedin:  <Linkedin className="w-5 h-5 text-sky-700" />,
  x:         <Twitter className="w-5 h-5" />,
  tiktok:    <PlaySquare className="w-5 h-5" />,
  youtube:   <Youtube className="w-5 h-5 text-red-600" />,
  pinterest: <ImagePlus className="w-5 h-5 text-red-500" />,
  mock:      <Link2 className="w-5 h-5 text-zinc-600" />
};

export default function SocialAccountsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [mockHandle, setMockHandle] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/social/accounts', { cache: 'no-store' });
    const j = await res.json();
    setRows(j.items || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function linkMock() {
    setLinking(true);
    const res = await fetch('/api/social/connect/mock', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ handle: mockHandle || '@mock_account' })
    });
    setLinking(false);
    if (!res.ok) alert((await res.json()).error || 'Link failed');
    await load();
    setMockHandle('');
  }

  async function remove(id: string) {
    if (!confirm('Remove this social account?')) return;
    const res = await fetch('/api/social/accounts', {
      method: 'DELETE',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ id })
    });
    if (!res.ok) alert((await res.json()).error || 'Delete failed');
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Social Accounts</h1>
        <div className="flex gap-2">
          {/* In prod, show real providers here; for dev, mock is enough */}
          <div className="card flex items-center gap-2">
            <input className="input" placeholder="@your_handle (mock)" value={mockHandle} onChange={e=>setMockHandle(e.target.value)} />
            <button className="btn btn-primary" onClick={linkMock} disabled={linking}>
              {linking ? 'Linking…' : 'Link Social Account (Mock)'}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-6">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-lg font-medium mb-1">No accounts linked</div>
          <p className="text-sm text-[rgb(var(--muted))] mb-4">Link a social account to start posting.</p>
          <button className="btn btn-primary" onClick={linkMock}>Link Social Account (Mock)</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rows.map(a => (
            <div key={a.id} className="card flex items-center gap-4">
              <div className="shrink-0">{ICON[a.provider] || ICON.mock}</div>
              <div className="flex-1">
                <div className="font-medium">
                  {a.display_name || a.handle || a.account_id}
                </div>
                <div className="text-sm text-[rgb(var(--muted))]">
                  <span className="capitalize">{a.provider}</span>
                  {a.handle ? <span> · {a.handle}</span> : null}
                  <span> · {a.status}</span>
                </div>
                {a.last_error && <div className="text-xs text-amber-600 mt-1">⚠ {a.last_error}</div>}
              </div>
              <button className="btn btn-outline" onClick={()=>remove(a.id)}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
