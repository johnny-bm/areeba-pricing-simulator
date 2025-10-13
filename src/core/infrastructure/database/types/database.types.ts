/**
 * Database Types
 * 
 * Type definitions for Supabase database schema
 * These types represent the actual database structure
 */

export interface PricingItemRow {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  currency: string;
  category_id: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  description: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface PricingItemWithCategoryRow extends PricingItemRow {
  categories: CategoryRow;
}

export interface Database {
  public: {
    Tables: {
      pricing_items: {
        Row: PricingItemRow;
        Insert: Omit<PricingItemRow, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PricingItemRow, 'id' | 'created_at'>>;
      };
      categories: {
        Row: CategoryRow;
        Insert: Omit<CategoryRow, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CategoryRow, 'id' | 'created_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Supabase response types
export interface SupabaseResponse<T> {
  data: T | null;
  error: {
    message: string;
    code: string;
    details?: string;
  } | null;
}

export interface SupabaseArrayResponse<T> {
  data: T[] | null;
  error: {
    message: string;
    code: string;
    details?: string;
  } | null;
}
