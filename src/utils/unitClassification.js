/**
 * Utility functions for classifying pricing units
 * Helps determine billing frequency and calculation methods
 */
// Units that are calculated once (one-time charges)
export const ONE_TIME_UNITS = [
    'one-time',
    'per change'
];
// Units that are calculated monthly (recurring charges)
export const MONTHLY_RECURRING_UNITS = [
    'per month',
    'per card/month',
    'per user/month'
];
// Units that are calculated per transaction or token
export const TRANSACTION_BASED_UNITS = [
    'per transaction',
    'per token'
];
// Units that are calculated per event or activity
export const EVENT_ACTIVITY_BASED_UNITS = [
    'per card',
    'per delivery',
    'per file',
    'per case'
];
// All available units
export const ALL_UNITS = [
    ...ONE_TIME_UNITS,
    ...MONTHLY_RECURRING_UNITS,
    ...TRANSACTION_BASED_UNITS,
    ...EVENT_ACTIVITY_BASED_UNITS
];
/**
 * Determines if a unit represents a one-time charge
 */
export function isOneTimeUnit(unit) {
    return ONE_TIME_UNITS.includes(unit);
}
/**
 * Determines if a unit represents a monthly recurring charge
 */
export function isMonthlyRecurringUnit(unit) {
    return MONTHLY_RECURRING_UNITS.includes(unit);
}
/**
 * Determines if a unit represents a transaction-based charge
 */
export function isTransactionBasedUnit(unit) {
    return TRANSACTION_BASED_UNITS.includes(unit);
}
/**
 * Determines if a unit represents an event/activity-based charge
 */
export function isEventActivityBasedUnit(unit) {
    return EVENT_ACTIVITY_BASED_UNITS.includes(unit);
}
/**
 * Gets the category of a pricing unit
 */
export function getUnitCategory(unit) {
    if (isOneTimeUnit(unit))
        return 'one-time';
    if (isMonthlyRecurringUnit(unit))
        return 'monthly-recurring';
    if (isTransactionBasedUnit(unit))
        return 'transaction-based';
    if (isEventActivityBasedUnit(unit))
        return 'event-activity-based';
    return 'unknown';
}
/**
 * Gets a human-readable description of the unit category
 */
export function getUnitCategoryDescription(unit) {
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
