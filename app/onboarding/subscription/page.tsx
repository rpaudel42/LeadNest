
'use client';
import Container from '@/components/Container';
import Button from '@/components/Button';
import { useState } from 'react';

const plans = [
  { id: 'bronze', name: 'Bronze', price: 299, desc: '4 posts / month' },
  { id: 'silver', name: 'Silver', price: 499, desc: '12 posts / month' },
  { id: 'gold', name: 'Gold', price: 999, desc: '20 posts / month + video' },
  { id: 'platinum', name: 'Platinum', price: 1499, desc: 'Unlimited + ads + reporting' },
];

export default function SubscriptionPage(){
  const [selected, setSelected] = useState<string>('silver');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string|null>(null);

  async function checkout(){
    setLoading(true);
    const res = await fetch('/api/stripe/checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ plan: selected }) });
    setLoading(false);
    if(!res.ok){ setMsg('Checkout failed'); return; }
    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <Container>
      <h1 className="text-2xl font-semibold mb-4">Choose a Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map(p => (
          <div key={p.id} className={"border rounded p-4 " + (selected===p.id ? "ring-2 ring-black" : "")} onClick={()=>setSelected(p.id)}>
            <h2 className="text-xl font-semibold">{p.name}</h2>
            <p className="text-zinc-600">${p.price}/mo</p>
            <p className="mt-2">{p.desc}</p>
          </div>
        ))}
      </div>
      <Button className="mt-6" onClick={checkout} loading={loading}>Proceed to Payment</Button>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </Container>
  );
}
