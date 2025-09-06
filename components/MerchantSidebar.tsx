'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Building2, CreditCard, Link as LinkIcon,
  PenSquare, CalendarClock, BarChart3
} from 'lucide-react';

function Item({ href, label, Icon }: { href: string; label: string; Icon: any }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      className={
        'flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-100 ' +
        (active ? 'bg-zinc-100 font-medium' : '')
      }
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
}

export default function MerchantSidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-[rgb(var(--bg-muted))] border-r border-[rgb(var(--ring))] p-4 rounded-r-2xl shadow-soft">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Your Business</h2>
        <p className="text-xs text-zinc-500">Manage your presence</p>
      </div>
      <nav className="space-y-1">
        <Item href="/dashboard" label="Overview" Icon={Home} />
        <Item href="/onboarding/business-info" label="Business Info" Icon={Building2} />
        <Item href="/onboarding/subscription" label="Subscription" Icon={CreditCard} />
        <Item href="/social" label="Social Accounts" Icon={LinkIcon} />
        <Item href="/content/preferences" label="Content Preferences" Icon={PenSquare} />
        <Item href="/content" label="Content" Icon={CalendarClock} />
        <Item href="/posts" label="Posts & Schedule" Icon={CalendarClock} />
        <Item href="/analytics" label="Analytics" Icon={BarChart3} />
      </nav>
    </aside>
  );
}
