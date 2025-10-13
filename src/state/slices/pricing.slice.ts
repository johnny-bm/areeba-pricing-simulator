/**
 * Pricing Slice
 * 
 * Replaces: Local state in PricingSimulator.tsx
 * Manages pricing items, calculations, and scenarios
 */

import { StateCreator } from 'zustand';
import { PricingState, PricingActions, PricingItem, Scenario, PricingResult } from '../types';
import { RepositoryFactory } from '@/core/infrastructure/database/repositories/RepositoryFactory';
import { CalculatePricingUseCase } from '@/core/application/pricing/use-cases/CalculatePricingUseCase';
import { GetPricingItemsUseCase } from '@/core/application/pricing/use-cases/GetPricingItemsUseCase';
import { FEATURES } from '@/config/features';
import type { CalculatePricingInputDTO } from '@/core/application/pricing/dtos/PricingDTOs';

export const createPricingSlice: StateCreator<
  any,
  [],
  [],
  PricingState & PricingActions
> = (set, get) => ({
  // Initial State
  selectedItems: [],
  scenario: null,
  isCalculating: false,
  calculationResult: null,
  error: null,

  // Actions
  addItem: (item: PricingItem) => {
    set((state) => {
      const existingItem = state.selectedItems.find(i => i.id === item.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return {
          ...state,
          selectedItems: state.selectedItems.map(i =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      } else {
        // Add new item
        return {
          ...state,
          selectedItems: [...state.selectedItems, item],
        };
      }
    });
  },

  removeItem: (itemId: string) => {
    set((state) => ({
      ...state,
      selectedItems: state.selectedItems.filter(item => item.id !== itemId),
    }));
  },

  updateItemQuantity: (itemId: string, quantity: number) => {
    if (quantity < 0) {
      set((state) => ({
        ...state,
        error: 'Quantity cannot be negative',
      }));
      return;
    }

    set((state) => ({
      ...state,
      selectedItems: state.selectedItems.map(item =>
        item.id === itemId
          ? { ...item, quantity, totalPrice: item.basePrice * quantity }
          : item
      ),
    }));
  },

  updateItemDiscount: (itemId: string, discount: number, type: 'percentage' | 'fixed') => {
    if (discount < 0) {
      set((state) => ({
        ...state,
        error: 'Discount cannot be negative',
      }));
      return;
    }

    if (type === 'percentage' && discount > 100) {
      set((state) => ({
        ...state,
        error: 'Percentage discount cannot exceed 100%',
      }));
      return;
    }

    set((state) => ({
      ...state,
      selectedItems: state.selectedItems.map(item => {
        if (item.id === itemId) {
          const subtotal = item.basePrice * item.quantity;
          const discountAmount = type === 'percentage' 
            ? (subtotal * discount) / 100 
            : discount;
          const totalPrice = Math.max(0, subtotal - discountAmount);
          
          return {
            ...item,
            discount,
            discountType: type,
            totalPrice,
          };
        }
        return item;
      }),
    }));
  },

  clearItems: () => {
    set((state) => ({
      ...state,
      selectedItems: [],
      calculationResult: null,
      error: null,
    }));
  },

  calculatePricing: async () => {
    set((state) => ({
      ...state,
      isCalculating: true,
      error: null,
    }));

    try {
      let result: PricingResult;

      if (FEATURES.USE_NEW_PRICING) {
        // Use new architecture with use cases
        const repository = RepositoryFactory.getPricingRepository();
        const useCase = new CalculatePricingUseCase(repository);
        
        // Prepare input for use case
        const selectedItems = get().selectedItems;
        const input: CalculatePricingInputDTO = {
          itemIds: selectedItems.map(item => item.id),
          quantities: selectedItems.reduce((acc, item) => ({
            ...acc,
            [item.id]: item.quantity || 1,
          }), {}),
          discountCode: get().scenario?.discountCode,
          taxRate: get().scenario?.taxRate,
        };

        // Execute use case
        const useCaseResult = await useCase.execute(input);
        
        // Convert to store format
        result = {
          subtotal: useCaseResult.subtotal,
          discount: useCaseResult.discount,
          total: useCaseResult.total,
          savings: useCaseResult.discount,
          savingsRate: useCaseResult.discountRate,
        };
      } else {
        // Legacy calculation (fallback)
        const items = get().selectedItems;
        const subtotal = items.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0);
        const totalDiscount = items.reduce((sum, item) => {
          const itemSubtotal = item.basePrice * item.quantity;
          const discountAmount = item.discountType === 'percentage'
            ? (itemSubtotal * item.discount) / 100
            : item.discount;
          return sum + discountAmount;
        }, 0);
        
        const total = subtotal - totalDiscount;
        const savings = totalDiscount;
        const savingsRate = subtotal > 0 ? (savings / subtotal) * 100 : 0;

        result = {
          subtotal,
          discount: totalDiscount,
          total,
          savings,
          savingsRate,
        };
      }

      set((state) => ({
        ...state,
        calculationResult: result,
        isCalculating: false,
        error: null,
      }));
    } catch (error) {
      set((state) => ({
        ...state,
        isCalculating: false,
        error: error instanceof Error ? error.message : 'Calculation failed',
      }));
      throw error;
    }
  },

  setScenario: (scenario: Scenario | null) => {
    set((state) => ({
      ...state,
      scenario,
    }));
  },

  reset: () => {
    set((state) => ({
      ...state,
      selectedItems: [],
      scenario: null,
      isCalculating: false,
      calculationResult: null,
      error: null,
    }));
  },

  setError: (error: string | null) => {
    set((state) => ({
      ...state,
      error,
    }));
  },
});
