import { api } from '../../../utils/api';
import { PricingItem, Category, Tag, SelectedItem, ScenarioSummary, PricingFilters, PricingSortOptions } from '../../../types/domain';
import { PRICING_ERRORS } from '../constants';

export class PricingService {
  /**
   * Get all pricing items with optional filtering and sorting
   */
  static async getPricingItems(
    filters?: PricingFilters,
    sort?: PricingSortOptions
  ): Promise<PricingItem[]> {
    try {
      const response = await api.loadPricingItems();
      let items = response || [];

      // Apply filters
      if (filters) {
        if (filters.categoryId) {
          items = items.filter(item => item.categoryId === filters.categoryId);
        }
        
        if (filters.tags && filters.tags.length > 0) {
          items = items.filter(item => 
            item.tags && filters.tags!.some(tag => item.tags!.includes(tag))
          );
        }
        
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          items = items.filter(item => 
            item.name.toLowerCase().includes(searchLower) ||
            (item.description && item.description.toLowerCase().includes(searchLower))
          );
        }
        
        if (!filters.showArchived) {
          items = items.filter(item => !item.isArchived);
        }
      }

      // Apply sorting
      if (sort) {
        items.sort((a, b) => {
          let aValue: any, bValue: any;
          
          switch (sort.field) {
            case 'name':
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
              break;
            case 'price':
              aValue = a.defaultPrice;
              bValue = b.defaultPrice;
              break;
            case 'category':
              aValue = a.categoryId;
              bValue = b.categoryId;
              break;
            case 'createdAt':
              aValue = new Date(a.createdAt || 0);
              bValue = new Date(b.createdAt || 0);
              break;
            default:
              return 0;
          }
          
          if (sort.direction === 'desc') {
            return bValue > aValue ? 1 : -1;
          } else {
            return aValue > bValue ? 1 : -1;
          }
        });
      }

      return items;
    } catch (error) {
      throw new Error(`Failed to fetch pricing items: ${(error as Error).message}`);
    }
  }

  /**
   * Get pricing item by ID
   */
  static async getPricingItem(id: string): Promise<PricingItem | null> {
    try {
      const response = await api.loadPricingItems();
      const items = response || [];
      return items.find(item => item.id === id) || null;
    } catch (error) {
      throw new Error(`Failed to fetch pricing item: ${(error as Error).message}`);
    }
  }

  /**
   * Create new pricing item
   */
  static async createPricingItem(item: Omit<PricingItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<PricingItem> {
    try {
      const response = await api.createPricingItem(item);
      return response;
    } catch (error) {
      throw new Error(`Failed to create pricing item: ${(error as Error).message}`);
    }
  }

  /**
   * Update existing pricing item
   */
  static async updatePricingItem(id: string, updates: Partial<PricingItem>): Promise<PricingItem> {
    try {
      const response = await api.updatePricingItem(id, updates);
      return response;
    } catch (error) {
      throw new Error(`Failed to update pricing item: ${(error as Error).message}`);
    }
  }

  /**
   * Delete pricing item
   */
  static async deletePricingItem(id: string): Promise<void> {
    try {
      await api.deletePricingItem(id);
    } catch (error) {
      throw new Error(`Failed to delete pricing item: ${(error as Error).message}`);
    }
  }

  /**
   * Get all categories
   */
  static async getCategories(): Promise<Category[]> {
    try {
      const response = await api.loadCategories();
      return response || [];
    } catch (error) {
      throw new Error(`Failed to fetch categories: ${(error as Error).message}`);
    }
  }

  /**
   * Create new category
   */
  static async createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    try {
      const response = await api.createCategory(category);
      return response;
    } catch (error) {
      throw new Error(`Failed to create category: ${(error as Error).message}`);
    }
  }

  /**
   * Update category
   */
  static async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    try {
      const response = await api.updateCategory(id, updates);
      return response;
    } catch (error) {
      throw new Error(`Failed to update category: ${(error as Error).message}`);
    }
  }

  /**
   * Delete category
   */
  static async deleteCategory(id: string): Promise<void> {
    try {
      await api.deleteCategory(id);
    } catch (error) {
      throw new Error(`Failed to delete category: ${(error as Error).message}`);
    }
  }

  /**
   * Get all tags
   */
  static async getTags(): Promise<Tag[]> {
    try {
      const response = await api.getTags();
      return response || [];
    } catch (error) {
      throw new Error(`Failed to fetch tags: ${(error as Error).message}`);
    }
  }

  /**
   * Create new tag
   */
  static async createTag(tag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tag> {
    try {
      const response = await api.createTag(tag);
      return response;
    } catch (error) {
      throw new Error(`Failed to create tag: ${(error as Error).message}`);
    }
  }

  /**
   * Update tag
   */
  static async updateTag(id: string, updates: Partial<Tag>): Promise<Tag> {
    try {
      const response = await api.updateTag(id, updates);
      return response;
    } catch (error) {
      throw new Error(`Failed to update tag: ${(error as Error).message}`);
    }
  }

  /**
   * Delete tag
   */
  static async deleteTag(id: string): Promise<void> {
    try {
      await api.deleteTag(id);
    } catch (error) {
      throw new Error(`Failed to delete tag: ${(error as Error).message}`);
    }
  }

  /**
   * Calculate pricing for selected items
   */
  static calculatePricing(selectedItems: SelectedItem[]): ScenarioSummary {
    const oneTimeItems = selectedItems.filter(item => 
      item.item.categoryId === 'setup' || this.isOneTimeUnit(item.item.unit)
    );
    const monthlyItems = selectedItems.filter(item => 
      item.item.categoryId !== 'setup' && !this.isOneTimeUnit(item.item.unit)
    );

    const oneTimeSubtotal = oneTimeItems.reduce((sum, item) => sum + this.calculateItemTotal(item), 0);
    const monthlySubtotal = monthlyItems.reduce((sum, item) => sum + this.calculateItemTotal(item), 0);
    const yearlySubtotal = monthlySubtotal * 12;

    const totalProjectCost = oneTimeSubtotal + yearlySubtotal;
    const originalPrice = selectedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalSavings = originalPrice - totalProjectCost;
    const savingsRate = originalPrice > 0 ? (totalSavings / originalPrice) * 100 : 0;

    return {
      oneTimeTotal: oneTimeSubtotal,
      monthlyTotal: monthlySubtotal,
      yearlyTotal: yearlySubtotal,
      totalProjectCost,
      savings: {
        totalSavings,
        discountSavings: totalSavings,
        freeSavings: 0,
        originalPrice,
        savingsRate,
      },
      itemCount: selectedItems.length,
    };
  }

  /**
   * Calculate total for a single item
   */
  private static calculateItemTotal(item: SelectedItem): number {
    if (item.isFree) return 0;
    
    const subtotal = item.quantity * item.unitPrice;
    let discountAmount = 0;
    
    if (item.discountType === 'percentage') {
      discountAmount = subtotal * (item.discount / 100);
    } else {
      discountAmount = item.discount * item.quantity;
    }
    
    return Math.max(0, subtotal - discountAmount);
  }

  /**
   * Check if unit is one-time
   */
  private static isOneTimeUnit(unit: string): boolean {
    return unit === 'onetime' || unit === 'per_setup' || unit === 'per_installation';
  }
}
