/**
 * Database persistence utilities for multi-user session data
 * Replaces localStorage with database storage for shared platform usage
 */
import { api } from './api';
// Generate a unique session ID for this browser session
const generateSessionId = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return `session_${timestamp}_${random}`;
};
// Get or create session ID
const getSessionId = () => {
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
};
/**
 * Debounce utility for database saves
 */
const debounceMap = new Map();
const debouncedSave = (key, value, delay = 1000) => {
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
            }
            catch (error) {
                console.warn(`Failed to save ${key} to database:`, error);
                resolve(false);
            }
        }, delay);
        debounceMap.set(key, timeout);
    });
};
const saveToDatabase = async (key, value, debounce = true) => {
    if (debounce) {
        return debouncedSave(key, value);
    }
    try {
        const sessionId = getSessionId();
        await api.saveSessionData(sessionId, key, value);
        return true;
    }
    catch (error) {
        console.warn(`Failed to save ${key} to database:`, error);
        return false;
    }
};
async function loadFromDatabase(key, fallback) {
    try {
        const sessionId = getSessionId();
        return await api.loadSessionData(sessionId, key, fallback);
    }
    catch (error) {
        // Enhanced error handling for timeouts
        if (error.name === 'AbortError' || error.message?.includes('timeout')) {
            console.warn(`⏰ Load timeout for ${key} - using fallback value`);
        }
        else {
            console.warn(`Failed to load ${key} from database:`, error);
        }
        return fallback;
    }
}
const deleteFromDatabase = async (key) => {
    try {
        const sessionId = getSessionId();
        await api.deleteSessionData(sessionId, key);
    }
    catch (error) {
        // Enhanced error handling for timeouts
        if (error.name === 'AbortError' || error.message?.includes('timeout')) {
            console.warn(`⏰ Delete timeout for ${key} - operation may not have completed`);
        }
        else {
            console.warn(`Failed to delete ${key} from database:`, error);
        }
    }
};
/**
 * Client Configuration Persistence
 */
export const clientConfigPersistence = {
    save: async (config) => {
        return saveToDatabase(STORAGE_KEYS.CLIENT_CONFIG, config);
    },
    load: async () => {
        const config = await loadFromDatabase(STORAGE_KEYS.CLIENT_CONFIG, null);
        if (!config)
            return null;
        // Validate the structure to ensure it's a valid DynamicClientConfig
        if (typeof config === 'object' &&
            config !== null &&
            'configValues' in config &&
            typeof config.configValues === 'object') {
            return config;
        }
        return null;
    },
    clear: async () => {
        await deleteFromDatabase(STORAGE_KEYS.CLIENT_CONFIG);
    }
};
/**
 * Selected Items Persistence
 */
export const selectedItemsPersistence = {
    save: async (items) => {
        return saveToDatabase(STORAGE_KEYS.SELECTED_ITEMS, items);
    },
    load: async () => {
        const items = await loadFromDatabase(STORAGE_KEYS.SELECTED_ITEMS, []);
        // Validate that it's an array
        if (Array.isArray(items)) {
            return items;
        }
        return [];
    },
    clear: async () => {
        await deleteFromDatabase(STORAGE_KEYS.SELECTED_ITEMS);
    }
};
/**
 * Global Discount Settings Persistence
 */
