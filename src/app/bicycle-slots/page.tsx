'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Database } from '@/types/supabase';
import { PlusIcon, UserPlusIcon, UserMinusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

type BicycleSlot = Database['public']['Tables']['bicycle_slots']['Row'];
type Resident = Database['public']['Tables']['residents']['Row'];
type Sticker = Database['public']['Tables']['stickers']['Row'];

export default function BicycleSlotsPage() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const [slots, setSlots] = useState<(BicycleSlot & { resident_name?: string })[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<BicycleSlot | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<BicycleSlot | null>(null);
  
  const [slotFormData, setSlotFormData] = useState({
    slot_code: '',
    location: '',
  });
  
  const [assignmentFormData, setAssignmentFormData] = useState({
    resident_id: '',
    sticker_number: '',
  });

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        fetchData();
      }
    };

    checkAuthAndFetchData();
  }, [supabase, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch bicycle slots with resident info
      const { data: slotsData, error: slotsError } = await supabase
        .from('bicycle_slots')
        .select('*, residents(name)')
        .order('slot_code', { ascending: true });
      
      if (slotsError) throw slotsError;
      
      const formattedSlots = slotsData.map(slot => ({
        ...slot,
        resident_name: slot.residents?.name || null
      }));
      
      setSlots(formattedSlots);
      
      // Fetch active residents for the assignment dropdown
      const { data: residentsData, error: residentsError } = await supabase
        .from('residents')
        .select('*')
        .eq('status', 'active')
        .order('room_number', { ascending: true });
      
      if (residentsError) throw residentsError;
      setResidents(residentsData || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlotFormData({
      ...slotFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAssignmentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAssignmentFormData({
      ...assignmentFormData,
      [e.target.name]: e.target.value,
    });
  };

  const resetSlotForm = () => {
    setSlotFormData({
      slot_code: '',
      location: '',
    });
    setEditingSlot(null);
  };

  const resetAssignmentForm = () => {
    setAssignmentFormData({
      resident_id: '',
      sticker_number: '',
    });
    setSelectedSlot(null);
  };

  const handleEditClick = (slot: BicycleSlot) => {
    setEditingSlot(slot);
    setSlotFormData({
      slot_code: slot.slot_code,
      location: slot.location,
    });
    setShowAddModal(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (!window.confirm('この駐輪枠を削除しますか？')) return;
    
    try {
      const { error } = await supabase
        .from('bicycle_slots')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setSlots(slots.filter(slot => slot.id !== id));
    } catch (error) {
      console.error('Error deleting slot:', error);
    }
  };

  const handleAssignClick = (slot: BicycleSlot) => {
    setSelectedSlot(slot);
    setAssignmentFormData({
      resident_id: '',
      sticker_number: `S-${new Date().getFullYear()}-${String(slot.id).padStart(3, '0')}`,
    });
    setShowAssignModal(true);
  };

  const handleReleaseClick = async (slotId: number) => {
    if (!window.confirm('この枠の割り当てを解除しますか？')) return;
    
    try {
      const { error } = await supabase
        .from('bicycle_slots')
        .update({
          resident_id: null,
          status: 'available',
          updated_at: new Date().toISOString(),
        })
        .eq('id', slotId);
      
      if (error) throw error;
      
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error releasing slot:', error);
    }
  };

  const handleSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSlot) {
        // Update existing slot
        const { error } = await supabase
          .from('bicycle_slots')
          .update({
            slot_code: slotFormData.slot_code,
            location: slotFormData.location,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingSlot.id);
        
        if (error) throw error;
      } else {
        // Add new slot
        const { error } = await supabase
          .from('bicycle_slots')
          .insert([{
            slot_code: slotFormData.slot_code,
            location: slotFormData.location,
            status: 'available',
          }]);
        
        if (error) throw error;
      }
      
      resetSlotForm();
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Error submitting slot:', error);
    }
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    
    try {
      // First update the bicycle slot with the resident assignment
      const { error: slotError } = await supabase
        .from('bicycle_slots')
        .update({
          resident_id: parseInt(assignmentFormData.resident_id),
          status: 'occupied',
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedSlot.id);
      
      if (slotError) throw slotError;
      
      // Then create a sticker record
      const { error: stickerError } = await supabase
        .from('stickers')
        .insert([{
          slot_id: selectedSlot.id,
          sticker_number: assignmentFormData.sticker_number,
        }]);
      
      if (stickerError) throw stickerError;
      
      resetAssignmentForm();
      setShowAssignModal(false);
      fetchData();
    } catch (error) {
      console.error('Error assigning resident to slot:', error);
    }
  };

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">駐輪枠管理</h1>
            <p className="mt-2 text-sm text-gray-700">
              マンションの駐輪枠と割り当て状況を管理します。
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => {
                resetSlotForm();
                setShowAddModal(true);
              }}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              駐輪枠を追加
            </button>
          </div>
        </div>

        {loading ? (
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
                      {slots.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-4 text-center text-sm text-gray-500">
                            駐輪枠情報がありません
                          </td>
                        </tr>
                      ) : (
                        slots.map((slot) => (
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
                              {slot.resident_name || '-'}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              {slot.status === 'available' ? (
                                <button
                                  onClick={() => handleAssignClick(slot)}
                                  className="inline-flex items-center text-green-600 hover:text-green-900 mr-2"
                                >
                                  <UserPlusIcon className="h-4 w-4 mr-1" /> 割り当て
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleReleaseClick(slot.id)}
                                  className="inline-flex items-center text-orange-600 hover:text-orange-900 mr-2"
                                >
                                  <UserMinusIcon className="h-4 w-4 mr-1" /> 解除
                                </button>
                              )}
                              <button
                                onClick={() => handleEditClick(slot)}
                                className="inline-flex items-center text-indigo-600 hover:text-indigo-900 mr-2"
                              >
                                <PencilSquareIcon className="h-4 w-4 mr-1" /> 編集
                              </button>
                              <button
                                onClick={() => handleDeleteClick(slot.id)}
                                className="inline-flex items-center text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="h-4 w-4 mr-1" /> 削除
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {editingSlot ? '駐輪枠情報を編集' : '新規駐輪枠を追加'}
              </h3>
            </div>
            <form onSubmit={handleSlotSubmit}>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4">
                  <div>
                    <label htmlFor="slot_code" className="block text-sm font-medium text-gray-700">
                      枠番号
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="slot_code"
                        id="slot_code"
                        value={slotFormData.slot_code}
                        onChange={handleSlotInputChange}
                        required
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      位置
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="location"
                        id="location"
                        value={slotFormData.location}
                        onChange={handleSlotInputChange}
                        required
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {editingSlot ? '更新' : '追加'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetSlotForm();
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Resident Modal */}
      {showAssignModal && selectedSlot && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                駐輪枠割り当て - {selectedSlot.slot_code}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                居住者を枠に割り当ててステッカーを発行
              </p>
            </div>
            <form onSubmit={handleAssignmentSubmit}>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4">
                  <div>
                    <label htmlFor="resident_id" className="block text-sm font-medium text-gray-700">
                      利用者
                    </label>
                    <div className="mt-1">
                      <select
                        id="resident_id"
                        name="resident_id"
                        value={assignmentFormData.resident_id}
                        onChange={handleAssignmentInputChange}
                        required
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="">利用者を選択</option>
                        {residents.map(resident => (
                          <option key={resident.id} value={resident.id}>
                            {resident.room_number} - {resident.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="sticker_number" className="block text-sm font-medium text-gray-700">
                      ステッカー番号
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="sticker_number"
                        id="sticker_number"
                        value={assignmentFormData.sticker_number}
                        onChange={handleAssignmentInputChange}
                        required
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  割り当て・ステッカー発行
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    resetAssignmentForm();
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}