'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Database } from '@/types/supabase';

export default function Dashboard() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalSlots: 0,
    availableSlots: 0,
    occupiedSlots: 0,
    totalResidents: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get slots stats
        const { data: slots, error: slotsError } = await supabase
          .from('bicycle_slots')
          .select('status');

        if (slotsError) throw slotsError;

        // Get residents count
        const { count: residentsCount, error: residentsError } = await supabase
          .from('residents')
          .select('*', { count: 'exact', head: true });

        if (residentsError) throw residentsError;

        // Get pending payments count
        const { count: pendingPaymentsCount, error: paymentsError } = await supabase
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (paymentsError) throw paymentsError;

        // Calculate stats
        const totalSlots = slots?.length || 0;
        const availableSlots = slots?.filter(slot => slot.status === 'available').length || 0;
        const occupiedSlots = totalSlots - availableSlots;

        setStats({
          totalSlots,
          availableSlots,
          occupiedSlots,
          totalResidents: residentsCount || 0,
          pendingPayments: pendingPaymentsCount || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        fetchStats();
      }
    };

    checkAuth();
  }, [supabase, router]);

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
    <MainLayout>
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">読み込み中...</p>
        </div>
      ) : (
        <>
        <h1 className='text-xl text-gray-900'>駐輪状況</h1>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="総駐輪枠数" value={stats.totalSlots} icon="🏗️" />
          <StatCard title="空き枠数" value={stats.availableSlots} icon="✅" />
          <StatCard title="使用中枠数" value={stats.occupiedSlots} icon="🚲" />
        </div>
        </>
      )}

    </MainLayout>
  );
}