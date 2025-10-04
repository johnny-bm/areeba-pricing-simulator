import { PricingItem, DynamicClientConfig, SelectedItem } from '../types/pricing';
import { getConfigBasedQuantity, getEffectiveUnitPrice } from './tieredPricing';

export interface AutoAddConfig {
  autoAddRules: Record<string, string[]>; // configFieldId -> serviceIds[]
  quantityRules: Record<string, { field: string; multiplier?: number }>; // serviceId -> config field mapping
}

export interface ServiceMapping {
  serviceId: string;
  configField: string;
  triggerCondition: 'boolean' | 'number';
  autoAdd: boolean;
  syncQuantity: boolean;
}

/**
 * Apply auto-add logic based on client configuration changes
 */
export function applyAutoAddLogic(
  currentSelectedItems: SelectedItem[],
  clientConfig: DynamicClientConfig,
  pricingServices: PricingItem[],
  autoAddConfig: AutoAddConfig,
  serviceMappings: Record<string, ServiceMapping>
): SelectedItem[] {
  const configValues = clientConfig.configValues;
  const updatedItems = [...currentSelectedItems];
  
  // Track which services to add based on config changes - use Set to avoid duplicates
  const servicesToAdd = new Set<string>();
  
  // NEW: Process services using their direct array fields (optimized for normalized schema)
  pricingServices.forEach(service => {
    // Skip if service is already selected
    const isAlreadySelected = currentSelectedItems.some(item => item.item.id === service.id);
    if (isAlreadySelected) return;
    
    // Check auto-add trigger fields array directly
    if (service.autoAddServices && service.autoAddServices.length > 0) {
      const shouldAutoAdd = service.autoAddServices.some(configFieldId => {
        const configValue = configValues[configFieldId];
        
        if (configValue === undefined || configValue === null) return false;
        
        // Auto-add conditions: boolean true, number > 0, non-empty string
        return (typeof configValue === 'boolean' && configValue) ||
               (typeof configValue === 'number' && configValue > 0) ||
               (typeof configValue === 'string' && configValue.trim() !== '');
      });
      
      if (shouldAutoAdd) {
        servicesToAdd.add(service.id);
      }
    }
  });

  // LEGACY: Also process auto-add rules for backward compatibility
  Object.entries(autoAddConfig.autoAddRules).forEach(([configFieldId, serviceIds]) => {
    const configValue = configValues[configFieldId];
    
    // Check if this config field triggers auto-add
    if (configValue !== undefined && configValue !== null) {
      // For boolean fields, add if true
      // For number fields, add if > 0
      const shouldAdd = (typeof configValue === 'boolean' && configValue) ||
                       (typeof configValue === 'number' && configValue > 0) ||
                       (typeof configValue === 'string' && configValue.trim() !== '');
      
      if (shouldAdd) {
        serviceIds.forEach(serviceId => {
          // Only add if not already selected and service exists
          const alreadySelected = currentSelectedItems.some(item => item.item.id === serviceId);
          const serviceExists = pricingServices.some(service => service.id === serviceId);
          
          if (!alreadySelected && serviceExists) {
            servicesToAdd.add(serviceId);
          }
        });
      }
    }
  });
  
  // Process service mappings for auto-add (fallback/additional logic)
  Object.values(serviceMappings).forEach(mapping => {
    if (mapping.autoAdd && mapping.serviceId && mapping.configField) {
      const configValue = configValues[mapping.configField];
      
      if (configValue !== undefined && configValue !== null) {
        const shouldAdd = (mapping.triggerCondition === 'boolean' && configValue === true) ||
                         (mapping.triggerCondition === 'number' && typeof configValue === 'number' && configValue > 0) ||
                         (mapping.triggerCondition === 'string' && typeof configValue === 'string' && configValue.trim() !== '');
        
        if (shouldAdd && 
            !currentSelectedItems.some(item => item.item.id === mapping.serviceId) &&
            pricingServices.some(service => service.id === mapping.serviceId)) {
          servicesToAdd.add(mapping.serviceId);
        }
      }
    }
  });
  
  // Add new services (now guaranteed to be unique)
  Array.from(servicesToAdd).forEach(serviceId => {
    const service = pricingServices.find(s => s.id === serviceId);
    if (service) {
      const defaultQuantity = calculateServiceQuantity(service, clientConfig, autoAddConfig, serviceMappings);
      
      const newSelectedItem: SelectedItem = {
        id: `${service.id}-${Date.now()}-${Math.random().toString(36).substring(2)}`,
        item: service,
        quantity: defaultQuantity,
        unitPrice: service.pricingType === 'tiered' && service.tiers && service.tiers.length > 0 
          ? getEffectiveUnitPrice(service, defaultQuantity) 
          : service.defaultPrice,
        discount: 0,
        discountType: 'percentage',
        isFree: false
      };
      
      updatedItems.push(newSelectedItem);
    }
  });
  
  // Update quantities for existing items based on quantity rules
  return updatedItems.map(selectedItem => {
    const quantityRule = autoAddConfig.quantityRules[selectedItem.item.id];
    const serviceMapping = serviceMappings[selectedItem.item.id];
    
    let newQuantity = selectedItem.quantity;
    
    // Apply quantity rule from autoAddConfig
    if (quantityRule) {
      const configValue = configValues[quantityRule.field];
      if (typeof configValue === 'number') {
        newQuantity = configValue * (quantityRule.multiplier || 1);
      }
    }
    
    // Apply quantity rule from service mapping
    if (serviceMapping && serviceMapping.syncQuantity) {
      const configValue = configValues[serviceMapping.configField];
      if (typeof configValue === 'number') {
        newQuantity = configValue;
      }
    }
    
    // Apply quantity source fields (use normalized fields with fallback)
    const quantityFields = selectedItem.item.quantity_source_fields || selectedItem.item.quantitySourceFields || [];
    if (quantityFields.length > 0) {
      // Convert dynamic config to legacy format for compatibility
      const legacyConfig = convertToLegacyConfig(clientConfig);
      newQuantity = getConfigBasedQuantity(selectedItem.item, legacyConfig);
    }
    
    // Update the item if quantity changed
    if (newQuantity !== selectedItem.quantity) {
      const updatedItem = { ...selectedItem, quantity: newQuantity };
      
      // Update unit price for tiered items
      if (selectedItem.item.pricingType === 'tiered' && selectedItem.item.tiers && selectedItem.item.tiers.length > 0) {
        updatedItem.unitPrice = getEffectiveUnitPrice(selectedItem.item, newQuantity);
      }
      
      return updatedItem;
    }
    
    return selectedItem;
  });
}

