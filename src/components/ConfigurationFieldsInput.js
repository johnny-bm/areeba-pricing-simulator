import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Plus } from 'lucide-react';
export function ConfigurationFieldsInput({ selectedFieldIds, configurations, onAddField, onRemoveField }) {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    // Create a flat list of all available fields with config context
    const allFields = configurations.flatMap(config => (config.fields || []).map(field => ({
        ...field,
        configName: config.name,
        configId: config.id,
        displayName: `${config.name}: ${field.label}`,
        searchText: `${config.name} ${field.label} ${field.description || ''}`.toLowerCase()
    })));
    // Get selected field objects for display
    const selectedFields = allFields.filter(field => selectedFieldIds.includes(field.id));
    // Filter available fields to exclude already selected ones
    const availableFields = allFields.filter(field => !selectedFieldIds.includes(field.id));
    // Filter based on input value
    const filteredFields = availableFields.filter(field => field.searchText.includes(inputValue.toLowerCase()));
    const handleAddField = (fieldId) => {
        if (fieldId && !selectedFieldIds.includes(fieldId)) {
            onAddField(fieldId);
            setInputValue('');
            // Keep dropdown open for adding multiple fields
        }
    };
    const handleInputKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setInputValue('');
        }
    };
    const handleInputClick = () => {
        setIsOpen(true);
    };
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        if (!isOpen) {
            setIsOpen(true);
        }
    };
    return (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Configuration-Based Quantity (Auto-quantity from client config)" }), selectedFields.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2 mb-2", children: selectedFields.map(field => (_jsxs(Badge, { variant: "secondary", className: "text-xs", children: [_jsxs("span", { className: "font-medium", children: [field.configName, ":"] }), _jsx("span", { className: "ml-1", children: field.label }), _jsx(Button, { size: "sm", variant: "ghost", className: "h-auto p-0 ml-1", onClick: () => onRemoveField(field.id), children: _jsx(X, { className: "h-3 w-3" }) })] }, field.id))) })), _jsxs("div", { className: "relative", children: [_jsx(Input, { placeholder: "Search configuration fields to add auto-quantity...", value: inputValue, onChange: handleInputChange, onKeyDown: handleInputKeyDown, onFocus: handleInputClick, onBlur: (e) => {
                            // Only close if not clicking on the dropdown
                            setTimeout(() => {
                                if (!e.relatedTarget?.closest('.config-fields-dropdown')) {
                                    setIsOpen(false);
                                }
                            }, 100);
                        } }), isOpen && (_jsxs("div", { className: "config-fields-dropdown absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-md", children: [_jsx("div", { className: "border-b px-3 py-2", children: _jsx("div", { className: "text-xs font-medium text-muted-foreground mb-1", children: filteredFields.length > 0
                                        ? 'Select configuration fields for auto-quantity:'
                                        : inputValue.trim()
                                            ? 'No matching fields found'
                                            : 'Available configuration fields:' }) }), _jsx("div", { className: "max-h-48 overflow-y-auto", children: filteredFields.length > 0 ? (_jsx("div", { className: "py-1", children: filteredFields.map((field) => (_jsx("div", { onClick: () => handleAddField(field.id), className: "cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "outline", className: "text-xs", children: field.configName }), _jsx("span", { className: "font-medium", children: field.label })] }), field.description && (_jsx("div", { className: "text-xs text-muted-foreground mt-1", children: field.description }))] }), _jsx(Plus, { className: "h-4 w-4 text-muted-foreground" })] }) }, field.id))) })) : availableFields.length === 0 ? (_jsx("div", { className: "px-3 py-4 text-sm text-muted-foreground text-center", children: selectedFields.length > 0
                                        ? 'All available fields are selected'
                                        : 'No configuration fields available' })) : (_jsxs("div", { className: "px-3 py-4 text-sm text-muted-foreground text-center", children: ["No fields match \"", inputValue, "\""] })) })] }))] }), configurations.length === 0 && (_jsx("div", { className: "text-sm text-muted-foreground p-4 border border-dashed rounded-md", children: "No active configuration fields found. Create configuration fields in the admin panel to enable auto-quantity mapping." })), _jsx("p", { className: "text-xs text-muted-foreground", children: "Service quantity will automatically match values from selected client configuration fields. Leave empty for manual quantity entry." })] }));
}
