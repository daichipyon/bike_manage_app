import { createSupabaseServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = await createSupabaseServerClient();

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  // Redirect to dashboard if authenticated, otherwise to login
  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}