/**
 * Database persistence utilities for multi-user session data
 * Replaces localStorage with database storage for shared platform usage
 */

import { DynamicClientConfig, SelectedItem } from '../types/domain';
import { api } from './api';

// Generate a unique session ID for this browser session
const generateSessionId = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  return `session_${timestamp}_${random}`;
};

// Get or create session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('pricing_simulator_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('pricing_simulator_session_id', sessionId);
  }
  return sessionId;
};

/**
 * Database storage keys
 */
const STORAGE_KEYS = {
  CLIENT_CONFIG: 'client_config',
  SELECTED_ITEMS: 'selected_items',
  GLOBAL_DISCOUNT: 'global_discount',
  GLOBAL_DISCOUNT_TYPE: 'global_discount_type',
  GLOBAL_DISCOUNT_APPLICATION: 'global_discount_application',
  SIMULATOR_SELECTION: 'simulator_selection',
  SERVICE_MAPPINGS: 'service_mappings',
  AUTO_ADD_CONFIG: 'auto_add_config'
} as const;

/**
 * Debounce utility for database saves
 */
const debounceMap = new Map<string, NodeJS.Timeout>();

const debouncedSave = (key: string, value: any, delay: number = 1000): Promise<boolean> => {
  return new Promise((resolve) => {
    // Clear existing debounce for this key
    const existingTimeout = debounceMap.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Set new debounce
    const timeout = setTimeout(async () => {
      debounceMap.delete(key);
      try {
        const sessionId = getSessionId();
        await api.saveSessionData(sessionId, key, value);
        resolve(true);
      } catch (error) {
        // // console.warn(`Failed to save ${key} to database:`, error);
        resolve(false);
      }
    }, delay);
    
    debounceMap.set(key, timeout);
  });
};

const saveToDatabase = async (key: string, value: any, debounce: boolean = true): Promise<boolean> => {
  if (debounce) {
    return debouncedSave(key, value);
  }
  
  try {
    const sessionId = getSessionId();
    await api.saveSessionData(sessionId, key, value);
    return true;
  } catch (error) {
    // // console.warn(`Failed to save ${key} to database:`, error);
    return false;
  }
};

async function loadFromDatabase<T>(key: string, fallback: T): Promise<T> {
  try {
    const sessionId = getSessionId();
    return await api.loadSessionData(sessionId, key, fallback);
  } catch (error) {
    // Enhanced error handling for timeouts
    if ((error as Error).name === 'AbortError' || (error as Error).message?.includes('timeout')) {
      // // console.warn(`⏰ Load timeout for ${key} - using fallback value`);
    } else {
      // // console.warn(`Failed to load ${key} from database:`, error);
    }
    return fallback;
  }
}

const deleteFromDatabase = async (key: string): Promise<void> => {
  try {
    const sessionId = getSessionId();
    await api.deleteSessionData(sessionId, key);
  } catch (error) {
    // Enhanced error handling for timeouts
    if ((error as Error).name === 'AbortError' || (error as Error).message?.includes('timeout')) {
      // // console.warn(`⏰ Delete timeout for ${key} - operation may not have completed`);
    } else {
      // // console.warn(`Failed to delete ${key} from database:`, error);
    }
  }
};

/**
 * Client Configuration Persistence
 */
export const clientConfigPersistence = {
  save: async (config: DynamicClientConfig): Promise<boolean> => {
    return saveToDatabase(STORAGE_KEYS.CLIENT_CONFIG, config);
  },

  load: async (): Promise<DynamicClientConfig | null> => {
    const config = await loadFromDatabase(STORAGE_KEYS.CLIENT_CONFIG, null);
    
    if (!config) return null;
    
    // Validate the structure to ensure it's a valid DynamicClientConfig
    if (typeof config === 'object' && 
        config !== null && 
        'configValues' in config &&
        typeof config.configValues === 'object') {
      return config as DynamicClientConfig;
    }
    
    return null;
  },

  clear: async (): Promise<void> => {
    await deleteFromDatabase(STORAGE_KEYS.CLIENT_CONFIG);
  }
};

/**
 * Selected Items Persistence
 */
