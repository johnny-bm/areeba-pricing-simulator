/**
 * Supabase Pricing Repository
 * 
 * Implements IPricingRepository interface using Supabase
 * Pure data access - no business logic
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { IPricingRepository } from '../../../../domain/pricing/repositories/IPricingRepository';
import { PricingItem } from '../../../../domain/pricing/entities/PricingItem';
import { PricingItemDbMapper } from '../mappers/PricingItemDbMapper';
import { 
  InfrastructureError, 
  DatabaseQueryError, 
  DatabaseNotFoundError 
} from '../errors/InfrastructureError';
import type { Database, PricingItemWithCategoryRow } from '../types/database.types';

export class SupabasePricingRepository implements IPricingRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Find pricing item by ID
   */
  async findById(id: string): Promise<PricingItem | null> {
    try {
      const { data, error } = await this.supabase
        .from('pricing_items')
        .select(`
          *,
          categories (*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new DatabaseQueryError(`findById(${id})`, error);
      }

      return data ? PricingItemDbMapper.toDomain(data as PricingItemWithCategoryRow) : null;
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(`Failed to find pricing item by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find pricing items by IDs
   */
  async findByIds(ids: string[]): Promise<PricingItem[]> {
    try {
      if (ids.length === 0) return [];

      const { data, error } = await this.supabase
        .from('pricing_items')
        .select(`
          *,
          categories (*)
        `)
        .in('id', ids);

      if (error) {
        throw new DatabaseQueryError(`findByIds([${ids.join(', ')}])`, error);
      }

      return data ? PricingItemDbMapper.toDomainArray(data as PricingItemWithCategoryRow[]) : [];
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(`Failed to find pricing items by IDs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find all pricing items
   */
  async findAll(): Promise<PricingItem[]> {
    try {
      const { data, error } = await this.supabase
        .from('pricing_items')
        .select(`
          *,
          categories (*)
        `)
        .order('name');

      if (error) {
        throw new DatabaseQueryError('findAll()', error);
      }

      return data ? PricingItemDbMapper.toDomainArray(data as PricingItemWithCategoryRow[]) : [];
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(`Failed to find all pricing items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find pricing items by category
   */
  async findByCategory(categoryId: string): Promise<PricingItem[]> {
    try {
      const { data, error } = await this.supabase
        .from('pricing_items')
        .select(`
          *,
          categories (*)
        `)
        .eq('category_id', categoryId)
        .order('name');

      if (error) {
        throw new DatabaseQueryError(`findByCategory(${categoryId})`, error);
      }

      return data ? PricingItemDbMapper.toDomainArray(data as PricingItemWithCategoryRow[]) : [];
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(`Failed to find pricing items by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find pricing items by name (partial match)
   */
  async findByName(name: string): Promise<PricingItem[]> {
    try {
      const { data, error } = await this.supabase
        .from('pricing_items')
        .select(`
          *,
          categories (*)
        `)
        .ilike('name', `%${name}%`)
        .order('name');

      if (error) {
        throw new DatabaseQueryError(`findByName(${name})`, error);
      }

      return data ? PricingItemDbMapper.toDomainArray(data as PricingItemWithCategoryRow[]) : [];
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(`Failed to find pricing items by name: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find pricing items by price range
   */
  async findByPriceRange(minPrice: number, maxPrice: number): Promise<PricingItem[]> {
    try {
      const { data, error } = await this.supabase
        .from('pricing_items')
        .select(`
          *,
          categories (*)
        `)
        .gte('base_price', minPrice)
        .lte('base_price', maxPrice)
        .order('base_price');

      if (error) {
        throw new DatabaseQueryError(`findByPriceRange(${minPrice}, ${maxPrice})`, error);
      }

      return data ? PricingItemDbMapper.toDomainArray(data as PricingItemWithCategoryRow[]) : [];
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(`Failed to find pricing items by price range: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Save pricing item (insert or update)
   */
  async save(item: PricingItem): Promise<void> {
    try {
      const row = PricingItemDbMapper.toDatabase(item);
      
      const { error } = await this.supabase
        .from('pricing_items')
        .upsert(row, {
          onConflict: 'id'
        });

      if (error) {
        throw new DatabaseQueryError(`save(${item.id})`, error);
      }
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(`Failed to save pricing item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete pricing item by ID
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('pricing_items')
        .delete()
        .eq('id', id);

      if (error) {
        throw new DatabaseQueryError(`delete(${id})`, error);
      }
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(`Failed to delete pricing item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if pricing item exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('pricing_items')
        .select('id')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return false; // Not found
        }
        throw new DatabaseQueryError(`exists(${id})`, error);
      }

      return !!data;
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(`Failed to check if pricing item exists: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Count total pricing items
   */
  async count(): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('pricing_items')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw new DatabaseQueryError('count()', error);
      }

      return count || 0;
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(`Failed to count pricing items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Count pricing items by category
   */
  async countByCategory(categoryId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('pricing_items')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId);

      if (error) {
        throw new DatabaseQueryError(`countByCategory(${categoryId})`, error);
      }

      return count || 0;
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(`Failed to count pricing items by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
