// Pricing feature constants
export const PRICING_TYPES = {
    FIXED: 'fixed',
    TIERED: 'tiered',
};
export const DISCOUNT_TYPES = {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed',
};
export const DISCOUNT_APPLICATIONS = {
    NONE: 'none',
    BOTH: 'both',
    MONTHLY: 'monthly',
    ONETIME: 'onetime',
    TOTAL: 'total',
    UNIT: 'unit',
};
export const UNIT_TYPES = {
    ONETIME: 'onetime',
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
    PER_TRANSACTION: 'per_transaction',
    PER_CARD: 'per_card',
    PER_ACCOUNT: 'per_account',
};
export const CATEGORY_IDS = {
    SETUP: 'setup',
    HOSTING: 'hosting',
    PROCESSING: 'processing',
    SUPPORT: 'support',
    INTEGRATION: 'integration',
};
export const PRICING_ERRORS = {
    INVALID_QUANTITY: 'Quantity must be greater than 0',
    INVALID_PRICE: 'Price must be greater than or equal to 0',
    INVALID_DISCOUNT: 'Discount must be between 0 and 100%',
    TIER_OVERLAP: 'Tier ranges cannot overlap',
    MISSING_TIER: 'At least one pricing tier is required',
    INVALID_TIER_RANGE: 'Tier minimum must be less than maximum',
};
export const PRICING_VALIDATION = {
    MIN_QUANTITY: 0,
    MAX_QUANTITY: 999999,
    MIN_PRICE: 0,
    MAX_PRICE: 999999,
    MIN_DISCOUNT: 0,
    MAX_DISCOUNT: 100,
};
export const PRICING_SORT_OPTIONS = {
    NAME: { field: 'name', direction: 'asc' },
    PRICE: { field: 'price', direction: 'asc' },
    CATEGORY: { field: 'category', direction: 'asc' },
    CREATED: { field: 'createdAt', direction: 'desc' },
};
