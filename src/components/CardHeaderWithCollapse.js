import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
export function CardHeaderWithCollapse({ title, description, isCollapsed, onToggle, showCollapseButton = true, variant = 'main' }) {
    // For sub-cards, the entire header is clickable with just a chevron icon
    if (variant === 'sub') {
        return (_jsx(CardHeader, { className: "border-b cursor-pointer hover:bg-muted/50 transition-colors p-[24px]", onClick: onToggle, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: title }), _jsx(CardDescription, { className: "text-[12px]", children: description })] }), _jsx(ChevronDown, { className: `h-4 w-4 text-muted-foreground transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}` })] }) }));
    }
    // For main cards, only the button is clickable
    return (_jsx(CardHeader, { className: "border-b p-[24px]", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: title }), _jsx(CardDescription, { className: "text-[12px]", children: description })] }), showCollapseButton && (_jsx(Button, { variant: "outline", size: "sm", onClick: onToggle, className: "text-xs", children: isCollapsed ? (_jsxs(_Fragment, { children: [_jsx(ChevronDown, { className: "h-3 w-3 mr-1" }), "Expand All"] })) : (_jsxs(_Fragment, { children: [_jsx(ChevronUp, { className: "h-3 w-3 mr-1" }), "Collapse All"] })) }))] }) }));
}
