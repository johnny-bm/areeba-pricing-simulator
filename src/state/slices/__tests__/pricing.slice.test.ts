/**
 * Pricing Slice Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { createPricingSlice } from '../pricing.slice';
import { PricingState, PricingActions, PricingItem } from '../../types';

type PricingStore = PricingState & PricingActions;

const createPricingStore = () => create<PricingStore>()((...args) => createPricingSlice(...args));

describe('Pricing Slice', () => {
  let store: ReturnType<typeof createPricingStore>;

  beforeEach(() => {
    store = createPricingStore();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState();
      
      expect(state.selectedItems).toEqual([]);
      expect(state.scenario).toBeNull();
      expect(state.isCalculating).toBe(false);
      expect(state.calculationResult).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('Item Management', () => {
    const mockItem: PricingItem = {
      id: '1',
      name: 'Software License',
      description: 'Annual license',
      basePrice: 100,
      category: 'Software',
      unit: 'license',
      quantity: 1,
      discount: 0,
      discountType: 'percentage',
      totalPrice: 100,
    };

    it('should add item correctly', () => {
      store.getState().addItem(mockItem);
      
      const state = store.getState();
      expect(state.selectedItems).toHaveLength(1);
      expect(state.selectedItems[0]).toEqual(mockItem);
    });

    it('should update quantity when adding existing item', () => {
      store.getState().addItem(mockItem);
      store.getState().addItem(mockItem);
      
      const state = store.getState();
      expect(state.selectedItems).toHaveLength(1);
      expect(state.selectedItems[0].quantity).toBe(2);
    });

    it('should remove item correctly', () => {
      store.getState().addItem(mockItem);
      store.getState().removeItem('1');
      
      const state = store.getState();
      expect(state.selectedItems).toHaveLength(0);
    });

    it('should update item quantity correctly', () => {
      store.getState().addItem(mockItem);
      store.getState().updateItemQuantity('1', 5);
      
      const state = store.getState();
      expect(state.selectedItems[0].quantity).toBe(5);
      expect(state.selectedItems[0].totalPrice).toBe(500);
    });

    it('should not allow negative quantity', () => {
      store.getState().addItem(mockItem);
      store.getState().updateItemQuantity('1', -1);
      
      const state = store.getState();
      expect(state.error).toBe('Quantity cannot be negative');
    });

    it('should update item discount correctly', () => {
      store.getState().addItem(mockItem);
      store.getState().updateItemDiscount('1', 20, 'percentage');
      
      const state = store.getState();
      expect(state.selectedItems[0].discount).toBe(20);
      expect(state.selectedItems[0].discountType).toBe('percentage');
      expect(state.selectedItems[0].totalPrice).toBe(80); // 100 - 20%
    });

    it('should not allow negative discount', () => {
      store.getState().addItem(mockItem);
      store.getState().updateItemDiscount('1', -10, 'percentage');
      
      const state = store.getState();
      expect(state.error).toBe('Discount cannot be negative');
    });

    it('should not allow percentage discount over 100%', () => {
      store.getState().addItem(mockItem);
      store.getState().updateItemDiscount('1', 150, 'percentage');
      
      const state = store.getState();
      expect(state.error).toBe('Percentage discount cannot exceed 100%');
    });

    it('should clear items correctly', () => {
      store.getState().addItem(mockItem);
      store.getState().clearItems();
      
      const state = store.getState();
      expect(state.selectedItems).toHaveLength(0);
      expect(state.calculationResult).toBeNull();
    });
  });

  describe('Pricing Calculations', () => {
    it('should calculate pricing correctly', async () => {
      const item1: PricingItem = {
        id: '1',
        name: 'Item 1',
        description: 'Description',
        basePrice: 100,
        category: 'Category',
        unit: 'unit',
        quantity: 2,
        discount: 0,
        discountType: 'percentage',
        totalPrice: 200,
      };

      const item2: PricingItem = {
        id: '2',
        name: 'Item 2',
        description: 'Description',
        basePrice: 50,
        category: 'Category',
        unit: 'unit',
        quantity: 1,
        discount: 10,
        discountType: 'percentage',
        totalPrice: 45,
      };

      store.getState().addItem(item1);
      store.getState().addItem(item2);
      
      await store.getState().calculatePricing();
      
      const state = store.getState();
      expect(state.calculationResult).toBeTruthy();
      expect(state.calculationResult?.subtotal).toBe(250); // 200 + 50
      expect(state.calculationResult?.discount).toBe(5); // 10% of 50
      expect(state.calculationResult?.total).toBe(245); // 250 - 5
    });
  });

  describe('State Management', () => {
    it('should set scenario correctly', () => {
      const mockScenario = {
        id: '1',
        name: 'Test Scenario',
        clientName: 'Test Client',
        projectName: 'Test Project',
        items: [],
        total: 1000,
        createdAt: new Date().toISOString(),
      };

      store.getState().setScenario(mockScenario);
      
      const state = store.getState();
      expect(state.scenario).toEqual(mockScenario);
    });

    it('should reset state correctly', () => {
      store.getState().addItem({
        id: '1',
        name: 'Item',
        description: 'Description',
        basePrice: 100,
        category: 'Category',
        unit: 'unit',
        quantity: 1,
        discount: 0,
        discountType: 'percentage',
        totalPrice: 100,
      });
      
      store.getState().reset();
      
      const state = store.getState();
      expect(state.selectedItems).toHaveLength(0);
      expect(state.scenario).toBeNull();
      expect(state.isCalculating).toBe(false);
      expect(state.calculationResult).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('State Immutability', () => {
    it('should not mutate original state when adding items', () => {
      const initialState = store.getState();
      const mockItem: PricingItem = {
        id: '1',
        name: 'Software License',
        description: 'Annual license',
        basePrice: 100,
        category: 'Software',
        unit: 'license',
        quantity: 1,
        discount: 0,
        discountType: 'percentage',
        totalPrice: 100,
      };

      store.getState().addItem(mockItem);
      
      // Original state should be unchanged
      expect(initialState.selectedItems).toHaveLength(0);
      
      // New state should be updated
      const newState = store.getState();
      expect(newState.selectedItems).toHaveLength(1);
    });
  });
});
