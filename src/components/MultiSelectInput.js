import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Plus } from 'lucide-react';
export function MultiSelectInput({ label, placeholder, selectedValues, options, onAdd, onRemove, allowCreateNew = false, helpText, emptyMessage = 'No options available', groupBy = false, multiple = true }) {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    // Get selected option objects for display
    const selectedOptions = options.filter(option => selectedValues.includes(option.id));
    // Filter available options to exclude already selected ones (if multiple is false, show all)
    const availableOptions = multiple
        ? options.filter(option => !selectedValues.includes(option.id))
        : options;
    // Filter based on input value
    const filteredOptions = availableOptions.filter(option => {
        const searchText = option.searchText || `${option.label} ${option.description || ''}`.toLowerCase();
        return searchText.includes(inputValue.toLowerCase());
    });
    // Group options if requested
    const groupedOptions = groupBy
        ? filteredOptions.reduce((groups, option) => {
            const groupName = option.groupName || 'Other';
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(option);
            return groups;
        }, {})
        : { 'All': filteredOptions };
    const handleAdd = (value) => {
        if (value.trim() && (multiple || !selectedValues.includes(value.trim()))) {
            onAdd(value.trim());
            setInputValue('');
            // For single select, close dropdown after selection
            if (!multiple) {
                setIsOpen(false);
            }
        }
    };
    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputValue.trim() && allowCreateNew) {
                handleAdd(inputValue);
            }
        }
        else if (e.key === 'Escape') {
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
    const canCreateNew = allowCreateNew && inputValue.trim() && !options.some(opt => opt.label.toLowerCase() === inputValue.trim().toLowerCase());
    return (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: label }), selectedOptions.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2 mb-2", children: selectedOptions.map(option => (_jsxs(Badge, { variant: "secondary", className: "text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900", children: [option.groupName && (_jsxs("span", { className: "font-medium", children: [option.groupName, ":"] })), _jsx("span", { className: option.groupName ? "ml-1" : "", children: option.label }), _jsx(Button, { size: "sm", variant: "ghost", className: "h-auto p-0 ml-1", onClick: () => onRemove(option.id), children: _jsx(X, { className: "h-3 w-3" }) })] }, option.id))) })), _jsxs("div", { className: "relative", children: [_jsx(Input, { placeholder: placeholder, value: inputValue, onChange: handleInputChange, onKeyDown: handleInputKeyDown, onFocus: handleInputClick, onBlur: (e) => {
                            // Only close if not clicking on the dropdown
                            setTimeout(() => {
                                if (!e.relatedTarget?.closest('.multi-select-dropdown')) {
                                    setIsOpen(false);
                                }
                            }, 100);
                        } }), canCreateNew && (_jsxs(Button, { size: "sm", variant: "ghost", className: "absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2", onClick: () => handleAdd(inputValue), children: [_jsx(Plus, { className: "h-3 w-3 mr-1" }), "Add \"", inputValue, "\""] })), isOpen && (_jsxs("div", { className: "multi-select-dropdown absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-md", children: [_jsx("div", { className: "border-b px-3 py-2", children: _jsx("div", { className: "text-xs font-medium text-muted-foreground mb-1", children: Object.keys(groupedOptions).some(key => groupedOptions[key].length > 0)
                                        ? multiple
                                            ? 'Select options:'
                                            : 'Select option:'
                                        : inputValue.trim()
                                            ? 'No matching options found'
                                            : emptyMessage }) }), _jsxs("div", { className: "max-h-48 overflow-y-auto", children: [Object.keys(groupedOptions).some(key => groupedOptions[key].length > 0) ? (_jsx("div", { className: "py-1", children: Object.entries(groupedOptions).map(([groupName, groupOptions]) => (groupOptions.length > 0 && (_jsxs("div", { children: [groupBy && Object.keys(groupedOptions).length > 1 && (_jsx("div", { className: "px-3 py-1 text-xs font-medium text-muted-foreground bg-muted/50 border-b", children: groupName })), groupOptions.map((option) => (_jsx("div", { onClick: () => handleAdd(option.id), className: "cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [option.groupName && !groupBy && (_jsx(Badge, { variant: "outline", className: "text-xs", children: option.groupName })), _jsx("span", { className: "font-medium", children: option.label })] }), option.description && (_jsx("div", { className: "text-xs text-muted-foreground mt-1", children: option.description }))] }), _jsx(Plus, { className: "h-4 w-4 text-muted-foreground" })] }) }, option.id)))] }, groupName)))) })) : (_jsx("div", { className: "px-3 py-4 text-sm text-muted-foreground text-center", children: options.length === 0
                                            ? emptyMessage
                                            : inputValue.trim()
                                                ? `No options match "${inputValue}"`
                                                : multiple && selectedOptions.length === options.length
                                                    ? 'All available options are selected'
                                                    : 'No options available' })), canCreateNew && (_jsx("div", { className: "py-1 border-t", children: _jsxs("div", { onClick: () => handleAdd(inputValue), className: "cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center bg-muted/50", children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), _jsxs("span", { children: ["Create new: ", _jsxs("strong", { children: ["\"", inputValue.trim(), "\""] })] })] }) }))] })] }))] }), helpText && (_jsx("p", { className: "text-xs text-muted-foreground", children: helpText }))] }));
}
