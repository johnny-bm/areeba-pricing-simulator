import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * SimpleServiceManager - DataTable Edition
 * Version: 5.1.0
 * Last Updated: 2025-09-30
 * Layout: Unified DataTable layout (matches TagManager implementation)
 */
import { useState, useMemo, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TableCell } from './ui/table';
import { Plus, Edit, Trash2, Copy, Package } from 'lucide-react';
import { toast } from "sonner";
import { SimpleServiceEditor } from './SimpleServiceEditor';
import { DataTable } from './DataTable';
import { formatPrice } from '../utils/formatters';
export function SimpleServiceManager({ services, categories, onUpdateServices, onRefresh }) {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveProgress, setSaveProgress] = useState('');
    // Component version logging
    useEffect(() => {
        const componentVersion = '5.1.0-DATATABLE';
        console.log(`%c✅ SimpleServiceManager v${componentVersion} loaded (DataTable Edition)`, 'color: #22c55e; font-weight: bold');
        console.log('%c   ➜ Layout: Unified DataTable (no more separate cards)', 'color: #22c55e');
    }, []);
    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category?.name || categoryId;
    };
    const handleCreateService = () => {
        setEditingService(null);
        setIsCreating(true);
        setIsEditorOpen(true);
    };
    const handleEditService = (service) => {
        setEditingService(service);
        setIsCreating(false);
        setIsEditorOpen(true);
    };
    const handleSaveService = async (service) => {
        setIsSaving(true);
        setSaveProgress('Preparing to save...');
        try {
            let updatedServices;
            if (isCreating) {
                // Add new service
                setSaveProgress('Creating new service...');
                updatedServices = [...services, service];
            }
            else {
                // Update existing service
                setSaveProgress('Updating service...');
                updatedServices = services.map(s => s.id === service.id ? service : s);
            }
            setSaveProgress(`Saving ${updatedServices.length} services...`);
            await onUpdateServices(updatedServices);
            setSaveProgress('Service saved successfully');
            toast.success(isCreating ? 'Service created!' : 'Service updated!', {
                description: `"${service.name}" has been ${isCreating ? 'created' : 'updated'} successfully`,
                duration: 3000
            });
            // Clear progress after a moment
            setTimeout(() => {
                setSaveProgress('');
                setIsSaving(false);
            }, 500);
        }
        catch (error) {
            console.error('Error saving service:', error);
            setSaveProgress('');
            setIsSaving(false);
            toast.error('Failed to save service', {
                description: error.message || 'Please try again',
                duration: 5000
            });
            throw error; // Re-throw to let the editor handle the error display
        }
    };
    const handleDeleteService = async (service) => {
        try {
            const updatedServices = services.filter(s => s.id !== service.id);
            await onUpdateServices(updatedServices);
        }
        catch (error) {
            console.error('Error deleting service:', error);
            throw error; // Re-throw to let the editor handle the error display
        }
    };
    const handleQuickDelete = async (service) => {
        const confirmed = window.confirm(`Are you sure you want to delete "${service.name}"? This action cannot be undone.`);
        if (!confirmed)
            return;
        try {
            await handleDeleteService(service);
        }
        catch (error) {
            alert(`Failed to delete service: ${error.message || 'Unknown error'}`);
        }
    };
    const handleDuplicateService = async (service) => {
        try {
            const duplicatedService = {
                ...service,
                id: `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: `${service.name} (Copy)`
            };
            const updatedServices = [...services, duplicatedService];
            await onUpdateServices(updatedServices);
        }
        catch (error) {
            console.error('Error duplicating service:', error);
            alert(`Failed to duplicate service: ${error.message || 'Unknown error'}`);
        }
    };
    // Prepare filter options for categories
    const categoryFilterOptions = useMemo(() => {
        return categories.map(cat => ({
            value: cat.id,
            label: cat.name,
            count: services.filter(s => s.category === cat.id).length
        }));
    }, [categories, services]);
    return (_jsxs("div", { children: [_jsx(DataTable, { title: "Services", description: "Manage your pricing services", headers: ['Name', 'Category', 'Price', 'Unit', 'Type', 'Tags', 'Actions'], items: services, getItemKey: (service) => service.id, onRowClick: handleEditService, searchFields: ['name', 'description', 'tags'], searchPlaceholder: "Search services by name, description, or tags...", filterOptions: [
                    {
                        key: 'category',
                        label: 'Categories',
                        options: categoryFilterOptions
                    }
                ], actionButton: _jsxs(Button, { onClick: handleCreateService, size: "sm", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create Service"] }), emptyStateTitle: "No services created yet", emptyStateDescription: "Create your first service to get started with pricing configurations.", emptyStateIcon: _jsx(Package, { className: "h-12 w-12 text-muted-foreground" }), emptyStateAction: _jsxs(Button, { onClick: handleCreateService, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create First Service"] }), renderRow: (service) => (_jsxs(_Fragment, { children: [_jsx(TableCell, { children: _jsxs("div", { children: [_jsx("div", { children: service.name }), _jsx("div", { className: "text-sm text-muted-foreground truncate max-w-xs", children: service.description })] }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", children: getCategoryName(service.category) }) }), _jsx(TableCell, { children: formatPrice(service.defaultPrice) }), _jsx(TableCell, { children: _jsx("span", { className: "text-sm text-muted-foreground", children: service.unit }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: service.pricingType === 'tiered' ? 'default' : 'secondary', children: service.pricingType === 'tiered' ? 'Tiered' : 'Simple' }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex flex-wrap gap-1 max-w-xs", children: [service.tags?.slice(0, 2).map(tag => (_jsx(Badge, { variant: "outline", className: "text-xs", children: tag }, tag))), service.tags && service.tags.length > 2 && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: ["+", service.tags.length - 2, " more"] }))] }) }), _jsx(TableCell, { onClick: (e) => e.stopPropagation(), children: _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleEditService(service), title: "Edit service", children: _jsx(Edit, { className: "h-3 w-3" }) }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleDuplicateService(service), title: "Duplicate service", children: _jsx(Copy, { className: "h-3 w-3" }) }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleQuickDelete(service), className: "text-red-600 hover:text-red-700", title: "Delete service", children: _jsx(Trash2, { className: "h-3 w-3" }) })] }) })] })) }), _jsx(SimpleServiceEditor, { isOpen: isEditorOpen, onClose: () => setIsEditorOpen(false), onSave: handleSaveService, onDelete: handleDeleteService, service: editingService, categories: categories, isCreating: isCreating, isSaving: isSaving, saveProgress: saveProgress })] }));
}
