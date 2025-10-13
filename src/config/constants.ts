// Application-wide constants
export const APP_CONFIG = {
  name: 'areeba Pricing Simulator',
  version: '2.0.0',
  api: {
    timeout: 30000,
    retries: 3,
  },
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  pricing: {
    maxItems: 50,
    maxQuantity: 10000,
    supportedCurrencies: ['USD', 'EUR', 'GBP'] as const,
  },
} as const;
