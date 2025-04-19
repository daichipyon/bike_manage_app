'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type Database } from '@/types/supabase';

// For server components - this file is marked with 'use server'
export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => {
          // Implement your own logic for setting cookies here
          console.warn('Setting cookies is not directly supported with ReadonlyRequestCookies.');
        },
        remove: (name, options) => {
          // Implement your own logic for removing cookies here
          console.warn('Removing cookies is not directly supported with ReadonlyRequestCookies.');
        },
      },
    }
  );
};