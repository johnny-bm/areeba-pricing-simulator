import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Link2, ArrowRight, Zap, RotateCcw, Info, Bug } from 'lucide-react';
import { updateServiceMappings } from '../utils/autoAddLogic';
import { saveAdminSelection, removeAdminSelection } from '../utils/adminSelectionPersistence';
export function AutoAddConfigPanel({ services, clientConfig, configurations, serviceMappings, autoAddConfig, onUpdateServiceMappings, onUpdateAutoAddConfig }) {
    const [selectedService, setSelectedService] = useState('');
    const [showDebugger, setShowDebugger] = useState(false);
    // Load persisted selection on mount
    useEffect(() => {
        const persistedSelection = localStorage.getItem('autoAddConfigPanel.selectedService');
        if (persistedSelection && services.some(service => service.id === persistedSelection)) {
            setSelectedService(persistedSelection);
        }
    }, [services]);
    // Persist selection changes (with race condition protection)
    const handleSelectedServiceChange = (serviceId) => {
        setSelectedService(serviceId);
        if (serviceId) {
            saveAdminSelection('AUTO_ADD_CONFIG', serviceId);
        }
        else {
            removeAdminSelection('AUTO_ADD_CONFIG');
        }
    };
    // Get all config fields from active configurations
    const allConfigFields = configurations
        .filter(config => config.isActive)
        .flatMap(config => config.fields)
        .filter(field => field.type === 'boolean' || field.type === 'number');
    // Convert service mappings to auto-add config format
    const convertMappingsToAutoAddConfig = (mappings) => {
        const autoAddRules = {};
        const quantityRules = {};
        console.log('🔄 AutoAdd: Converting mappings to auto-add config:', {
            mappingsKeys: Object.keys(mappings),
            mappingsCount: Object.keys(mappings).length,
            sampleMapping: Object.entries(mappings)[0]
        });
        Object.entries(mappings).forEach(([serviceId, mapping]) => {
            if (mapping.autoAdd && mapping.configField) {
                // Add to auto-add rules
                if (!autoAddRules[mapping.configField]) {
                    autoAddRules[mapping.configField] = [];
                }
                if (!autoAddRules[mapping.configField].includes(serviceId)) {
                    autoAddRules[mapping.configField].push(serviceId);
                }
                // Add to quantity rules if sync is enabled
                if (mapping.syncQuantity && mapping.triggerCondition === 'number') {
                    quantityRules[serviceId] = {
                        field: mapping.configField,
                        multiplier: mapping.quantityMultiplier || 1
                    };
                }
            }
        });
        const result = { autoAddRules, quantityRules };
        console.log('🔄 AutoAdd: Conversion result:', {
            autoAddRulesCount: Object.keys(autoAddRules).length,
            quantityRulesCount: Object.keys(quantityRules).length,
            autoAddRules,
            quantityRules
        });
        return result;
    };
    const handleServiceMappingUpdate = (serviceId, mapping) => {
        console.log('🔧 AutoAdd: Updating service mapping:', { serviceId, mapping });
        const updatedMappings = updateServiceMappings(serviceMappings, serviceId, mapping);
        console.log('🔧 AutoAdd: Updated mappings:', updatedMappings);
        onUpdateServiceMappings(updatedMappings);
        // Also update the auto-add configuration to match
        const newAutoAddConfig = convertMappingsToAutoAddConfig(updatedMappings);
        console.log('🔧 AutoAdd: Updating auto-add config:', newAutoAddConfig);
        onUpdateAutoAddConfig(newAutoAddConfig);
    };
    const handleClearMapping = (serviceId) => {
        console.log('🗑️ AutoAdd: Clearing mapping for service:', serviceId);
        const updatedMappings = updateServiceMappings(serviceMappings, serviceId, {});
        console.log('🗑️ AutoAdd: Mappings after clearing:', updatedMappings);
        onUpdateServiceMappings(updatedMappings);
        // Also update the auto-add configuration to match
        const newAutoAddConfig = convertMappingsToAutoAddConfig(updatedMappings);
        console.log('🗑️ AutoAdd: Auto-add config after clearing:', newAutoAddConfig);
        onUpdateAutoAddConfig(newAutoAddConfig);
    };
    const getMappedServicesCount = () => {
        return Object.keys(serviceMappings).length;
    };
    const getAutoAddServicesCount = () => {
        return Object.values(serviceMappings).filter((mapping) => mapping.autoAdd).length;
    };
    const getServiceMapping = (serviceId) => {
        return serviceMappings[serviceId];
    };
    const selectedServiceData = services.find(s => s.id === selectedService);
    const selectedServiceMapping = selectedServiceData ? getServiceMapping(selectedServiceData.id) : null;
    // Get status of auto-add rules
    const getAutoAddStatus = () => {
        const activeRules = Object.entries(autoAddConfig.autoAddRules).filter(([fieldId, serviceIds]) => {
            const configValue = clientConfig.configValues[fieldId];
            return configValue && (typeof configValue === 'boolean' && configValue || typeof configValue === 'number' && configValue > 0);
        });
        const triggeredServices = new Set();
        activeRules.forEach(([_, serviceIds]) => {
            serviceIds.forEach(id => triggeredServices.add(id));
        });
        return {
            activeRules: activeRules.length,
            triggeredServices: triggeredServices.size
        };
    };
    const autoAddStatus = getAutoAddStatus();
    return (_jsxs(Dialog, { children: [_jsx(DialogTrigger, { asChild: true }), _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-hidden", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(Link2, { className: "h-5 w-5" }), "Auto-Add & Quantity Sync Configuration"] }) }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsx(Card, { className: "p-4", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-semibold text-blue-600", children: getMappedServicesCount() }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Mapped Services" })] }) }), _jsx(Card, { className: "p-4", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-semibold text-green-600", children: getAutoAddServicesCount() }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Auto-Add Enabled" })] }) }), _jsx(Card, { className: "p-4", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-semibold text-orange-600", children: autoAddStatus.triggeredServices }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Currently Triggered" })] }) })] }), allConfigFields.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "p-6 text-center", children: [_jsx(Info, { className: "h-8 w-8 mx-auto mb-2 text-muted-foreground" }), _jsx("p", { className: "text-muted-foreground", children: "No configuration fields available for auto-add setup." }), _jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "Configure fields in the admin panel first." })] }) })) : (_jsxs(_Fragment, { children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Service Configuration" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Select Service to Configure" }), _jsxs(Select, { value: selectedService, onValueChange: handleSelectedServiceChange, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Choose a service..." }) }), _jsx(SelectContent, { children: _jsx(ScrollArea, { className: "h-[200px]", children: services.map(service => {
                                                                                const mapping = getServiceMapping(service.id);
                                                                                return (_jsx(SelectItem, { value: service.id, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { children: service.name }), mapping ? (_jsx(Badge, { variant: "secondary", className: "text-xs", children: "Mapped" })) : (_jsx(Badge, { variant: "outline", className: "text-xs", children: "Not Mapped" }))] }) }, service.id));
                                                                            }) }) })] })] }), selectedServiceData && (_jsxs(Card, { className: "border-muted", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: selectedServiceData.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: selectedServiceData.description })] }), selectedServiceMapping && (_jsx(Button, { variant: "outline", size: "sm", onClick: () => handleClearMapping(selectedServiceData.id), children: "Clear Mapping" }))] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Link to Configuration Field" }), _jsxs(Select, { value: selectedServiceMapping?.configField || '', onValueChange: (field) => {
                                                                                    const fieldDescriptor = allConfigFields.find(f => f.id === field);
                                                                                    handleServiceMappingUpdate(selectedServiceData.id, {
                                                                                        configField: field,
                                                                                        triggerCondition: fieldDescriptor?.type === 'boolean' ? 'boolean' : 'number',
                                                                                        autoAdd: true,
                                                                                        syncQuantity: fieldDescriptor?.type === 'number'
                                                                                    });
                                                                                }, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select configuration field..." }) }), _jsx(SelectContent, { children: _jsx(ScrollArea, { className: "h-[150px]", children: allConfigFields.map(field => (_jsx(SelectItem, { value: field.id, children: _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: field.label || field.name }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [field.description, " (", field.type, ")"] })] }) }, field.id))) }) })] })] }), selectedServiceMapping && (_jsxs(_Fragment, { children: [_jsx(Separator, {}), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-1", children: [_jsxs(Label, { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "h-4 w-4" }), "Auto-Add Service"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Automatically add this service when the config field is enabled/has value" })] }), _jsx(Switch, { checked: selectedServiceMapping.autoAdd, onCheckedChange: (checked) => handleServiceMappingUpdate(selectedServiceData.id, {
                                                                                                    ...selectedServiceMapping,
                                                                                                    autoAdd: checked
                                                                                                }) })] }), selectedServiceMapping.triggerCondition === 'number' && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-1", children: [_jsxs(Label, { className: "flex items-center gap-2", children: [_jsx(RotateCcw, { className: "h-4 w-4" }), "Sync Quantity"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Keep service quantity in sync with the config field value" })] }), _jsx(Switch, { checked: selectedServiceMapping.syncQuantity, onCheckedChange: (checked) => handleServiceMappingUpdate(selectedServiceData.id, {
                                                                                                    ...selectedServiceMapping,
                                                                                                    syncQuantity: checked
                                                                                                }) })] }))] }), _jsxs("div", { className: "bg-muted/50 rounded-lg p-3", children: [_jsxs("div", { className: "text-sm font-medium mb-2 flex items-center gap-2", children: [_jsx(ArrowRight, { className: "h-4 w-4" }), "Configuration Preview"] }), _jsxs("div", { className: "text-xs space-y-1", children: [_jsxs("div", { children: ["\u2022 Linked to: ", allConfigFields.find(f => f.id === selectedServiceMapping.configField)?.label || selectedServiceMapping.configField] }), _jsxs("div", { children: ["\u2022 Auto-add: ", selectedServiceMapping.autoAdd ? 'Yes' : 'No'] }), _jsxs("div", { children: ["\u2022 Sync quantity: ", selectedServiceMapping.syncQuantity ? 'Yes' : 'No'] }), _jsxs("div", { className: "mt-2 pt-2 border-t border-muted", children: ["Current config value: ", String(clientConfig.configValues[selectedServiceMapping.configField] || 'Not set')] })] })] })] }))] })] }))] })] }), getMappedServicesCount() > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Current Configuration Summary" }) }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-[200px]", children: _jsx("div", { className: "space-y-3", children: Object.entries(serviceMappings).map(([serviceId, mapping]) => {
                                                            const service = services.find(s => s.id === serviceId);
                                                            const configField = allConfigFields.find(f => f.id === mapping.configField);
                                                            const currentValue = clientConfig.configValues[mapping.configField];
                                                            if (!service || !configField)
                                                                return null;
                                                            const isActive = currentValue && ((typeof currentValue === 'boolean' && currentValue) ||
                                                                (typeof currentValue === 'number' && currentValue > 0));
                                                            return (_jsxs("div", { className: "border rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("div", { className: "font-medium", children: service.name }), _jsxs("div", { className: "flex items-center gap-2", children: [mapping.autoAdd && (_jsxs("span", { className: cn("inline-flex items-center rounded-md text-xs px-2 py-1 font-medium transition-colors", isActive
                                                                                            ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900"
                                                                                            : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900"), children: [_jsx(Zap, { className: "h-3 w-3 mr-1" }), "Auto-Add"] })), mapping.syncQuantity && (_jsxs("span", { className: "inline-flex items-center rounded-md text-xs px-2 py-1 font-medium transition-colors bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900", children: [_jsx(RotateCcw, { className: "h-3 w-3 mr-1" }), "Sync"] }))] })] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [_jsxs("div", { children: ["Linked to: ", configField.label || configField.name] }), _jsxs("div", { children: ["Current value: ", String(currentValue || 'Not set')] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { children: "Status:" }), _jsx(StatusBadge, { status: isActive, size: "sm" })] })] })] }, serviceId));
                                                        }) }) }) })] }))] })), _jsxs(Card, { className: "border-orange-200 dark:border-orange-800", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(Bug, { className: "h-5 w-5 text-orange-500" }), "Persistence Diagnostics"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => setShowDebugger(!showDebugger), children: [showDebugger ? 'Hide' : 'Show', " Debugger"] })] }) }), showDebugger && (_jsx(CardContent, { children: _jsx("div", { className: "bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-4", children: _jsxs("p", { className: "text-sm text-orange-800 dark:text-orange-200", children: [_jsx("strong", { children: "Use this tool if auto-add settings are not persisting after page refresh." }), "It will test if your configuration data is being properly saved and loaded from the database."] }) }) }))] })] })] })] }));
}