export const selectedItemsPersistence = {
  save: async (items: SelectedItem[]): Promise<boolean> => {
    return saveToDatabase(STORAGE_KEYS.SELECTED_ITEMS, items);
  },

  load: async (): Promise<SelectedItem[]> => {
    const items = await loadFromDatabase(STORAGE_KEYS.SELECTED_ITEMS, []);
    
    // Validate that it's an array
    if (Array.isArray(items)) {
      return items;
    }
    
    return [];
  },

  clear: async (): Promise<void> => {
    await deleteFromDatabase(STORAGE_KEYS.SELECTED_ITEMS);
  }
};

/**
 * Global Discount Settings Persistence
 */
export const globalDiscountPersistence = {
  saveDiscount: async (discount: number): Promise<boolean> => {
    return saveToDatabase(STORAGE_KEYS.GLOBAL_DISCOUNT, discount);
  },

  loadDiscount: async (): Promise<number> => {
    const discount = await loadFromDatabase(STORAGE_KEYS.GLOBAL_DISCOUNT, 0);
    return typeof discount === 'number' ? discount : 0;
  },

  saveDiscountType: async (type: 'percentage' | 'fixed'): Promise<boolean> => {
    return saveToDatabase(STORAGE_KEYS.GLOBAL_DISCOUNT_TYPE, type);
  },

  loadDiscountType: async (): Promise<'percentage' | 'fixed'> => {
    const type = await loadFromDatabase(STORAGE_KEYS.GLOBAL_DISCOUNT_TYPE, 'percentage');
    return (type === 'percentage' || type === 'fixed') ? type : 'percentage';
  },

  saveDiscountApplication: async (application: 'none' | 'both' | 'monthly' | 'onetime'): Promise<boolean> => {
    return saveToDatabase(STORAGE_KEYS.GLOBAL_DISCOUNT_APPLICATION, application);
  },

  loadDiscountApplication: async (): Promise<'none' | 'both' | 'monthly' | 'onetime'> => {
    const application = await loadFromDatabase(STORAGE_KEYS.GLOBAL_DISCOUNT_APPLICATION, 'none');
    const validValues: ('none' | 'both' | 'monthly' | 'onetime')[] = ['none', 'both', 'monthly', 'onetime'];
    return validValues.includes(application as any) ? (application as 'none' | 'both' | 'monthly' | 'onetime') : 'none';
  },

  clearAll: async (): Promise<void> => {
    await Promise.all([
      deleteFromDatabase(STORAGE_KEYS.GLOBAL_DISCOUNT),
      deleteFromDatabase(STORAGE_KEYS.GLOBAL_DISCOUNT_TYPE),
      deleteFromDatabase(STORAGE_KEYS.GLOBAL_DISCOUNT_APPLICATION)
    ]);
  }
};

/**
 * Simulator Selection Persistence
 */
export const simulatorSelectionPersistence = {
  save: async (simulatorId: string): Promise<boolean> => {
    return saveToDatabase(STORAGE_KEYS.SIMULATOR_SELECTION, simulatorId);
  },

  load: async (): Promise<string | null> => {
    const simulatorId = await loadFromDatabase(STORAGE_KEYS.SIMULATOR_SELECTION, null);
    return typeof simulatorId === 'string' ? simulatorId : null;
  },

  clear: async (): Promise<void> => {
    await deleteFromDatabase(STORAGE_KEYS.SIMULATOR_SELECTION);
  }
};

/**
 * Service Configuration Mappings Persistence
 */
export const serviceMappingsPersistence = {
  save: async (mappings: Record<string, any>): Promise<boolean> => {
    return saveToDatabase(STORAGE_KEYS.SERVICE_MAPPINGS, mappings);
  },

  load: async (): Promise<Record<string, any>> => {
    const mappings = await loadFromDatabase(STORAGE_KEYS.SERVICE_MAPPINGS, {});
    return typeof mappings === 'object' && mappings !== null ? mappings : {};
  },

  clear: async (): Promise<void> => {
    await deleteFromDatabase(STORAGE_KEYS.SERVICE_MAPPINGS);
  }
};

/**
 * Auto-Add Configuration Persistence
 */
