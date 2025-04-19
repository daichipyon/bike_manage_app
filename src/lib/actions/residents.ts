'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ResidentFormValues, residentSchema } from '@/lib/validators/schemas';

// Function to get all residents
export async function getAllResidents() {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('residents')
    .select(`
      *,
      bicycle_slots (
        id,
        slot_code,
        location
      )
    `)
    .order('name');

  if (error) {
    console.error('Error fetching residents:', error);
    throw new Error('Failed to fetch residents');
  }

  return data;
}

// Function to get a resident by ID
export async function getResidentById(id: number) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('residents')
    .select(`
      *,
      bicycle_slots (
        id,
        slot_code,
        location
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching resident with ID ${id}:`, error);
    throw new Error('Failed to fetch resident');
  }

  return data;
}

// Function to create a new resident
export async function createResident(formData: ResidentFormValues) {
  const result = residentSchema.safeParse(formData);
  
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }
  
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('residents')
    .insert(result.data)
    .select()
    .single();

  if (error) {
    console.error('Error creating resident:', error);
    return { success: false, message: 'Failed to create resident' };
  }

  revalidatePath('/residents');
  return { success: true, data };
}

// Function to create a new resident and return the ID (used in assignments)
export async function createResidentAndReturnId(formData: Omit<ResidentFormValues, 'id' | 'status'>) {
  const resident = {
    name: formData.name,
    room_number: formData.room_number,
    contact_info: formData.contact_info,
    status: 'active' as const
  };
  
  const result = residentSchema.safeParse(resident);
  
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }
  
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('residents')
    .insert(result.data)
    .select('id')
    .single();

  if (error) {
    console.error('Error creating resident:', error);
    return { success: false, message: 'Failed to create resident' };
  }

  revalidatePath('/residents');
  return { success: true, id: data.id };
}

// Function to update a resident
export async function updateResident(id: number, formData: ResidentFormValues) {
  const result = residentSchema.safeParse(formData);
  
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }
  
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('residents')
    .update(result.data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating resident with ID ${id}:`, error);
    return { success: false, message: 'Failed to update resident' };
  }

  revalidatePath(`/residents/${id}`);
  revalidatePath('/residents');
  return { success: true, data };
}

// Function to delete a resident
export async function deleteResident(id: number) {
  const supabase = await createSupabaseServerClient();
  
  // First, check if this resident has any bicycle slots assigned
  const { data: slots, error: slotError } = await supabase
    .from('bicycle_slots')
    .select('id')
    .eq('resident_id', id);
    
  if (slotError) {
    console.error(`Error checking bicycle slots for resident ID ${id}:`, slotError);
    return { success: false, message: 'Failed to check resident bicycle slots' };
  }
  
  if (slots && slots.length > 0) {
    return { 
      success: false, 
      message: '使用中の駐輪枠が割り当てられているため、この居住者を削除できません。先に駐輪枠の割り当てを解除してください。' 
    };
  }
  
  // If no slots are assigned, proceed with deletion
  const { error } = await supabase
    .from('residents')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting resident with ID ${id}:`, error);
    return { success: false, message: 'Failed to delete resident' };
  }

  revalidatePath('/residents');
  redirect('/residents');
}

// Function to get resident statistics for dashboard
export async function getResidentStatistics() {
  const supabase = await createSupabaseServerClient();
  
  // Get total count
  const { count: totalCount, error: totalError } = await supabase
    .from('residents')
    .select('*', { count: 'exact', head: true });
    
  if (totalError) {
    console.error('Error fetching total residents count:', totalError);
    throw new Error('Failed to fetch resident statistics');
  }
  
  // Get active count
  const { count: activeCount, error: activeError } = await supabase
    .from('residents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');
    
  if (activeError) {
    console.error('Error fetching active residents count:', activeError);
    throw new Error('Failed to fetch resident statistics');
  }
  
  return {
    total: totalCount || 0,
    active: activeCount || 0,
    inactive: (totalCount || 0) - (activeCount || 0)
  };
}