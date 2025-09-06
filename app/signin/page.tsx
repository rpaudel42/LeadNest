
'use client';
import Container from '@/components/Container';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();

    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMsg(error.message);
      return;
    }

    // get the user id after successful sign-in
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      setMsg('Signed in, but no user session found.');
      return;
    }

    // check if current user is superadmin
    const { data: sa } = await supabase
      .from('superadmins')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    // redirect based on role
    window.location.href = sa ? '/admin' : '/dashboard';
  }

  return (
    <Container>
      <h1 className="text-2xl font-semibold mb-4">Sign In</h1>
      <form onSubmit={onSignIn} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <Button type="submit">Sign In</Button>
      </form>
      {msg && <p className="mt-4 text-sm text-zinc-700">{msg}</p>}
    </Container>
  );
}
