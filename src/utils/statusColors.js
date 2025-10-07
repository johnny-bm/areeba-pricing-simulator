// Status color coding utility
// This provides consistent color schemes for status indicators throughout the application
// Define status mappings - add more as needed
const STATUS_MAPPINGS = {
    // Positive statuses (Green)
    'active': 'positive',
    'enabled': 'positive',
    'available': 'positive',
    'online': 'positive',
    'connected': 'positive',
    'success': 'positive',
    'complete': 'positive',
    'completed': 'positive',
    'approved': 'positive',
    'valid': 'positive',
    'healthy': 'positive',
    'ready': 'positive',
    'published': 'positive',
    'live': 'positive',
    // Negative statuses (Red)
    'inactive': 'negative',
    'disabled': 'negative',
    'unavailable': 'negative',
    'offline': 'negative',
    'disconnected': 'negative',
    'error': 'negative',
    'failed': 'negative',
    'rejected': 'negative',
    'invalid': 'negative',
    'unhealthy': 'negative',
    'blocked': 'negative',
    'suspended': 'negative',
    'terminated': 'negative',
    'deleted': 'negative',
    // Warning statuses (Orange)
    'pending': 'warning',
    'warning': 'warning',
    'partial': 'warning',
    'processing': 'warning',
    'in-progress': 'warning',
    'loading': 'warning',
    'updating': 'warning',
    'syncing': 'warning',
    'draft': 'warning',
    'scheduled': 'warning',
    'paused': 'warning',
    'limited': 'warning',
    'expiring': 'warning',
    'expired': 'warning',
    // Neutral statuses (Default)
    'unknown': 'neutral',
    'default': 'neutral',
    'none': 'neutral',
    'not-set': 'neutral',
    'optional': 'neutral',
    // Additional positive statuses
    'required': 'positive',
    'yes': 'positive',
    'on': 'positive',
    'true': 'positive',
    // Additional negative statuses
    'no': 'negative',
    'off': 'negative',
    'false': 'negative'
};
/**
 * Get status type based on status string
 */
export function getStatusType(status) {
    if (typeof status === 'boolean') {
        return status ? 'positive' : 'negative';
    }
    const normalizedStatus = status.toLowerCase().trim();
    return STATUS_MAPPINGS[normalizedStatus] || 'neutral';
}
/**
 * Get Tailwind classes for status indicators
 */
export function getStatusClasses(status, variant = 'badge') {
    const statusType = getStatusType(status);
    const colorSchemes = {
        positive: {
            badge: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-950/20 dark:text-green-300 dark:hover:bg-green-900/30',
            text: 'text-green-700 dark:text-green-300',
            background: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
        },
        negative: {
            badge: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/20 dark:text-red-300 dark:hover:bg-red-900/30',
            text: 'text-red-700 dark:text-red-300',
            background: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
        },
        warning: {
            badge: 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-300 dark:hover:bg-yellow-900/30',
            text: 'text-yellow-700 dark:text-yellow-300',
            background: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
        },
        neutral: {
            badge: 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-950/20 dark:text-gray-300 dark:hover:bg-gray-900/30',
            text: 'text-gray-700 dark:text-gray-300',
            background: 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800'
        }
    };
    return colorSchemes[statusType][variant];
}
/**
 * Get a status display label (capitalizes first letter)
 */
export function getStatusLabel(status) {
    if (typeof status === 'boolean') {
        return status ? 'Active' : 'Inactive';
    }
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}
/**
 * Get status badge classes with size variants
 */
export function getStatusBadgeClasses(status, size = 'md', className) {
    const statusClasses = getStatusClasses(status, 'badge');
    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-2.5 py-1.5',
        lg: 'text-base px-3 py-2'
    };
    const baseClasses = 'inline-flex items-center rounded-md font-medium transition-colors';
    return `${baseClasses} ${sizeClasses[size]} ${statusClasses} ${className || ''}`.trim();
}
