// app/auth/reset-password/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // 1) On mount, set session from the hash tokens in the recovery link
  useEffect(() => {
    (async () => {
      try {
        const hash = window.location.hash.startsWith('#')
          ? window.location.hash.slice(1)
          : window.location.hash;
        const params = new URLSearchParams(hash);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) {
            console.error('setSession error:', error.message);
            setMsg('Link invalid or expired. Please request a new reset email.');
            setReady(false);
            return;
          }
        } else {
          // No tokens in URL — user didn’t come from the email link
          setMsg('Missing auth session. Open this page from the password email link.');
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // 2) Submit new password
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMsg(error.message || 'Failed to update password');
      return;
    }
    setMsg('Password updated. Redirecting to sign in…');
    setTimeout(() => (window.location.href = '/signin'), 800);
  }

  if (!ready) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Set your password</h1>
      <form onSubmit={submit} className="space-y-3">
        <input
          className="border p-2 w-full"
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="px-4 py-2 bg-black text-white rounded">Update Password</button>
      </form>
      {msg && <p className="mt-3 text-sm">{msg}</p>}
    </div>
  );
}
