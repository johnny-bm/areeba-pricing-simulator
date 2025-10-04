/**
 * Local persistence utilities for client-side data that should persist across browser sessions
 * This is separate from the server-side storage and handles UI state, configuration, and working data
 */

import { DynamicClientConfig, SelectedItem } from '../types/pricing';

const STORAGE_KEYS = {
  CLIENT_CONFIG: 'pricing_simulator_client_config',
  SELECTED_ITEMS: 'pricing_simulator_selected_items', 
  GLOBAL_DISCOUNT: 'pricing_simulator_global_discount',
  GLOBAL_DISCOUNT_TYPE: 'pricing_simulator_global_discount_type',
  GLOBAL_DISCOUNT_APPLICATION: 'pricing_simulator_global_discount_application',
  SIMULATOR_SELECTION: 'pricing_simulator_selection'
} as const;

/**
 * Safely parse JSON from localStorage with error handling
 */
function safeParseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('Failed to parse stored JSON:', error);
    return fallback;
  }
}

/**
 * Safely set JSON to localStorage with error handling
 */
function safeSetJSON(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Failed to save to localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Client Configuration Persistence
 */
export const clientConfigPersistence = {
  save: (config: DynamicClientConfig): boolean => {
    return safeSetJSON(STORAGE_KEYS.CLIENT_CONFIG, config);
  },

  load: (): DynamicClientConfig | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.CLIENT_CONFIG);
    if (!stored) return null;
    
    const parsed = safeParseJSON(stored, null);
    if (!parsed) return null;
    
    // Validate the structure to ensure it's a valid DynamicClientConfig
    if (typeof parsed === 'object' && 
        parsed !== null && 
        'configValues' in parsed &&
        typeof parsed.configValues === 'object') {
      return parsed as DynamicClientConfig;
    }
    
    return null;
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CLIENT_CONFIG);
  }
};

/**
 * Selected Items Persistence
 */
export const selectedItemsPersistence = {
  save: (items: SelectedItem[]): boolean => {
    return safeSetJSON(STORAGE_KEYS.SELECTED_ITEMS, items);
  },

  load: (): SelectedItem[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_ITEMS);
    const parsed = safeParseJSON(stored, []);
    
    // Validate that it's an array
    if (Array.isArray(parsed)) {
      return parsed;
    }
    
    return [];
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.SELECTED_ITEMS);
  }
};

/**
 * Global Discount Settings Persistence
 */
export const globalDiscountPersistence = {
  saveDiscount: (discount: number): boolean => {
    return safeSetJSON(STORAGE_KEYS.GLOBAL_DISCOUNT, discount);
  },

  loadDiscount: (): number => {
    const stored = localStorage.getItem(STORAGE_KEYS.GLOBAL_DISCOUNT);
    const parsed = safeParseJSON(stored, 0);
    return typeof parsed === 'number' ? parsed : 0;
  },

  saveDiscountType: (type: 'percentage' | 'fixed'): boolean => {
    return safeSetJSON(STORAGE_KEYS.GLOBAL_DISCOUNT_TYPE, type);
  },

  loadDiscountType: (): 'percentage' | 'fixed' => {
    const stored = localStorage.getItem(STORAGE_KEYS.GLOBAL_DISCOUNT_TYPE);
    const parsed = safeParseJSON(stored, 'percentage');
    return (parsed === 'percentage' || parsed === 'fixed') ? parsed : 'percentage';
  },

  saveDiscountApplication: (application: 'none' | 'both' | 'monthly' | 'onetime'): boolean => {
    return safeSetJSON(STORAGE_KEYS.GLOBAL_DISCOUNT_APPLICATION, application);
  },

  loadDiscountApplication: (): 'none' | 'both' | 'monthly' | 'onetime' => {
    const stored = localStorage.getItem(STORAGE_KEYS.GLOBAL_DISCOUNT_APPLICATION);
    const parsed = safeParseJSON(stored, 'none');
    const validValues = ['none', 'both', 'monthly', 'onetime'];
    return validValues.includes(parsed) ? parsed : 'none';
  },

  clearAll: (): void => {
    localStorage.removeItem(STORAGE_KEYS.GLOBAL_DISCOUNT);
    localStorage.removeItem(STORAGE_KEYS.GLOBAL_DISCOUNT_TYPE);
    localStorage.removeItem(STORAGE_KEYS.GLOBAL_DISCOUNT_APPLICATION);
  }
};

/**
 * Simulator Selection Persistence
 */
export const simulatorSelectionPersistence = {
  save: (simulatorId: string): boolean => {
    return safeSetJSON(STORAGE_KEYS.SIMULATOR_SELECTION, simulatorId);
  },

  load: (): string | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.SIMULATOR_SELECTION);
    const parsed = safeParseJSON(stored, null);
    return typeof parsed === 'string' ? parsed : null;
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.SIMULATOR_SELECTION);
  }
};

/**
 * Clear all local persistence data (useful for reset scenarios)
 */
export const clearAllLocalData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

/**
 * Check if localStorage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const test = 'localStorage_test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get storage usage info for debugging
 */
export const getStorageInfo = () => {
  const info: Record<string, any> = {};
  
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const value = localStorage.getItem(key);
    info[name] = {
      key,
      hasValue: !!value,
      size: value ? value.length : 0
    };
  });
  
  return info;
};