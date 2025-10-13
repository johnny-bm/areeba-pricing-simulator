/**
 * Feature Flag Configuration
 * 
 * Controls gradual migration from legacy to new architecture
 * Allows safe rollout of new features
 */

export const FEATURES = {
  // Main architecture flag
  USE_NEW_ARCHITECTURE: import.meta.env.VITE_USE_NEW_ARCHITECTURE === 'true',
  
  // Feature-specific flags
  USE_NEW_PRICING: import.meta.env.VITE_USE_NEW_PRICING === 'true',
  USE_NEW_AUTH: import.meta.env.VITE_USE_NEW_AUTH === 'true',
  USE_NEW_ADMIN: import.meta.env.VITE_USE_NEW_ADMIN === 'true',
  USE_NEW_DOCUMENTS: import.meta.env.VITE_USE_NEW_DOCUMENTS === 'true',
  
  // Development flags
  ENABLE_DEBUG_LOGGING: import.meta.env.VITE_ENABLE_DEBUG_LOGGING === 'true',
  ENABLE_PERFORMANCE_MONITORING: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
} as const;

/**
 * Check if new architecture is fully enabled
 */
export const isNewArchitectureEnabled = (): boolean => {
  return FEATURES.USE_NEW_ARCHITECTURE;
};

/**
 * Check if specific feature is enabled
 */
export const isFeatureEnabled = (feature: keyof typeof FEATURES): boolean => {
  return FEATURES[feature];
};

/**
 * Check if pricing feature is enabled
 */
export const isPricingEnabled = (): boolean => {
  return FEATURES.USE_NEW_ARCHITECTURE && FEATURES.USE_NEW_PRICING;
};

/**
 * Check if authentication feature is enabled
 */
export const isAuthEnabled = (): boolean => {
  return FEATURES.USE_NEW_ARCHITECTURE && FEATURES.USE_NEW_AUTH;
};

/**
 * Check if admin feature is enabled
 */
export const isAdminEnabled = (): boolean => {
  return FEATURES.USE_NEW_ARCHITECTURE && FEATURES.USE_NEW_ADMIN;
};

/**
 * Check if documents feature is enabled
 */
export const isDocumentsEnabled = (): boolean => {
  return FEATURES.USE_NEW_ARCHITECTURE && FEATURES.USE_NEW_DOCUMENTS;
};

/**
 * Get feature flag status for debugging
 */
export const getFeatureFlags = () => {
  return {
    newArchitecture: FEATURES.USE_NEW_ARCHITECTURE,
    pricing: FEATURES.USE_NEW_PRICING,
    auth: FEATURES.USE_NEW_AUTH,
    admin: FEATURES.USE_NEW_ADMIN,
    documents: FEATURES.USE_NEW_DOCUMENTS,
    debugLogging: FEATURES.ENABLE_DEBUG_LOGGING,
    performanceMonitoring: FEATURES.ENABLE_PERFORMANCE_MONITORING,
  };
};

/**
 * Log feature flags in development
 */
if (import.meta.env.DEV && FEATURES.ENABLE_DEBUG_LOGGING) {
  // // console.log('🚩 Feature Flags:', getFeatureFlags());
}
