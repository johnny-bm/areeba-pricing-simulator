import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TableCell } from './ui/table';
import { Plus, Edit, Trash2, Package, Copy } from 'lucide-react';
import { DataTable } from './DataTable';
import { CategoryDialog } from './dialogs/CategoryDialog';
export function CategoryManager({ categories, services, onUpdateCategories }) {
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const handleCreateCategory = () => {
        setEditingCategory(null);
        setIsCreating(true);
        setIsCategoryDialogOpen(true);
    };
    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setIsCreating(false);
        setIsCategoryDialogOpen(true);
    };
    const handleSaveCategory = async (category) => {
        try {
            let updatedCategories;
            if (isCreating) {
                // Add new category
                updatedCategories = [...categories, category];
            }
            else {
                // Update existing category
                updatedCategories = categories.map(c => c.id === category.id ? category : c);
            }
            await onUpdateCategories(updatedCategories);
            setIsCategoryDialogOpen(false);
            setEditingCategory(null);
        }
        catch (error) {
            console.error('Error saving category:', error);
            throw error; // Re-throw to let the dialog handle the error display
        }
    };
    const handleDeleteCategory = async (category) => {
        try {
            // Check if category is being used by any services
            const servicesUsingCategory = services.filter(service => service.category === category.id);
            if (servicesUsingCategory.length > 0) {
                throw new Error(`Cannot delete category "${category.name}" because it is being used by ${servicesUsingCategory.length} service(s). Please reassign or delete those services first.`);
            }
            const updatedCategories = categories.filter(c => c.id !== category.id);
            await onUpdateCategories(updatedCategories);
            setIsCategoryDialogOpen(false);
            setEditingCategory(null);
        }
        catch (error) {
            console.error('Error deleting category:', error);
            throw error; // Re-throw to let the dialog handle the error display
        }
    };
    const handleDuplicateCategory = async (category) => {
        try {
            const duplicatedCategory = {
                ...category,
                id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: `${category.name} (Copy)`,
                order_index: categories.length + 1
            };
            const updatedCategories = [...categories, duplicatedCategory];
            await onUpdateCategories(updatedCategories);
        }
        catch (error) {
            console.error('Error duplicating category:', error);
            throw error;
        }
    };
    const handleQuickDelete = async (category) => {
        const confirmed = window.confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`);
        if (!confirmed)
            return;
        try {
            await handleDeleteCategory(category);
        }
        catch (error) {
            alert(`Failed to delete category: ${error.message || 'Unknown error'}`);
        }
    };
    const handleReorderCategories = async (reorderedCategories) => {
        try {
            await onUpdateCategories(reorderedCategories);
        }
        catch (error) {
            console.error('Error reordering categories:', error);
        }
    };
    // Get services count for each category
    const getCategoryServiceCount = (categoryId) => {
        return services.filter(service => service.category === categoryId).length;
    };
    return (_jsxs("div", { children: [_jsx(DataTable, { title: "Category Management", description: "Organize pricing services into logical categories", headers: ['Name', 'Description', 'Order', 'Services', 'Actions'], items: categories, getItemKey: (category) => category.id, onReorder: handleReorderCategories, onRowClick: handleEditCategory, searchFields: ['name', 'description'], searchPlaceholder: "Search categories...", actionButton: _jsxs(Button, { onClick: handleCreateCategory, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Category"] }), emptyStateTitle: "No categories created yet", emptyStateDescription: "Create your first category to organize pricing services", emptyStateIcon: _jsx(Package, { className: "h-12 w-12 text-muted-foreground" }), emptyStateAction: _jsxs(Button, { onClick: handleCreateCategory, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create First Category"] }), renderRow: (category) => (_jsxs(_Fragment, { children: [_jsx(TableCell, { children: _jsx("div", { className: "font-medium", children: category.name }) }), _jsx(TableCell, { children: _jsx("div", { className: "text-sm text-muted-foreground max-w-xs truncate", children: category.description }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", children: category.order_index }) }), _jsx(TableCell, { children: _jsxs(Badge, { variant: "secondary", children: [getCategoryServiceCount(category.id), " services"] }) }), _jsx(TableCell, { onClick: (e) => e.stopPropagation(), children: _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleEditCategory(category), title: "Edit category", children: _jsx(Edit, { className: "h-3 w-3" }) }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleDuplicateCategory(category), title: "Duplicate category", children: _jsx(Copy, { className: "h-3 w-3" }) }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleQuickDelete(category), className: "text-red-600 hover:text-red-700", title: "Delete category", children: _jsx(Trash2, { className: "h-3 w-3" }) })] }) })] })) }), _jsx(CategoryDialog, { isOpen: isCategoryDialogOpen, onClose: () => {
                    setIsCategoryDialogOpen(false);
                    setEditingCategory(null);
                }, onSave: handleSaveCategory, onDelete: handleDeleteCategory, onDuplicate: handleDuplicateCategory, category: editingCategory, categories: categories, isCreating: isCreating })] }));
}
