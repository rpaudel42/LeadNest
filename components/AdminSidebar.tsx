// components/AdminSidebar.tsx
'use client';
import Link from 'next/link';
import { BarChart3, Users, Settings, Home } from 'lucide-react';

const Item = ({ href, icon: Icon, label }: any) => (
  <Link
    href={href}
    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-100"
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </Link>
);

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-[rgb(var(--bg-muted))] border-r border-[rgb(var(--ring))] p-4 rounded-r-2xl shadow-soft">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Admin</h2>
        <p className="text-xs text-zinc-500">Social Media AI Agent</p>
      </div>
      <nav className="space-y-1">
        <Item href="/admin" icon={BarChart3} label="Dashboard" />
        <Item href="/admin/merchants" icon={Users} label="Business" />
        <Item href="/dashboard" icon={Home} label="User Dashboard" />
        <Item href="/admin/settings" icon={Settings} label="Settings" />
      </nav>
    </aside>
  );
}
