/**
 * Integration Tests for API Endpoints
 * Tests the API layer with real data flow and error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from '../../src/utils/api';
import { validatePricingItems, validateCategories, validateScenarioData } from '../../src/utils/validationSchemas';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
};

vi.mock('../../src/utils/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Mock data
const mockPricingItems = [
  {
    id: '1',
    name: 'Web Development',
    description: 'Custom web application development',
    categoryId: 'cat-1',
    unit: 'hour',
    defaultPrice: 150,
    pricingType: 'one_time' as const,
    billingCycle: 'one_time' as const,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockCategories = [
  {
    id: 'cat-1',
    name: 'Development',
    description: 'Software development services',
    color: '#3B82F6',
    order_index: 1,
    display_order: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockScenarioData = {
  id: 'scenario-1',
  userId: 'user-1',
  config: { clientName: 'Test Client' },
  selectedItems: [
    {
      id: '1',
      item: mockPricingItems[0],
      quantity: 1,
      unitPrice: 150,
      discount: 0,
      discountType: 'percentage' as const,
      discountApplication: 'total' as const,
      isFree: false,
    },
  ],
  summary: {
    oneTimeTotal: 150,
    monthlyTotal: 0,
    yearlyTotal: 0,
    totalProjectCost: 150,
    itemCount: 1,
    savings: {
      totalSavings: 0,
      discountSavings: 0,
      freeSavings: 0,
      originalPrice: 150,
      savingsRate: 0,
    },
  },
  globalDiscount: 0,
  globalDiscountType: 'percentage' as const,
  globalDiscountApplication: 'none' as const,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'user-1' } } },
      error: null,
    });
  });

  describe('Health Check', () => {
    it('should return true when API is healthy', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const result = await api.healthCheck();
      expect(result).toBe(true);
    });

    it('should return false when API is unhealthy', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: null, error: new Error('Connection failed') }),
        }),
      });

      const result = await api.healthCheck();
      expect(result).toBe(false);
    });

    it('should retry on failure', async () => {
      let callCount = 0;
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockImplementation(() => {
            callCount++;
            if (callCount < 2) {
              return Promise.resolve({ data: null, error: new Error('Temporary failure') });
            }
            return Promise.resolve({ data: [], error: null });
          }),
        }),
      });

      const result = await api.healthCheck();
      expect(result).toBe(true);
      expect(callCount).toBe(2);
    });
  });

  describe('Pricing Items API', () => {
    it('should load pricing items successfully', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockResolvedValue({ data: mockPricingItems, error: null }),
          }),
        }),
      });

      const result = await api.loadPricingItems('simulator-1');
      
      expect(result).toEqual(mockPricingItems);
      expect(validatePricingItems(result)).toBeDefined();
    });

    it('should handle empty results', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      const result = await api.loadPricingItems('simulator-1');
      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockResolvedValue({ data: null, error: new Error('Database error') }),
          }),
        }),
      });

      await expect(api.loadPricingItems('simulator-1')).rejects.toThrow('Database error');
    });

    it('should save pricing items successfully', async () => {
      mockSupabase.from.mockReturnValue({
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: mockPricingItems, error: null }),
        }),
      });

      await expect(api.savePricingItems(mockPricingItems, 'simulator-1')).resolves.not.toThrow();
    });

    it('should validate data before saving', async () => {
      const invalidItems = [
        { ...mockPricingItems[0], name: '' }, // Invalid: empty name
      ];

      await expect(api.savePricingItems(invalidItems, 'simulator-1')).rejects.toThrow();
    });
  });

  describe('Categories API', () => {
    it('should load categories successfully', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockResolvedValue({ data: mockCategories, error: null }),
          }),
        }),
      });

      const result = await api.loadCategories('simulator-1');
      
      expect(result).toEqual(mockCategories);
      expect(validateCategories(result)).toBeDefined();
    });

    it('should save categories successfully', async () => {
      mockSupabase.from.mockReturnValue({
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: mockCategories, error: null }),
        }),
      });

      await expect(api.saveCategories(mockCategories, 'simulator-1')).resolves.not.toThrow();
    });
  });

  describe('Scenario Data API', () => {
    it('should save scenario data successfully', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ data: mockScenarioData, error: null }),
      });

      await expect(api.saveScenarioData(mockScenarioData, 'simulator-1')).resolves.not.toThrow();
    });

    it('should load scenario data successfully', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [mockScenarioData], error: null }),
            }),
          }),
        }),
      });

      const result = await api.loadScenarios('simulator-1');
      
      expect(result).toEqual([mockScenarioData]);
      expect(validateScenarioData(result[0])).toBeDefined();
    });

    it('should handle scenario not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
            }),
          }),
        }),
      });

      const result = await api.getScenarioData('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('User Management API', () => {
    it('should load users successfully', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'admin@example.com',
          full_name: 'Admin User',
          role: 'admin',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockUsers, error: null }),
        }),
      });

      const result = await api.getUsers();
      expect(result).toEqual(mockUsers);
    });

    it('should update user successfully', async () => {
      const userUpdates = {
        full_name: 'Updated Name',
        role: 'admin' as const,
      };

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'user-1', ...userUpdates }, error: null }),
            }),
          }),
        }),
      });

      const result = await api.updateUser('user-1', userUpdates);
      expect(result.full_name).toBe('Updated Name');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockRejectedValue(new Error('Network error')),
          }),
        }),
      });

      await expect(api.loadPricingItems('simulator-1')).rejects.toThrow('Network error');
    });

    it('should handle authentication errors', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      await expect(api.savePricingItems(mockPricingItems, 'simulator-1')).rejects.toThrow();
    });

    it('should handle validation errors', async () => {
      const invalidData = [
        { ...mockPricingItems[0], name: '' }, // Invalid: empty name
      ];

      await expect(api.savePricingItems(invalidData, 'simulator-1')).rejects.toThrow();
    });
  });

  describe('Performance Tests', () => {
    it('should handle large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        ...mockPricingItems[0],
        id: `item-${i}`,
        name: `Item ${i}`,
      }));

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockResolvedValue({ data: largeDataset, error: null }),
          }),
        }),
      });

      const startTime = Date.now();
      const result = await api.loadPricingItems('simulator-1');
      const loadTime = Date.now() - startTime;

      expect(result).toHaveLength(1000);
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    it('should handle concurrent requests', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockResolvedValue({ data: mockPricingItems, error: null }),
          }),
        }),
      });

      const promises = Array.from({ length: 10 }, () => api.loadPricingItems('simulator-1'));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toEqual(mockPricingItems);
      });
    });
  });
});
