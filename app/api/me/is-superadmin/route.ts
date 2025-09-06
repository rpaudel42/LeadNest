// app/api/me/is-superadmin/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ ok: false, superadmin: false });

  const { data } = await supabase
    .from('superadmins')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  return NextResponse.json({ ok: true, superadmin: !!data });
}
