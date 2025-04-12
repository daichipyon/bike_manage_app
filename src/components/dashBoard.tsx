'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { 
  useBicycleSlots, 
  useResidents, 
  usePayments 
} from '@/lib/queries';

export default function Dashboard() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();

  // Query hooks for data fetching
  const { 
    data: slotsData, 
    isLoading: slotsLoading,
    error: slotsError 
  } = useBicycleSlots();
  
  const { 
    data: residentsData, 
    isLoading: residentsLoading,
    error: residentsError 
  } = useResidents();
  
  const { 
    data: paymentsData, 
    isLoading: paymentsLoading,
    error: paymentsError 
  } = usePayments({
    queryKey: ['payments', 'pending'],
    select: (data) => data.filter(payment => payment.status === 'pending')
  });

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [supabase, router]);

  // Calculate stats from query results
  const stats = {
    totalSlots: slotsData?.length || 0,
    availableSlots: slotsData?.filter(slot => slot.status === 'available').length || 0,
    occupiedSlots: (slotsData?.length || 0) - (slotsData?.filter(slot => slot.status === 'available').length || 0),
    totalResidents: residentsData?.length || 0,
    pendingPayments: paymentsData?.length || 0,
  };

  // Check for any loading state or errors
  const isLoading = slotsLoading || residentsLoading || paymentsLoading;
  const hasError = slotsError || residentsError || paymentsError;

  if (hasError) {
    console.error('Error fetching dashboard data:', { slotsError, residentsError, paymentsError });
    return (
        <div className="text-center py-10">
          <p className="text-red-500">データ取得中にエラーが発生しました。</p>
        </div>
    );
  }

  const StatCard = ({ title, value, icon }: { title: string; value: number; icon: string }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
            <span className="text-white text-xl">{icon}</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">読み込み中...</p>
        </div>
      ) : (
        <>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="総駐輪枠数" value={stats.totalSlots} icon="🏗️" />
          <StatCard title="空き枠数" value={stats.availableSlots} icon="✅" />
          <StatCard title="使用中枠数" value={stats.occupiedSlots} icon="🚲" />
        </div>
        </>
      )}
    </>
  );
}