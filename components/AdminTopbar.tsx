// components/AdminTopbar.tsx
'use client';
import { useEffect, useState } from 'react';
import { User2 } from 'lucide-react';
import { useTheme } from 'next-themes';
export default function AdminTopbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="h-14 bg-white dark:bg-[rgb(var(--bg-muted))] border-b border-[rgb(var(--ring))] flex items-center justify-between px-4 rounded-b-2xl">
      <div className="font-semibold">Dashboard</div>
      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 border rounded-full hover:bg-zinc-50"
        >
          <User2 className="w-5 h-5" />
          <span className="text-sm">Profile</span>
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md border bg-white shadow">
            <a className="block px-3 py-2 text-sm hover:bg-zinc-50" href="/profile">
              Settings
            </a>
            <form method="post" action="/api/auth/signout">
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50">
                Sign out
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
