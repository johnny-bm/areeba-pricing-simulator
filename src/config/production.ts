// Production configuration and feature flags
export const PRODUCTION_CONFIG = {
  // Feature flags
  features: {
    analytics: import.meta.env.PROD,
    errorTracking: import.meta.env.PROD,
    performanceMonitoring: import.meta.env.PROD,
    rateLimiting: true,
    inputValidation: true,
    securityHeaders: true,
    caching: true,
    compression: true,
    minification: true,
    sourceMaps: import.meta.env.DEV,
    hotReload: import.meta.env.DEV,
  },

  // Performance settings
  performance: {
    enableLazyLoading: true,
    enableCodeSplitting: true,
    enableMemoization: true,
    enableVirtualization: true,
    enableDebouncing: true,
    enableThrottling: true,
    maxConcurrentRequests: 5,
    requestTimeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Security settings
  security: {
    enableCSP: true,
    enableHSTS: true,
    enableXSSProtection: true,
    enableCSRFProtection: true,
    enableRateLimiting: true,
    enableInputSanitization: true,
    enableOutputEncoding: true,
    maxRequestSize: 1024 * 1024, // 1MB
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
  },

  // Caching settings
  caching: {
    enableBrowserCache: true,
    enableServiceWorker: true,
    enableCDN: true,
    cacheMaxAge: 31536000, // 1 year
    cacheStaleWhileRevalidate: 86400, // 1 day
    cacheStaleIfError: 604800, // 1 week
  },

  // API settings
  api: {
    baseURL: import.meta.env.VITE_SUPABASE_URL,
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    enableRequestLogging: import.meta.env.DEV,
    enableResponseLogging: import.meta.env.DEV,
    enableErrorLogging: true,
    enablePerformanceLogging: true,
  },

  // Database settings
  database: {
    enableConnectionPooling: true,
    enableQueryOptimization: true,
    enableIndexing: true,
    enableCaching: true,
    maxConnections: 100,
    connectionTimeout: 30000,
    queryTimeout: 30000,
  },

  // Monitoring settings
  monitoring: {
    enableErrorTracking: true,
    enablePerformanceTracking: true,
    enableUserTracking: true,
    enableBusinessMetrics: true,
    enableRealUserMonitoring: true,
    enableSyntheticMonitoring: true,
    enableLogging: true,
    enableAlerting: true,
    enableReporting: true,
  },

  // Analytics settings
  analytics: {
    enableUserAnalytics: true,
    enableBusinessAnalytics: true,
    enablePerformanceAnalytics: true,
    enableErrorAnalytics: true,
    enableConversionTracking: true,
    enableFunnelAnalysis: true,
    enableCohortAnalysis: true,
    enableRetentionAnalysis: true,
  },

  // UI settings
  ui: {
    enableDarkMode: true,
    enableAnimations: true,
    enableTransitions: true,
    enableHoverEffects: true,
    enableFocusEffects: true,
    enableLoadingStates: true,
    enableErrorStates: true,
    enableEmptyStates: true,
    enableAccessibility: true,
    enableKeyboardNavigation: true,
    enableScreenReaderSupport: true,
  },

  // Development settings
  development: {
    enableHotReload: import.meta.env.DEV,
    enableSourceMaps: import.meta.env.DEV,
    enableDebugLogging: import.meta.env.DEV,
    enablePerformanceProfiling: import.meta.env.DEV,
    enableMemoryProfiling: import.meta.env.DEV,
    enableNetworkProfiling: import.meta.env.DEV,
    enableComponentProfiling: import.meta.env.DEV,
    enableStateProfiling: import.meta.env.DEV,
  },
};

// Environment-specific configurations
export const getEnvironmentConfig = () => {
  const env = import.meta.env.MODE || 'development';
  
  switch (env) {
    case 'production':
      return {
        ...PRODUCTION_CONFIG,
        features: {
          ...PRODUCTION_CONFIG.features,
          analytics: true,
          errorTracking: true,
          performanceMonitoring: true,
        },
      };
    
    case 'staging':
      return {
        ...PRODUCTION_CONFIG,
        features: {
          ...PRODUCTION_CONFIG.features,
          analytics: true,
          errorTracking: true,
          performanceMonitoring: true,
        },
      };
    
    case 'development':
      return {
        ...PRODUCTION_CONFIG,
        features: {
          ...PRODUCTION_CONFIG.features,
          analytics: false,
          errorTracking: false,
          performanceMonitoring: false,
        },
      };
    
    default:
      return PRODUCTION_CONFIG;
  }
};

// Feature flag utilities
export const isFeatureEnabled = (feature: keyof typeof PRODUCTION_CONFIG.features): boolean => {
  const config = getEnvironmentConfig();
  return config.features[feature];
};

export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};

export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
};

export const isStaging = (): boolean => {
  return import.meta.env.MODE === 'staging';
};

// Configuration validation
export const validateConfig = (): boolean => {
  try {
    const config = getEnvironmentConfig();
    
    // Validate required features
    const requiredFeatures = ['rateLimiting', 'inputValidation', 'securityHeaders'];
    for (const feature of requiredFeatures) {
      if (!config.features[feature as keyof typeof config.features]) {
        // // console.error(`Required feature ${feature} is disabled`);
        return false;
      }
    }
    
    // Validate security settings
    if (config.security.passwordMinLength < 8) {
      // // console.error('Password minimum length must be at least 8 characters');
      return false;
    }
    
    // Validate performance settings
    if (config.performance.maxConcurrentRequests < 1) {
      // // console.error('Maximum concurrent requests must be at least 1');
      return false;
    }
    
    return true;
  } catch (error) {
    // // console.error('Configuration validation failed:', error);
    return false;
  }
};

// Initialize configuration
if (typeof window !== 'undefined') {
  const isValid = validateConfig();
  if (!isValid) {
    // // console.error('Invalid configuration detected. Please check your environment settings.');
  }
}