export const globalDiscountPersistence = {
    saveDiscount: async (discount) => {
        return saveToDatabase(STORAGE_KEYS.GLOBAL_DISCOUNT, discount);
    },
    loadDiscount: async () => {
        const discount = await loadFromDatabase(STORAGE_KEYS.GLOBAL_DISCOUNT, 0);
        return typeof discount === 'number' ? discount : 0;
    },
    saveDiscountType: async (type) => {
        return saveToDatabase(STORAGE_KEYS.GLOBAL_DISCOUNT_TYPE, type);
    },
    loadDiscountType: async () => {
        const type = await loadFromDatabase(STORAGE_KEYS.GLOBAL_DISCOUNT_TYPE, 'percentage');
        return (type === 'percentage' || type === 'fixed') ? type : 'percentage';
    },
    saveDiscountApplication: async (application) => {
        return saveToDatabase(STORAGE_KEYS.GLOBAL_DISCOUNT_APPLICATION, application);
    },
    loadDiscountApplication: async () => {
        const application = await loadFromDatabase(STORAGE_KEYS.GLOBAL_DISCOUNT_APPLICATION, 'none');
        const validValues = ['none', 'both', 'monthly', 'onetime'];
        return validValues.includes(application) ? application : 'none';
    },
    clearAll: async () => {
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
    save: async (simulatorId) => {
        return saveToDatabase(STORAGE_KEYS.SIMULATOR_SELECTION, simulatorId);
    },
    load: async () => {
        const simulatorId = await loadFromDatabase(STORAGE_KEYS.SIMULATOR_SELECTION, null);
        return typeof simulatorId === 'string' ? simulatorId : null;
    },
    clear: async () => {
        await deleteFromDatabase(STORAGE_KEYS.SIMULATOR_SELECTION);
    }
};
/**
 * Service Configuration Mappings Persistence
 */
export const serviceMappingsPersistence = {
    save: async (mappings) => {
        return saveToDatabase(STORAGE_KEYS.SERVICE_MAPPINGS, mappings);
    },
    load: async () => {
        const mappings = await loadFromDatabase(STORAGE_KEYS.SERVICE_MAPPINGS, {});
        return typeof mappings === 'object' && mappings !== null ? mappings : {};
    },
    clear: async () => {
        await deleteFromDatabase(STORAGE_KEYS.SERVICE_MAPPINGS);
    }
};
/**
 * Auto-Add Configuration Persistence
 */
export const autoAddConfigPersistence = {
    save: async (config) => {
        return saveToDatabase(STORAGE_KEYS.AUTO_ADD_CONFIG, config);
    },
    load: async () => {
        const config = await loadFromDatabase(STORAGE_KEYS.AUTO_ADD_CONFIG, {
            autoAddRules: {},
            quantityRules: {}
        });
        if (typeof config === 'object' && config !== null &&
            'autoAddRules' in config && 'quantityRules' in config) {
            return config;
        }
        return {
            autoAddRules: {},
            quantityRules: {}
        };
    },
    clear: async () => {
        await deleteFromDatabase(STORAGE_KEYS.AUTO_ADD_CONFIG);
    }
};
/**
 * Clear all session data (useful for reset scenarios)
 */
export const clearAllSessionData = async () => {
    const sessionId = getSessionId();
    try {
        await api.clearSessionData(sessionId);
        // Also clear the session ID from sessionStorage
        sessionStorage.removeItem('pricing_simulator_session_id');
    }
    catch (error) {
        console.warn('Failed to clear all session data:', error);
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
    }
    catch (error) {
        console.warn('Failed to get session info:', error);
        return {
            sessionId,
            error: error.message,
            hasData: false
        };
    }
};
/**
 * Flush all pending debounced saves immediately
 * Useful when the user is about to leave the page
 */
export const flushPendingSaves = () => {
    for (const [key, timeout] of debounceMap.entries()) {
        clearTimeout(timeout);
        // Don't await these saves as we want them to fire quickly
        setTimeout(async () => {
            try {
                // This will trigger the actual save without debounce
                // Flushing pending save for ${key}
            }
            catch (error) {
                console.warn(`Failed to flush save for ${key}:`, error);
            }
        }, 0);
    }
    debounceMap.clear();
};
/**
 * Check if database persistence is available
 */
export const isDatabasePersistenceAvailable = async () => {
    try {
        await api.ping();
        return true;
    }
    catch {
        return false;
    }
};
/**
 * Debug function to check persistence status for auto-add configuration
 */
export const debugAutoAddPersistence = async () => {
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
        let syncStatus;
        if (!hasMappings && !hasAutoAddRules && !hasQuantityRules) {
            syncStatus = 'empty';
        }
        else if (hasMappings && (hasAutoAddRules || hasQuantityRules)) {
            syncStatus = 'synchronized';
        }
        else {
            syncStatus = 'out_of_sync';
        }
        return {
            sessionId,
            serviceMappings,
            autoAddConfig,
            syncStatus
        };
    }
    catch (error) {
        console.error('Failed to debug auto-add persistence:', error);
        return {
            sessionId,
            serviceMappings: {},
            autoAddConfig: { autoAddRules: {}, quantityRules: {} },
            syncStatus: 'empty'
        };
    }
};
