'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PLATFORM_OPTS = ['instagram','facebook','linkedin','tiktok','x'];
const EMOJI_OPTS = ['none','minimal','heavy'];
const CATEGORIES = ['funny','informative','blog','inspiring','educational','promotional','behind_the_scenes'];
const TIMEZONES = ['America/Chicago','America/New_York','America/Los_Angeles','UTC','Europe/London','Asia/Kathmandu'];

export default function NewPreferencePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    name: '',
    content_type: 'text',
    platforms: ['instagram'],
    categories: [],
    emoji_style: 'minimal',
    approval_required: true,
    preferred_times: [],
  });
  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));
  const toggle = (key: 'platforms'|'categories', v: string) =>
    setForm((p: any) => {
      const s = new Set(p[key] || []);
      s.has(v) ? s.delete(v) : s.add(v);
      return { ...p, [key]: Array.from(s) };
    });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/content/preferences', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      const { id } = await res.json();
      router.replace(`/content/preferences/${id}`); // go to the card view of the new preference
    } else {
      const j = await res.json().catch(()=>({}));
      alert(j.error || 'Save failed');
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">New Preference</h1>
      <form onSubmit={save} className="card grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm">Name</label>
          <input className="input mt-1" value={form.name} onChange={e=>set('name', e.target.value)} placeholder="e.g., Instagram – Playful – Buyers" />
        </div>

        <div>
          <label className="text-sm">Content Type</label>
          <div className="relative mt-1">
            <select className="select pr-10" value={form.content_type} onChange={e=>set('content_type', e.target.value)}>
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
          <label className="text-sm">Seed Idea</label>
          <input className="input mt-1" value={form.idea || ''} onChange={e=>set('idea', e.target.value)} placeholder="e.g., staging tips before listing" />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm">Categories</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORIES.map(c=>{
              const active = (form.categories || []).includes(c);
              return (
                <button key={c} type="button" onClick={()=>toggle('categories', c)}
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
            {PLATFORM_OPTS.map(p=>{
              const active = (form.platforms || []).includes(p);
              return (
                <button key={p} type="button" onClick={()=>toggle('platforms', p)}
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
            <select className="select pr-10" value={form.emoji_style} onChange={e=>set('emoji_style', e.target.value)}>
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
          <label className="text-sm">Preferred Times (HH:MM, comma)</label>
          <input className="input mt-1"
            value={(form.preferred_times || []).join(', ')}
            onChange={e=>set('preferred_times', e.target.value.split(',').map((s)=>s.trim()).filter(Boolean))}
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
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Preference'}</button>
          <a href="/content/preferences" className="btn btn-outline">Cancel</a>
        </div>
      </form>
    </div>
  );
}
