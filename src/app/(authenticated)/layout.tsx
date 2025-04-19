import { createSupabaseServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  // If no session, redirect to login
  if (!session) {
    redirect('/login');
  }
  
  return <>{children}</>;
}