import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Collapsible, CollapsibleContent } from "./ui/collapsible";
import { NumberInput } from "./NumberInput";
import { useEffect, useState, useRef } from "react";
import { api } from "../utils/api";
import { CardHeaderWithCollapse } from "./CardHeaderWithCollapse";
export function DynamicClientConfigBar({ config, onConfigChange, isGuestMode = false }) {
    const [configurations, setConfigurations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [collapsedCards, setCollapsedCards] = useState(new Set());
    const [isMainContentCollapsed, setIsMainContentCollapsed] = useState(false);
    const hasInitialized = useRef(false);
    // Load configuration definitions on mount
    useEffect(() => {
        const loadConfigurations = async () => {
            try {
                setIsLoading(true);
                const loadedConfigurations = await api.loadConfigurations();
                const activeConfigurations = loadedConfigurations.filter(config => config.isActive);
                // Use only what's in the database - no auto-generation of default cards
                setConfigurations(activeConfigurations);
                // 🔧 CRITICAL FIX: Initialize all field values with defaults if they don't exist
                if (!hasInitialized.current) {
                    const updatedConfigValues = { ...config.configValues };
                    let hasNewFields = false;
                    activeConfigurations.forEach(configDef => {
                        configDef.fields.forEach(field => {
                            if (updatedConfigValues[field.id] === undefined) {
                                updatedConfigValues[field.id] = field.defaultValue;
                                hasNewFields = true;
                            }
                        });
                    });
                    // Update config if we added new fields
                    if (hasNewFields) {
                        onConfigChange({
                            ...config,
                            configValues: updatedConfigValues
                        });
                    }
                    hasInitialized.current = true;
                }
            }
            catch (error) {
                console.error('Failed to load configurations:', error);
                // Fall back to empty array if loading fails
                setConfigurations([]);
            }
            finally {
                setIsLoading(false);
            }
        };
        loadConfigurations();
    }, []); // Only run on mount to avoid infinite loops
    const updateConfigValue = (fieldId, value) => {
        onConfigChange({
            ...config,
            configValues: {
                ...config.configValues,
                [fieldId]: value
            }
        });
    };
    const updateCoreField = (field, value) => {
        onConfigChange({
            ...config,
            [field]: value
        });
    };
    const getFieldValue = (fieldId, defaultValue, fieldLabel) => {
        // Check if it's a core field (top-level in config) by ID or label
        const isPreparedBy = fieldId === 'preparedBy' || fieldLabel?.toLowerCase() === 'prepared by';
        const isClientName = fieldId === 'clientName' || fieldLabel?.toLowerCase() === 'client name';
        const isProjectName = fieldId === 'projectName' || fieldLabel?.toLowerCase() === 'project name';
        if (isPreparedBy || isClientName || isProjectName) {
            // Determine which config field to access
            let configKey;
            if (isPreparedBy)
                configKey = 'preparedBy';
            else if (isClientName)
                configKey = 'clientName';
            else
                configKey = 'projectName';
            let value = config[configKey] !== undefined ? config[configKey] : defaultValue;
            // Special handling for preparedBy - always use the logged-in user's name
            if (isPreparedBy && !value) {
                const userData = JSON.parse(localStorage.getItem('user') || '{}');
                value = userData.first_name && userData.last_name
                    ? `${userData.first_name} ${userData.last_name}`
                    : userData.email || '';
            }
            return value;
        }
        // Otherwise, get from configValues
        return config.configValues[fieldId] !== undefined ? config.configValues[fieldId] : defaultValue;
    };
    const toggleCardCollapse = (cardId) => {
        setCollapsedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(cardId)) {
                newSet.delete(cardId);
            }
            else {
                newSet.add(cardId);
            }
            return newSet;
        });
    };
    const isCardCollapsed = (cardId) => collapsedCards.has(cardId);
    const handleToggleAllCards = () => {
        setIsMainContentCollapsed(prev => !prev);
    };
    if (isLoading) {
        return (_jsx("div", { className: "space-y-3 mb-6", children: _jsxs(Card, { children: [_jsx("div", { className: "pb-4 border-b p-6", children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-4 bg-muted rounded w-32 mb-2" }), _jsx("div", { className: "h-3 bg-muted rounded w-48" })] }) }), _jsx(CardContent, { className: "pt-6", children: _jsx("div", { className: "animate-pulse", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: Array.from({ length: 3 }).map((_, i) => (_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "h-3 bg-muted rounded w-20" }), _jsx("div", { className: "h-8 bg-muted rounded" })] }, i))) }) }) })] }) }));
    }
    // Sort configurations by order
    const sortedConfigurations = [...configurations].sort((a, b) => (a.order || 0) - (b.order || 0));
    return (_jsx("div", { className: "mb-6", children: sortedConfigurations.length > 0 ? (_jsxs(Card, { children: [_jsx(CardHeaderWithCollapse, { title: "Client Configuration", description: `${sortedConfigurations.length} configuration card${sortedConfigurations.length !== 1 ? 's' : ''}`, isCollapsed: isMainContentCollapsed, onToggle: handleToggleAllCards, showCollapseButton: sortedConfigurations.length >= 1 }), _jsx(Collapsible, { open: !isMainContentCollapsed, children: _jsx(CollapsibleContent, { className: "animate-collapsible-down data-[state=closed]:animate-collapsible-up", children: _jsx(CardContent, { className: "py-[0px] px-[24px]", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: sortedConfigurations.map((configDef) => {
                                    // Calculate filled fields count
                                    const filledFieldsCount = configDef.fields?.filter(field => {
                                        const value = config.configValues[field.id];
                                        if (typeof value === 'boolean')
                                            return value;
                                        if (typeof value === 'number')
                                            return value > 0;
                                        if (typeof value === 'string')
                                            return value.trim() !== '';
                                        return false;
                                    }).length || 0;
                                    const totalFieldsCount = configDef.fields?.length || 0;
                                    const fieldStatusDescription = `${filledFieldsCount} of ${totalFieldsCount} fields filled`;
                                    return (_jsx(Card, { children: _jsxs(Collapsible, { open: !isCardCollapsed(configDef.id), onOpenChange: () => toggleCardCollapse(configDef.id), children: [_jsx(CardHeaderWithCollapse, { title: configDef.name, description: fieldStatusDescription, isCollapsed: isCardCollapsed(configDef.id), onToggle: () => toggleCardCollapse(configDef.id), variant: "sub" }), _jsx(CollapsibleContent, { className: "animate-collapsible-down data-[state=closed]:animate-collapsible-up", children: _jsx(CardContent, { className: "pt-4", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: configDef.fields
                                                                ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                                                                .map((field) => {
                                                                // Hide "Prepared By" field in guest mode
                                                                const isPreparedByField = field.id === 'preparedBy' || field.label?.toLowerCase() === 'prepared by';
                                                                if (isGuestMode && isPreparedByField) {
                                                                    return null;
                                                                }
                                                                const currentValue = getFieldValue(field.id, field.defaultValue, field.label);
                                                                return (_jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { htmlFor: field.id, className: "text-sm", children: [field.label, field.required && _jsx("span", { className: "text-destructive ml-1", children: "*" })] }), field.type === 'string' && (_jsx(Input, { id: field.id, value: currentValue, onChange: (e) => {
                                                                                // Check both field.id and field.label for core fields
                                                                                const isPreparedBy = field.id === 'preparedBy' || field.label?.toLowerCase() === 'prepared by';
                                                                                const isClientName = field.id === 'clientName' || field.label?.toLowerCase() === 'client name';
                                                                                const isProjectName = field.id === 'projectName' || field.label?.toLowerCase() === 'project name';
                                                                                if (isClientName) {
                                                                                    updateCoreField('clientName', e.target.value);
                                                                                }
                                                                                else if (isProjectName) {
                                                                                    updateCoreField('projectName', e.target.value);
                                                                                }
                                                                                else if (isPreparedBy) {
                                                                                    updateCoreField('preparedBy', e.target.value);
                                                                                }
                                                                                else {
                                                                                    updateConfigValue(field.id, e.target.value);
                                                                                }
                                                                            }, placeholder: `Enter ${field.label?.toLowerCase() || 'value'}`, className: `h-8 ${currentValue ? 'bg-white border-border-filled shadow-sm' : ''} ${(field.id === 'preparedBy' || field.label?.toLowerCase() === 'prepared by') ? 'bg-muted cursor-not-allowed' : ''}`, required: field.required, disabled: field.id === 'preparedBy' || field.label?.toLowerCase() === 'prepared by' })), field.type === 'number' && (_jsx(NumberInput, { id: field.id, value: currentValue, onChange: (value) => updateConfigValue(field.id, value), placeholder: `Enter ${field.label?.toLowerCase() || 'value'}`, className: `h-8 ${currentValue ? 'bg-white border-border-filled shadow-sm' : ''}`, min: field.min, max: field.max, step: field.step })), field.type === 'boolean' && (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: field.id, checked: currentValue, onCheckedChange: (checked) => updateConfigValue(field.id, checked === true) }), _jsxs(Label, { htmlFor: field.id, className: "text-sm", children: ["Enable ", field.label] })] })), field.description && (_jsx("p", { className: "text-xs text-muted-foreground", children: field.description }))] }, field.id));
                                                            }) }) }) })] }) }, configDef.id));
                                }) }) }) }) })] })) : (_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "text-center text-muted-foreground", children: [_jsx("p", { className: "text-sm", children: "No configuration cards available." }), _jsx("p", { className: "text-xs mt-1", children: "Contact your admin to set up configuration cards." })] }) }) })) }));
}
