import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
};
export const StandardDialog = ({ isOpen, onClose, title, description, children, primaryAction, secondaryActions = [], destructiveActions = [], size = 'md', hideCloseButton = false }) => {
    const dialogRef = useRef(null);
    // Handle ESC key press
    useEffect(() => {
        if (!isOpen)
            return;
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);
    // Handle outside click
    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };
    if (!isOpen)
        return null;
    const hasActions = primaryAction || secondaryActions.length > 0 || destructiveActions.length > 0;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", onClick: handleBackdropClick, children: _jsxs("div", { ref: dialogRef, className: `bg-background rounded-lg shadow-xl ${sizeClasses[size]} w-full flex flex-col max-h-[90vh] overflow-hidden`, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b shrink-0", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h2", { className: "text-xl font-semibold", children: title }), description && (_jsx("p", { className: "text-sm text-muted-foreground mt-1", children: description }))] }), !hideCloseButton && (_jsx("button", { onClick: onClose, className: "text-muted-foreground hover:text-foreground transition-colors p-2 ml-4", "aria-label": "Close", children: _jsx(X, { size: 20 }) }))] }), _jsx("div", { className: "flex-1 overflow-y-auto p-6", children: children }), hasActions && (_jsxs("div", { className: "flex items-center justify-between p-6 border-t shrink-0", children: [_jsx("div", { className: "flex gap-2", children: destructiveActions.length > 0 ? (destructiveActions.map((action, index) => (_jsxs(Button, { variant: "destructive", onClick: action.onClick, disabled: action.loading || action.disabled, className: "w-auto", children: [action.icon && _jsx("span", { className: "mr-2", children: action.icon }), action.loading ? 'Processing...' : action.label] }, index)))) : (_jsx("div", {})) }), _jsxs("div", { className: "flex gap-2", children: [secondaryActions.map((action, index) => (_jsxs(Button, { variant: action.variant || 'outline', onClick: action.onClick, disabled: action.loading || action.disabled, className: "w-auto", children: [action.icon && _jsx("span", { className: "mr-2", children: action.icon }), action.loading ? 'Processing...' : action.label] }, index))), primaryAction && (_jsxs(Button, { variant: primaryAction.variant || 'default', onClick: primaryAction.onClick, disabled: primaryAction.loading || primaryAction.disabled, className: "w-auto", children: [primaryAction.icon && _jsx("span", { className: "mr-2", children: primaryAction.icon }), primaryAction.loading ? 'Processing...' : primaryAction.label] }))] })] }))] }) }));
};
