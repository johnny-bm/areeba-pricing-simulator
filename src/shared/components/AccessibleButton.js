import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
export const AccessibleButton = forwardRef(({ children, className, disabled, loading = false, loadingText = 'Loading...', 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedby, 'aria-expanded': ariaExpanded, 'aria-pressed': ariaPressed, 'aria-current': ariaCurrent, ...props }, ref) => {
    const isDisabled = disabled || loading;
    return (_jsx(Button, { ref: ref, className: cn(className), disabled: isDisabled, "aria-label": ariaLabel, "aria-describedby": ariaDescribedby, "aria-expanded": ariaExpanded, "aria-pressed": ariaPressed, "aria-current": ariaCurrent, "aria-disabled": isDisabled, ...props, children: loading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" }), loadingText] })) : (children) }));
});
AccessibleButton.displayName = 'AccessibleButton';
