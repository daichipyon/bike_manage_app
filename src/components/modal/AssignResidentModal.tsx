import React from 'react';
import { Database } from '@/types/supabase';

type BicycleSlot = Database['public']['Tables']['bicycle_slots']['Row'];
type Resident = Database['public']['Tables']['residents']['Row'];

interface AssignResidentModalProps {
  showModal: boolean;
  selectedSlot: BicycleSlot | null;
  residents: Resident[] | undefined;
  assignmentFormData: {
    resident_id: string;
    sticker_number: string;
  };
  handleAssignmentInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleAssignmentSubmit: (e: React.FormEvent) => void;
  closeModal: () => void;
  isPending: boolean;
}

const AssignResidentModal: React.FC<AssignResidentModalProps> = ({
  showModal,
  selectedSlot,
  residents,
  assignmentFormData,
  handleAssignmentInputChange,
  handleAssignmentSubmit,
  closeModal,
  isPending,
}) => {
  if (!showModal || !selectedSlot) return null;

  return (
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
                    {residents &&
                      residents.map((resident) => (
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
              disabled={isPending}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {isPending ? '処理中...' : '割り当て・ステッカー発行'}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignResidentModal;