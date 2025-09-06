
'use client';
import Container from '@/components/Container';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export default function SignUpPage(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string>('');
  const [msg, setMsg] = useState<string|null>(null);

  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token') || '';
    setToken(t);
    // Optionally fetch invite email from token
    (async ()=>{
      if(!t) return;
      const res = await fetch('/api/invites/lookup?token=' + encodeURIComponent(t));
      if(res.ok){
        const data = await res.json();
        if(data?.email) setEmail(data.email);
      }
    })();
  },[]);

  async function onSignUp(e: React.FormEvent){
    e.preventDefault();
    // verify token
    const res = await fetch('/api/invites/accept', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ token }) });
    if(!res.ok){ setMsg('Invalid or expired invite.'); return; }
    // create auth user
    const { data, error } = await supabase.auth.signUp({ email, password });
    if(error){ setMsg(error.message); return; }
    // create business profile
    await fetch('/api/business/create', { method:'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email }) });
    setMsg('Account created! Redirecting...');
    window.location.href = '/onboarding/business-info';
  }

  return (
    <Container>
      <h1 className="text-2xl font-semibold mb-4">Create Your Account</h1>
      <form onSubmit={onSignUp} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <Button type="submit">Create Account</Button>
      </form>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </Container>
  );
}
