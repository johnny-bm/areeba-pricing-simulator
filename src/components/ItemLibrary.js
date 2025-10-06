import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * ItemLibrary - Card-Based Layout
 * Version: 2.1.0
 * Last Updated: 2025-09-30
 * This component uses cards for a cleaner, more visual layout
 */
import { useState, useMemo } from 'react';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Plus, Minus, ChevronDown, ChevronUp, Sparkles, X, Search } from "lucide-react";
import { formatPrice } from "../utils/formatters";
import { CardHeaderWithCollapse } from "./CardHeaderWithCollapse";
export function ItemLibrary({ items, categories, selectedItemIds, selectedItems, onAddItem, onRemoveItem, clientConfig }) {
    const [selectedTags, setSelectedTags] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showAllTags, setShowAllTags] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [openCategories, setOpenCategories] = useState({});
    const [allCategoriesExpanded, setAllCategoriesExpanded] = useState(true);
    // Create sorted categories based on order_index
    const sortedCategories = useMemo(() => {
        if (!categories || categories.length === 0) {
            return [];
        }
        return [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [categories]);
    // Get all unique tags across all items
    const allTags = useMemo(() => {
        const tagSet = new Set();
        items.forEach(item => {
            item.tags?.forEach(tag => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    }, [items]);
    // Get smart suggestions based on currently selected items
    const smartSuggestions = useMemo(() => {
        if (selectedItemIds.length === 0)
            return [];
        const selectedItems = items.filter(item => selectedItemIds.includes(item.id));
        const selectedTagCounts = {};
        // Count tags from selected items
        selectedItems.forEach(item => {
            item.tags?.forEach(tag => {
                selectedTagCounts[tag] = (selectedTagCounts[tag] || 0) + 1;
            });
        });
        // Find items with similar tags that aren't already selected
        const suggestions = items
            .filter(item => !selectedItemIds.includes(item.id))
            .map(item => {
            let score = 0;
            item.tags?.forEach(tag => {
                score += selectedTagCounts[tag] || 0;
            });
            return { item, score };
        })
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(({ item }) => item);
        return suggestions;
    }, [items, selectedItemIds]);
    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category?.name || categoryId;
    };
    const handleToggleItem = (item) => {
        const isSelected = selectedItemIds.includes(item.id);
        if (isSelected) {
            const selectedItemToRemove = selectedItems.find(selected => selected.item.id === item.id);
            if (selectedItemToRemove) {
                onRemoveItem(selectedItemToRemove.id);
            }
        }
        else {
            onAddItem(item);
        }
    };
    const toggleTag = (tag) => {
        setSelectedTags(prev => prev.includes(tag)
            ? prev.filter(t => t !== tag)
            : [...prev, tag]);
    };
    const clearFilters = () => {
        setSelectedTags([]);
        setSearchQuery('');
    };
    const toggleCategory = (categoryId) => {
        setOpenCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };
    const handleToggleAllCategories = () => {
        const newOpenState = {};
        const newExpandedState = !allCategoriesExpanded;
        sortedCategories.forEach(cat => {
            newOpenState[cat.id] = newExpandedState;
        });
        setOpenCategories(newOpenState);
        setAllCategoriesExpanded(newExpandedState);
    };
    // Filter items based on selected tags and search
    const filteredItems = useMemo(() => {
        let result = items;
        // Apply tag filter
        if (selectedTags.length > 0) {
            result = result.filter(item => {
                return item.tags && selectedTags.every(selectedTag => item.tags.includes(selectedTag));
            });
        }
        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item => {
                return (item.name.toLowerCase().includes(query) ||
                    item.description.toLowerCase().includes(query) ||
                    item.tags?.some(tag => tag.toLowerCase().includes(query)));
            });
        }
        return result;
    }, [items, selectedTags, searchQuery]);
    // Group filtered items by category
    const itemsByCategory = useMemo(() => {
        const grouped = {};
        filteredItems.forEach(item => {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });
        return grouped;
    }, [filteredItems]);
    const displayedTags = showAllTags ? allTags : allTags.slice(0, 6);
    return (_jsx("div", { className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeaderWithCollapse, { title: "Service Library", description: `${selectedItemIds.length} selected · ${filteredItems.length} available`, isCollapsed: !allCategoriesExpanded, onToggle: handleToggleAllCategories, showCollapseButton: sortedCategories.length > 1 }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search services by name, description, or tags...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-9" })] }), allTags.length > 0 && (_jsxs("div", { className: "border rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Filter by tags" }), (selectedTags.length > 0 || searchQuery.trim()) && (_jsxs(Button, { variant: "ghost", size: "sm", onClick: clearFilters, className: "h-6 px-2 text-xs", children: [_jsx(X, { className: "h-3 w-3 mr-1" }), "Clear all"] }))] }), _jsxs("div", { className: "flex flex-wrap gap-1", children: [displayedTags.map(tag => (_jsx(Badge, { variant: selectedTags.includes(tag) ? "default" : "secondary", className: "text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors", onClick: () => toggleTag(tag), children: tag }, tag))), allTags.length > 6 && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setShowAllTags(!showAllTags), className: "h-6 px-2 text-xs", children: showAllTags ? 'Show less' : `+${allTags.length - 6} more` }))] })] })), smartSuggestions.length > 0 && selectedTags.length === 0 && !searchQuery.trim() && (_jsx("div", { className: "border border-primary/20 bg-primary/5 rounded-lg", children: _jsxs("div", { className: "p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Sparkles, { className: "h-4 w-4 text-primary" }), _jsx("span", { className: "text-sm font-medium", children: "Suggested Services" })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setShowSuggestions(!showSuggestions), className: "h-6 px-2 text-xs", children: showSuggestions ? 'Hide' : 'Show' })] }), showSuggestions && (_jsx("div", { className: "space-y-2", children: smartSuggestions.map((item) => {
                                            const isSelected = selectedItemIds.includes(item.id);
                                            return (_jsx(Card, { className: `cursor-pointer transition-all hover:shadow-md ${isSelected ? 'bg-muted border-primary' : ''}`, onClick: () => handleToggleItem(item), children: _jsx(CardContent, { className: "p-3", children: _jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "font-medium mb-1", children: item.name }), _jsx("div", { className: "text-sm text-muted-foreground line-clamp-2 mb-2", children: item.description }), item.tags && item.tags.length > 0 && (_jsxs("div", { className: "flex flex-wrap gap-1", children: [item.tags.slice(0, 3).map(tag => (_jsx(Badge, { variant: "secondary", className: "text-xs", children: tag }, tag))), item.tags.length > 3 && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: ["+", item.tags.length - 3] }))] }))] }), _jsxs("div", { className: "flex flex-col items-end gap-2", children: [_jsx("div", { className: "text-sm font-medium", children: item.pricingType === 'tiered' ? (_jsxs("div", { className: "text-right", children: [_jsx(Badge, { variant: "default", className: "text-xs mb-1", children: "Tiered" }), _jsxs("div", { className: "text-muted-foreground text-xs", children: ["from ", formatPrice(item.tiers?.[0]?.unitPrice || item.defaultPrice)] })] })) : (formatPrice(item.defaultPrice)) }), _jsx(Button, { size: "sm", variant: isSelected ? "default" : "outline", onClick: (e) => {
                                                                            e.stopPropagation();
                                                                            handleToggleItem(item);
                                                                        }, children: isSelected ? _jsx(Minus, { className: "h-3 w-3" }) : _jsx(Plus, { className: "h-3 w-3" }) })] })] }) }) }, item.id));
                                        }) }))] }) })), _jsx("div", { className: "space-y-3", children: sortedCategories.map(category => {
                                const categoryItems = itemsByCategory[category.id] || [];
                                if (categoryItems.length === 0)
                                    return null;
                                const isOpen = openCategories[category.id] ?? allCategoriesExpanded; // Default to allCategoriesExpanded state
                                return (_jsx(Collapsible, { open: isOpen, onOpenChange: () => toggleCategory(category.id), children: _jsxs("div", { className: "border rounded-lg", children: [_jsx(CollapsibleTrigger, { className: "w-full", children: _jsxs("div", { className: "flex items-center justify-between p-3 hover:bg-muted/50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "font-medium", children: category.name }), _jsx(Badge, { variant: "secondary", className: "text-xs", children: categoryItems.length })] }), isOpen ? (_jsx(ChevronUp, { className: "h-4 w-4 text-muted-foreground" })) : (_jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground" }))] }) }), _jsx(CollapsibleContent, { children: _jsx("div", { className: "border-t", children: _jsx("div", { className: "divide-y", children: categoryItems.map((item) => {
                                                            const isSelected = selectedItemIds.includes(item.id);
                                                            return (_jsxs("div", { className: `flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer ${isSelected ? 'bg-muted' : ''}`, onClick: () => handleToggleItem(item), children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "font-medium mb-0.5 text-[14px]", children: item.name }), _jsx("div", { className: "text-sm text-muted-foreground line-clamp-1 text-[12px]", children: item.description })] }), _jsxs("div", { className: "flex items-center gap-3 flex-shrink-0", children: [_jsx("div", { className: "text-right", children: item.pricingType === 'tiered' ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "text-sm font-medium", children: formatPrice(item.tiers?.[0]?.unitPrice || item.defaultPrice) }), _jsxs("div", { className: "text-xs text-muted-foreground", children: ["Tiered \u00B7 ", item.unit] })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "text-sm font-medium", children: formatPrice(item.defaultPrice) }), _jsx("div", { className: "text-xs text-muted-foreground", children: item.unit })] })) }), _jsx(Button, { size: "sm", variant: isSelected ? "default" : "outline", onClick: (e) => {
                                                                                    e.stopPropagation();
                                                                                    handleToggleItem(item);
                                                                                }, className: "h-8 w-8 p-0", children: isSelected ? (_jsx(Minus, { className: "h-4 w-4" })) : (_jsx(Plus, { className: "h-4 w-4" })) })] })] }, item.id));
                                                        }) }) }) })] }) }, category.id));
                            }) }), filteredItems.length === 0 && (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx("p", { className: "mb-2", children: "No services found" }), _jsx("p", { className: "text-sm", children: "Try adjusting your filters or search query" })] }))] })] }) }));
}
