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
import { StandardDialog } from './StandardDialog';
import { Settings2, Link2, ArrowRight, Zap, RotateCcw, Info, Bug } from 'lucide-react';
import { PricingItem, DynamicClientConfig, ConfigurationDefinition } from '../types/domain';
import { updateServiceMappings, updateAutoAddConfig, AutoAddConfig } from '../utils/autoAddLogic';

import { saveAdminSelection, removeAdminSelection } from '../utils/adminSelectionPersistence';

interface AutoAddConfigPanelProps {
  services: PricingItem[];
  clientConfig: DynamicClientConfig;
  configurations: ConfigurationDefinition[];
  serviceMappings: Record<string, any>;
  autoAddConfig: AutoAddConfig;
  onUpdateServiceMappings: (mappings: Record<string, any>) => void;
  onUpdateAutoAddConfig: (config: AutoAddConfig) => void;
}

export function AutoAddConfigPanel({
  services,
  clientConfig,
  configurations,
  serviceMappings,
  autoAddConfig,
  onUpdateServiceMappings,
  onUpdateAutoAddConfig
}: AutoAddConfigPanelProps) {
  const [selectedService, setSelectedService] = useState<string>('');
  const [showDebugger, setShowDebugger] = useState<boolean>(false);

  // Load persisted selection on mount
  useEffect(() => {
    const persistedSelection = localStorage.getItem('autoAddConfigPanel.selectedService');
    if (persistedSelection && services.some(service => service.id === persistedSelection)) {
      setSelectedService(persistedSelection);
    }
  }, [services]);

  // Persist selection changes (with race condition protection)
  const handleSelectedServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);
    if (serviceId) {
      saveAdminSelection('AUTO_ADD_CONFIG', serviceId);
    } else {
      removeAdminSelection('AUTO_ADD_CONFIG');
    }
  };

  // Get all config fields from active configurations
  const allConfigFields = configurations
    .filter(config => config.is_active)
    .flatMap(config => config.fields)
    .filter(field => field.type === 'boolean' || field.type === 'number');

  // Convert service mappings to auto-add config format
  const convertMappingsToAutoAddConfig = (mappings: Record<string, any>) => {
    const autoAddRules: Record<string, string[]> = {};
    const quantityRules: Record<string, { field: string; multiplier?: number }> = {};

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

  const handleServiceMappingUpdate = (serviceId: string, mapping: any) => {
    console.log('🔧 AutoAdd: Updating service mapping:', { serviceId, mapping });
    
    const updatedMappings = updateServiceMappings(serviceMappings, serviceId, mapping);
    console.log('🔧 AutoAdd: Updated mappings:', updatedMappings);
    
    onUpdateServiceMappings(updatedMappings);
    
    // Also update the auto-add configuration to match
    const newAutoAddConfig = convertMappingsToAutoAddConfig(updatedMappings);
    console.log('🔧 AutoAdd: Updating auto-add config:', newAutoAddConfig);
    
    onUpdateAutoAddConfig(newAutoAddConfig);
  };

  const handleClearMapping = (serviceId: string) => {
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
    return Object.values(serviceMappings).filter((mapping: any) => mapping.autoAdd).length;
  };

  const getServiceMapping = (serviceId: string) => {
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

    const triggeredServices = new Set<string>();
    activeRules.forEach(([_, serviceIds]) => {
      serviceIds.forEach(id => triggeredServices.add(id));
    });

    return {
      activeRules: activeRules.length,
      triggeredServices: triggeredServices.size
    };
  };

  const autoAddStatus = getAutoAddStatus();

  return (
    <StandardDialog
      isOpen={true}
      onClose={() => {}}
      title="Auto-Add & Quantity Sync Configuration"
      description="Configure automatic service addition and quantity synchronization based on client configuration values."
      size="lg"
      hideCloseButton={true}
    >
        
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-primary">{getMappedServicesCount()}</div>
                <div className="text-sm text-muted-foreground">Mapped Services</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-emerald-600">{getAutoAddServicesCount()}</div>
                <div className="text-sm text-muted-foreground">Auto-Add Enabled</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-orange-600">{autoAddStatus.triggeredServices}</div>
                <div className="text-sm text-muted-foreground">Currently Triggered</div>
              </div>
            </Card>
          </div>

          {allConfigFields.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Info className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No configuration fields available for auto-add setup.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Configure fields in the admin panel first.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Service Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Service Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Select Service to Configure</Label>
                    <Select value={selectedService} onValueChange={handleSelectedServiceChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a service..." />
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className="h-[200px]">
                          {services.map(service => {
                            const mapping = getServiceMapping(service.id);
                            return (
                              <SelectItem key={service.id} value={service.id}>
                                <div className="flex items-center gap-2">
                                  <span>{service.name}</span>
                                  {mapping ? (
                                    <Badge variant="secondary" className="text-xs">
                                      Mapped
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      Not Mapped
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedServiceData && (
                    <Card className="border-muted">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{selectedServiceData.name}</h4>
                            <p className="text-sm text-muted-foreground">{selectedServiceData.description}</p>
                          </div>
                          {selectedServiceMapping && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleClearMapping(selectedServiceData.id)}
                            >
                              Clear Mapping
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Link to Configuration Field</Label>
                          <Select
                            value={selectedServiceMapping?.configField || ''}
                            onValueChange={(field) => {
                              const fieldDescriptor = allConfigFields.find(f => f.id === field);
                              handleServiceMappingUpdate(selectedServiceData.id, {
                                configField: field,
                                triggerCondition: fieldDescriptor?.type === 'boolean' ? 'boolean' : 'number',
                                autoAdd: true,
                                syncQuantity: fieldDescriptor?.type === 'number'
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select configuration field..." />
                            </SelectTrigger>
                            <SelectContent>
                              <ScrollArea className="h-[150px]">
                                {allConfigFields.map(field => (
                                  <SelectItem key={field.id} value={field.id}>
                                    <div>
                                      <div className="font-medium">{field.label || field.name}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {field.description} ({field.type})
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedServiceMapping && (
                          <>
                            <Separator />
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <Label className="flex items-center gap-2">
                                    <Zap className="h-4 w-4" />
                                    Auto-Add Service
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    Automatically add this service when the config field is enabled/has value
                                  </p>
                                </div>
                                <Switch
                                  checked={selectedServiceMapping.autoAdd}
                                  onCheckedChange={(checked) =>
                                    handleServiceMappingUpdate(selectedServiceData.id, {
                                      ...selectedServiceMapping,
                                      autoAdd: checked
                                    })
                                  }
                                />
                              </div>

                              {selectedServiceMapping.triggerCondition === 'number' && (
                                <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    <Label className="flex items-center gap-2">
                                      <RotateCcw className="h-4 w-4" />
                                      Sync Quantity
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                      Keep service quantity in sync with the config field value
                                    </p>
                                  </div>
                                  <Switch
                                    checked={selectedServiceMapping.syncQuantity}
                                    onCheckedChange={(checked) =>
                                      handleServiceMappingUpdate(selectedServiceData.id, {
                                        ...selectedServiceMapping,
                                        syncQuantity: checked
                                      })
                                    }
                                  />
                                </div>
                              )}
                            </div>

                            {/* Preview */}
                            <div className="bg-muted/50 rounded-lg p-3">
                              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                                <ArrowRight className="h-4 w-4" />
                                Configuration Preview
                              </div>
                              <div className="text-xs space-y-1">
                                <div>• Linked to: {allConfigFields.find(f => f.id === selectedServiceMapping.configField)?.label || selectedServiceMapping.configField}</div>
                                <div>• Auto-add: {selectedServiceMapping.autoAdd ? 'Yes' : 'No'}</div>
                                <div>• Sync quantity: {selectedServiceMapping.syncQuantity ? 'Yes' : 'No'}</div>
                                <div className="mt-2 pt-2 border-t border-muted">
                                  Current config value: {String(clientConfig.configValues[selectedServiceMapping.configField] || 'Not set')}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>

              {/* Current Mappings Summary */}
              {getMappedServicesCount() > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Configuration Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-3">
                        {Object.entries(serviceMappings).map(([serviceId, mapping]: [string, any]) => {
                          const service = services.find(s => s.id === serviceId);
                          const configField = allConfigFields.find(f => f.id === mapping.configField);
                          const currentValue = clientConfig.configValues[mapping.configField];
                          
                          if (!service || !configField) return null;

                          const isActive = currentValue && (
                            (typeof currentValue === 'boolean' && currentValue) ||
                            (typeof currentValue === 'number' && currentValue > 0)
                          );

                          return (
                            <div key={serviceId} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium">{service.name}</div>
                                <div className="flex items-center gap-2">
                                  {mapping.autoAdd && (
                                    <Badge variant={isActive ? "default" : "destructive"} className="text-xs">
                                      <Zap className="h-3 w-3 mr-1" />
                                      Auto-Add
                                    </Badge>
                                  )}
                                  {mapping.syncQuantity && (
                                    <Badge variant="secondary" className="text-xs">
                                      <RotateCcw className="h-3 w-3 mr-1" />
                                      Sync
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                <div>Linked to: {configField.label || configField.name}</div>
                                <div>Current value: {String(currentValue || 'Not set')}</div>
                                <div className="flex items-center gap-2">
                                  <span>Status:</span>
                                  <StatusBadge status={isActive} size="sm" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Debug Panel */}
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bug className="h-5 w-5 text-orange-500" />
                  Persistence Diagnostics
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDebugger(!showDebugger)}
                >
                  {showDebugger ? 'Hide' : 'Show'} Debugger
                </Button>
              </div>
            </CardHeader>
            {showDebugger && (
              <CardContent>
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    <strong>Use this tool if auto-add settings are not persisting after page refresh.</strong> 
                    It will test if your configuration data is being properly saved and loaded from the database.
                  </p>
                </div>
                {/* <AutoAddPersistenceDebugger
                  serviceMappings={serviceMappings}
                  autoAddConfig={autoAddConfig}
                  onClose={() => setShowDebugger(false)}
                  onFixSynchronization={onUpdateAutoAddConfig}
                /> */}
              </CardContent>
            )}
          </Card>
        </div>
    </StandardDialog>
  );
}