/**
 * Calculate the appropriate quantity for a service based on configuration
 * This function now properly combines quantities from multiple config sources
 */
export function calculateServiceQuantity(
  service: PricingItem,
  clientConfig: DynamicClientConfig,
  autoAddConfig: AutoAddConfig,
  serviceMappings: Record<string, ServiceMapping>
): number {
  const configValues = clientConfig.configValues;
  let totalQuantity = 0;
  
  // NEW: Check service's direct quantity source fields array (from normalized schema)
  // Sum up quantities from all relevant fields for this service
  if (service.quantitySourceFields && service.quantitySourceFields.length > 0) {
    service.quantitySourceFields.forEach(configFieldId => {
      const configValue = configValues[configFieldId];
      if (typeof configValue === 'number' && configValue > 0) {
        // Use the service's quantity multiplier if available
        const multiplier = service.quantityMultiplier || 1;
        totalQuantity += configValue * multiplier;
      }
    });
    
    if (totalQuantity > 0) {
      return totalQuantity;
    }
  }
  
  // Also check normalized field name
  const quantityFields = service.quantity_source_fields || [];
  if (quantityFields.length > 0) {
    quantityFields.forEach(configFieldId => {
      const configValue = configValues[configFieldId];
      if (typeof configValue === 'number' && configValue > 0) {
        totalQuantity += configValue;
      }
    });
    
    if (totalQuantity > 0) {
      return totalQuantity;
    }
  }
  
  // LEGACY: Check quantity rule from autoAddConfig
  const quantityRule = autoAddConfig.quantityRules[service.id];
  if (quantityRule) {
    const configValue = configValues[quantityRule.field];
    if (typeof configValue === 'number') {
      return Math.max(1, configValue * (quantityRule.multiplier || 1));
    }
  }
  
  // LEGACY: Check service mapping
  const serviceMapping = serviceMappings[service.id];
  if (serviceMapping && serviceMapping.syncQuantity) {
    const configValue = configValues[serviceMapping.configField];
    if (typeof configValue === 'number') {
      return Math.max(1, configValue);
    }
  }
  
  // FALLBACK: Use getConfigBasedQuantity with normalized fields
  // This function should handle quantity combining internally
  if (quantityFields.length > 0) {
    const legacyConfig = convertToLegacyConfig(clientConfig);
    return getConfigBasedQuantity(service, legacyConfig);
  }
  
  // Check if this service should be auto-added based on any boolean flags
  // If so, use a default quantity of 1
  if (service.autoAddServices && service.autoAddServices.length > 0) {
    const hasAnyTrigger = service.autoAddServices.some(configFieldId => {
      const configValue = configValues[configFieldId];
      return (typeof configValue === 'boolean' && configValue) ||
             (typeof configValue === 'number' && configValue > 0) ||
             (typeof configValue === 'string' && configValue.trim() !== '');
    });
    
    if (hasAnyTrigger) {
      return 1;
    }
  }
  
  // Default to 1
  return 1;
}

