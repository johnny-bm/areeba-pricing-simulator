import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { NumberInput } from "./NumberInput";
import { formatPrice } from "../utils/formatters";
import { isOneTimeUnit } from "../utils/unitClassification";
import { CardHeaderWithCollapse } from "./CardHeaderWithCollapse";
import { Save, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
export function FeeSummary({ selectedItems, categories, globalDiscount, globalDiscountType, globalDiscountApplication, onGlobalDiscountChange, onGlobalDiscountTypeChange, onGlobalDiscountApplicationChange, clientConfig, onSubmit, isSubmitting = false, isGuestMode = false, guestContactSubmitted = false, onShowGuestContactForm }) {
    const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(false);
    const [showDiscountDetails, setShowDiscountDetails] = useState(false);
    const calculateRowTotal = (item) => {
        if (item.isFree)
            return 0;
        const discountApplication = item.discountApplication || 'total';
        if (discountApplication === 'unit') {
            let effectiveUnitPrice = item.unitPrice;
            if (item.discountType === 'percentage') {
                effectiveUnitPrice = item.unitPrice * (1 - item.discount / 100);
            }
            else {
                effectiveUnitPrice = item.unitPrice - item.discount;
            }
            effectiveUnitPrice = Math.max(0, effectiveUnitPrice);
            return effectiveUnitPrice * item.quantity;
        }
        else {
            const subtotal = item.quantity * item.unitPrice;
            let discountAmount = 0;
            if (item.discountType === 'percentage') {
                discountAmount = subtotal * (item.discount / 100);
            }
            else {
                discountAmount = item.discount * item.quantity;
            }
            return Math.max(0, subtotal - discountAmount);
        }
    };
    const oneTimeItems = selectedItems.filter(item => item.item.category === 'setup' || isOneTimeUnit(item.item.unit));
    const monthlyItems = selectedItems.filter(item => item.item.category !== 'setup' && !isOneTimeUnit(item.item.unit));
    const oneTimeSubtotal = oneTimeItems.reduce((sum, item) => sum + calculateRowTotal(item), 0);
    const monthlySubtotal = monthlyItems.reduce((sum, item) => sum + calculateRowTotal(item), 0);
    let oneTimeFinal, monthlyFinal;
    if (globalDiscountApplication === 'none') {
        oneTimeFinal = oneTimeSubtotal;
        monthlyFinal = monthlySubtotal;
    }
    else if (globalDiscountApplication === 'both') {
        if (globalDiscountType === 'percentage') {
            oneTimeFinal = Math.max(0, oneTimeSubtotal - (oneTimeSubtotal * (globalDiscount / 100)));
            monthlyFinal = Math.max(0, monthlySubtotal - (monthlySubtotal * (globalDiscount / 100)));
        }
        else {
            oneTimeFinal = Math.max(0, oneTimeSubtotal - globalDiscount);
            monthlyFinal = Math.max(0, monthlySubtotal - globalDiscount);
        }
    }
    else if (globalDiscountApplication === 'monthly') {
        oneTimeFinal = oneTimeSubtotal;
        if (globalDiscountType === 'percentage') {
            monthlyFinal = Math.max(0, monthlySubtotal - (monthlySubtotal * (globalDiscount / 100)));
        }
        else {
            monthlyFinal = Math.max(0, monthlySubtotal - globalDiscount);
        }
    }
    else if (globalDiscountApplication === 'onetime') {
        monthlyFinal = monthlySubtotal;
        if (globalDiscountType === 'percentage') {
            oneTimeFinal = Math.max(0, oneTimeSubtotal - (oneTimeSubtotal * (globalDiscount / 100)));
        }
        else {
            oneTimeFinal = Math.max(0, oneTimeSubtotal - globalDiscount);
        }
    }
    else {
        oneTimeFinal = oneTimeSubtotal;
        monthlyFinal = monthlySubtotal;
    }
    const yearlyFinal = monthlyFinal * 12;
    const rowDiscountTotal = selectedItems.reduce((sum, item) => {
        if (item.isFree)
            return sum;
        const beforeDiscount = item.quantity * item.unitPrice;
        const afterDiscount = calculateRowTotal(item);
        return sum + (beforeDiscount - afterDiscount);
    }, 0);
    const totalSubtotal = oneTimeSubtotal + monthlySubtotal;
    let globalDiscountAmount = 0;
    if (globalDiscount > 0 && globalDiscountApplication !== 'none') {
        const oneTimeGlobalDiscount = oneTimeSubtotal - oneTimeFinal;
        const monthlyGlobalDiscount = monthlySubtotal - monthlyFinal;
        globalDiscountAmount = oneTimeGlobalDiscount + monthlyGlobalDiscount;
    }
    const totalDiscountAmount = rowDiscountTotal + globalDiscountAmount;
    const groupedItems = selectedItems.reduce((acc, item) => {
        if (!acc[item.item.category]) {
            acc[item.item.category] = [];
        }
        acc[item.item.category].push(item);
        return acc;
    }, {});
    const sortedCategories = categories
        .filter(cat => groupedItems[cat.id])
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    const getCategoryTotal = (categoryId) => {
        const items = groupedItems[categoryId] || [];
        return items.reduce((sum, item) => sum + calculateRowTotal(item), 0);
    };
    // Calculate savings
    const totalOriginalPrice = selectedItems.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
    }, 0);
    const totalFinalPrice = oneTimeFinal + monthlyFinal;
    const totalSavings = totalOriginalPrice - totalFinalPrice;
    const freeSavings = selectedItems.reduce((sum, item) => {
        return sum + (item.isFree ? (item.quantity * item.unitPrice) : 0);
    }, 0);
    const discountSavings = totalSavings - freeSavings;
    const savingsRate = totalOriginalPrice > 0 ? (totalSavings / totalOriginalPrice) * 100 : 0;
    return (_jsxs(Card, { children: [_jsx(CardHeaderWithCollapse, { title: "Fee Summary", description: "Total costs and pricing breakdown", isCollapsed: false, onToggle: () => { }, showCollapseButton: false }), _jsxs(CardContent, { className: "space-y-3", children: [!isGuestMode && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-sm font-medium", children: "Global Discount" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Select, { value: globalDiscountApplication, onValueChange: onGlobalDiscountApplicationChange, children: [_jsx(SelectTrigger, { className: "h-9 flex-1", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "none", children: "No Discount" }), _jsx(SelectItem, { value: "both", children: "Both" }), _jsx(SelectItem, { value: "monthly", children: "Monthly Only" }), _jsx(SelectItem, { value: "onetime", children: "One-time Only" })] })] }), _jsx(NumberInput, { value: globalDiscount, onChange: onGlobalDiscountChange, min: 0, max: globalDiscountType === 'percentage' ? 100 : undefined, step: globalDiscountType === 'percentage' ? 0.1 : 0.01, placeholder: "0", className: "h-9 w-24", allowDecimals: true, disabled: globalDiscountApplication === 'none' }), _jsxs(Select, { value: globalDiscountType, onValueChange: onGlobalDiscountTypeChange, disabled: globalDiscountApplication === 'none', children: [_jsx(SelectTrigger, { className: "h-9 w-16", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "percentage", children: "%" }), _jsx(SelectItem, { value: "fixed", children: "$" })] })] })] })] }), _jsx(Separator, {})] })), _jsxs("div", { className: isGuestMode && !guestContactSubmitted ? 'relative' : '', children: [_jsxs(Collapsible, { open: showCategoryBreakdown, onOpenChange: setShowCategoryBreakdown, children: [_jsx(CollapsibleTrigger, { className: "w-full", children: _jsxs("div", { className: "flex items-center justify-between py-2 hover:bg-muted/50 transition-colors rounded px-2", children: [_jsx("h3", { className: "text-sm font-medium", children: "Cost by Category" }), showCategoryBreakdown ? (_jsx(ChevronUp, { className: "h-4 w-4 text-muted-foreground" })) : (_jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground" }))] }) }), _jsx(CollapsibleContent, { children: _jsx("div", { className: "space-y-1 pb-2", children: sortedCategories.map(category => {
                                                const items = groupedItems[category.id];
                                                if (!items || items.length === 0)
                                                    return null;
                                                const categoryTotal = getCategoryTotal(category.id);
                                                const freeItemsCount = items.filter(item => item.isFree).length;
                                                return (_jsxs("div", { className: "flex justify-between items-center text-sm px-2", children: [_jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [_jsx("div", { className: "w-2 h-2 rounded-full flex-shrink-0", style: { backgroundColor: category.color } }), _jsxs("span", { className: "text-xs", children: [category.name, " (", items.length, !isGuestMode && freeItemsCount > 0 && _jsxs("span", { className: "text-green-600 ml-1", children: ["\u00B7 ", freeItemsCount, " free"] }), ")"] })] }), _jsx("span", { className: `text-xs ${!isGuestMode && categoryTotal === 0 && freeItemsCount > 0 ? "text-green-600" : ""}`, children: formatPrice(categoryTotal) })] }, category.id));
                                            }) }) })] }), _jsx(Separator, {}), !isGuestMode && totalDiscountAmount > 0 && (_jsxs(_Fragment, { children: [_jsxs(Collapsible, { open: showDiscountDetails, onOpenChange: setShowDiscountDetails, children: [_jsx(CollapsibleTrigger, { className: "w-full", children: _jsxs("div", { className: "flex items-center justify-between py-2 hover:bg-muted/50 transition-colors rounded px-2", children: [_jsx("h3", { className: "text-sm font-medium", children: "Discount Details" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-sm text-destructive", children: ["-", formatPrice(totalDiscountAmount)] }), showDiscountDetails ? (_jsx(ChevronUp, { className: "h-4 w-4 text-muted-foreground" })) : (_jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground" }))] })] }) }), _jsx(CollapsibleContent, { children: _jsxs("div", { className: "space-y-2 pb-2 px-2", children: [rowDiscountTotal > 0 && (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground text-xs", children: "Service Discounts" }), _jsxs("span", { className: "text-destructive text-xs", children: ["-", formatPrice(rowDiscountTotal)] })] })), globalDiscount > 0 && globalDiscountApplication !== 'none' && (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { className: "text-muted-foreground text-xs", children: ["Global (", globalDiscountType === 'percentage' ? `${globalDiscount}%` : formatPrice(globalDiscount), ")"] }), _jsxs("span", { className: "text-destructive text-xs", children: ["-", formatPrice(globalDiscountAmount)] })] }))] }) })] }), _jsx(Separator, {})] })), !isGuestMode && totalSavings > 0 && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800", children: [_jsxs("span", { className: "text-sm text-green-700 dark:text-green-300", children: ["\uD83D\uDCB0 Total Savings (", savingsRate.toFixed(1), "% off)"] }), _jsx("span", { className: "text-sm font-medium text-green-700 dark:text-green-300", children: formatPrice(totalSavings) })] }), _jsx(Separator, {})] })), _jsxs("div", { className: "space-y-2", children: [(oneTimeFinal > 0 || oneTimeItems.length > 0) && (_jsxs("div", { className: "flex justify-between items-center p-2 bg-primary/5 rounded", children: [_jsx("span", { className: "text-sm font-medium", children: "One-time Total" }), _jsxs("span", { className: `text-sm font-medium ${!isGuestMode && oneTimeFinal === 0 ? 'text-green-600' : ''}`, children: [formatPrice(oneTimeFinal), !isGuestMode && oneTimeFinal === 0 && oneTimeItems.some(item => item.isFree) &&
                                                        _jsx("span", { className: "text-xs ml-1", children: "(free)" })] })] })), (monthlyFinal > 0 || monthlyItems.length > 0) && (_jsxs("div", { className: "flex justify-between items-center p-2 bg-primary/5 rounded", children: [_jsx("span", { className: "text-sm font-medium", children: "Monthly Total" }), _jsxs("span", { className: `text-sm font-medium ${!isGuestMode && monthlyFinal === 0 ? 'text-green-600' : ''}`, children: [formatPrice(monthlyFinal), !isGuestMode && monthlyFinal === 0 && monthlyItems.some(item => item.isFree) &&
                                                        _jsx("span", { className: "text-xs ml-1", children: "(free)" })] })] })), (monthlyFinal > 0 || monthlyItems.length > 0) && (_jsxs("div", { className: "flex justify-between items-center p-2 bg-primary/10 rounded", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-sm font-medium", children: "Yearly Total" }), _jsx("span", { className: "text-xs text-muted-foreground", children: "Monthly \u00D7 12" })] }), _jsxs("span", { className: `font-bold ${!isGuestMode && yearlyFinal === 0 ? 'text-green-600' : 'text-primary'}`, children: [formatPrice(yearlyFinal), !isGuestMode && yearlyFinal === 0 && monthlyItems.some(item => item.isFree) &&
                                                        _jsx("span", { className: "text-xs ml-1", children: "(free)" })] })] }))] }), isGuestMode && !guestContactSubmitted && (_jsx("div", { className: "absolute inset-0 backdrop-blur-md bg-white/30 dark:bg-black/30 flex items-center justify-center rounded-lg", children: _jsx(Button, { size: "lg", onClick: onShowGuestContactForm, className: "shadow-lg", children: "View Full Pricing Details" }) }))] }), _jsx(Card, { className: "p-2 bg-accent", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium", children: "Total Project Cost" }), _jsx("div", { className: "text-xs text-muted-foreground", children: "One-time + First year" })] }), _jsxs("span", { className: `font-bold ${!isGuestMode && oneTimeFinal + yearlyFinal === 0 ? 'text-green-600' : ''}`, children: [formatPrice(oneTimeFinal + yearlyFinal), !isGuestMode && oneTimeFinal + yearlyFinal === 0 && selectedItems.some(item => item.isFree) &&
                                            _jsx("span", { className: "text-xs ml-1", children: "(free)" })] })] }) }), selectedItems.length > 0 && onSubmit && (_jsxs(_Fragment, { children: [_jsx(Separator, {}), _jsxs(Button, { onClick: onSubmit, disabled: isSubmitting ||
                                    !clientConfig.clientName ||
                                    !clientConfig.projectName ||
                                    (!isGuestMode && !clientConfig.preparedBy), className: "w-full", size: "lg", children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), isSubmitting ? 'Saving Scenario...' : 'Submit & Generate Report'] }), (!clientConfig.clientName || !clientConfig.projectName || (!isGuestMode && !clientConfig.preparedBy)) && (_jsx("p", { className: "text-xs text-orange-600 dark:text-orange-400 text-center", children: isGuestMode
                                    ? 'Please fill in Client Name and Project Name fields to submit'
                                    : 'Please fill in Client Name, Project Name, and Prepared By fields to submit' }))] })), _jsxs("div", { className: "p-2 bg-muted/30 rounded text-xs text-muted-foreground", children: [_jsx("p", { className: "font-medium mb-0.5", children: "Disclaimer" }), _jsx("p", { className: "text-[10px] leading-relaxed", children: "Pricing is for information only and may change. Final pricing depends on requirements and contracts. Not a binding offer. Contact your areeba representative for confirmed pricing." })] })] })] }));
}
