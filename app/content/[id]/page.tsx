'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Content = {
  id: string;
  content_type: 'text'|'image'|'video'|'carousel'|'story'|'reel'|'short';
  platforms: string[];
  categories: string[];
  idea: string | null;
  caption: string | null;
  status: 'draft'|'generating'|'ready'|'scheduled'|'publishing'|'published'|'failed'|'canceled';
  scheduled_at: string | null;
  preference_id: string | null;
  created_at: string;
  updated_at: string | null;
};

type Target = {
  id: string;
  platform: string;
  destination_label: string | null;
  caption_override: string | null;
  first_comment: string | null;
  status: 'pending'|'ready'|'scheduled'|'publishing'|'published'|'failed'|'canceled';
  scheduled_at: string | null;
  published_at: string | null;
  external_url: string | null;
};

export default function ContentDetail({ params }: { params: { id: string } }) {
  const [content, setContent] = useState<Content | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);

  // edit state for a single target row
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Target>>({});

  useEffect(() => {
    (async () => {
      const cRes = await fetch(`/api/content/${params.id}`, { cache: 'no-store' });
      const cData = await cRes.json();
      setContent(cData.content);

      const tRes = await fetch(`/api/content/${params.id}/targets`, { cache: 'no-store' });
      const tData = await tRes.json();
      setTargets(tData.targets || []);

      setLoading(false);
    })();
  }, [params.id]);

  function startEdit(t: Target) {
    setEditingId(t.id);
    setForm({
      caption_override: t.caption_override || '',
      first_comment: t.first_comment || '',
      status: t.status,
      scheduled_at: t.scheduled_at ? toLocalInput(t.scheduled_at) : '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({});
  }

  async function saveEdit() {
    if (!editingId) return;
    const payload: any = {
      caption_override: form.caption_override ?? null,
      first_comment: form.first_comment ?? null,
      status: form.status,
      scheduled_at: form.scheduled_at ? new Date(form.scheduled_at as string).toISOString() : null,
    };
    const res = await fetch(`/api/content/${params.id}/targets/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      // refresh targets
      const tRes = await fetch(`/api/content/${params.id}/targets`, { cache: 'no-store' });
      const tData = await tRes.json();
      setTargets(tData.targets || []);
      cancelEdit();
    } else {
      const j = await res.json().catch(()=>({}));
      alert(j.error || 'Update failed');
    }
  }

  if (loading || !content) return <div className="p-6">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Content Preview</h1>
        <Link href="/content" className="btn btn-outline">Back to list</Link>
      </div>

      {/* Top meta card */}
      <div className="card grid grid-cols-1 md:grid-cols-2 gap-4">
        <KV k="Type" v={content.content_type} />
        <KV k="Status" v={content.status} />
        <KV k="Platforms" v={(content.platforms || []).join(', ') || '—'} />
        <KV k="Scheduled" v={content.scheduled_at ? new Date(content.scheduled_at).toLocaleString() : '—'} />
        <KV k="Categories" v={(content.categories || []).join(', ') || '—'} className="md:col-span-2"/>
        <KV k="Idea" v={content.idea || '—'} className="md:col-span-2" />
      </div>

      {/* Preview block for text caption */}
      {content.content_type === 'text' && (
        <div className="rounded-xl border border-[rgb(var(--ring))] p-4 bg-white dark:bg-[rgb(var(--bg-muted))]">
          <div className="text-xs text-[rgb(var(--muted))] mb-2">Post Text</div>
          <div className="whitespace-pre-wrap text-base">{content.caption}</div>
        </div>
      )}

      {/* Targets section */}
      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Per-platform Targets</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Platform</th>
              <th className="py-2 pr-4">Destination</th>
              <th className="py-2 pr-4">Scheduled</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Permalink</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {targets.map(t => {
              const isEditing = editingId === t.id;
              return (
                <tr key={t.id} className="border-b last:border-none align-top">
                  <td className="py-2 pr-4 capitalize">{t.platform}</td>
                  <td className="py-2 pr-4">{t.destination_label || '—'}</td>
                  <td className="py-2 pr-4">
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        className="input"
                        value={(form.scheduled_at as string) || ''}
                        onChange={e=>setForm(f=>({ ...f, scheduled_at: e.target.value }))}
                      />
                    ) : (
                      t.scheduled_at ? new Date(t.scheduled_at).toLocaleString() : '—'
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {isEditing ? (
                      <select
                        className="select pr-10"
                        value={form.status || t.status}
                        onChange={e=>setForm(f=>({ ...f, status: e.target.value as Target['status'] }))}
                      >
                        {['pending','ready','scheduled','publishing','published','failed','canceled'].map(s=>(
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      t.status
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {t.external_url ? <a className="underline" href={t.external_url} target="_blank" rel="noreferrer">View</a> : '—'}
                  </td>
                  <td className="py-2">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button className="btn btn-primary" onClick={saveEdit}>Save</button>
                        <button className="btn btn-outline" onClick={cancelEdit}>Cancel</button>
                      </div>
                    ) : (
                      <button className="btn btn-outline" onClick={()=>startEdit(t)}>Edit</button>
                    )}
                  </td>
                </tr>
              );
            })}
            {!targets.length && (
              <tr><td colSpan={6} className="py-6 text-center text-[rgb(var(--muted))]">No targets created (this content isn’t scheduled to any platforms yet).</td></tr>
            )}
          </tbody>
        </table>

        {/* Expandable editor for copy fields */}
        {editingId && (
          <div className="mt-4 rounded-xl border border-[rgb(var(--ring))] p-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Caption Override (optional)</label>
                <textarea
                  className="input mt-1 h-28"
                  value={form.caption_override ?? ''}
                  onChange={e=>setForm(f=>({ ...f, caption_override: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm">First Comment (optional)</label>
                <textarea
                  className="input mt-1 h-28"
                  value={form.first_comment ?? ''}
                  onChange={e=>setForm(f=>({ ...f, first_comment: e.target.value }))}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
              <button className="btn btn-outline" onClick={cancelEdit}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function KV({ k, v, className='' }: { k: string; v: string; className?: string }) {
  return (
    <div className={`rounded-xl border border-[rgb(var(--ring))] p-3 bg-white dark:bg-[rgb(var(--bg-muted))] ${className}`}>
      <div className="text-xs text-[rgb(var(--muted))]">{k}</div>
      <div className="mt-1 font-medium break-words">{v}</div>
    </div>
  );
}

// Helpers
function toLocalInput(iso: string) {
  // Convert ISO string to local 'YYYY-MM-DDTHH:mm' for datetime-local
  const d = new Date(iso);
  const pad = (n:number)=> String(n).padStart(2,'0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth()+1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
