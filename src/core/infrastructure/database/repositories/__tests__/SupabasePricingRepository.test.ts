/**
 * SupabasePricingRepository Unit Tests
 * 
 * Tests repository logic with mocked Supabase client
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupabasePricingRepository } from '../SupabasePricingRepository';
import { PricingItem } from '../../../../domain/pricing/entities/PricingItem';
import { Category } from '../../../../domain/pricing/entities/Category';
import { Money } from '../../../../domain/pricing/value-objects/Money';
import { InfrastructureError, DatabaseQueryError } from '../../errors/InfrastructureError';

describe('SupabasePricingRepository', () => {
  let repository: SupabasePricingRepository;
  let mockSupabase: any;

  // Test data
  const category = new Category('cat-1', 'Software', 'Software products', 1);
  const basePrice = new Money(100, 'USD');
  const item = new PricingItem('item-1', 'Software A', 'Description A', basePrice, category, 1);

  const mockRow = {
    id: 'item-1',
    name: 'Software A',
    description: 'Description A',
    base_price: 100,
    currency: 'USD',
    category_id: 'cat-1',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    categories: {
      id: 'cat-1',
      name: 'Software',
      description: 'Software products',
      order: 1,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
  };

  beforeEach(() => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn().mockReturnThis(),
    };

    mockSupabase = {
      from: vi.fn().mockReturnValue(mockChain),
    };
    
    repository = new SupabasePricingRepository(mockSupabase);
  });

  describe('findById', () => {
    it('should return pricing item when found', async () => {
      const mockChain = mockSupabase.from().select().eq().single;
      mockChain.mockResolvedValue({
        data: mockRow,
        error: null,
      });

      const result = await repository.findById('item-1');

      expect(result).toBeInstanceOf(PricingItem);
      expect(result?.id).toBe('item-1');
      expect(result?.name).toBe('Software A');
      expect(result?.basePrice.amount).toBe(100);
      expect(mockSupabase.from).toHaveBeenCalledWith('pricing_items');
    });

    it('should return null when item not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });

    it('should throw InfrastructureError on database error', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Connection failed', code: 'CONNECTION_ERROR' },
      });

      await expect(repository.findById('item-1'))
        .rejects.toThrow(InfrastructureError);
    });
  });

  describe('findByIds', () => {
    it('should return array of pricing items', async () => {
      mockSupabase.in.mockResolvedValue({
        data: [mockRow],
        error: null,
      });

      const result = await repository.findByIds(['item-1']);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(PricingItem);
      expect(result[0].id).toBe('item-1');
    });

    it('should return empty array for empty input', async () => {
      const result = await repository.findByIds([]);

      expect(result).toEqual([]);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should throw InfrastructureError on database error', async () => {
      mockSupabase.in.mockResolvedValue({
        data: null,
        error: { message: 'Query failed', code: 'QUERY_ERROR' },
      });

      await expect(repository.findByIds(['item-1']))
        .rejects.toThrow(InfrastructureError);
    });
  });

  describe('findAll', () => {
    it('should return all pricing items', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [mockRow],
        error: null,
      });

      const result = await repository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(PricingItem);
      expect(mockSupabase.from).toHaveBeenCalledWith('pricing_items');
      expect(mockSupabase.order).toHaveBeenCalledWith('name');
    });

    it('should throw InfrastructureError on database error', async () => {
      mockSupabase.order.mockResolvedValue({
        data: null,
        error: { message: 'Query failed', code: 'QUERY_ERROR' },
      });

      await expect(repository.findAll())
        .rejects.toThrow(InfrastructureError);
    });
  });

  describe('findByCategory', () => {
    it('should return items for specific category', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [mockRow],
        error: null,
      });

      const result = await repository.findByCategory('cat-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(PricingItem);
      expect(mockSupabase.eq).toHaveBeenCalledWith('category_id', 'cat-1');
    });
  });

  describe('findByName', () => {
    it('should return items matching name', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [mockRow],
        error: null,
      });

      const result = await repository.findByName('Software');

      expect(result).toHaveLength(1);
      expect(mockSupabase.ilike).toHaveBeenCalledWith('name', '%Software%');
    });
  });

  describe('findByPriceRange', () => {
    it('should return items within price range', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [mockRow],
        error: null,
      });

      const result = await repository.findByPriceRange(50, 150);

      expect(result).toHaveLength(1);
      expect(mockSupabase.gte).toHaveBeenCalledWith('base_price', 50);
      expect(mockSupabase.lte).toHaveBeenCalledWith('base_price', 150);
    });
  });

  describe('save', () => {
    it('should save pricing item', async () => {
      mockSupabase.upsert.mockResolvedValue({
        data: null,
        error: null,
      });

      await repository.save(item);

      expect(mockSupabase.from).toHaveBeenCalledWith('pricing_items');
      expect(mockSupabase.upsert).toHaveBeenCalled();
    });

    it('should throw InfrastructureError on save error', async () => {
      mockSupabase.upsert.mockResolvedValue({
        data: null,
        error: { message: 'Save failed', code: 'SAVE_ERROR' },
      });

      await expect(repository.save(item))
        .rejects.toThrow(InfrastructureError);
    });
  });

  describe('delete', () => {
    it('should delete pricing item', async () => {
      mockSupabase.delete.mockResolvedValue({
        data: null,
        error: null,
      });

      await repository.delete('item-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('pricing_items');
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'item-1');
    });

    it('should throw InfrastructureError on delete error', async () => {
      mockSupabase.delete.mockResolvedValue({
        data: null,
        error: { message: 'Delete failed', code: 'DELETE_ERROR' },
      });

      await expect(repository.delete('item-1'))
        .rejects.toThrow(InfrastructureError);
    });
  });

  describe('exists', () => {
    it('should return true when item exists', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { id: 'item-1' },
        error: null,
      });

      const result = await repository.exists('item-1');

      expect(result).toBe(true);
    });

    it('should return false when item does not exist', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      const result = await repository.exists('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should return count of all items', async () => {
      mockSupabase.select.mockResolvedValue({
        count: 5,
        error: null,
      });

      const result = await repository.count();

      expect(result).toBe(5);
    });

    it('should return 0 when no items', async () => {
      mockSupabase.select.mockResolvedValue({
        count: 0,
        error: null,
      });

      const result = await repository.count();

      expect(result).toBe(0);
    });
  });

  describe('countByCategory', () => {
    it('should return count for specific category', async () => {
      mockSupabase.select.mockResolvedValue({
        count: 3,
        error: null,
      });

      const result = await repository.countByCategory('cat-1');

      expect(result).toBe(3);
      expect(mockSupabase.eq).toHaveBeenCalledWith('category_id', 'cat-1');
    });
  });
});
