import React from 'react';
import { Database } from '@/types/supabase';
import { UserPlusIcon } from '@heroicons/react/24/outline';

type BicycleSlot = Database['public']['Tables']['bicycle_slots']['Row'];
type Resident = Database['public']['Tables']['residents']['Row'];

interface SlotSelectionModalProps {
  showModal: boolean;
  newResident: Resident | null;
  slotsData: Array<BicycleSlot & { resident_name?: string | null }> | undefined;
  handleSlotSelectionClick: (slotId: number) => void;
  closeModal: () => void;
  isPending: boolean;
  assigningSlotId: number | null;
}

const SlotSelectionModal: React.FC<SlotSelectionModalProps> = ({
  showModal,
  newResident,
  slotsData,
  handleSlotSelectionClick,
  closeModal,
  isPending,
  assigningSlotId,
}) => {
  if (!showModal || !newResident) return null;

  // Filter to only show available slots
  const availableSlots = slotsData?.filter(slot => slot.status === 'available') || [];

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            駐輪枠を選択して割り当て
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {newResident.name}さん（{newResident.room_number}）に駐輪枠を割り当ててください
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6 max-h-96 overflow-y-auto">
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
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">操作</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {availableSlots.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-500">
                    利用可能な駐輪枠がありません
                  </td>
                </tr>
              ) : (
                availableSlots.map((slot) => (
                  <tr key={slot.id}>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {slot.slot_code}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {slot.location}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-green-100 text-green-800">
                        空き
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => handleSlotSelectionClick(slot.id)}
                        className="inline-flex items-center text-green-600 hover:text-green-900"
                        disabled={isPending}
                      >
                        {isPending && assigningSlotId === slot.id ? (
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <UserPlusIcon className="h-4 w-4 mr-1" />
                        )}
                        この枠を割り当てる
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={closeModal}
            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlotSelectionModal;