'use client';

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Database } from '@/types/supabase';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useResidents, useSupabaseMutation } from '@/lib/queries';

type Resident = Database['public']['Tables']['residents']['Row'];

export default function ResidentsPage() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    room_number: '',
    contact_info: '',
    status: 'active',
  });

  // Use the TanStack Query hook to fetch residents
  const { 
    data: residents = [], 
    isLoading, 
    refetch 
  } = useResidents();

  // Setup mutations
  const createResidentMutation = useSupabaseMutation('residents', {
    mutationFn: async (newResident: Omit<Resident, 'id' | 'created_at' | 'updated_at'>) => {
      return supabase
        .from('residents')
        .insert([newResident]);
    },
    mutationOptions: {
      onSuccess: () => {
        refetch();
        resetForm();
        setShowAddModal(false);
      },
      onError: (error) => {
        console.error('Error creating resident:', error);
      },
    }
  });

  const updateResidentMutation = useSupabaseMutation('residents', {
    mutationFn: async ({ id, ...updateData }: Partial<Resident> & { id: number }) => {
      return supabase
        .from('residents')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
    },
    mutationOptions: {
      onSuccess: () => {
        refetch();
        resetForm();
        setShowAddModal(false);
      },
      onError: (error) => {
        console.error('Error updating resident:', error);
      },
    }
  });

  const deleteResidentMutation = useSupabaseMutation('residents', {
    mutationFn: async (id: number) => {
      return supabase
        .from('residents')
        .delete()
        .eq('id', id);
    },
    mutationOptions: {
      onSuccess: () => {
        refetch();
      },
      onError: (error) => {
        console.error('Error deleting resident:', error);
      },
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      room_number: '',
      contact_info: '',
      status: 'active',
    });
    setEditingResident(null);
  };

  const handleEditClick = (resident: Resident) => {
    setEditingResident(resident);
    setFormData({
      name: resident.name,
      room_number: resident.room_number,
      contact_info: resident.contact_info || '',
      status: resident.status,
    });
    setShowAddModal(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (!window.confirm('この居住者を削除しますか？')) return;
    deleteResidentMutation.mutate(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingResident) {
      // Update existing resident
      updateResidentMutation.mutate({
        id: editingResident.id,
        name: formData.name,
        room_number: formData.room_number,
        contact_info: formData.contact_info || null,
        status: formData.status,
      });
    } else {
      // Add new resident
      createResidentMutation.mutate({
        name: formData.name,
        room_number: formData.room_number,
        contact_info: formData.contact_info || null,
        status: formData.status,
      });
    }
  };

  // Show loading state if mutations are in progress
  const isSubmitting = createResidentMutation.isPending || 
                       updateResidentMutation.isPending || 
                       deleteResidentMutation.isPending;

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">居住者管理</h1>
            <p className="mt-2 text-sm text-gray-700">
              マンションの居住者情報を管理します。
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              居住者を追加
            </button>
          </div>
        </div>

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
                          部屋番号
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          氏名
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          連絡先
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          ステータス
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">編集・削除</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {residents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-4 text-center text-sm text-gray-500">
                            居住者情報がありません
                          </td>
                        </tr>
                      ) : (
                        residents.map((resident) => (
                          <tr key={resident.id}>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                              {resident.room_number}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                              {resident.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {resident.contact_info || '-'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span
                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                  resident.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {resident.status === 'active' ? '入居中' : '退去'}
                              </span>
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <button
                                onClick={() => handleEditClick(resident)}
                                className="inline-flex items-center text-indigo-600 hover:text-indigo-900 mr-4"
                                disabled={isSubmitting}
                              >
                                <PencilSquareIcon className="h-4 w-4 mr-1" /> 編集
                              </button>
                              <button
                                onClick={() => handleDeleteClick(resident.id)}
                                className="inline-flex items-center text-red-600 hover:text-red-900"
                                disabled={isSubmitting}
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

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {editingResident ? '居住者情報を編集' : '新規居住者を追加'}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
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
                        value={formData.name}
                        onChange={handleInputChange}
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
                        value={formData.room_number}
                        onChange={handleInputChange}
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
                        value={formData.contact_info}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      ステータス
                    </label>
                    <div className="mt-1">
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="active">入居中</option>
                        <option value="inactive">退去</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      処理中...
                    </>
                  ) : editingResident ? '更新' : '追加'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  disabled={isSubmitting}
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