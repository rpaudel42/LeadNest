'use client';
import { useState } from 'react';
import { CalendarClock, CheckCircle2 } from 'lucide-react';

type Candidate = { text: string };

export default function ContentGeneratorPage() {
  const [contentType, setContentType] = useState<'text'|'image'|'video'>('text');
  const [categories, setCategories] = useState<string[]>([]);
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [picked, setPicked] = useState<number | null>(null);

  const toggleCat = (c: string) =>
    setCategories(prev => prev.includes(c) ? prev.filter(x=>x!==c) : [...prev, c]);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setPicked(null); setCandidates([]);
    const res = await fetch('/api/content/generate', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ content_type: contentType, categories, idea }),
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setCandidates((data.posts || []).map((t: string) => ({ text: t })));
    } else {
      const j = await res.json().catch(()=>({}));
      alert(j.error || 'Generation failed');
    }
  }

  async function schedule() {
    if (picked == null) return;
    const when = (document.getElementById('scheduleAt') as HTMLInputElement)?.value;
    if (!when) { alert('Pick a schedule date/time'); return; }
    const res = await fetch('/api/posts/schedule', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ text: candidates[picked].text, scheduled_at: new Date(when).toISOString() }),
    });
    if (res.ok) {
      alert('Scheduled!');
      setPicked(null); setCandidates([]);
    } else {
      const j = await res.json().catch(()=>({}));
      alert(j.error || 'Scheduling failed');
    }
  }

  const catOptions = ['funny','informative','blog','inspiring','educational','promotional','behind_the_scenes'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Generate Content</h1>

      {/* Criteria form */}
      <form onSubmit={generate} className="card grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm">Content Type</label>
          <div className="relative mt-1">
            <select className="select pr-10" value={contentType} onChange={e=>setContentType(e.target.value as any)}>
              <option value="text">Text (now)</option>
              <option value="image" disabled>Image (soon)</option>
              <option value="video" disabled>Video (soon)</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm">Idea (what should this post be about?)</label>
          <input className="input mt-1" placeholder="e.g., first-time homebuyer tips in Austin"
            value={idea} onChange={e=>setIdea(e.target.value)} />
        </div>

        <div className="md:col-span-3">
          <label className="text-sm">Idea Categories</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {catOptions.map(c => {
              const active = categories.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={()=>toggleCat(c)}
                  className={`px-3 py-1.5 rounded-full border ${active ? 'bg-[rgb(var(--bg-muted))] border-brand-500 text-brand-700' : 'border-[rgb(var(--ring))] text-[rgb(var(--text))] hover:bg-[rgb(var(--bg-muted))]'}`}
                >
                  {c.replaceAll('_',' ')}
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-3">
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Generating…' : 'Generate 5 Posts'}</button>
        </div>
      </form>

      {/* Candidates */}
      {candidates.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Pick your favorite</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.map((c, i) => {
              const active = picked === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={()=>setPicked(i)}
                  className={`text-left rounded-2xl border p-4 transition ${
                    active
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-[rgb(var(--ring))] bg-white hover:bg-[rgb(var(--bg-muted))]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {active ? <CheckCircle2 className="w-5 h-5 text-brand-600 mt-0.5"/> : <span className="w-5 h-5 mt-1 rounded-full border flex items-center justify-center text-xs">{i+1}</span>}
                    <p className="whitespace-pre-wrap">{c.text}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Schedule picker */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-3">
            <div>
              <label className="text-sm">Schedule</label>
              <div className="flex items-center gap-2 mt-1">
                <input id="scheduleAt" type="datetime-local" className="input" />
                <CalendarClock className="w-5 h-5 text-[rgb(var(--muted))]" />
              </div>
            </div>
            <button className="btn btn-primary" onClick={schedule} disabled={picked == null}>Schedule Selected</button>
          </div>
        </div>
      )}
    </div>
  );
}
