/**
 * Utility functions for classifying pricing units
 * Helps determine billing frequency and calculation methods
 */

// Units that are calculated once (one-time charges)
export const ONE_TIME_UNITS = [
  'Per Project',
  'Per Setup'
] as const;

// Units that are calculated monthly (recurring charges)
export const MONTHLY_RECURRING_UNITS = [
  'Per User'
] as const;

// Units that are calculated per transaction or token
export const TRANSACTION_BASED_UNITS = [
  'Per Transaction'
] as const;

// Units that are calculated per event or activity
export const EVENT_ACTIVITY_BASED_UNITS = [
  'Per Card',
  'Per Item'
] as const;

// All available units
export const ALL_UNITS = [
  ...ONE_TIME_UNITS,
  ...MONTHLY_RECURRING_UNITS,
  ...TRANSACTION_BASED_UNITS,
  ...EVENT_ACTIVITY_BASED_UNITS
] as const;

export type PricingUnit = typeof ALL_UNITS[number];

/**
 * Determines if a unit represents a one-time charge
 */
export function isOneTimeUnit(unit: string): boolean {
  return ONE_TIME_UNITS.includes(unit as any);
}

/**
 * Determines if a unit represents a monthly recurring charge
 */
export function isMonthlyRecurringUnit(unit: string): boolean {
  return MONTHLY_RECURRING_UNITS.includes(unit as any);
}

/**
 * Determines if a unit represents a transaction-based charge
 */
export function isTransactionBasedUnit(unit: string): boolean {
  return TRANSACTION_BASED_UNITS.includes(unit as any);
}

/**
 * Determines if a unit represents an event/activity-based charge
 */
export function isEventActivityBasedUnit(unit: string): boolean {
  return EVENT_ACTIVITY_BASED_UNITS.includes(unit as any);
}

/**
 * Gets the category of a pricing unit
 */
export function getUnitCategory(unit: string): 'one-time' | 'monthly-recurring' | 'transaction-based' | 'event-activity-based' | 'unknown' {
  if (isOneTimeUnit(unit)) return 'one-time';
  if (isMonthlyRecurringUnit(unit)) return 'monthly-recurring';
  if (isTransactionBasedUnit(unit)) return 'transaction-based';
  if (isEventActivityBasedUnit(unit)) return 'event-activity-based';
  return 'unknown';
}

/**
 * Gets a human-readable description of the unit category
 */
export function getUnitCategoryDescription(unit: string): string {
  const category = getUnitCategory(unit);
  
  switch (category) {
    case 'one-time':
      return 'Calculated once (setup fees, configurations, changes)';
    case 'monthly-recurring':
      return 'Calculated per month (service fees, hosting, user access)';
    case 'transaction-based':
      return 'Calculated per transaction or token (processing, API calls, SMS)';
    case 'event-activity-based':
      return 'Calculated per event (card creation, deliveries, files, cases)';
    default:
      return 'Unknown billing frequency';
  }
}