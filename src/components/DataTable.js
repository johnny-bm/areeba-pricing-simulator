import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { GripVertical, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
function DraggableRow({ children, index, onDragStart, onDragOver, onDrop, onDragEnd, isDragging, isDropTarget, onClick }) {
    return (_jsxs(TableRow, { draggable: true, onDragStart: () => onDragStart(index), onDragOver: (e) => onDragOver(e, index), onDrop: (e) => onDrop(e, index), onDragEnd: onDragEnd, onClick: onClick, className: `
        transition-all duration-200 cursor-move
        ${isDragging ? 'opacity-50 bg-muted' : ''} 
        ${isDropTarget ? 'bg-accent border-primary border-2' : ''} 
        ${onClick ? 'hover:bg-muted/50' : ''}
      `, children: [_jsx(TableCell, { className: "w-8 p-2", children: _jsx(GripVertical, { className: "h-4 w-4 text-muted-foreground" }) }), children] }));
}
export function DataTable({ title, description, headers, items, renderRow, getItemKey, onRowClick, onReorder, actionButton, searchPlaceholder = 'Search items...', searchFields = [], filterOptions = [], itemsPerPage = 20, isLoading = false, emptyStateTitle = 'No items found', emptyStateDescription = 'There are no items to display.', emptyStateIcon, emptyStateAction }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [activeFilters, setActiveFilters] = useState({});
    // Drag and drop state
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const draggedItem = useRef(null);
    // Filter and search logic
    const filteredItems = useMemo(() => {
        let filtered = [...items];
        // Apply search filter
        if (searchTerm && searchFields.length > 0) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item => searchFields.some(field => {
                const value = item[field];
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(term);
                }
                if (typeof value === 'number') {
                    return value.toString().includes(term);
                }
                if (Array.isArray(value)) {
                    return value.some(v => typeof v === 'string' && v.toLowerCase().includes(term));
                }
                return false;
            }));
        }
        // Apply category/field filters
        Object.entries(activeFilters).forEach(([filterKey, filterValue]) => {
            if (filterValue && filterValue !== 'all') {
                filtered = filtered.filter(item => {
                    const value = item[filterKey];
                    // Handle boolean values as strings
                    if (typeof value === 'boolean') {
                        return value.toString() === filterValue;
                    }
                    return value === filterValue;
                });
            }
        });
        return filtered;
    }, [items, searchTerm, searchFields, activeFilters]);
    // Pagination logic
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = useMemo(() => {
        const startIndex = currentPage * itemsPerPage;
        return filteredItems.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredItems, currentPage, itemsPerPage]);
    // Reset page when filters change
    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setCurrentPage(0);
    };
    const handleFilterChange = (filterKey, value) => {
        setActiveFilters(prev => ({
            ...prev,
            [filterKey]: value
        }));
        setCurrentPage(0);
    };
    // Drag and drop handlers
    const handleDragStart = (index) => {
        if (!onReorder)
            return;
        setDraggedIndex(index);
        draggedItem.current = paginatedItems[index];
    };
    const handleDragOver = (e, index) => {
        if (!onReorder)
            return;
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== index) {
            setDragOverIndex(index);
        }
    };
    const handleDrop = (e, dropIndex) => {
        if (!onReorder)
            return;
        e.preventDefault();
        if (draggedIndex === null || draggedItem.current === null || draggedIndex === dropIndex) {
            return;
        }
        const newPageItems = [...paginatedItems];
        newPageItems.splice(draggedIndex, 1);
        newPageItems.splice(dropIndex, 0, draggedItem.current);
        // Reconstruct the full array with reordered page items
        const startIndex = currentPage * itemsPerPage;
        const newItems = [...filteredItems];
        newPageItems.forEach((item, index) => {
            newItems[startIndex + index] = item;
        });
        onReorder(newItems);
        handleDragEnd();
    };
    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
        draggedItem.current = null;
    };
    const handlePageChange = (newPage) => {
        setCurrentPage(Math.max(0, Math.min(totalPages - 1, newPage)));
    };
    // Count active filters
    const activeFilterCount = Object.values(activeFilters).filter(v => v && v !== 'all').length;
    return (_jsx("div", { className: "space-y-4", children: isLoading ? (_jsx("div", { className: "border rounded-lg p-8", children: _jsx("div", { className: "flex justify-center", children: _jsx("div", { className: "text-muted-foreground", children: "Loading..." }) }) })) : filteredItems.length === 0 && searchTerm === '' && activeFilterCount === 0 ? (
        /* Empty state - only show when no filters/search active */
        _jsx("div", { className: "border rounded-lg p-8", children: _jsxs("div", { className: "text-center", children: [emptyStateIcon && (_jsx("div", { className: "flex justify-center mb-4", children: emptyStateIcon })), _jsx("h3", { className: "text-lg font-medium mb-2", children: emptyStateTitle }), _jsx("p", { className: "text-muted-foreground mb-4", children: emptyStateDescription }), emptyStateAction] }) })) : (_jsx(_Fragment, { children: _jsxs("div", { className: "border rounded-lg overflow-hidden", children: [_jsxs("div", { className: "flex justify-between items-center px-4 py-3 border-b bg-background", children: [_jsx("h2", { className: "text-lg", children: title }), _jsx("div", { className: "[&>button]:h-8 [&>button]:text-sm", children: actionButton })] }), (searchFields.length > 0 || filterOptions.length > 0) && (_jsxs("div", { className: "p-4 border-b bg-muted/20", children: [_jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [searchFields.length > 0 && (_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: searchPlaceholder, value: searchTerm, onChange: (e) => handleSearchChange(e.target.value), className: "pl-10" })] }) })), filterOptions.map(filter => (_jsx("div", { className: "min-w-[180px]", children: _jsxs(Select, { value: activeFilters[filter.key] || 'all', onValueChange: (value) => handleFilterChange(filter.key, value), children: [_jsx(SelectTrigger, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Filter, { className: "h-4 w-4" }), _jsx(SelectValue, { placeholder: filter.label })] }) }), _jsxs(SelectContent, { children: [_jsxs(SelectItem, { value: "all", children: ["All ", filter.label] }), filter.options.map(option => (_jsx(SelectItem, { value: option.value, children: _jsxs("div", { className: "flex items-center justify-between w-full", children: [_jsx("span", { children: option.label }), option.count !== undefined && (_jsx(Badge, { variant: "secondary", className: "ml-2", children: option.count }))] }) }, option.value)))] })] }) }, filter.key)))] }), activeFilterCount > 0 && (_jsxs("div", { className: "flex items-center gap-2 mt-3 pt-3 border-t", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Active filters:" }), _jsxs(Badge, { variant: "secondary", children: [activeFilterCount, " filter", activeFilterCount !== 1 ? 's' : '', " active"] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                            setActiveFilters({});
                                            setSearchTerm('');
                                            setCurrentPage(0);
                                        }, children: "Clear all" })] }))] })), filteredItems.length === 0 && (searchTerm !== '' || activeFilterCount > 0) ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("p", { className: "text-muted-foreground mb-2", children: "No items found" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Try adjusting your search or filters" })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "max-h-[600px] overflow-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { className: "sticky top-0 bg-background z-10", children: _jsxs(TableRow, { children: [onReorder && _jsx(TableHead, { className: "w-8" }), headers.map((header, index) => (_jsx(TableHead, { children: header }, index)))] }) }), _jsx(TableBody, { children: paginatedItems.map((item, index) => (onReorder ? (_jsx(DraggableRow, { index: index, onDragStart: handleDragStart, onDragOver: handleDragOver, onDrop: handleDrop, onDragEnd: handleDragEnd, isDragging: draggedIndex === index, isDropTarget: dragOverIndex === index, onClick: onRowClick ? () => onRowClick(item) : undefined, children: renderRow(item, index) }, getItemKey(item))) : (_jsx(TableRow, { onClick: onRowClick ? () => onRowClick(item) : undefined, className: onRowClick ? 'cursor-pointer hover:bg-muted/50' : '', children: renderRow(item, index) }, getItemKey(item))))) })] }) }), totalPages > 0 && (_jsxs("div", { className: "flex items-center justify-between p-4 border-t bg-muted/20", children: [_jsxs("div", { className: "text-sm text-muted-foreground", children: ["Showing ", currentPage * itemsPerPage + 1, " to ", Math.min((currentPage + 1) * itemsPerPage, filteredItems.length), " of ", filteredItems.length, " items", filteredItems.length !== items.length && (_jsxs("span", { className: "ml-1", children: ["(filtered from ", items.length, " total)"] }))] }), totalPages > 1 && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => handlePageChange(currentPage - 1), disabled: currentPage === 0, children: [_jsx(ChevronLeft, { className: "h-4 w-4" }), "Previous"] }), _jsxs("span", { className: "text-sm", children: ["Page ", currentPage + 1, " of ", totalPages] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handlePageChange(currentPage + 1), disabled: currentPage >= totalPages - 1, children: ["Next", _jsx(ChevronRight, { className: "h-4 w-4" })] })] }))] }))] }))] }) })) }));
}
