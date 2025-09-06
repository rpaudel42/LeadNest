'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string|null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setMsg(error.message); return; }
    setMsg('Password updated. Redirecting to sign in...');
    window.location.href = '/signin';
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Set your password</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="border p-2 w-full" type="password" placeholder="New password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="px-4 py-2 bg-black text-white rounded">Update Password</button>
      </form>
      {msg && <p className="mt-3 text-sm">{msg}</p>}
    </div>
  );
}
