'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { BicycleSlotFormValues, bicycleSlotSchema } from '@/lib/validators/schemas';

// Function to get all bicycle slots
export async function getAllBicycleSlots() {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('bicycle_slots')
    .select(`
      *,
      residents:resident_id (
        id,
        name,
        room_number,
        contact_info
      )
    `)
    .order('slot_code');

  if (error) {
    console.error('Error fetching bicycle slots:', error);
    throw new Error('Failed to fetch bicycle slots');
  }

  return data;
}

// Function to get available bicycle slots
export async function getAvailableBicycleSlots() {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('bicycle_slots')
    .select('*')
    .is('resident_id', null)
    .eq('status', 'available')
    .order('slot_code');

  if (error) {
    console.error('Error fetching available bicycle slots:', error);
    throw new Error('Failed to fetch available bicycle slots');
  }

  return data;
}

// Function to get a bicycle slot by ID
export async function getBicycleSlotById(id: number) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('bicycle_slots')
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
    console.error(`Error fetching bicycle slot with ID ${id}:`, error);
    throw new Error('Failed to fetch bicycle slot');
  }

  return data;
}

// Function to create a new bicycle slot
export async function createBicycleSlot(formData: BicycleSlotFormValues) {
  const result = bicycleSlotSchema.safeParse(formData);
  
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }
  
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('bicycle_slots')
    .insert(result.data)
    .select()
    .single();

  if (error) {
    console.error('Error creating bicycle slot:', error);
    return { success: false, message: 'Failed to create bicycle slot' };
  }

  revalidatePath('/bicycle-slots');
  return { success: true, data };
}

// Function to update a bicycle slot
export async function updateBicycleSlot(id: number, formData: BicycleSlotFormValues) {
  const result = bicycleSlotSchema.safeParse(formData);
  
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }
  
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('bicycle_slots')
    .update(result.data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating bicycle slot with ID ${id}:`, error);
    return { success: false, message: 'Failed to update bicycle slot' };
  }

  revalidatePath(`/bicycle-slots/${id}`);
  revalidatePath('/bicycle-slots');
  revalidatePath('/dashboard');
  return { success: true, data };
}

// Function to release a bicycle slot (remove resident assignment)
export async function releaseBicycleSlot(id: number) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('bicycle_slots')
    .update({
      resident_id: null,
      status: 'available'
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error releasing bicycle slot with ID ${id}:`, error);
    return { success: false, message: 'Failed to release bicycle slot' };
  }

  revalidatePath(`/bicycle-slots/${id}`);
  revalidatePath('/bicycle-slots');
  revalidatePath('/dashboard');
  return { success: true, data };
}

// Function to delete a bicycle slot
export async function deleteBicycleSlot(id: number) {
  const supabase = await createSupabaseServerClient();
  
  const { error } = await supabase
    .from('bicycle_slots')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting bicycle slot with ID ${id}:`, error);
    return { success: false, message: 'Failed to delete bicycle slot' };
  }

  revalidatePath('/bicycle-slots');
  revalidatePath('/dashboard');
  redirect('/bicycle-slots');
}

// Function to get bicycle slot statistics for dashboard
export async function getBicycleSlotStatistics() {
  const supabase = await createSupabaseServerClient();
  
  // Get total count
  const { count: totalCount, error: totalError } = await supabase
    .from('bicycle_slots')
    .select('*', { count: 'exact', head: true });
    
  if (totalError) {
    console.error('Error fetching total bicycle slots count:', totalError);
    throw new Error('Failed to fetch bicycle slots statistics');
  }
  
  // Get available count
  const { count: availableCount, error: availableError } = await supabase
    .from('bicycle_slots')
    .select('*', { count: 'exact', head: true })
    .is('resident_id', null)
    .eq('status', 'available');
    
  if (availableError) {
    console.error('Error fetching available bicycle slots count:', availableError);
    throw new Error('Failed to fetch bicycle slots statistics');
  }
  
  // Get occupied count
  const { count: occupiedCount, error: occupiedError } = await supabase
    .from('bicycle_slots')
    .select('*', { count: 'exact', head: true })
    .not('resident_id', 'is', null)
    .eq('status', 'occupied');
    
  if (occupiedError) {
    console.error('Error fetching occupied bicycle slots count:', occupiedError);
    throw new Error('Failed to fetch bicycle slots statistics');
  }
  
  return {
    total: totalCount || 0,
    available: availableCount || 0,
    occupied: occupiedCount || 0,
    maintenance: (totalCount || 0) - (availableCount || 0) - (occupiedCount || 0)
  };
}