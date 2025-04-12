'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Database } from '@/types/supabase';
import { PlusIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

type ViolationLog = Database['public']['Tables']['violation_logs']['Row'];

export default function ViolationsPage() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const [violations, setViolations] = useState<ViolationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    memo: '',
    photo_url: '',
    reported_at: new Date().toISOString().split('T')[0],
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        fetchViolations();
      }
    };

    checkAuthAndFetchData();
  }, [supabase, router]);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('violation_logs')
        .select('*')
        .order('reported_at', { ascending: false });
      
      if (error) throw error;
      setViolations(data || []);
    } catch (error) {
      console.error('Error fetching violation logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      location: '',
      memo: '',
      photo_url: '',
      reported_at: new Date().toISOString().split('T')[0],
    });
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleDeleteClick = async (id: number) => {
    if (!window.confirm('この不正利用記録を削除しますか？')) return;
    
    try {
      // Get the photo URL first
      const { data } = await supabase
        .from('violation_logs')
        .select('photo_url')
        .eq('id', id)
        .single();
      
      // Delete from DB
      const { error } = await supabase
        .from('violation_logs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // If there was a photo, remove it from storage
      if (data && data.photo_url) {
        const path = data.photo_url.split('/').slice(-2).join('/'); // Get the path in format 'violations/filename.jpg'
        await supabase.storage.from('photos').remove([path]);
      }
      
      // Update the local state
      setViolations(violations.filter(violation => violation.id !== id));
    } catch (error) {
      console.error('Error deleting violation log:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let photoUrl = '';
      
      // Upload photo if provided
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `violations/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, photoFile);
        
        if (uploadError) throw uploadError;
        
        // Get the photo URL
        const { data } = supabase.storage.from('photos').getPublicUrl(filePath);
        photoUrl = data.publicUrl;
      }
      
      // Add new violation log
      const { error } = await supabase
        .from('violation_logs')
        .insert([{
          location: formData.location,
          memo: formData.memo || null,
          photo_url: photoUrl || null,
          reported_at: formData.reported_at ? new Date(formData.reported_at).toISOString() : new Date().toISOString(),
        }]);
      
      if (error) throw error;
      
      // Reset form and refresh data
      resetForm();
      setShowAddModal(false);
      fetchViolations();
    } catch (error) {
      console.error('Error submitting violation log:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy/MM/dd HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">不正利用記録</h1>
            <p className="mt-2 text-sm text-gray-700">
              許可なく駐輪場を利用している自転車などの記録を管理します。
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
              不正利用を記録
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
                          報告日時
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          場所
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          メモ
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          写真
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">操作</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {violations.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-4 text-center text-sm text-gray-500">
                            不正利用記録がありません
                          </td>
                        </tr>
                      ) : (
                        violations.map((violation) => (
                          <tr key={violation.id}>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                              {formatDate(violation.reported_at)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                              {violation.location}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              {violation.memo || '-'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                              {violation.photo_url ? (
                                <a
                                  href={violation.photo_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                                >
                                  <PhotoIcon className="h-5 w-5 mr-1" /> 写真を表示
                                </a>
                              ) : (
                                '写真なし'
                              )}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <button
                                onClick={() => handleDeleteClick(violation.id)}
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

      {/* Add Violation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                新規不正利用を記録
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4">
                  <div>
                    <label htmlFor="reported_at" className="block text-sm font-medium text-gray-700">
                      報告日時
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        name="reported_at"
                        id="reported_at"
                        value={formData.reported_at}
                        onChange={handleInputChange}
                        required
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      場所
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="location"
                        id="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        placeholder="例: A棟駐輪場入口付近"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="memo" className="block text-sm font-medium text-gray-700">
                      メモ
                    </label>
                    <div className="mt-1">
                      <textarea
                        name="memo"
                        id="memo"
                        rows={3}
                        value={formData.memo}
                        onChange={handleInputChange}
                        placeholder="不正利用の詳細など"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
                      写真
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="file"
                        id="photo"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="sr-only"
                      />
                      <label
                        htmlFor="photo"
                        className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        写真をアップロード
                      </label>
                      {photoPreview && (
                        <div className="ml-5">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="h-20 w-20 object-cover rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {isSubmitting ? '保存中...' : '保存'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
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