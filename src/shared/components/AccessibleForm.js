import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from './ui/utils';
export const AccessibleForm = forwardRef(({ children, className, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, 'aria-describedby': ariaDescribedby, novalidate = false, ...props }, ref) => {
    return (_jsx("form", { ref: ref, className: cn(className), "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, "aria-describedby": ariaDescribedby, noValidate: novalidate, ...props, children: children }));
});
AccessibleForm.displayName = 'AccessibleForm';
export const AccessibleFieldset = forwardRef(({ children, className, legend, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, 'aria-describedby': ariaDescribedby, ...props }, ref) => {
    return (_jsxs("fieldset", { ref: ref, className: cn(className), "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, "aria-describedby": ariaDescribedby, ...props, children: [legend && (_jsx("legend", { className: "text-sm font-medium text-foreground mb-2", children: legend })), children] }));
});
AccessibleFieldset.displayName = 'AccessibleFieldset';
