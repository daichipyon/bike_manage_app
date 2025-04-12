'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Database } from '@/types/supabase';
import { PlusIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { useBicycleSlots, useResidents, useSupabaseMutation } from '@/lib/queries';
import { useQueryClient } from '@tanstack/react-query';
import Dashboard from '@/components/dashBoard';

// Import modal components
import BicycleSlotModal from '@/components/modal/BicycleSlotModal';
import AssignResidentModal from '@/components/modal/AssignResidentModal';
import AddResidentModal from '@/components/modal/AddResidentModal';
import SlotSelectionModal from '@/components/modal/SlotSelectionModal';
import SlotTable from '@/components/organizms/slotTable';

type BicycleSlot = Database['public']['Tables']['bicycle_slots']['Row'];
type Resident = Database['public']['Tables']['residents']['Row'];

// Extended type for bicycle slots with joined resident data
type BicycleSlotWithResident = BicycleSlot & {
  residents?: { name: string } | null;
  resident_name?: string;
};

export default function BicycleSlotsPage() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<BicycleSlot | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<BicycleSlot | null>(null);

  // New states for the add-and-assign flow
  const [showAddResidentModal, setShowAddResidentModal] = useState(false);
  const [showSlotSelectionModal, setShowSlotSelectionModal] = useState(false);
  const [newResident, setNewResident] = useState<Resident | null>(null);
  const [assigningSlotId, setAssigningSlotId] = useState<number | null>(null);

  const [residentFormData, setResidentFormData] = useState({
    name: '',
    room_number: '',
    contact_info: '',
    status: 'active',
  });

  const [slotFormData, setSlotFormData] = useState({
    slot_code: '',
    location: '',
  });

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
        residents: { name: string, room_number: string } | null;
      }

      const { data, error } = await supabase
        .from('bicycle_slots')
        .select('*, residents(name, room_number)')
        .order('slot_code', { ascending: true });
      
      if (error) throw error;
      
      // Transform the data to include resident_name
      return data.map((slot: BicycleSlotWithJoin) => ({
        ...slot,
        resident_name: slot.residents?.name || null,
        resident_room_number: slot.residents?.room_number || null
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

  const addOrUpdateSlotMutation = useSupabaseMutation('bicycle_slots', {
    mutationFn: async (values: {
      id?: number;
      slot_code: string;
      location: string;
      status?: string;
    }) => {
      if (values.id) {
        return await supabase
          .from('bicycle_slots')
          .update({
            slot_code: values.slot_code,
            location: values.location,
            updated_at: new Date().toISOString(),
          })
          .eq('id', values.id);
      } else {
        return await supabase
          .from('bicycle_slots')
          .insert([
            {
              slot_code: values.slot_code,
              location: values.location,
              status: 'available',
            },
          ]);
      }
    },
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['bicycle_slots_with_residents'] });
        resetSlotForm();
        setShowAddModal(false);
      },
      onError: (error) => {
        console.error('Error submitting slot:', error);
      },
    },
  });

  const deleteSlotMutation = useSupabaseMutation('bicycle_slots', {
    mutationFn: async (id: number) => {
      return await supabase.from('bicycle_slots').delete().eq('id', id);
    },
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['bicycle_slots_with_residents'] });
      },
      onError: (error) => {
        console.error('Error deleting slot:', error);
      },
    },
  });

  const assignSlotMutation = useSupabaseMutation('bicycle_slots', {
    mutationFn: async (values: {
      slotId: number;
      residentId: number;
      stickerNumber: string;
    }) => {
      const slotUpdate = await supabase
        .from('bicycle_slots')
        .update({
          resident_id: values.residentId,
          status: 'occupied',
          updated_at: new Date().toISOString(),
        })
        .eq('id', values.slotId);

      if (slotUpdate.error) throw slotUpdate.error;

      return await supabase
        .from('stickers')
        .insert([
          {
            slot_id: values.slotId,
            sticker_number: values.stickerNumber,
          },
        ]);
    },
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['bicycle_slots_with_residents'] });
        resetAssignmentForm();
        setShowAssignModal(false);
      },
      onError: (error) => {
        console.error('Error assigning slot:', error);
      },
    },
  });

  const releaseSlotMutation = useSupabaseMutation('bicycle_slots', {
    mutationFn: async (slotId: number) => {
      return await supabase
        .from('bicycle_slots')
        .update({
          resident_id: null,
          status: 'available',
          updated_at: new Date().toISOString(),
        })
        .eq('id', slotId);
    },
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['bicycle_slots_with_residents'] });
      },
      onError: (error) => {
        console.error('Error releasing slot:', error);
      },
    },
  });

  const createResidentMutation = useSupabaseMutation('residents', {
    mutationFn: async (values: {
      name: string;
      room_number: string;
      contact_info?: string;
      status: string;
    }) => {
      return await supabase
        .from('residents')
        .insert([values])
        .select()
        .single();
    },
    mutationOptions: {
      onSuccess: (data) => {
        setNewResident(data.data);
        setShowAddResidentModal(false);
        setShowSlotSelectionModal(true);
      },
      onError: (error) => {
        console.error('Error creating resident:', error);
      },
    },
  });

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['bicycle_slots_with_residents'] });
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [supabase, router]);

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
    deleteSlotMutation.mutate(id);
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
    releaseSlotMutation.mutate(slotId);
  };

  const handleSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    addOrUpdateSlotMutation.mutate({
      id: editingSlot?.id,
      slot_code: slotFormData.slot_code,
      location: slotFormData.location,
    });
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    assignSlotMutation.mutate({
      slotId: selectedSlot.id,
      residentId: parseInt(assignmentFormData.resident_id),
      stickerNumber: assignmentFormData.sticker_number,
    });
  };

  const handleAddResidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    createResidentMutation.mutate({
      name: residentFormData.name,
      room_number: residentFormData.room_number,
      contact_info: residentFormData.contact_info,
      status: residentFormData.status,
    });
  };

  const isLoading = slotsLoading || residentsLoading;

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
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              駐輪枠を追加
            </button>
            <button
              type="button"
              onClick={() => {
                setResidentFormData({
                  name: '',
                  room_number: '',
                  contact_info: '',
                  status: 'active',
                });
                setShowAddResidentModal(true);
              }}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" />
              居住者を追加して割り当てる
            </button>
          </div>
        </div>
        <Dashboard />

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
                        slotsData.map((slot) => {
                          // Cast the slot to include resident_name and resident_room_number properties
                          const slotWithResidentName = slot as BicycleSlot & { resident_name: string | null, resident_room_number: string | null };
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
                              {slotWithResidentName.resident_id ? `${slotWithResidentName.resident_name}-${slotWithResidentName.resident_room_number}` : '-'}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              {slot.status === 'available' ? (
                                <button
                                  onClick={() => handleAssignClick(slot)}
                                  className="inline-flex items-center text-green-600 hover:text-green-900 mr-2"
                                >
                                  割り当て
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleReleaseClick(slot.id)}
                                  className="inline-flex items-center text-orange-600 hover:text-orange-900 mr-2"
                                >
                                  解除
                                </button>
                              )}
                              <button
                                onClick={() => handleEditClick(slot)}
                                className="inline-flex items-center text-indigo-600 hover:text-indigo-900 mr-2"
                              >
                                編集
                              </button>
                              <button
                                onClick={() => handleDeleteClick(slot.id)}
                                className="inline-flex items-center text-red-600 hover:text-red-900"
                              >
                                削除
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

      {/* Replace inline modals with external components */}
      <BicycleSlotModal
        showModal={showAddModal}
        editingSlot={editingSlot}
        slotFormData={slotFormData}
        handleSlotInputChange={handleSlotInputChange}
        handleSlotSubmit={handleSlotSubmit}
        closeModal={() => {
          setShowAddModal(false);
          resetSlotForm();
        }}
        isPending={addOrUpdateSlotMutation.isPending}
      />

      <AssignResidentModal
        showModal={showAssignModal}
        selectedSlot={selectedSlot}
        residents={residents}
        assignmentFormData={assignmentFormData}
        handleAssignmentInputChange={handleAssignmentInputChange}
        handleAssignmentSubmit={handleAssignmentSubmit}
        closeModal={() => {
          setShowAssignModal(false);
          resetAssignmentForm();
        }}
        isPending={assignSlotMutation.isPending}
      />

      <AddResidentModal
        showModal={showAddResidentModal}
        residentFormData={residentFormData}
        handleResidentInputChange={(e) => {
          setResidentFormData({
            ...residentFormData,
            [e.target.name]: e.target.value,
          });
        }}
        handleAddResidentSubmit={handleAddResidentSubmit}
        closeModal={() => setShowAddResidentModal(false)}
        isPending={createResidentMutation.isPending}
      />


      <SlotSelectionModal
        showModal={showSlotSelectionModal}
        newResident={newResident}
        slotsData={slotsData}
        handleSlotSelectionClick={(slotId) => {
          setAssigningSlotId(slotId);
          // Create a default sticker number for this slot
          const stickerNumber = `S-${new Date().getFullYear()}-${String(slotId).padStart(3, '0')}`;

          // Assign the newly created resident to this slot
          assignSlotMutation.mutate({
            slotId: slotId,
            residentId: newResident?.id || 0,
            stickerNumber: stickerNumber
          }, {
            onSuccess: () => {
              setShowSlotSelectionModal(false);
              setNewResident(null);
              setAssigningSlotId(null);
            }
          });
        }}
        closeModal={() => {
          setShowSlotSelectionModal(false);
          setNewResident(null);
        }}
        isPending={assignSlotMutation.isPending}
        assigningSlotId={assigningSlotId}
      />

      { createResidentMutation.data && (
          <SlotTable createdResident={createResidentMutation.data} onClose={() => refreshData()}></SlotTable>
      )}

    </MainLayout>
  );
}