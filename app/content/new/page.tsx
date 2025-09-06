'use client';
import { useEffect, useState } from 'react';
import { CalendarClock, CheckCircle2, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

type PrefRow = { id: string; name: string | null; content_type: string; platforms: string[] | null; categories: string[] | null; idea: string | null; };

export default function NewContentPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<PrefRow[]>([]);
  const [prefId, setPrefId] = useState<string>('');
  const [idea, setIdea] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [loadingGen, setLoadingGen] = useState(false);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [picked, setPicked] = useState<number | null>(null);

  // load preferences list
  useEffect(() => {
    (async () => {
      const res = await fetch('/api/content/preferences', { cache: 'no-store' });
      const data = await res.json();
      const items: PrefRow[] = (data.items || []).map((r: any) => ({
        id: r.id, name: r.name, content_type: r.content_type,
        platforms: r.platforms || [], categories: r.categories || [], idea: r.idea || null
      }));
      setPrefs(items);
      if (items[0]) {
        setPrefId(items[0].id);
        setPlatforms(items[0].platforms || []);
        setCategories(items[0].categories || []);
        setIdea(items[0].idea || '');
      }
    })();
  }, []);

  function toggle(arr: string[], v: string) {
    const s = new Set(arr);
    s.has(v) ? s.delete(v) : s.add(v);
    return Array.from(s);
  }

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (!prefId) { alert('Select a preference first'); return; }
    setLoadingGen(true); setCandidates([]); setPicked(null);
    const res = await fetch('/api/content/generate', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ preferenceId: prefId, content_type: 'text', categories, idea })
    });
    setLoadingGen(false);
    if (res.ok) {
      const data = await res.json();
      setCandidates(data.posts || []);
    } else {
      const j = await res.json().catch(()=>({}));
      alert(j.error || 'Generation failed');
    }
  }

  async function saveAndSchedule() {
    if (picked == null) { alert('Pick a post'); return; }
    const when = (document.getElementById('scheduleAt') as HTMLInputElement)?.value;
    if (!when) { alert('Pick a schedule date/time'); return; }
    const res = await fetch('/api/content/create-and-schedule', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({
        preference_id: prefId,
        content_type: 'text',
        platforms,
        categories,
        idea,
        caption: candidates[picked],
        scheduled_at: new Date(when).toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
    });
    if (res.ok) {
      const { id } = await res.json();
      router.replace(`/content/${id}`);
    } else {
      const j = await res.json().catch(()=>({}));
      alert(j.error || 'Save failed');
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New Content</h1>

      {/* Step 1: pick preference */}
      <div className="card grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm">Preference</label>
          <div className="relative mt-1">
            <select className="select pr-10" value={prefId} onChange={(e)=> {
              const id = e.target.value; setPrefId(id);
              const p = prefs.find(x=>x.id===id);
              if (p) { setPlatforms(p.platforms || []); setCategories(p.categories || []); setIdea(p.idea || ''); }
            }}>
              {prefs.map(p=><option key={p.id} value={p.id}>{p.name || 'Untitled'}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--muted))]" />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm">Idea (override)</label>
          <input className="input mt-1" value={idea} onChange={e=>setIdea(e.target.value)} placeholder="Refine the idea from the preference (optional)" />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm">Categories</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {(categories || []).map(c => (
              <span key={c} className="px-3 py-1.5 rounded-full border border-[rgb(var(--ring))]">{c}</span>
            ))}
          </div>
          {/* quick adder: comma input */}
          <input className="input mt-2" placeholder="Add categories (comma separated)"
            onBlur={(e)=>{
              const extra = e.target.value.split(',').map(s=>s.trim()).filter(Boolean);
              if (extra.length) setCategories(prev=>Array.from(new Set([...(prev||[]), ...extra])));
              e.currentTarget.value='';
            }}/>
          <div className="text-xs text-[rgb(var(--muted))] mt-1">Tip: click out to add.</div>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm">Platforms</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {['instagram','facebook','linkedin','tiktok','x'].map(p=>{
              const active = (platforms || []).includes(p);
              return (
                <button key={p} type="button"
                  onClick={()=>setPlatforms(prev=>toggle(prev||[], p))}
                  className={`px-3 py-1.5 rounded-full border capitalize ${active ? 'bg-[rgb(var(--bg-muted))] border-brand-500 text-brand-700' : 'border-[rgb(var(--ring))] hover:bg-[rgb(var(--bg-muted))]'}`}>
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-2">
          <button className="btn btn-primary" onClick={generate} disabled={loadingGen || !prefId}>
            {loadingGen ? 'Generating…' : 'Generate 5'}
          </button>
        </div>
      </div>

      {/* Step 2: pick candidate */}
      {candidates.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">Pick your favorite</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.map((t, i) => {
              const active = picked === i;
              return (
                <button key={i} type="button" onClick={()=>setPicked(i)}
                  className={`text-left rounded-2xl border p-4 transition ${
                    active ? 'border-brand-500 bg-brand-50'
                           : 'border-[rgb(var(--ring))] bg-white hover:bg-[rgb(var(--bg-muted))]'
                  }`}>
                  <div className="flex items-start gap-2">
                    {active ? <CheckCircle2 className="w-5 h-5 text-brand-600 mt-0.5"/> :
                              <span className="w-5 h-5 mt-1 rounded-full border flex items-center justify-center text-xs">{i+1}</span>}
                    <p className="whitespace-pre-wrap">{t}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Schedule */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-3">
            <div>
              <label className="text-sm">Schedule</label>
              <div className="flex items-center gap-2 mt-1">
                <input id="scheduleAt" type="datetime-local" className="input" />
                <CalendarClock className="w-5 h-5 text-[rgb(var(--muted))]" />
              </div>
            </div>
            <button className="btn btn-primary" onClick={saveAndSchedule} disabled={picked==null}>Save & Schedule</button>
          </div>
        </div>
      )}
    </div>
  );
}
