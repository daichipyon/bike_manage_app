'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { PaymentFormValues, paymentSchema } from '@/lib/validators/schemas';
import { format } from 'date-fns';

// Function to get all payments
export async function getAllPayments() {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      residents:resident_id (
        id,
        name,
        room_number,
        contact_info
      )
    `)
    .order('month', { ascending: false });

  if (error) {
    console.error('Error fetching payments:', error);
    throw new Error('Failed to fetch payments');
  }

  return data;
}

// Function to get unpaid payments
export async function getUnpaidPayments() {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      residents:resident_id (
        id,
        name,
        room_number,
        contact_info
      )
    `)
    .eq('status', 'unpaid')
    .order('month', { ascending: false });

  if (error) {
    console.error('Error fetching unpaid payments:', error);
    throw new Error('Failed to fetch unpaid payments');
  }

  return data;
}

// Function to get payments for a specific month
export async function getPaymentsByMonth(month: string) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      residents:resident_id (
        id,
        name,
        room_number,
        contact_info
      )
    `)
    .eq('month', month)
    .order('status');

  if (error) {
    console.error(`Error fetching payments for month ${month}:`, error);
    throw new Error('Failed to fetch payments by month');
  }

  return data;
}

// Function to get a payment by ID
export async function getPaymentById(id: number) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      residents:resident_id (
        id,
        name,
        room_number,
        contact_info
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching payment with ID ${id}:`, error);
    throw new Error('Failed to fetch payment');
  }

  return data;
}

// Function to mark a payment as paid
export async function markPaymentAsPaid(id: number) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('payments')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error marking payment with ID ${id} as paid:`, error);
    return { success: false, message: 'Failed to mark payment as paid' };
  }

  revalidatePath('/payments');
  revalidatePath(`/payments/${id}`);
  revalidatePath('/dashboard');
  return { success: true, data };
}

// Function to create a new payment
export async function createPayment(formData: PaymentFormValues) {
  const result = paymentSchema.safeParse(formData);
  
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }
  
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('payments')
    .insert(result.data)
    .select()
    .single();

  if (error) {
    console.error('Error creating payment:', error);
    return { success: false, message: 'Failed to create payment' };
  }

  revalidatePath('/payments');
  revalidatePath('/dashboard');
  return { success: true, data };
}

// Function to generate payments for all active residents with allocated slots
export async function generatePayments(month: string, amount: number) {
  const supabase = await createSupabaseServerClient();
  
  // Get all active residents with allocated bicycle slots
  const { data: residents, error: residentError } = await supabase
    .from('residents')
    .select(`
      id,
      bicycle_slots (id)
    `)
    .eq('status', 'active')
    .not('bicycle_slots', 'is', null);
    
  if (residentError) {
    console.error('Error fetching residents for payment generation:', residentError);
    return { success: false, message: 'Failed to fetch residents for payment generation' };
  }
  
  // Filter out residents without bicycle slots
  const residentsWithSlots = residents.filter(resident => 
    resident.bicycle_slots && resident.bicycle_slots.length > 0
  );
  
  if (residentsWithSlots.length === 0) {
    return { success: false, message: 'No eligible residents found with allocated bicycle slots' };
  }
  
  // Check if payments already exist for this month
  const { data: existingPayments, error: existingError } = await supabase
    .from('payments')
    .select('resident_id')
    .eq('month', month);
    
  if (existingError) {
    console.error(`Error checking existing payments for month ${month}:`, existingError);
    return { success: false, message: 'Failed to check existing payments' };
  }
  
  // Filter out residents that already have payments for this month
  const existingPaymentResidentIds = existingPayments.map(payment => payment.resident_id);
  const newPaymentResidents = residentsWithSlots.filter(resident => 
    !existingPaymentResidentIds.includes(resident.id)
  );
  
  if (newPaymentResidents.length === 0) {
    return { success: false, message: 'All eligible residents already have payments for this month' };
  }
  
  // Create payments for eligible residents
  const paymentsToCreate = newPaymentResidents.map(resident => ({
    resident_id: resident.id,
    month,
    amount,
    status: 'unpaid'
  }));
  
  const { data, error } = await supabase
    .from('payments')
    .insert(paymentsToCreate)
    .select();
    
  if (error) {
    console.error(`Error generating payments for month ${month}:`, error);
    return { success: false, message: 'Failed to generate payments' };
  }
  
  revalidatePath('/payments');
  revalidatePath('/dashboard');
  return { 
    success: true, 
    message: `${data.length}件の支払いを作成しました`, 
    count: data.length 
  };
}

// Function to get payment statistics for dashboard
export async function getPaymentStatistics() {
  const supabase = await createSupabaseServerClient();
  
  // Get total count
  const { count: totalCount, error: totalError } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true });
    
  if (totalError) {
    console.error('Error fetching total payments count:', totalError);
    throw new Error('Failed to fetch payment statistics');
  }
  
  // Get unpaid count
  const { count: unpaidCount, error: unpaidError } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'unpaid');
    
  if (unpaidError) {
    console.error('Error fetching unpaid payments count:', unpaidError);
    throw new Error('Failed to fetch payment statistics');
  }
  
  // Get current month count
  const currentMonth = format(new Date(), 'yyyy-MM');
  
  const { count: currentMonthCount, error: currentMonthError } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('month', currentMonth);
    
  if (currentMonthError) {
    console.error(`Error fetching payments count for month ${currentMonth}:`, currentMonthError);
    throw new Error('Failed to fetch payment statistics');
  }
  
  return {
    total: totalCount || 0,
    unpaid: unpaidCount || 0,
    currentMonth: currentMonthCount || 0
  };
}