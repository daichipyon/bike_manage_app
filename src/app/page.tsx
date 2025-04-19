import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()

  // getUser()を使用して正確な認証状態を確認
  const { data: { user } } = await supabase.auth.getUser()
  
  // 認証済みならダッシュボードへ、未認証ならログインページへ
  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}