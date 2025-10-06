// This file has been simplified - complex mapping logic has been removed
// These are stub implementations to avoid breaking imports
export function getDynamicConfigServiceMapping(items) {
    // No longer needed with simple system
    return {};
}
export function getDynamicServiceToConfigMapping(items) {
    // No longer needed with simple system
    return {};
}
export function shouldAutoAddItem(item, config) {
    // No auto-add logic in simple system
    return false;
}
export function getConfigFieldForQuantitySync(item) {
    // No longer needed with simple system
    return null;
}
// Additional stub functions for old debug components
export function getQuantitySourceFields(item) {
    // Simple system: return the quantitySourceFields array or empty array
    return item.quantitySourceFields || [];
}
export function getConfigFieldDependencies(items) {
    // Simple system: group items by their quantity source fields
    const dependencies = {};
    items.forEach(item => {
        if (item.quantitySourceFields && item.quantitySourceFields.length > 0) {
            item.quantitySourceFields.forEach(field => {
                if (!dependencies[field]) {
                    dependencies[field] = [];
                }
                dependencies[field].push(item);
            });
        }
    });
    return dependencies;
}
export function calculateCombinedQuantityForFields(items, config, fields) {
    // Simple system: sum the values of the specified fields
    let total = 0;
    fields.forEach(field => {
        const configValue = config[field];
        if (typeof configValue === 'number') {
            total += configValue;
        }
        else if (typeof configValue === 'boolean') {
            total += configValue ? 1 : 0;
        }
    });
    return total;
}
// Legacy mappings - kept for backward compatibility but no longer used
export const legacyConfigServiceMapping = {};
export const legacyServiceToConfigMapping = {};
