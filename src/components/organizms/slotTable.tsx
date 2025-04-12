'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Database } from '@/types/supabase';
import { useBicycleSlots, useResidents, useSupabaseMutation } from '@/lib/queries';
import { useQueryClient } from '@tanstack/react-query';
import { set } from 'date-fns';

type BicycleSlot = Database['public']['Tables']['bicycle_slots']['Row'];
type Resident = Database['public']['Tables']['residents']['Row'];

// Extended type for bicycle slots with joined resident data
type BicycleSlotWithResident = BicycleSlot & {
  residents?: { name: string } | null;
  resident_name?: string;
};

type SlotTableProps = {
  createdResident: Resident
  onClose: () => void;
};

export default function SlotTable(props: SlotTableProps) {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(true);
  // New states for the add-and-assign flow

  const [assignmentFormData, setAssignmentFormData] = useState({
    resident_id: '',
    sticker_number: '',
  });

  const {
    data: slotsData,
    isLoading: slotsLoading,
    error: slotsError,
  } = useBicycleSlots({
    queryKey: ['bicycle_slots_with_residents'],
    queryFn: async () => {
      interface BicycleSlotWithJoin extends BicycleSlot {
        residents: { name: string } | null;
      }

      const { data, error } = await supabase
        .from('bicycle_slots')
        .select('*, residents(name)')
        .order('slot_code', { ascending: true });
      
      if (error) throw error;
      
      // Transform the data to include resident_name
      return data.map((slot: BicycleSlotWithJoin) => ({
        ...slot,
        resident_name: slot.residents?.name || null
      })) as Array<BicycleSlot & { resident_name: string | null }>;
    }
  });


  const {
    data: residents,
    isLoading: residentsLoading,
  } = useResidents({
    queryKey: ['active_residents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('residents')
        .select('*')
        .eq('status', 'active')
        .order('room_number', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const handleAssignClick = async (slot: BicycleSlot) => {
    const slotUpdate = await supabase
        .from('bicycle_slots')
        .update({
          resident_id: props.createdResident.id,
          status: 'occupied',
          updated_at: new Date().toISOString(),
        })
        .eq('id', slot.id);
    if (slotUpdate.error) {
      console.error('Error updating slot:', slotUpdate.error);
    } else {

    }
    setIsOpen(false);
    props.onClose();
  };

  const isLoading = slotsLoading || residentsLoading;

  return isOpen && (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
    {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">読み込み中...</p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        枠番号
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        位置
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        ステータス
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        利用者
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">操作</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {!slotsData || slotsData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-4 text-center text-sm text-gray-500">
                          駐輪枠情報がありません
                        </td>
                      </tr>
                    ) : (
                      slotsData
                      .filter((slot) => slot.status == 'available')
                      .map((slot) => {
                        // Cast the slot to include resident_name property
                        const slotWithResidentName = slot as BicycleSlot & { resident_name: string | null };
                        return (
                        <tr key={slot.id}>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {slot.slot_code}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {slot.location}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span
                              className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                slot.status === 'available'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {slot.status === 'available' ? '空き' : '使用中'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {slotWithResidentName.resident_name || '-'}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => handleAssignClick(slot)}
                              className="inline-flex items-center text-green-600 hover:text-green-900 mr-2"
                            >
                              割り当て
                            </button>
                          </td>
                        </tr>
                      )})
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}