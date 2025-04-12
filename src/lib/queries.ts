import { createClient } from '@supabase/supabase-js';
import { 
  useQuery, 
  useMutation, 
  QueryKey, 
  UseQueryOptions, 
  UseMutationOptions 
} from '@tanstack/react-query';
import { supabase } from './supabase';
import { Database } from '@/types/supabase';

export type Tables = Database['public']['Tables'];
type TableName = keyof Tables;

// Helper function to get data from Supabase with React Query
export function useSupabaseQuery<T extends TableName, R = Tables[T]['Row']>(
  table: T,
  options?: {
    queryKey?: QueryKey,
    queryOptions?: Omit<UseQueryOptions<R[], Error>, 'queryKey' | 'queryFn'>,
    queryFn?: (supabaseQuery: ReturnType<typeof supabase.from>) => Promise<{ data: R[] }>,
  }
) {
  const { queryKey = [table], queryOptions = {}, queryFn } = options || {};
  
  return useQuery<R[], Error>({
    queryKey,
    queryFn: async () => {
      if (queryFn) {
        const { data, error } = await queryFn(supabase.from(table));
        if (error) throw error;
        return data;
      }
      
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw error;
      return data as R[];
    },
    ...queryOptions,
  });
}

// Helper function for mutations (insert, update, delete)
export function useSupabaseMutation<T extends TableName, R = Tables[T]['Row'], V = any>(
  table: T,
  options?: {
    mutationFn?: (values: V) => Promise<{ data: R | R[] | null, error: any }>,
    mutationOptions?: Omit<UseMutationOptions<R | R[] | null, Error, V>, 'mutationFn'>,
  }
) {
  const { mutationFn, mutationOptions = {} } = options || {};
  
  return useMutation<R | R[] | null, Error, V>({
    mutationFn: async (values: V) => {
      if (mutationFn) {
        const { data, error } = await mutationFn(values);
        if (error) throw error;
        return data;
      }
      
      throw new Error('Mutation function is required');
    },
    ...mutationOptions,
  });
}

// Specific query functions for each table
export function useResidents(options?: UseQueryOptions<Tables['residents']['Row'][], Error>) {
  return useSupabaseQuery('residents', { queryOptions: options });
}

export function useBicycleSlots(options?: UseQueryOptions<Tables['bicycle_slots']['Row'][], Error>) {
  return useSupabaseQuery('bicycle_slots', { queryOptions: options });
}

export function useStickers(options?: UseQueryOptions<Tables['stickers']['Row'][], Error>) {
  return useSupabaseQuery('stickers', { queryOptions: options });
}

export function useViolations(options?: UseQueryOptions<Tables['violation_logs']['Row'][], Error>) {
  return useSupabaseQuery('violation_logs', { queryOptions: options });
}

export function usePayments(options?: UseQueryOptions<Tables['payments']['Row'][], Error>) {
  return useSupabaseQuery('payments', { queryOptions: options });
}