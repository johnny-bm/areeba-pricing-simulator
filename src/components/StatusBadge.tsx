import React from 'react';
import { cn } from '@/lib/utils';
import { getStatusBadgeClasses, getStatusLabel, type StatusBadgeProps } from '../utils/statusColors';

/**
 * StatusBadge Component
 * 
 * Displays status indicators with consistent color coding:
 * - Green: active, enabled, available, etc. (positive states)
 * - Red: inactive, disabled, unavailable, etc. (negative states)
 * - Orange: pending, warning, partial, etc. (warning states)
 * - Gray: unknown, default, neutral states
 */
export function StatusBadge({ 
  status, 
  className, 
  size = 'sm',
  children,
  ...props 
}: StatusBadgeProps & React.HTMLAttributes<HTMLSpanElement> & { children?: React.ReactNode }) {
  const statusClasses = getStatusBadgeClasses(status, size, className);
  const statusLabel = getStatusLabel(status);

  return (
    <span 
      className={statusClasses}
      title={`Status: ${statusLabel}`}
      {...props}
    >
      {children || statusLabel}
    </span>
  );
}

/**
 * StatusText Component
 * 
 * For status text without badge styling
 */
export function StatusText({ 
  status, 
  className,
  ...props 
}: { status: string | boolean; className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  const statusLabel = getStatusLabel(status);
  
  return (
    <span 
      className={cn('font-medium', className)}
      title={`Status: ${statusLabel}`}
      {...props}
    >
      {statusLabel}
    </span>
  );
}