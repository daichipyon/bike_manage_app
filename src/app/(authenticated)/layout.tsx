import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import SideNav from '@/components/layout/SideNav'

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient()

  // 重要: getSession()ではなくgetUser()を使用して認証状態を確認
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // ユーザーが認証されていない場合はログインページにリダイレクト
  if (error || !user) {
    redirect('/login')
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      <SideNav />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}