/**
 * Convert dynamic client config to legacy format for backward compatibility
 */
function convertToLegacyConfig(dynamicConfig: DynamicClientConfig): any {
  // Start with the base legacy fields
  const legacyConfig: any = {
    clientName: dynamicConfig.clientName,
    projectName: dynamicConfig.projectName,
    preparedBy: dynamicConfig.preparedBy,
    hasDebitCards: (dynamicConfig.configValues.hasDebitCards as boolean) || false,
    hasCreditCards: (dynamicConfig.configValues.hasCreditCards as boolean) || false,
    debitCards: (dynamicConfig.configValues.debitCards as number) || 0,
    creditCards: (dynamicConfig.configValues.creditCards as number) || 0,
    monthlyAuthorizations: (dynamicConfig.configValues.monthlyAuthorizations as number) || 0,
    monthlySettlements: (dynamicConfig.configValues.monthlySettlements as number) || 0,
    monthly3DS: (dynamicConfig.configValues.monthly3DS as number) || 0,
    monthlySMS: (dynamicConfig.configValues.monthlySMS as number) || 0,
    monthlyNotifications: (dynamicConfig.configValues.monthlyNotifications as number) || 0,
    monthlyDeliveries: (dynamicConfig.configValues.monthlyDeliveries as number) || 0
  };
  
  // Add all dynamic configuration fields to the legacy config
  // This ensures that services with quantitySourceFields can find their dynamic field IDs
  Object.entries(dynamicConfig.configValues).forEach(([key, value]) => {
    if (!(key in legacyConfig)) {
      // Add dynamic fields that aren't already in the legacy config
      legacyConfig[key] = value;
    }
  });
  
  return legacyConfig;
}

/**
 * Remove services that should no longer be auto-added based on config changes
 */
export function removeAutoAddedServices(
  currentSelectedItems: SelectedItem[],
  clientConfig: DynamicClientConfig,
  autoAddConfig: AutoAddConfig,
  serviceMappings: Record<string, ServiceMapping>
): SelectedItem[] {
  const configValues = clientConfig.configValues;
  
  return currentSelectedItems.filter(selectedItem => {
    const serviceId = selectedItem.item.id;
    
    // Check if this service is auto-added and should be removed
    const isAutoAdded = Object.entries(autoAddConfig.autoAddRules).some(([configFieldId, serviceIds]) => {
      if (serviceIds.includes(serviceId)) {
        const configValue = configValues[configFieldId];
        // Remove if config field is false or 0
        return !configValue || (typeof configValue === 'number' && configValue <= 0);
      }
      return false;
    });
    
    // Check service mappings
    const serviceMapping = serviceMappings[serviceId];
    if (serviceMapping && serviceMapping.autoAdd) {
      const configValue = configValues[serviceMapping.configField];
      if (!configValue || (typeof configValue === 'number' && configValue <= 0)) {
        return false; // Remove this service
      }
    }
    
    return !isAutoAdded; // Keep the service if it's not auto-added or should stay
  });
}

/**
 * Update service mappings based on service configuration changes
 */
export function updateServiceMappings(
  serviceMappings: Record<string, ServiceMapping>,
  serviceId: string,
  mapping: Partial<ServiceMapping>
): Record<string, ServiceMapping> {
  const updated = { ...serviceMappings };
  
  if (mapping.configField) {
    updated[serviceId] = {
      serviceId,
      configField: mapping.configField,
      triggerCondition: mapping.triggerCondition || 'boolean',
      autoAdd: mapping.autoAdd !== undefined ? mapping.autoAdd : true,
      syncQuantity: mapping.syncQuantity !== undefined ? mapping.syncQuantity : false
    };
  } else {
    // Remove the mapping
    delete updated[serviceId];
  }
  
  return updated;
}

/**
 * Update auto-add configuration
 */
export function updateAutoAddConfig(
  autoAddConfig: AutoAddConfig,
  configFieldId: string,
  serviceIds: string[],
  quantityMappings?: Record<string, { field: string; multiplier?: number }>
): AutoAddConfig {
  const updated = {
    autoAddRules: { ...autoAddConfig.autoAddRules },
    quantityRules: { ...autoAddConfig.quantityRules }
  };
  
  // Update auto-add rules
  if (serviceIds.length > 0) {
    updated.autoAddRules[configFieldId] = serviceIds;
  } else {
    delete updated.autoAddRules[configFieldId];
  }
  
  // Update quantity rules if provided
  if (quantityMappings) {
    Object.assign(updated.quantityRules, quantityMappings);
  }
  
  return updated;
}