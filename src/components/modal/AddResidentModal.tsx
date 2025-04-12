import React from 'react';

interface AddResidentModalProps {
  showModal: boolean;
  residentFormData: {
    name: string;
    room_number: string;
    contact_info: string;
    status: string;
  };
  handleResidentInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleAddResidentSubmit: (e: React.FormEvent) => void;
  closeModal: () => void;
  isPending: boolean;
}

const AddResidentModal: React.FC<AddResidentModalProps> = ({
  showModal,
  residentFormData,
  handleResidentInputChange,
  handleAddResidentSubmit,
  closeModal,
  isPending,
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            新規居住者を追加
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            追加後、駐輪枠の割り当てへ進みます
          </p>
        </div>
        <form onSubmit={handleAddResidentSubmit}>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  氏名
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={residentFormData.name}
                    onChange={handleResidentInputChange}
                    required
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="room_number" className="block text-sm font-medium text-gray-700">
                  部屋番号
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="room_number"
                    id="room_number"
                    value={residentFormData.room_number}
                    onChange={handleResidentInputChange}
                    required
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contact_info" className="block text-sm font-medium text-gray-700">
                  連絡先
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="contact_info"
                    id="contact_info"
                    value={residentFormData.contact_info}
                    onChange={handleResidentInputChange}
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
              {isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  処理中...
                </>
              ) : '追加して次へ'}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              disabled={isPending}
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddResidentModal;