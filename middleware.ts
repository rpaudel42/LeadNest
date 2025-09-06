// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Only guard /admin and /api/admin/*
  const url = new URL(req.url);
  const isAdminRoute =
    url.pathname === '/admin' ||
    url.pathname.startsWith('/admin/') ||
    url.pathname.startsWith('/api/admin/');

  if (!isAdminRoute) return res;

  // Require logged-in user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const signInUrl = new URL('/signin', req.url);
    signInUrl.searchParams.set('redirect', url.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check superadmin role
  const { data: superadmin } = await supabase
    .from('superadmins')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (!superadmin) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
