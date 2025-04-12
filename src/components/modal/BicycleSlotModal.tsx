import React from 'react';
import { Database } from '@/types/supabase';

type BicycleSlot = Database['public']['Tables']['bicycle_slots']['Row'];

interface BicycleSlotModalProps {
  showModal: boolean;
  editingSlot: BicycleSlot | null;
  slotFormData: {
    slot_code: string;
    location: string;
  };
  handleSlotInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSlotSubmit: (e: React.FormEvent) => void;
  closeModal: () => void;
  isPending: boolean;
}

const BicycleSlotModal: React.FC<BicycleSlotModalProps> = ({
  showModal,
  editingSlot,
  slotFormData,
  handleSlotInputChange,
  handleSlotSubmit,
  closeModal,
  isPending,
}) => {
  if (!showModal) return null;

  return (
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
              disabled={isPending}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {isPending ? '処理中...' : editingSlot ? '更新' : '追加'}
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

export default BicycleSlotModal;