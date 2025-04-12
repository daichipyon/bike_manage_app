'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Database } from '@/types/supabase';
import { format } from 'date-fns';
import { PlusIcon, CheckIcon, ArrowDownTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';

type Payment = Database['public']['Tables']['payments']['Row'] & {
  residents: {
    name: string;
    room_number: string;
  } | null;
};

export default function PaymentsPage() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [residents, setResidents] = useState<Array<{ id: number; name: string; room_number: string }>>([]);
  const [formData, setFormData] = useState({
    resident_id: '',
    month: format(new Date(), 'yyyy-MM'),
    amount: '1000',
    status: 'pending'
  });
  const [filterStatus, setFilterStatus] = useState('all');

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
      
      // Fetch payments with resident info
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*, residents(name, room_number)')
        .order('month', { ascending: false });
      
      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);
      
      // Fetch active residents for the payment form
      const { data: residentsData, error: residentsError } = await supabase
        .from('residents')
        .select('id, name, room_number')
        .eq('status', 'active')
        .order('room_number', { ascending: true });
      
      if (residentsError) throw residentsError;
      setResidents(residentsData || []);
      
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      resident_id: '',
      month: format(new Date(), 'yyyy-MM'),
      amount: '1000',
      status: 'pending'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Add new payment record
      const { error } = await supabase
        .from('payments')
        .insert([{
          resident_id: parseInt(formData.resident_id),
          month: formData.month,
          amount: parseFloat(formData.amount),
          status: formData.status,
          paid_at: formData.status === 'paid' ? new Date().toISOString() : null,
        }]);
      
      if (error) throw error;
      
      // Reset form and refresh data
      resetForm();
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Error adding payment record:', error);
    }
  };

  const handlePaymentStatusChange = async (paymentId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status: newStatus,
          paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId);
      
      if (error) throw error;
      
      // Update local state
      setPayments(
        payments.map(payment =>
          payment.id === paymentId
            ? {
                ...payment,
                status: newStatus,
                paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
              }
            : payment
        )
      );
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const exportToCSV = () => {
    // Filter payments based on current filter
    const filteredPayments = filterStatus === 'all'
      ? payments
      : payments.filter(payment => payment.status === filterStatus);
    
    // Create CSV content
    const headers = ['部屋番号', '氏名', '年月', '金額', '状態', '入金日'];
    const rows = filteredPayments.map(payment => [
      payment.residents?.room_number || '-',
      payment.residents?.name || '-',
      payment.month,
      `${payment.amount}円`,
      payment.status === 'paid' ? '支払済' : '未払い',
      payment.paid_at ? format(new Date(payment.paid_at), 'yyyy/MM/dd') : '-'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `駐輪場料金_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPayments = filterStatus === 'all'
    ? payments
    : payments.filter(payment => payment.status === filterStatus);

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">入金管理</h1>
            <p className="mt-2 text-sm text-gray-700">
              駐輪場利用料金の入金状況を管理します。
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex">
            <button
              type="button"
              onClick={exportToCSV}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
            >
              <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
              CSVダウンロード
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              入金記録を追加
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-start items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">フィルター:</span>
          <div className="relative z-0 inline-flex shadow-sm rounded-md">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                filterStatus === 'all'
                  ? 'bg-indigo-50 text-indigo-600 z-10'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              すべて
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('pending')}
              className={`-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                filterStatus === 'pending'
                  ? 'bg-indigo-50 text-indigo-600 z-10'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              未払い
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('paid')}
              className={`-ml-px relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                filterStatus === 'paid'
                  ? 'bg-indigo-50 text-indigo-600 z-10'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              支払済
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-500">読み込み中...</p>
          </div>
        ) : (
          <div className="mt-4 flex flex-col">
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
                          年月
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          金額
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          状態
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          入金日
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">操作</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredPayments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-3 py-4 text-center text-sm text-gray-500">
                            入金記録がありません
                          </td>
                        </tr>
                      ) : (
                        filteredPayments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                              {payment.residents?.room_number || '-'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                              {payment.residents?.name || '-'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                              {payment.month}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                              {payment.amount.toLocaleString()}円
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span
                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                  payment.status === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {payment.status === 'paid' ? '支払済' : '未払い'}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {payment.paid_at ? format(new Date(payment.paid_at), 'yyyy/MM/dd') : '-'}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              {payment.status === 'pending' ? (
                                <button
                                  onClick={() => handlePaymentStatusChange(payment.id, 'paid')}
                                  className="inline-flex items-center text-green-600 hover:text-green-900"
                                >
                                  <CheckIcon className="h-4 w-4 mr-1" /> 入金済にする
                                </button>
                              ) : (
                                <button
                                  onClick={() => handlePaymentStatusChange(payment.id, 'pending')}
                                  className="inline-flex items-center text-orange-600 hover:text-orange-900"
                                >
                                  <XMarkIcon className="h-4 w-4 mr-1" /> 未払いに戻す
                                </button>
                              )}
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

      {/* Add Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                新規入金記録
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4">
                  <div>
                    <label htmlFor="resident_id" className="block text-sm font-medium text-gray-700">
                      居住者
                    </label>
                    <div className="mt-1">
                      <select
                        id="resident_id"
                        name="resident_id"
                        value={formData.resident_id}
                        onChange={handleInputChange}
                        required
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="">居住者を選択</option>
                        {residents.map(resident => (
                          <option key={resident.id} value={resident.id}>
                            {resident.room_number} - {resident.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="month" className="block text-sm font-medium text-gray-700">
                      年月
                    </label>
                    <div className="mt-1">
                      <input
                        type="month"
                        name="month"
                        id="month"
                        value={formData.month}
                        onChange={handleInputChange}
                        required
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      金額
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        name="amount"
                        id="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        min="0"
                        step="100"
                        required
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">円</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      支払い状況
                    </label>
                    <div className="mt-1">
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="pending">未払い</option>
                        <option value="paid">支払い済み</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  登録
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