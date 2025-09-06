// lib/supabaseServerAuth.ts
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { type Database } from './types'; // optional if you have typed schema

export function getServerClient() {
  return createServerComponentClient<Database>({ cookies });
}
