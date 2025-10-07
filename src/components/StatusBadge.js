import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
import { getStatusBadgeClasses, getStatusLabel } from '../utils/statusColors';
/**
 * StatusBadge Component
 *
 * Displays status indicators with consistent color coding:
 * - Green: active, enabled, available, etc. (positive states)
 * - Red: inactive, disabled, unavailable, etc. (negative states)
 * - Orange: pending, warning, partial, etc. (warning states)
 * - Gray: unknown, default, neutral states
 */
export function StatusBadge({ status, className, size = 'sm', children, ...props }) {
    const statusClasses = getStatusBadgeClasses(status, size, className);
    const statusLabel = getStatusLabel(status);
    return (_jsx("span", { className: statusClasses, title: `Status: ${statusLabel}`, ...props, children: children || statusLabel }));
}
/**
 * StatusText Component
 *
 * For status text without badge styling
 */
export function StatusText({ status, className, ...props }) {
    const statusLabel = getStatusLabel(status);
    return (_jsx("span", { className: cn('font-medium', className), title: `Status: ${statusLabel}`, ...props, children: statusLabel }));
}
