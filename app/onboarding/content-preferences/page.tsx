
'use client';
import Container from '@/components/Container';
import Button from '@/components/Button';
import { useState } from 'react';

export default function ContentPreferencesPage(){
  const [form, setForm] = useState({ tone:'professional', hashtags:'', ideas:'', frequency:12 });
  const [msg, setMsg] = useState<string|null>(null);
  function set<K extends keyof typeof form>(k: K, v: any){ setForm(prev=>({...prev, [k]:v})); }

  async function save(e: React.FormEvent){
    e.preventDefault();
    const res = await fetch('/api/content/preferences', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    setMsg(res.ok ? 'Saved! Onboarding complete.' : 'Failed to save');
    if(res.ok) window.location.href = '/dashboard';
  }

  return (
    <Container>
      <h1 className="text-2xl font-semibold mb-4">Content Preferences</h1>
      <form onSubmit={save} className="space-y-3">
        <label className="block">
          <span className="text-sm">Tone</span>
          <select className="border p-2 w-full" value={form.tone} onChange={e=>set('tone', e.target.value)}>
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="luxury">Luxury</option>
            <option value="casual">Casual</option>
          </select>
        </label>
        <textarea className="border p-2 w-full" placeholder="Hashtags (comma-separated)" value={form.hashtags} onChange={e=>set('hashtags', e.target.value)} />
        <textarea className="border p-2 w-full" placeholder="Content ideas (bullet points)" value={form.ideas} onChange={e=>set('ideas', e.target.value)} />
        <input className="border p-2 w-full" type="number" placeholder="Posts per month" value={form.frequency} onChange={e=>set('frequency', Number(e.target.value))} />
        <Button type="submit">Save & Finish</Button>
      </form>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </Container>
  );
}
