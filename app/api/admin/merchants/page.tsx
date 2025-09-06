'use client';
import { useState } from 'react';

export default function AdminMerchantsPage() {
  const [form, setForm] = useState({ email:'', business_name:'', contact_person:'' });
  const [msg, setMsg] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form, v: string) => setForm(p=>({...p,[k]:v}));

  async function sendInvite(e: React.FormEvent){
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/merchants/invite', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(form)
    });
    setLoading(false);
    setMsg(res.ok ? 'Invite sent!' : 'Failed to send invite');
  }

  return (
    <div className="max-w-lg space-y-3">
      <h1 className="text-2xl font-semibold">Invite Merchant</h1>
      <form onSubmit={sendInvite} className="grid gap-3 bg-white p-4 border rounded">
        <input className="border p-2" placeholder="Merchant Email" value={form.email} onChange={e=>set('email', e.target.value)} />
        <input className="border p-2" placeholder="Business Name" value={form.business_name} onChange={e=>set('business_name', e.target.value)} />
        <input className="border p-2" placeholder="Contact Person" value={form.contact_person} onChange={e=>set('contact_person', e.target.value)} />
        <button className="px-4 py-2 bg-black text-white rounded disabled:opacity-60" disabled={loading}>
          {loading ? '...' : 'Send Invite'}
        </button>
      </form>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
