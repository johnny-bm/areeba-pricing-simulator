import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { StandardDialog } from '../StandardDialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { TableCell } from '../ui/table';
import { Plus, Trash2, Copy } from 'lucide-react';
import { NumberInput } from '../NumberInput';
import { DraggableTable } from '../DraggableTable';
export function ConfigurationDialog({ isOpen, onClose, onSave, onDelete, onDuplicate, configuration, configurations, isCreating }) {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        isActive: true,
        order: 1,
        fields: []
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    // Prevent ESC from bubbling up to parent when dialog is open
    useEffect(() => {
        if (!isOpen)
            return;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.stopPropagation();
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown, { capture: true });
        return () => document.removeEventListener('keydown', handleKeyDown, { capture: true });
    }, [isOpen, onClose]);
    useEffect(() => {
        if (isOpen) {
            if (configuration && !isCreating) {
                // Edit mode
                setFormData({ ...configuration });
            }
            else {
                // Create mode
                setFormData({
                    id: '',
                    name: '',
                    description: '',
                    isActive: true,
                    order: (configurations.length + 1),
                    fields: []
                });
            }
        }
    }, [isOpen, configuration, isCreating, configurations]);
    const handleSave = async () => {
        try {
            setIsSaving(true);
            const newConfig = {
                ...formData,
                id: formData.id || `config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            };
            await onSave(newConfig);
            onClose();
        }
        catch (error) {
            console.error('Failed to save configuration:', error);
            alert(`Failed to save configuration: ${error.message || 'Unknown error'}`);
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleDelete = async () => {
        if (!configuration || isCreating || !onDelete)
            return;
        const confirmDelete = window.confirm(`Are you sure you want to delete the configuration "${configuration.name}"? This action cannot be undone.`);
        if (!confirmDelete)
            return;
        try {
            setIsDeleting(true);
            await onDelete(configuration);
            onClose();
        }
        catch (error) {
            console.error('Failed to delete configuration:', error);
            alert(`Failed to delete configuration: ${error.message || 'Unknown error'}`);
        }
        finally {
            setIsDeleting(false);
        }
    };
    const handleDuplicate = async () => {
        if (!configuration || !onDuplicate)
            return;
        try {
            setIsDuplicating(true);
            const duplicatedConfig = {
                ...configuration,
                id: `config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: `${configuration.name} (Copy)`,
                order: configurations.length + 1
            };
            await onDuplicate(duplicatedConfig);
            onClose();
        }
        catch (error) {
            console.error('Failed to duplicate configuration:', error);
            alert(`Failed to duplicate configuration: ${error.message || 'Unknown error'}`);
        }
        finally {
            setIsDuplicating(false);
        }
    };
    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const addConfigurationField = () => {
        const newField = {
            id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: '',
            label: '',
            type: 'string',
            defaultValue: '',
            required: false,
            order: formData.fields.length + 1
        };
        updateField('fields', [...formData.fields, newField]);
    };
    const updateConfigurationFieldData = (fieldId, updates) => {
        const updatedFields = formData.fields.map(field => field.id === fieldId ? { ...field, ...updates } : field);
        updateField('fields', updatedFields);
    };
    const removeConfigurationField = (fieldId) => {
        const updatedFields = formData.fields.filter(field => field.id !== fieldId);
        updateField('fields', updatedFields);
    };
    const handleFieldReorder = (reorderedFields) => {
        // Update order values based on new positions
        const fieldsWithUpdatedOrder = reorderedFields.map((field, index) => ({
            ...field,
            order: index + 1
        }));
        updateField('fields', fieldsWithUpdatedOrder);
    };
    const isValid = formData.name.trim() && formData.description.trim();
    return (_jsx(StandardDialog, { isOpen: isOpen, onClose: onClose, title: isCreating ? 'Create New Configuration' : 'Edit Configuration', description: isCreating
            ? 'Create a new configuration template with custom fields for client data collection.'
            : 'Modify the configuration template and its associated fields.', size: "full", destructiveActions: !isCreating && configuration && onDelete ? [{
                label: isDeleting ? 'Deleting...' : 'Delete',
                onClick: handleDelete,
                loading: isDeleting,
                disabled: isSaving || isDuplicating,
                icon: _jsx(Trash2, { className: "h-4 w-4" })
            }] : [], secondaryActions: [
            ...(!isCreating && configuration && onDuplicate ? [{
                    label: isDuplicating ? 'Duplicating...' : 'Duplicate',
                    onClick: handleDuplicate,
                    loading: isDuplicating,
                    disabled: isSaving || isDeleting,
                    icon: _jsx(Copy, { className: "h-4 w-4" })
                }] : []),
            {
                label: 'Cancel',
                onClick: onClose
            }
        ], primaryAction: {
            label: isSaving ? 'Saving...' : 'Save Configuration',
            onClick: handleSave,
            loading: isSaving,
            disabled: !isValid || isDeleting || isDuplicating
        }, children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "config-name", children: "Configuration Name *" }), _jsx(Input, { id: "config-name", value: formData.name, onChange: (e) => updateField('name', e.target.value), placeholder: "Enter configuration name" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "config-order", children: "Display Order" }), _jsx(NumberInput, { value: formData.order, onChange: (value) => updateField('order', value), placeholder: "1", allowDecimals: false })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "config-description", children: "Description *" }), _jsx(Textarea, { id: "config-description", value: formData.description, onChange: (e) => updateField('description', e.target.value), placeholder: "Describe this configuration (required)", rows: 2 })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { checked: formData.isActive, onCheckedChange: (checked) => updateField('isActive', checked) }), _jsx(Label, { children: "Active Configuration" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx(Label, { children: "Configuration Fields" }), _jsxs(Button, { onClick: addConfigurationField, size: "sm", variant: "outline", children: [_jsx(Plus, { className: "h-4 w-4 mr-1" }), "Add Field"] })] }), formData.fields.length > 0 ? (_jsx(DraggableTable, { headers: ['Field Name', 'Label', 'Type', 'Default', 'Required', 'Order', 'Actions'], items: formData.fields.sort((a, b) => a.order - b.order), onReorder: handleFieldReorder, getItemKey: (field) => field.id, renderRow: (field) => (_jsxs(_Fragment, { children: [_jsx(TableCell, { children: _jsx(Input, { value: field.name, onChange: (e) => updateConfigurationFieldData(field.id, { name: e.target.value }), placeholder: "field_name", className: "h-8" }) }), _jsx(TableCell, { children: _jsx(Input, { value: field.label || '', onChange: (e) => updateConfigurationFieldData(field.id, { label: e.target.value }), placeholder: "Display Label", className: "h-8" }) }), _jsx(TableCell, { children: _jsxs(Select, { value: field.type, onValueChange: (value) => updateConfigurationFieldData(field.id, { type: value }), children: [_jsx(SelectTrigger, { className: "h-8", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "string", children: "Text" }), _jsx(SelectItem, { value: "number", children: "Number" }), _jsx(SelectItem, { value: "boolean", children: "Checkbox" })] })] }) }), _jsx(TableCell, { children: field.type === 'boolean' ? (_jsx(Checkbox, { checked: field.defaultValue, onCheckedChange: (checked) => updateConfigurationFieldData(field.id, { defaultValue: checked === true }) })) : field.type === 'number' ? (_jsx(NumberInput, { value: field.defaultValue, onChange: (value) => updateConfigurationFieldData(field.id, { defaultValue: value }), className: "h-8" })) : (_jsx(Input, { value: field.defaultValue, onChange: (e) => updateConfigurationFieldData(field.id, { defaultValue: e.target.value }), placeholder: "Default value", className: "h-8" })) }), _jsx(TableCell, { children: _jsx(Checkbox, { checked: field.required || false, onCheckedChange: (checked) => updateConfigurationFieldData(field.id, { required: checked === true }) }) }), _jsx(TableCell, { children: _jsx(NumberInput, { value: field.order, onChange: (value) => updateConfigurationFieldData(field.id, { order: value }), min: 1, max: 100, className: "h-8 w-16" }) }), _jsx(TableCell, { children: _jsx(Button, { onClick: () => removeConfigurationField(field.id), size: "sm", variant: "ghost", children: _jsx(Trash2, { className: "h-3 w-3" }) }) })] })) })) : (_jsxs("div", { className: "text-center py-8 text-muted-foreground border border-dashed rounded-lg", children: [_jsx("p", { children: "No fields added yet." }), _jsx("p", { className: "text-xs", children: "Click \"Add Field\" to create configuration fields." })] }))] })] }) }));
}
