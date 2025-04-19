'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ViolationLogFormValues, violationLogSchema } from '@/lib/validators/schemas';

// Function to get all violation logs
export async function getAllViolationLogs() {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('violation_logs')
    .select('*')
    .order('reported_at', { ascending: false });

  if (error) {
    console.error('Error fetching violation logs:', error);
    throw new Error('Failed to fetch violation logs');
  }

  return data;
}

// Function to get a violation log by ID
export async function getViolationLogById(id: number) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('violation_logs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching violation log with ID ${id}:`, error);
    throw new Error('Failed to fetch violation log');
  }

  return data;
}

// Function to create a new violation log
export async function createViolationLog(formData: ViolationLogFormValues) {
  const result = violationLogSchema.safeParse(formData);
  
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }
  
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('violation_logs')
    .insert(result.data)
    .select()
    .single();

  if (error) {
    console.error('Error creating violation log:', error);
    return { success: false, message: 'Failed to create violation log' };
  }

  revalidatePath('/violations');
  revalidatePath('/dashboard');
  return { success: true, data };
}

// Function to update a violation log
export async function updateViolationLog(id: number, formData: ViolationLogFormValues) {
  const result = violationLogSchema.safeParse(formData);
  
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }
  
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('violation_logs')
    .update(result.data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating violation log with ID ${id}:`, error);
    return { success: false, message: 'Failed to update violation log' };
  }

  revalidatePath(`/violations/${id}`);
  revalidatePath('/violations');
  return { success: true, data };
}

// Function to delete a violation log
export async function deleteViolationLog(id: number) {
  const supabase = await createSupabaseServerClient();
  
  const { error } = await supabase
    .from('violation_logs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting violation log with ID ${id}:`, error);
    return { success: false, message: 'Failed to delete violation log' };
  }

  revalidatePath('/violations');
  revalidatePath('/dashboard');
  redirect('/violations');
}

// Function to get violation statistics for dashboard
export async function getViolationStatistics() {
  const supabase = await createSupabaseServerClient();
  
  // Get total count
  const { count: totalCount, error: totalError } = await supabase
    .from('violation_logs')
    .select('*', { count: 'exact', head: true });
    
  if (totalError) {
    console.error('Error fetching total violation logs count:', totalError);
    throw new Error('Failed to fetch violation statistics');
  }
  
  // Get recent (last 30 days) count
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { count: recentCount, error: recentError } = await supabase
    .from('violation_logs')
    .select('*', { count: 'exact', head: true })
    .gte('reported_at', thirtyDaysAgo.toISOString());
    
  if (recentError) {
    console.error('Error fetching recent violation logs count:', recentError);
    throw new Error('Failed to fetch violation statistics');
  }
  
  return {
    total: totalCount || 0,
    recent: recentCount || 0
  };
}