'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient<Database>();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isActive = (path: string) => {
    if (!mounted) return false;
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  // Only render the full content after client-side hydration
  if (!mounted) {
    return <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
                駐輪場管理システム
              </Link>
            </div>
            <nav className="flex space-x-4 text-sm">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md ${
                  isActive('/')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                駐輪枠管理
              </Link>
              <Link
                href="/residents"
                className={`px-3 py-2 rounded-md ${
                  isActive('/residents')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                居住者管理
              </Link>
              <Link
                href="/violations"
                className={`px-3 py-2 rounded-md ${
                  isActive('/violations')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                不正利用記録
              </Link>
              <Link
                href="/payments"
                className={`px-3 py-2 rounded-md ${
                  isActive('/payments')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                入金管理
              </Link>
              <button
                onClick={handleSignOut}
                className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
              >
                ログアウト
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} マンション共同駐輪場管理システム
          </p>
        </div>
      </footer>
    </div>
  );
}