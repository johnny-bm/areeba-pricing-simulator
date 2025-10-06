import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * ScenarioBuilder - Card-Based Layout
 * Version: 2.1.0
 * Last Updated: 2025-09-30
 * This component uses cards for a cleaner, more visual layout
 */
import { useState, useMemo } from 'react';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { X, Search, ChevronDown, ChevronUp } from "lucide-react";
import { NumberInput } from "./NumberInput";
import { formatPrice } from "../utils/formatters";
import { CardHeaderWithCollapse } from "./CardHeaderWithCollapse";
import { StandardDialog } from "./StandardDialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger, } from "./ui/collapsible";
import { getEffectiveUnitPrice, getConfigBasedQuantity } from "../utils/tieredPricing";
export function ScenarioBuilder({ selectedItems, onUpdateItem, onRemoveItem, clientConfig, categories, isGuestMode = false }) {
    const [editingItem, setEditingItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [expandedCards, setExpandedCards] = useState({});
    const [allCardsExpanded, setAllCardsExpanded] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [allCategoriesExpanded, setAllCategoriesExpanded] = useState(true);
    // Helper function to get the current calculated quantity for auto-synced items
    const getCurrentQuantity = (selectedItem) => {
        const quantityFields = selectedItem.item.quantitySourceFields || [];
        if (quantityFields.length > 0) {
            const calculatedQuantity = getConfigBasedQuantity(selectedItem.item, clientConfig);
            return calculatedQuantity;
        }
        return selectedItem.quantity;
    };
    const calculateRowTotal = (item) => {
        if (item.isFree)
            return 0;
        const currentQuantity = getCurrentQuantity(item);
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
            return effectiveUnitPrice * currentQuantity;
        }
        else {
            const subtotal = currentQuantity * item.unitPrice;
            let discountAmount = 0;
            if (item.discountType === 'percentage') {
                discountAmount = subtotal * (item.discount / 100);
            }
            else {
                discountAmount = item.discount * currentQuantity;
            }
            return Math.max(0, subtotal - discountAmount);
        }
    };
    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category?.name || categoryId;
    };
    const handleEditItem = (item) => {
        setEditingItem(item);
    };
    const handleCloseEditor = () => {
        setEditingItem(null);
    };
    const handleUpdateEditingItem = (updates) => {
        if (editingItem) {
            onUpdateItem(editingItem.id, updates);
            // Update local editing state
            setEditingItem({ ...editingItem, ...updates });
        }
    };
    const handleQuickRemove = (item, e) => {
        e.stopPropagation();
        onRemoveItem(item.id);
    };
    const toggleCardExpanded = (itemId, e) => {
        e.stopPropagation();
        setExpandedCards(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };
    const handleToggleAllCards = () => {
        const newExpandedValue = !allCardsExpanded;
        // Expand/collapse all categories
        const newCategoryState = {};
        selectedCategories.forEach(cat => {
            newCategoryState[cat.id] = newExpandedValue;
        });
        setExpandedCategories(newCategoryState);
        setAllCategoriesExpanded(newExpandedValue);
        // Expand/collapse all service cards
        const newCardState = {};
        selectedItems.forEach(item => {
            newCardState[item.id] = newExpandedValue;
        });
        setExpandedCards(newCardState);
        setAllCardsExpanded(newExpandedValue);
    };
    const handleToggleAllCategories = () => {
        const newExpandedValue = !allCategoriesExpanded;
        // Expand/collapse all categories
        const newCategoryState = {};
        categories.forEach(cat => {
            newCategoryState[cat.id] = newExpandedValue;
        });
        setExpandedCategories(newCategoryState);
        setAllCategoriesExpanded(newExpandedValue);
        // Expand/collapse all service cards
        const newCardState = {};
        selectedItems.forEach(item => {
            newCardState[item.id] = newExpandedValue;
        });
        setExpandedCards(newCardState);
        setAllCardsExpanded(newExpandedValue);
    };
    const toggleCategoryExpanded = (categoryId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };
    // Filter items based on search and category
    const filteredItems = useMemo(() => {
        let result = selectedItems;
        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item => {
                return (item.item.name.toLowerCase().includes(query) ||
                    item.item.description.toLowerCase().includes(query));
            });
        }
        // Apply category filter
        if (filterCategory !== 'all') {
            result = result.filter(item => item.item.category === filterCategory);
        }
        return result;
    }, [selectedItems, searchQuery, filterCategory]);
    // Get unique categories from selected items
    const selectedCategories = useMemo(() => {
        const categoryIds = new Set(selectedItems.map(item => item.item.category));
        return categories
            .filter(cat => categoryIds.has(cat.id))
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [selectedItems, categories]);
    // Group filtered items by category
    const itemsByCategory = useMemo(() => {
        const grouped = new Map();
        filteredItems.forEach(item => {
            const categoryId = item.item.category;
            if (!grouped.has(categoryId)) {
                grouped.set(categoryId, []);
            }
            grouped.get(categoryId).push(item);
        });
        return grouped;
    }, [filteredItems]);
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs(Card, { children: [_jsx(CardHeaderWithCollapse, { title: "Selected Services", description: `${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''} selected`, isCollapsed: !allCardsExpanded, onToggle: handleToggleAllCards, showCollapseButton: selectedItems.length > 0 }), _jsx(CardContent, { className: "space-y-4", children: selectedItems.length > 0 ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex gap-2", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search selected services...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-9" })] }), selectedCategories.length > 1 && (_jsxs(Select, { value: filterCategory, onValueChange: setFilterCategory, children: [_jsx(SelectTrigger, { className: "w-[180px]", children: _jsx(SelectValue, { placeholder: "All categories" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All categories" }), selectedCategories.map(cat => (_jsx(SelectItem, { value: cat.id, children: cat.name }, cat.id)))] })] }))] }), _jsx("div", { className: "space-y-3", children: categories
                                        .filter(category => itemsByCategory.has(category.id))
                                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                                        .map((category) => {
                                        const categoryItems = itemsByCategory.get(category.id) || [];
                                        const isCategoryExpanded = expandedCategories[category.id] ?? allCategoriesExpanded;
                                        return (_jsx(Collapsible, { open: isCategoryExpanded, onOpenChange: () => toggleCategoryExpanded(category.id), children: _jsxs("div", { className: "border rounded-lg", children: [_jsx(CollapsibleTrigger, { asChild: true, children: _jsxs("div", { className: "flex items-center justify-between p-3 cursor-pointer hover:bg-accent/50 transition-colors rounded-t-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(ChevronDown, { className: `h-5 w-5 transition-transform ${isCategoryExpanded ? 'transform rotate-0' : 'transform -rotate-90'}` }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium", children: category.name }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [categoryItems.length, " service", categoryItems.length !== 1 ? 's' : ''] })] })] }), _jsx(Badge, { variant: "secondary", children: categoryItems.length })] }) }), _jsx(CollapsibleContent, { children: _jsx("div", { className: "p-3 space-y-2 border-t", children: categoryItems.map((selectedItem) => {
                                                                const currentQuantity = getCurrentQuantity(selectedItem);
                                                                const total = calculateRowTotal(selectedItem);
                                                                const hasAutoQuantity = (selectedItem.item.quantitySourceFields || []).length > 0;
                                                                const isExpanded = expandedCards[selectedItem.id] ?? allCardsExpanded;
                                                                return (_jsx(Card, { className: "transition-all hover:shadow-md", children: _jsxs(CardContent, { className: "p-[12px]", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "font-medium truncate cursor-pointer mb-1 text-[14px]", onClick: () => handleEditItem(selectedItem), title: selectedItem.item.name, children: selectedItem.item.name }), _jsx("div", { className: "text-sm", children: selectedItem.isFree ? (_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "line-through text-muted-foreground", children: formatPrice(currentQuantity * selectedItem.unitPrice) }), _jsx("span", { className: "text-green-600 font-medium", children: formatPrice(0) })] })) : selectedItem.discount > 0 ? (_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "line-through text-muted-foreground text-[12px]", children: formatPrice(currentQuantity * selectedItem.unitPrice) }), _jsx("span", { className: "font-medium text-foreground text-[12px] text-[13px]", children: formatPrice(total) })] })) : (_jsx("span", { className: "font-medium text-muted-foreground", children: formatPrice(total) })) })] }), _jsx(Button, { size: "sm", variant: "ghost", onClick: (e) => toggleCardExpanded(selectedItem.id, e), className: "h-8 w-8 p-0 flex-shrink-0", title: isExpanded ? "Collapse" : "Expand", children: isExpanded ? (_jsx(ChevronUp, { className: "h-4 w-4" })) : (_jsx(ChevronDown, { className: "h-4 w-4" })) })] }), isExpanded && (_jsxs("div", { className: "mt-3 border-t space-y-3 pt-3", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Quantity Breakdown" }), _jsxs("span", { className: "font-medium", children: [currentQuantity.toLocaleString(), " \u00D7 ", formatPrice(selectedItem.unitPrice)] })] }), _jsxs("div", { className: "flex items-center gap-1 flex-wrap", children: [!isGuestMode && selectedItem.isFree && (_jsx(Badge, { variant: "default", className: "bg-green-600 text-xs", children: "FREE" })), selectedItem.item.pricingType === 'tiered' && (_jsx(Badge, { variant: "secondary", className: "text-xs", children: "Tiered Pricing" })), hasAutoQuantity && (_jsx(Badge, { variant: "outline", className: "text-xs", children: "Auto Quantity" })), !isGuestMode && selectedItem.discount > 0 && !selectedItem.isFree && (_jsxs(Badge, { variant: "secondary", className: "text-xs", children: ["Discount: -", selectedItem.discount, selectedItem.discountType === 'percentage' ? '%' : ' USD'] }))] }), (selectedItem.isFree || selectedItem.discount > 0) && (_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Total" }), _jsx("div", { className: "flex items-center gap-2", children: selectedItem.isFree ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "line-through text-muted-foreground", children: formatPrice(currentQuantity * selectedItem.unitPrice) }), _jsx("span", { className: "font-medium text-green-600", children: formatPrice(0) })] })) : selectedItem.discount > 0 ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "line-through text-muted-foreground", children: formatPrice(currentQuantity * selectedItem.unitPrice) }), _jsx("span", { className: "font-medium", children: formatPrice(total) })] })) : null })] })), _jsxs("div", { className: "flex items-center gap-4 pt-2 border-t text-sm", children: [_jsx("button", { onClick: (e) => {
                                                                                                    e.stopPropagation();
                                                                                                    handleEditItem(selectedItem);
                                                                                                }, className: "text-primary hover:underline text-[14px] no-underline", children: "Edit" }), _jsx("button", { onClick: (e) => handleQuickRemove(selectedItem, e), className: "text-destructive hover:underline", children: "Remove" })] })] }))] }) }, selectedItem.id));
                                                            }) }) })] }) }, category.id));
                                    }) }), filteredItems.length === 0 && selectedItems.length > 0 && (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx("p", { className: "mb-2", children: "No services match your filter" }), _jsx("p", { className: "text-sm", children: "Try adjusting your search or category filter" })] }))] })) : (
                        /* Empty State */
                        _jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx("p", { className: "mb-2", children: "No services selected" }), _jsx("p", { className: "text-sm", children: "Add services from the library to start building your scenario" })] })) })] }), _jsx(StandardDialog, { isOpen: !!editingItem, onClose: handleCloseEditor, title: "Edit Service", description: "Configure pricing and discounts for this service", size: "lg", primaryAction: {
                    label: 'Done',
                    onClick: handleCloseEditor,
                    variant: 'default'
                }, destructiveActions: editingItem ? [{
                        label: 'Remove',
                        onClick: () => {
                            onRemoveItem(editingItem.id);
                            handleCloseEditor();
                        },
                        variant: 'destructive',
                        icon: _jsx(X, { className: "h-4 w-4" })
                    }] : [], children: editingItem && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-3 bg-muted rounded-lg", children: [_jsx("h4", { className: "font-medium mb-1", children: editingItem.item.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: editingItem.item.description })] }), _jsxs("div", { children: [_jsxs(Label, { htmlFor: "edit-quantity", children: ["Quantity", ((editingItem.item.quantitySourceFields || []).length > 0) && (_jsx("span", { className: "ml-1 text-xs text-blue-600", title: "Quantity automatically calculated from configuration", children: "\uD83D\uDD04 Auto" }))] }), ((editingItem.item.quantitySourceFields || []).length > 0) ? (_jsxs("div", { className: "h-10 px-3 py-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md cursor-not-allowed flex items-center justify-between", children: [_jsx("span", { className: "text-foreground", children: getCurrentQuantity(editingItem).toLocaleString() }), _jsx("span", { className: "text-xs text-blue-600", children: "Automatically calculated" })] })) : (_jsx(NumberInput, { id: "edit-quantity", value: editingItem.quantity, onChange: (value) => handleUpdateEditingItem({ quantity: value }) }))] }), !isGuestMode && (_jsxs("div", { children: [_jsx(Label, { htmlFor: "edit-unitPrice", children: editingItem.item.pricingType === 'tiered' ? 'Current Tier Price (USD)' : 'Unit Price (USD)' }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground", children: "$" }), _jsx(NumberInput, { id: "edit-unitPrice", value: editingItem.item.pricingType === 'tiered' ?
                                                getEffectiveUnitPrice(editingItem.item, getCurrentQuantity(editingItem)) :
                                                editingItem.unitPrice, onChange: (value) => handleUpdateEditingItem({ unitPrice: value }), min: 0, step: 0.01, disabled: editingItem.isFree || editingItem.item.pricingType === 'tiered', className: "pl-8", allowDecimals: true })] }), editingItem.item.pricingType === 'tiered' && (_jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Price is automatically determined by quantity tier" }))] })), !isGuestMode && (_jsxs("div", { children: [_jsx(Label, { children: "Discount" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(NumberInput, { value: editingItem.discount, onChange: (value) => handleUpdateEditingItem({ discount: value }), min: 0, max: editingItem.discountType === 'percentage' ? 100 : undefined, step: editingItem.discountType === 'percentage' ? 0.1 : 0.01, disabled: editingItem.isFree, className: "flex-1", allowDecimals: true }), _jsxs(Select, { value: editingItem.discountType, onValueChange: (value) => handleUpdateEditingItem({
                                                discountType: value,
                                                discount: 0
                                            }), disabled: editingItem.isFree, children: [_jsx(SelectTrigger, { className: "w-20", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "percentage", children: "%" }), _jsx(SelectItem, { value: "fixed", children: "$" })] })] })] })] })), !isGuestMode && (_jsxs("div", { children: [_jsx(Label, { children: "Apply Discount To" }), _jsxs(Select, { value: editingItem.discountApplication || 'total', onValueChange: (value) => handleUpdateEditingItem({
                                        discountApplication: value
                                    }), disabled: editingItem.isFree, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "unit", children: "Unit Price" }), _jsx(SelectItem, { value: "total", children: "Total Price" })] })] }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: editingItem.discountApplication === 'unit'
                                        ? 'Discount is applied to each unit, then multiplied by quantity'
                                        : 'Discount is applied to the total price (quantity × unit price)' })] })), !isGuestMode && (_jsxs("div", { className: "flex items-center justify-between p-3 bg-muted rounded-lg", children: [_jsx(Label, { htmlFor: "edit-free", className: "mb-0", children: "Make this service free" }), _jsx(Switch, { id: "edit-free", checked: editingItem.isFree, onCheckedChange: (checked) => handleUpdateEditingItem({
                                        isFree: checked,
                                        ...(checked ? { discount: 0 } : {})
                                    }) })] })), _jsxs("div", { className: "p-3 bg-muted rounded-lg space-y-2", children: [_jsx("h4", { className: "font-medium text-sm", children: "Price Summary" }), _jsxs("div", { className: "space-y-1 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Quantity:" }), _jsx("span", { children: getCurrentQuantity(editingItem).toLocaleString() })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Unit Price:" }), _jsx("span", { children: editingItem.item.pricingType === 'tiered'
                                                        ? formatPrice(getEffectiveUnitPrice(editingItem.item, getCurrentQuantity(editingItem)))
                                                        : formatPrice(editingItem.unitPrice) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Subtotal:" }), _jsx("span", { children: formatPrice(getCurrentQuantity(editingItem) * editingItem.unitPrice) })] }), editingItem.discount > 0 && !editingItem.isFree && (_jsxs("div", { className: "flex justify-between text-blue-600", children: [_jsx("span", { children: "Discount:" }), _jsxs("span", { children: ["-", editingItem.discount, editingItem.discountType === 'percentage' ? '%' : ' USD'] })] })), _jsxs("div", { className: "flex justify-between font-medium pt-2 border-t", children: [_jsx("span", { children: "Total:" }), _jsx("span", { className: editingItem.isFree ? 'text-green-600' : '', children: formatPrice(calculateRowTotal(editingItem)) })] })] })] })] })) })] }));
}
