import type { Database } from '@/types/database';
import { supabase } from '@/utils/supabase/client';

type Tables = Database['public']['Tables'];

export type Row<T extends keyof Tables> = Tables[T]['Row'];
export type Insert<T extends keyof Tables> = Tables[T]['Insert'];
export type Update<T extends keyof Tables> = Tables[T]['Update'];

export const db = {
  from<T extends keyof Tables>(table: T) {
    return supabase.from(String(table));
  },
};
