// Status color coding utility
// This provides consistent color schemes for status indicators throughout the application

export type StatusType = 'positive' | 'negative' | 'warning' | 'neutral';

// Define status mappings - add more as needed
const STATUS_MAPPINGS: Record<string, StatusType> = {
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
export function getStatusType(status: string | boolean): StatusType {
  if (typeof status === 'boolean') {
    return status ? 'positive' : 'negative';
  }
  
  const normalizedStatus = status.toLowerCase().trim();
  return STATUS_MAPPINGS[normalizedStatus] || 'neutral';
}

/**
 * Get Tailwind classes for status indicators
 */
export function getStatusClasses(status: string | boolean, variant: 'badge' | 'text' | 'background' = 'badge'): string {
  const statusType = getStatusType(status);
  
  const colorSchemes = {
    positive: {
      badge: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900',
      text: 'text-green-700 dark:text-green-300',
      background: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
    },
    negative: {
      badge: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900',
      text: 'text-red-700 dark:text-red-300',
      background: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
    },
    warning: {
      badge: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800 dark:hover:bg-orange-900',
      text: 'text-orange-700 dark:text-orange-300',
      background: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'
    },
    neutral: {
      badge: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-900',
      text: 'text-gray-700 dark:text-gray-300',
      background: 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800'
    }
  };
  
  return colorSchemes[statusType][variant];
}

/**
 * Get a status display label (capitalizes first letter)
 */
export function getStatusLabel(status: string | boolean): string {
  if (typeof status === 'boolean') {
    return status ? 'Active' : 'Inactive';
  }
  
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

/**
 * Status Badge component props
 */
export interface StatusBadgeProps {
  status: string | boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Get status badge classes with size variants
 */
export function getStatusBadgeClasses(
  status: string | boolean, 
  size: 'sm' | 'md' | 'lg' = 'md',
  className?: string
): string {
  const statusClasses = getStatusClasses(status, 'badge');
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5',
    lg: 'text-base px-3 py-2'
  };
  
  const baseClasses = 'inline-flex items-center rounded-md font-medium transition-colors';
  
  return `${baseClasses} ${sizeClasses[size]} ${statusClasses} ${className || ''}`.trim();
}