'use client';
import { useEffect, useState } from 'react';
import { Pencil, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const PLATFORM_OPTS = ['instagram','facebook','linkedin','tiktok','x'];
const EMOJI_OPTS = ['none','minimal','heavy'];
const CATEGORIES = ['funny','informative','blog','inspiring','educational','promotional','behind_the_scenes'];
const TIMEZONES = ['America/Chicago','America/New_York','America/Los_Angeles','UTC','Europe/London','Asia/Kathmandu'];

type Prefs = {
  id?: string;
  name?: string | null;
  content_type?: 'text' | 'image' | 'video';
  categories?: string[];
  idea?: string | null;
  tone?: string | null;
  audience?: string | null;
  geo_focus?: string | null;
  preferred_hashtags?: string[];
  banned_hashtags?: string[];
  platforms?: string[];
  emoji_style?: 'none' | 'minimal' | 'heavy';
  frequency?: number | null;
  preferred_times?: string[];
  timezone?: string | null;
  approval_required?: boolean;
};

export default function PrefDetail({ params }: { params: { id: string } }) {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [form, setForm] = useState<Prefs>({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/content/preferences/${params.id}`, { cache: 'no-store' });
      const data = await res.json();
      setPrefs(data.prefs);
      setForm(data.prefs || {});
    })();
  }, [params.id]);

  function set<K extends keyof Prefs>(k: K, v: Prefs[K]) {
    setForm(prev => ({ ...prev, [k]: v }));
  }
  const toggleSet = (key: 'platforms'|'categories', v: string) => {
    setForm(prev => {
      const list = new Set((prev[key] as string[] | undefined) || []);
      list.has(v) ? list.delete(v) : list.add(v);
      return { ...prev, [key]: Array.from(list) };
    });
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const res = await fetch(`/api/content/preferences/${params.id}`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setPrefs(form);
      setEditing(false);
      setMsg('Saved!');
    } else {
      const j = await res.json().catch(()=>({}));
      setMsg(j.error || 'Save failed');
    }
  }

  if (!prefs) return <div className="p-6">Loading…</div>;

  // CARD VIEW
  if (!editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{prefs.name || 'Untitled Preference'}</h1>
          <div className="flex gap-2">
            <Link href="/content/preferences" className="btn btn-outline">Back to list</Link>
            <button className="btn btn-primary" onClick={()=>{setForm(prefs); setEditing(true);}}>
              <Pencil className="w-4 h-4" /> Edit
            </button>
          </div>
        </div>

        <div className="card grid grid-cols-1 md:grid-cols-2 gap-4">
          <KV k="Platforms" v={(prefs.platforms || []).join(', ') || '—'} />
          <KV k="Content Type" v={prefs.content_type || 'text'} />
          <KV k="Tone" v={prefs.tone || '—'} />
          <KV k="Persona" v={prefs.audience || '—'} />
          <KV k="Geo Focus" v={prefs.geo_focus || '—'} />
          <KV k="Emoji Style" v={prefs.emoji_style || 'minimal'} />
          <KV k="Posts/Week" v={String(prefs.frequency ?? '—')} />
          <KV k="Timezone" v={prefs.timezone || '—'} />
          <KV k="Idea" v={prefs.idea || '—'} className="md:col-span-2" />
          <KV k="Categories" v={(prefs.categories || []).join(', ') || '—'} className="md:col-span-2" />
          <KV k="Preferred Hashtags" v={(prefs.preferred_hashtags || []).map(h=>`#${h}`).join(' ') || '—'} className="md:col-span-2" />
          <KV k="Banned Hashtags" v={(prefs.banned_hashtags || []).map(h=>`#${h}`).join(' ') || '—'} className="md:col-span-2" />
        </div>
      </div>
    );
  }

  // EDIT VIEW
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Edit Preference</h1>
      {msg && <div className="text-sm">{msg}</div>}
      <form onSubmit={save} className="card grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm">Name</label>
          <input className="input mt-1" value={form.name || ''} onChange={e=>set('name', e.target.value)} />
        </div>

        <div>
          <label className="text-sm">Content Type</label>
          <div className="relative mt-1">
            <select className="select pr-10" value={form.content_type || 'text'} onChange={e=>set('content_type', e.target.value as any)}>
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--muted))]" />
          </div>
        </div>

        <div>
          <label className="text-sm">Tone</label>
          <input className="input mt-1" value={form.tone || ''} onChange={e=>set('tone', e.target.value)} placeholder="professional, playful, etc." />
        </div>

        <div>
          <label className="text-sm">Persona</label>
          <input className="input mt-1" value={form.audience || ''} onChange={e=>set('audience', e.target.value)} placeholder="first-time homebuyers in Austin" />
        </div>

        <div>
          <label className="text-sm">Geo Focus</label>
          <input className="input mt-1" value={form.geo_focus || ''} onChange={e=>set('geo_focus', e.target.value)} placeholder="City/Region" />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm">Idea</label>
          <input className="input mt-1" value={form.idea || ''} onChange={e=>set('idea', e.target.value)} placeholder="e.g., staging tips before listing" />
        </div>

        {/* categories chips */}
        <div className="md:col-span-2">
          <label className="text-sm">Categories</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORIES.map(c => {
              const active = (form.categories || []).includes(c);
              return (
                <button key={c} type="button" onClick={()=>toggleSet('categories', c)}
                  className={`px-3 py-1.5 rounded-full border ${active ? 'bg-[rgb(var(--bg-muted))] border-brand-500 text-brand-700' : 'border-[rgb(var(--ring))] hover:bg-[rgb(var(--bg-muted))]'}`}>
                  {c.replaceAll('_',' ')}
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm">Platforms</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PLATFORM_OPTS.map(p => {
              const active = (form.platforms || []).includes(p);
              return (
                <button key={p} type="button" onClick={()=>toggleSet('platforms', p)}
                  className={`px-3 py-1.5 rounded-full border capitalize ${active ? 'bg-[rgb(var(--bg-muted))] border-brand-500 text-brand-700' : 'border-[rgb(var(--ring))] hover:bg-[rgb(var(--bg-muted))]'}`}>
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-sm">Emoji Style</label>
          <div className="relative mt-1">
            <select className="select pr-10" value={form.emoji_style || 'minimal'} onChange={e=>set('emoji_style', e.target.value as any)}>
              {EMOJI_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--muted))]" />
          </div>
        </div>

        <div>
          <label className="text-sm">Posts per week</label>
          <input className="input mt-1" type="number" min={0} max={21}
            value={form.frequency ?? 3}
            onChange={e=>set('frequency', Number(e.target.value))}
          />
        </div>

        <div>
          <label className="text-sm">Preferred Times (HH:MM, comma separated)</label>
          <input className="input mt-1"
            value={(form.preferred_times || []).join(', ')}
            onChange={e=>set('preferred_times', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))}
          />
        </div>

        <div>
          <label className="text-sm">Timezone</label>
          <div className="relative mt-1">
            <select className="select pr-10" value={form.timezone || ''} onChange={e=>set('timezone', e.target.value)}>
              <option value="">Select timezone</option>
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--muted))]" />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm">Approval required</label>
          <div className="mt-2 flex items-center gap-3">
            <input id="approval" type="checkbox" checked={!!form.approval_required} onChange={e=>set('approval_required', e.target.checked)} />
            <label htmlFor="approval" className="text-sm">Require my approval before posting</label>
          </div>
        </div>

        <div>
          <label className="text-sm">Preferred Hashtags (comma)</label>
          <input className="input mt-1"
            value={(form.preferred_hashtags || []).join(', ')}
            onChange={e=>set('preferred_hashtags', e.target.value.split(',').map(s=>s.trim().replace(/^#/,'')).filter(Boolean))}
          />
        </div>
        <div>
          <label className="text-sm">Banned Hashtags (comma)</label>
          <input className="input mt-1"
            value={(form.banned_hashtags || []).join(', ')}
            onChange={e=>set('banned_hashtags', e.target.value.split(',').map(s=>s.trim().replace(/^#/,'')).filter(Boolean))}
          />
        </div>

        <div className="md:col-span-2 flex gap-2">
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          <Link href="/content/preferences" className="btn btn-outline">Cancel</Link>
        </div>
      </form>
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