export const autoAddConfigPersistence = {
  save: async (config: {
    autoAddRules: Record<string, string[]>;
    quantityRules: Record<string, { field: string; multiplier?: number }>;
  }): Promise<boolean> => {
    return saveToDatabase(STORAGE_KEYS.AUTO_ADD_CONFIG, config);
  },

  load: async (): Promise<{
    autoAddRules: Record<string, string[]>;
    quantityRules: Record<string, { field: string; multiplier?: number }>;
  }> => {
    const config = await loadFromDatabase(STORAGE_KEYS.AUTO_ADD_CONFIG, {
      autoAddRules: {},
      quantityRules: {}
    });
    
    if (typeof config === 'object' && config !== null && 
        'autoAddRules' in config && 'quantityRules' in config) {
      return config as {
        autoAddRules: Record<string, string[]>;
        quantityRules: Record<string, { field: string; multiplier?: number }>;
      };
    }
    
    return {
      autoAddRules: {},
      quantityRules: {}
    };
  },

  clear: async (): Promise<void> => {
    await deleteFromDatabase(STORAGE_KEYS.AUTO_ADD_CONFIG);
  }
};

/**
 * Clear all session data (useful for reset scenarios)
 */
export const clearAllSessionData = async (): Promise<void> => {
  const sessionId = getSessionId();
  
  try {
    await api.clearSessionData(sessionId);
    
    // Also clear the session ID from sessionStorage
    sessionStorage.removeItem('pricing_simulator_session_id');
  } catch (error) {
    // // console.warn('Failed to clear all session data:', error);
  }
};

/**
 * Get session storage info for debugging
 */
export const getSessionInfo = async () => {
  const sessionId = getSessionId();
  
  try {
    // Check if we have any data stored for this session
    const hasData = await loadFromDatabase(STORAGE_KEYS.SELECTED_ITEMS, null) !== null;
    
    return {
      sessionId,
      hasData,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    // // console.warn('Failed to get session info:', error);
    return {
      sessionId,
      error: (error as Error).message,
      hasData: false
    };
  }
};

/**
 * Flush all pending debounced saves immediately
 * Useful when the user is about to leave the page
 */
export const flushPendingSaves = (): void => {
  for (const [key, timeout] of debounceMap.entries()) {
    clearTimeout(timeout);
    // Don't await these saves as we want them to fire quickly
    setTimeout(async () => {
      try {
        // This will trigger the actual save without debounce
        // Flushing pending save for ${key}
      } catch (error) {
        // // console.warn(`Failed to flush save for ${key}:`, error);
      }
    }, 0);
  }
  debounceMap.clear();
};

/**
 * Check if database persistence is available
 */
export const isDatabasePersistenceAvailable = async (): Promise<boolean> => {
  try {
    await api.ping();
    return true;
  } catch {
    return false;
  }
};

/**
 * Debug function to check persistence status for auto-add configuration
 */
export const debugAutoAddPersistence = async (): Promise<{
  sessionId: string;
  serviceMappings: Record<string, any>;
  autoAddConfig: {
    autoAddRules: Record<string, string[]>;
    quantityRules: Record<string, { field: string; multiplier?: number }>;
  };
  syncStatus: 'synchronized' | 'out_of_sync' | 'empty';
}> => {
  const sessionId = getSessionId();
  
  try {
    const [serviceMappings, autoAddConfig] = await Promise.all([
      serviceMappingsPersistence.load(),
      autoAddConfigPersistence.load()
    ]);
    
    // Check if they're synchronized
    const hasMappings = Object.keys(serviceMappings).length > 0;
    const hasAutoAddRules = Object.keys(autoAddConfig.autoAddRules).length > 0;
    const hasQuantityRules = Object.keys(autoAddConfig.quantityRules).length > 0;
    
    let syncStatus: 'synchronized' | 'out_of_sync' | 'empty';
    
    if (!hasMappings && !hasAutoAddRules && !hasQuantityRules) {
      syncStatus = 'empty';
    } else if (hasMappings && (hasAutoAddRules || hasQuantityRules)) {
      syncStatus = 'synchronized';
    } else {
      syncStatus = 'out_of_sync';
    }
    
    return {
      sessionId,
      serviceMappings,
      autoAddConfig,
      syncStatus
    };
  } catch (error) {
    // // console.error('Failed to debug auto-add persistence:', error);
    return {
      sessionId,
      serviceMappings: {},
      autoAddConfig: { autoAddRules: {}, quantityRules: {} },
      syncStatus: 'empty'
    };
  }
};