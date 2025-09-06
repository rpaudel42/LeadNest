import { redirect } from 'next/navigation';
import { getServerClient } from '@/lib/supabaseServerAuth';
import MerchantDashboardClient from './widget'; // client UI (charts)

export default async function Dashboard() {
  const sb = getServerClient();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) redirect('/signin?redirect=/dashboard');

  // If superadmin → go to admin home
  const { data: sa } = await sb.from('superadmins').select('id').eq('user_id', session.user.id).maybeSingle();
  if (sa) redirect('/admin');

  return <MerchantDashboardClient />;
}
