import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Save, X, Trash2, Loader2 } from 'lucide-react';
import { ALL_UNITS } from '../utils/unitClassification';
import { PRICING_TYPES } from '../config/database';
import { api } from '../utils/api';
import { MultiSelectInput } from './MultiSelectInput';
import { TieredPricingEditor } from './TieredPricingEditor';
import { NumberInput } from './NumberInput';
export function SimpleServiceEditor({ isOpen, onClose, onSave, onDelete, service, categories, isCreating, isSaving: parentIsSaving, saveProgress: parentSaveProgress }) {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        category: categories.length > 0 ? categories[0].id : '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        unit: 'per month',
        defaultPrice: 0,
        tags: [],
        pricingType: 'fixed',
        tiers: [],
        quantitySourceFields: [],
        autoAddServices: []
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [configurations, setConfigurations] = useState([]);
    const [existingTags, setExistingTags] = useState([]);
    const [temporaryTags, setTemporaryTags] = useState([]);
    // Load configurations when dialog opens
    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                try {
                    const [configsData, servicesData] = await Promise.all([
                        api.loadConfigurations(),
                        api.loadPricingItems()
                    ]);
                    setConfigurations(configsData.filter(config => config.isActive));
                    // Extract all unique tags from services
                    const allTags = new Set();
                    servicesData.forEach(s => {
                        if (s.tags) {
                            s.tags.forEach(tag => allTags.add(tag));
                        }
                    });
                    setExistingTags(Array.from(allTags).sort());
                }
                catch (error) {
                    console.error('Failed to load configuration data:', error);
                    setConfigurations([]);
                    setExistingTags([]);
                }
            };
            loadData();
        }
    }, [isOpen]);
    // Reset form when dialog opens/closes or service changes
    useEffect(() => {
        if (isOpen) {
            // Clear temporary tags when dialog opens
            setTemporaryTags([]);
            if (service && !isCreating) {
                // Edit mode - populate with existing service data
                setFormData({
                    id: service.id,
                    name: service.name,
                    description: service.description,
                    category: service.category,
                    categoryId: service.categoryId || service.category,
                    unit: service.unit,
                    defaultPrice: service.defaultPrice,
                    tags: service.tags || [],
                    pricingType: service.pricingType || 'fixed',
                    tiers: service.tiers || [],
                    quantitySourceFields: service.quantitySourceFields || [],
                    autoAddServices: service.autoAddServices || []
                });
            }
            else {
                // Create mode - start with defaults
                setFormData({
                    id: '',
                    name: '',
                    description: '',
                    category: categories.length > 0 ? categories[0].id : '',
                    categoryId: categories.length > 0 ? categories[0].id : '',
                    unit: 'per month',
                    defaultPrice: 0,
                    tags: [],
                    pricingType: 'fixed',
                    tiers: [],
                    quantitySourceFields: [],
                    autoAddServices: []
                });
            }
        }
    }, [isOpen, service, isCreating, categories]);
    const updateField = (field, value) => {
        // Add safety checks for string fields to prevent undefined values
        let safeValue = value;
        if (field === 'name' || field === 'description') {
            safeValue = value || '';
        }
        setFormData(prev => ({ ...prev, [field]: safeValue }));
    };
    const handleSave = async () => {
        if (!formData.name.trim() || !formData.description.trim()) {
            alert('Please fill in all required fields (Name and Description)');
            return;
        }
        // Validate category
        if (!formData.category || formData.category.trim() === '') {
            alert('Please select a category');
            return;
        }
        // Ensure category exists in available categories
        const categoryExists = categories.some(cat => cat.id === formData.category);
        if (!categoryExists) {
            alert(`Invalid category selected. Available categories: ${categories.map(c => c.name).join(', ')}`);
            return;
        }
        try {
            setIsSaving(true);
            const serviceToSave = {
                id: formData.id || `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: formData.name.trim(),
                description: formData.description.trim(),
                category: formData.category,
                categoryId: formData.categoryId || '',
                unit: formData.unit,
                defaultPrice: formData.defaultPrice,
                tags: formData.tags,
                pricingType: formData.pricingType,
                tiers: formData.pricingType === PRICING_TYPES.TIERED ? formData.tiers : undefined,
                quantitySourceFields: formData.quantitySourceFields,
                autoAddServices: formData.autoAddServices
            };
            await onSave(serviceToSave);
            // After successful save, refresh the existing tags list
            try {
                const servicesData = await api.loadPricingItems();
                const allTags = new Set();
                servicesData.forEach(s => {
                    if (s.tags) {
                        s.tags.forEach(tag => allTags.add(tag));
                    }
                });
                const sortedTags = Array.from(allTags).sort();
                setExistingTags(sortedTags);
                // Clear temporary tags since they're now permanent
                setTemporaryTags([]);
            }
            catch (refreshError) {
                console.warn('Failed to refresh existing tags after save:', refreshError);
            }
            onClose();
        }
        catch (error) {
            console.error('Error saving service:', error);
            alert(`Failed to save service: ${error.message || 'Unknown error'}`);
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleDelete = async () => {
        if (!service || isCreating || !onDelete)
            return;
        const confirmed = window.confirm(`Are you sure you want to delete "${service.name}"? This action cannot be undone.`);
        if (!confirmed)
            return;
        try {
            setIsDeleting(true);
            await onDelete(service);
            onClose();
        }
        catch (error) {
            console.error('Error deleting service:', error);
            alert(`Failed to delete service: ${error.message || 'Unknown error'}`);
        }
        finally {
            setIsDeleting(false);
        }
    };
    const isValid = formData.name?.trim() && formData.description?.trim() && formData.category && formData.unit && categories.length > 0;
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "w-[90vw] max-w-[960px] sm:max-w-[960px] h-[90vh] flex flex-col p-0 gap-0", children: [_jsx("div", { className: "flex-shrink-0 bg-background border-b px-6 pt-6 pb-4", children: _jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: isCreating ? 'Create New Service' : 'Edit Service' }), _jsx(DialogDescription, { children: isCreating
                                    ? 'Add a new pricing service to the system with configurable options and tiered pricing support.'
                                    : 'Modify the selected pricing service settings, pricing tiers, and configuration options.' })] }) }), _jsx("div", { className: "flex-1 overflow-y-auto px-6 py-4 min-h-0", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "item-name", children: "Service Name *" }), _jsx(Input, { id: "item-name", value: formData.name, onChange: (e) => updateField('name', e.target.value), placeholder: "Enter service name" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "item-category", children: "Category *" }), _jsxs(Select, { value: formData.category, onValueChange: (value) => updateField('category', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: categories.map((category) => (_jsx(SelectItem, { value: category.id, children: category.name }, category.id))) })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "item-description", children: "Description *" }), _jsx(Textarea, { id: "item-description", value: formData.description, onChange: (e) => updateField('description', e.target.value), placeholder: "Describe this service", rows: 3 })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "item-unit", children: "Unit *" }), _jsxs(Select, { value: formData.unit, onValueChange: (value) => updateField('unit', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: ALL_UNITS.map((unit) => (_jsx(SelectItem, { value: unit, children: unit }, unit))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "item-price", children: "Default Price *" }), _jsx(NumberInput, { value: formData.defaultPrice, onChange: (value) => updateField('defaultPrice', value), placeholder: "0.00", step: 0.01, min: 0 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Pricing Type" }), _jsxs(Select, { value: formData.pricingType, onValueChange: (value) => updateField('pricingType', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "simple", children: "Simple Pricing" }), _jsx(SelectItem, { value: "tiered", children: "Tiered Pricing" })] })] })] })] }), formData.pricingType === PRICING_TYPES.TIERED && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Tiered Pricing" }), _jsx(TieredPricingEditor, { tiers: formData.tiers, unit: formData.unit, onUpdateTiers: (tiers) => updateField('tiers', tiers) })] })), _jsx("div", { className: "border-t border-border my-6" }), _jsx(MultiSelectInput, { label: "Tags", placeholder: "Type to add a new tag or select from existing...", selectedValues: formData.tags || [], options: [...existingTags, ...temporaryTags].sort().map(tag => ({
                                    id: tag,
                                    label: tag,
                                    searchText: tag.toLowerCase()
                                })), onAdd: (tag) => {
                                    const currentTags = formData.tags || [];
                                    const trimmedTag = tag.trim();
                                    if (!currentTags.includes(trimmedTag)) {
                                        updateField('tags', [...currentTags, trimmedTag]);
                                        // Immediately add new tag to available options for better UX
                                        if (!existingTags.includes(trimmedTag) && !temporaryTags.includes(trimmedTag)) {
                                            setTemporaryTags(prev => [...prev, trimmedTag]);
                                        }
                                    }
                                }, onRemove: (tag) => {
                                    const currentTags = formData.tags || [];
                                    updateField('tags', currentTags.filter(t => t !== tag));
                                }, allowCreateNew: true, helpText: `${existingTags.length + temporaryTags.length} tag${(existingTags.length + temporaryTags.length) !== 1 ? 's' : ''} available${temporaryTags.length > 0 ? ` (${temporaryTags.length} new this session)` : ''}`, multiple: true }), _jsx("div", { className: "space-y-3", children: _jsx(MultiSelectInput, { label: "Configuration-Based Quantity (Auto-quantity from client config)", placeholder: "Search configuration fields to add auto-quantity...", selectedValues: formData.quantitySourceFields || [], options: configurations.flatMap(config => (config.fields || [])
                                        .filter(field => field.type === 'number') // Only show number input fields
                                        .map(field => ({
                                        id: field.id,
                                        label: field.label || field.name,
                                        description: field.description,
                                        groupName: config.name,
                                        searchText: `${config.name} ${field.label} ${field.description || ''}`.toLowerCase()
                                    }))), onAdd: (fieldId) => {
                                        const currentFields = formData.quantitySourceFields || [];
                                        updateField('quantitySourceFields', [...currentFields, fieldId]);
                                    }, onRemove: (fieldId) => {
                                        const currentFields = formData.quantitySourceFields || [];
                                        updateField('quantitySourceFields', currentFields.filter(f => f !== fieldId));
                                    }, groupBy: true, helpText: "Service quantity will automatically match values from selected client configuration fields. Leave empty for manual quantity entry.", emptyMessage: "No number configuration fields found. Create number fields in the admin panel to enable auto-quantity mapping.", multiple: true }) }), _jsx(MultiSelectInput, { label: "Auto-Add Related Services", placeholder: "Search configuration fields for auto-add triggers...", selectedValues: formData.autoAddServices || [], options: configurations.flatMap(config => (config.fields || []).map(field => ({
                                    id: field.id,
                                    label: field.label || field.name,
                                    description: `${field.type}${field.description ? ` • ${field.description}` : ''}`,
                                    groupName: config.name,
                                    searchText: `${config.name} ${field.label} ${field.description || ''}`.toLowerCase()
                                }))), onAdd: (fieldId) => {
                                    const currentServices = formData.autoAddServices || [];
                                    updateField('autoAddServices', [...currentServices, fieldId]);
                                }, onRemove: (fieldId) => {
                                    const currentServices = formData.autoAddServices || [];
                                    updateField('autoAddServices', currentServices.filter(f => f !== fieldId));
                                }, groupBy: true, helpText: "When this service is added to a scenario, check specific client configuration field values to determine auto-add behavior. Select which configuration fields should trigger the auto-add.", emptyMessage: "No configuration fields available. Create configuration fields in the admin panel.", multiple: true })] }) }), _jsx("div", { className: "flex-shrink-0 bg-background border-t px-6 py-4", children: _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: handleSave, disabled: !isValid || isSaving || isDeleting || parentIsSaving, className: "flex-1 relative", children: (isSaving || parentIsSaving) ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), parentSaveProgress || 'Saving...'] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Save Service"] })) }), !isCreating && service && onDelete && (_jsxs(Button, { onClick: handleDelete, variant: "destructive", disabled: isSaving || isDeleting, children: [_jsx(Trash2, { className: "h-4 w-4 mr-2" }), isDeleting ? 'Deleting...' : 'Delete'] })), _jsxs(Button, { onClick: onClose, variant: "outline", children: [_jsx(X, { className: "h-4 w-4 mr-2" }), "Cancel"] })] }) })] }) }));
}
