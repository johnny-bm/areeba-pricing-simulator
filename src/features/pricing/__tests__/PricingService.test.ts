import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PricingService } from '../api/pricingService';
import { api } from '../../../utils/api';

// Mock the API
vi.mock('../../../utils/api', () => ({
  api: {
    getPricingItems: vi.fn(),
    getCategories: vi.fn(),
    getTags: vi.fn(),
    createPricingItem: vi.fn(),
    updatePricingItem: vi.fn(),
    deletePricingItem: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
    createTag: vi.fn(),
    updateTag: vi.fn(),
    deleteTag: vi.fn(),
  },
}));

describe('PricingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPricingItems', () => {
    it('should return pricing items without filters', async () => {
      const mockItems = [
        { 
          id: '1', 
          name: 'Item 1', 
          defaultPrice: 100,
          pricingType: 'fixed' as const,
          categoryId: 'setup',
          unit: 'item',
          isArchived: false
        },
        { 
          id: '2', 
          name: 'Item 2', 
          defaultPrice: 200,
          pricingType: 'fixed' as const,
          categoryId: 'setup',
          unit: 'item',
          isArchived: false
        },
      ];

      vi.mocked(api.getPricingItems).mockResolvedValue(mockItems);

      const result = await PricingService.getPricingItems();

      expect(result).toEqual(mockItems);
      expect(api.getPricingItems).toHaveBeenCalled();
    });

    it('should apply filters correctly', async () => {
      const mockItems = [
        { 
          id: '1', 
          name: 'Item 1', 
          categoryId: 'setup', 
          defaultPrice: 100,
          pricingType: 'fixed' as const,
          unit: 'item',
          isArchived: false
        },
        { 
          id: '2', 
          name: 'Item 2', 
          categoryId: 'hosting', 
          defaultPrice: 200,
          pricingType: 'fixed' as const,
          unit: 'item',
          isArchived: false
        },
      ];

      vi.mocked(api.getPricingItems).mockResolvedValue(mockItems);

      const filters = { categoryId: 'setup' };
      const result = await PricingService.getPricingItems(filters);

      expect(result).toEqual([mockItems[0]]);
    });

    it('should apply search filter', async () => {
      const mockItems = [
        { 
          id: '1', 
          name: 'Card Processing', 
          defaultPrice: 100,
          pricingType: 'fixed' as const,
          categoryId: 'setup',
          unit: 'item',
          isArchived: false
        },
        { 
          id: '2', 
          name: 'Hosting Service', 
          defaultPrice: 200,
          pricingType: 'fixed' as const,
          categoryId: 'setup',
          unit: 'item',
          isArchived: false
        },
      ];

      vi.mocked(api.getPricingItems).mockResolvedValue(mockItems);

      const filters = { searchTerm: 'card' };
      const result = await PricingService.getPricingItems(filters);

      expect(result).toEqual([mockItems[0]]);
    });

    it('should handle API error', async () => {
      vi.mocked(api.getPricingItems).mockRejectedValue(new Error('API Error'));

      await expect(PricingService.getPricingItems()).rejects.toThrow(
        'Failed to fetch pricing items: API Error'
      );
    });
  });

  describe('createPricingItem', () => {
    it('should create new pricing item', async () => {
      const newItem = {
        name: 'New Item',
        defaultPrice: 100,
        categoryId: 'setup',
        unit: 'per month',
        pricingType: 'fixed' as const,
        isActive: true,
        isArchived: false,
      };

      const createdItem = { id: '1', ...newItem };

      vi.mocked(api.createPricingItem).mockResolvedValue(createdItem);

      const result = await PricingService.createPricingItem(newItem);

      expect(result).toEqual(createdItem);
      expect(api.createPricingItem).toHaveBeenCalledWith(newItem);
    });

    it('should handle creation error', async () => {
      const newItem = {
        name: 'New Item',
        defaultPrice: 100,
        categoryId: 'setup',
        unit: 'per month',
        pricingType: 'fixed' as const,
        isActive: true,
        isArchived: false,
      };

      vi.mocked(api.createPricingItem).mockRejectedValue(new Error('Creation failed'));

      await expect(PricingService.createPricingItem(newItem)).rejects.toThrow(
        'Failed to create pricing item: Creation failed'
      );
    });
  });

  describe('updatePricingItem', () => {
    it('should update existing pricing item', async () => {
      const updates = { name: 'Updated Item' };
      const updatedItem = { 
        id: '1', 
        name: 'Updated Item', 
        defaultPrice: 100,
        pricingType: 'fixed' as const,
        categoryId: 'setup',
        unit: 'item',
        isArchived: false
      };

      vi.mocked(api.updatePricingItem).mockResolvedValue(updatedItem);

      const result = await PricingService.updatePricingItem('1', updates);

      expect(result).toEqual(updatedItem);
      expect(api.updatePricingItem).toHaveBeenCalledWith('1', updates);
    });

    it('should handle update error', async () => {
      const updates = { name: 'Updated Item' };

      vi.mocked(api.updatePricingItem).mockRejectedValue(new Error('Update failed'));

      await expect(PricingService.updatePricingItem('1', updates)).rejects.toThrow(
        'Failed to update pricing item: Update failed'
      );
    });
  });

  describe('deletePricingItem', () => {
    it('should delete pricing item', async () => {
      vi.mocked(api.deletePricingItem).mockResolvedValue(undefined);

      await expect(PricingService.deletePricingItem('1')).resolves.toBeUndefined();
      expect(api.deletePricingItem).toHaveBeenCalledWith('1');
    });

    it('should handle deletion error', async () => {
      vi.mocked(api.deletePricingItem).mockRejectedValue(new Error('Deletion failed'));

      await expect(PricingService.deletePricingItem('1')).rejects.toThrow(
        'Failed to delete pricing item: Deletion failed'
      );
    });
  });

  describe('calculatePricing', () => {
    it('should calculate pricing correctly', () => {
      const selectedItems = [
        {
          id: '1',
          item: { 
            id: '1',
            name: 'Item 1',
            defaultPrice: 100,
            pricingType: 'fixed' as const,
            categoryId: 'setup',
            unit: 'onetime',
            isArchived: false
          },
          quantity: 1,
          unitPrice: 100,
          discount: 0,
          discountType: 'percentage' as const,
          discountApplication: 'total' as const,
          isFree: false
        },
        {
          id: '2',
          item: { 
            id: '2',
            name: 'Item 2',
            defaultPrice: 50,
            pricingType: 'fixed' as const,
            categoryId: 'hosting',
            unit: 'monthly',
            isArchived: false
          },
          quantity: 1,
          unitPrice: 50,
          discount: 0,
          discountType: 'percentage' as const,
          discountApplication: 'total' as const,
          isFree: false
        },
      ];

      const result = PricingService.calculatePricing(selectedItems);

      expect(result.oneTimeTotal).toBe(100);
      expect(result.monthlyTotal).toBe(50);
      expect(result.yearlyTotal).toBe(600);
      expect(result.totalProjectCost).toBe(700);
      expect(result.savings.originalPrice).toBe(150);
      expect(result.savings.totalSavings).toBe(0);
      expect(result.itemCount).toBe(2);
    });

    it('should handle empty items', () => {
      const result = PricingService.calculatePricing([]);

      expect(result.oneTimeTotal).toBe(0);
      expect(result.monthlyTotal).toBe(0);
      expect(result.yearlyTotal).toBe(0);
      expect(result.totalProjectCost).toBe(0);
      expect(result.itemCount).toBe(0);
    });
  });
});
