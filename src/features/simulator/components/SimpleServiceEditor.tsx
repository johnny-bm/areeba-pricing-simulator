import { useState, useEffect } from 'react';
import { StandardDialog } from '../../../components/StandardDialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Save, X, Trash2, Copy, Loader2 } from 'lucide-react';
import { PricingItem, Category, PricingTier, ConfigurationDefinition } from '../../../types/domain';
import { PRICING_TYPES, COLUMNS } from '../../../config/database';
import { api } from '../../../utils/api';
import { MultiSelectInput } from '../../../components/MultiSelectInput';
import { TieredPricingEditor } from './TieredPricingEditor';
import { NumberInput } from '../../../components/NumberInput';
import { SecurityService, securitySchemas } from '../../../lib/security';

interface SimpleServiceEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: PricingItem) => Promise<void>;
  onDelete?: (service: PricingItem) => Promise<void>;
  service?: PricingItem | null;
  categories: Category[];
  isCreating: boolean;
  isSaving?: boolean;
  saveProgress?: string;
  simulatorId?: string; // Add simulator ID prop
}

interface ServiceFormData {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryId: string;
  unit: string;
  defaultPrice: number;
  tags: string[];
  pricingType: 'one_time' | 'recurring' | 'per_unit' | 'tiered';
  billingCycle: 'one_time' | 'monthly' | 'quarterly' | 'yearly';
  tiers: PricingTier[];
  quantitySourceFields: string[];
  autoAddServices: string[];
  is_active: boolean;
}

export function SimpleServiceEditor({
  isOpen,
  onClose,
  onSave,
  onDelete,
  service,
  categories,
  isCreating,
  isSaving: parentIsSaving,
  saveProgress: parentSaveProgress,
  simulatorId
}: SimpleServiceEditorProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    id: '',
    name: '',
    description: '',
    category: categories.length > 0 ? categories[0].id : '',
    categoryId: categories.length > 0 ? categories[0].id : '',
    unit: 'Per User',
    defaultPrice: 0,
    tags: [],
    pricingType: 'one_time',
    billingCycle: 'monthly',
    tiers: [],
    quantitySourceFields: [],
    autoAddServices: [],
    is_active: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [configurations, setConfigurations] = useState<ConfigurationDefinition[]>([]);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [temporaryTags, setTemporaryTags] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState<ServiceFormData | null>(null);
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);
  const [availablePricingTypes, setAvailablePricingTypes] = useState<Array<{value: string, label: string}>>([]);
  const [availableBillingCycles, setAvailableBillingCycles] = useState<Array<{value: string, label: string}>>([]);

  // Load configurations when dialog opens
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          const [configsData, servicesData, unitsData, pricingTypesData, billingCyclesData, tagsData] = await Promise.all([
            api.loadConfigurations(simulatorId), // Pass simulator ID
            api.loadPricingItems(simulatorId), // Pass simulator ID
            api.loadPricingUnits(), // Load pricing units from database
            api.loadPricingTypes(), // Load pricing types from database
            api.loadPricingCycles(), // Load billing cycles from database
            api.loadTags(simulatorId) // Load tags from database
          ]);
          
          setConfigurations(configsData.filter(config => config.is_active));
          
          // Filter active units and extract their names
          const activeUnits = unitsData
            .filter(unit => unit.is_active)
            .map(unit => unit.name)
            .sort();
          setAvailableUnits(activeUnits);
          
          // Filter active pricing types
          const activePricingTypes = pricingTypesData
            .filter(type => type.is_active)
            .map(type => ({ value: type.value, label: type.name }));
          setAvailablePricingTypes(activePricingTypes);
          
          // Filter active billing cycles
          const activeBillingCycles = billingCyclesData
            .filter(cycle => cycle.is_active)
            .map(cycle => ({ value: cycle.value, label: cycle.name }));
          setAvailableBillingCycles(activeBillingCycles);
          
          // Load tags from the tags table and combine with service tags
          const serviceTags = new Set<string>();
          servicesData.forEach(s => {
            if (s.tags) {
              s.tags.forEach(tag => serviceTags.add(tag));
            }
          });
          
          // Combine tags from tags table with service tags
          const allTags = new Set<string>();
          tagsData.forEach(tag => allTags.add(tag.name));
          serviceTags.forEach(tag => allTags.add(tag));
          
          setExistingTags(Array.from(allTags).sort());
        } catch (error) {
          console.error('❌ SimpleServiceEditor: Failed to load configuration data:', error);
          setConfigurations([]);
          setExistingTags([]);
          setAvailableUnits([]);
          
          // Provide fallback pricing types if API call fails
          const fallbackPricingTypes = [
            { value: 'one_time', label: 'One Time' },
            { value: 'recurring', label: 'Recurring' },
            { value: 'per_unit', label: 'Per Unit' },
            { value: 'tiered', label: 'Tiered' }
          ];
          setAvailablePricingTypes(fallbackPricingTypes);
          
          // Provide fallback billing cycles if API call fails
          const fallbackBillingCycles = [
            { value: 'one_time', label: 'One Time' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'quarterly', label: 'Quarterly' },
            { value: 'yearly', label: 'Yearly' }
          ];
          setAvailableBillingCycles(fallbackBillingCycles);
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
        const initialData = {
          id: service.id,
          name: service.name,
          description: service.description,
          category: service.categoryId,
          categoryId: service.categoryId,
          unit: service.unit,
          defaultPrice: service.defaultPrice,
          tags: service.tags || [],
          pricingType: (service.pricingType as 'one_time' | 'recurring' | 'per_unit' | 'tiered') || 'one_time',
          billingCycle: (service.billingCycle as 'one_time' | 'monthly' | 'quarterly' | 'yearly') || 'monthly',
          tiers: service.tiers || [],
          quantitySourceFields: service.quantitySourceFields || [],
          autoAddServices: Array.isArray(service.autoAddServices) 
            ? service.autoAddServices.map(item => typeof item === 'string' ? item : item.configFieldId).filter(Boolean)
            : [],
          is_active: service.is_active !== undefined ? service.is_active : true
        };
        setFormData(initialData);
        setInitialFormData(initialData);
        setHasUnsavedChanges(false);
      } else {
        // Create mode - start with defaults
        setFormData({
          id: '',
          name: '',
          description: '',
          category: categories.length > 0 ? categories[0].id : '',
          categoryId: categories.length > 0 ? categories[0].id : '',
          unit: availableUnits.length > 0 ? availableUnits[0] : 'Per User',
          defaultPrice: 0,
          tags: [],
          pricingType: (availablePricingTypes.length > 0 ? availablePricingTypes[0].value : 'one_time') as 'one_time' | 'recurring' | 'per_unit' | 'tiered',
          billingCycle: (availableBillingCycles.length > 0 ? availableBillingCycles[0].value : 'monthly') as 'one_time' | 'monthly' | 'quarterly' | 'yearly',
          tiers: [],
          quantitySourceFields: [],
          autoAddServices: [],
          is_active: true
        });
      }
    }
  }, [isOpen, service, isCreating, categories]);

  // Update form data when pricing types and billing cycles are loaded
  useEffect(() => {
    if (isOpen && isCreating && availablePricingTypes.length > 0 && availableBillingCycles.length > 0) {
      setFormData(prev => ({
        ...prev,
        pricingType: (prev.pricingType || availablePricingTypes[0].value) as 'one_time' | 'recurring' | 'per_unit' | 'tiered',
        billingCycle: (prev.billingCycle || availableBillingCycles[0].value) as 'one_time' | 'monthly' | 'quarterly' | 'yearly'
      }));
    }
  }, [isOpen, isCreating, availablePricingTypes, availableBillingCycles]);

  const updateField = (field: keyof ServiceFormData, value: any) => {
    // Add safety checks for string fields to prevent undefined values
    let safeValue = value;
    if (field === 'name' || field === 'description') {
      safeValue = (value as string) || '';
      
      // Security validation for text inputs
      const sanitizedValue = SecurityService.sanitizeInput(safeValue);
      if (SecurityService.detectSqlInjection(safeValue) || SecurityService.detectXss(safeValue)) {
        alert(`Invalid characters detected in ${field}`);
        return;
      }
      safeValue = sanitizedValue;
    }
    
    setFormData(prev => {
      const newData = { ...prev, [field]: safeValue };
      
      // Check if there are unsaved changes
      if (initialFormData && !isCreating) {
        const hasChanges = JSON.stringify(newData) !== JSON.stringify(initialFormData);
        setHasUnsavedChanges(hasChanges);
      }
      
      return newData;
    });
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields (Name and Description)');
      return;
    }

    // Security validation
    const sanitizedName = SecurityService.sanitizeInput(formData.name);
    const sanitizedDescription = SecurityService.sanitizeInput(formData.description);
    
    if (SecurityService.detectSqlInjection(formData.name) || SecurityService.detectXss(formData.name)) {
      alert('Invalid characters detected in service name');
      return;
    }
    
    if (SecurityService.detectSqlInjection(formData.description) || SecurityService.detectXss(formData.description)) {
      alert('Invalid characters detected in service description');
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

      const serviceToSave: PricingItem = {
        id: formData.id || `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId || '',
        unit: formData.unit,
        defaultPrice: formData.defaultPrice,
        tags: formData.tags,
        pricingType: formData.pricingType,
        billingCycle: formData.billingCycle,
        tiers: formData.pricingType === 'tiered' ? formData.tiers : undefined,
        quantitySourceFields: formData.quantitySourceFields,
        autoAddServices: formData.autoAddServices.map(configFieldId => ({
          configFieldId,
          triggerCondition: 'boolean',
          triggerValue: true
        })),
        is_active: formData.is_active
      };


      await onSave(serviceToSave);
      
      // After successful save, refresh the existing tags list
      try {
        const servicesData = await api.loadPricingItems();
        const allTags = new Set<string>();
        servicesData.forEach(s => {
          if (s.tags) {
            s.tags.forEach(tag => allTags.add(tag));
          }
        });
        const sortedTags = Array.from(allTags).sort();
        setExistingTags(sortedTags);
        
        // Clear temporary tags since they're now permanent
        setTemporaryTags([]);
      } catch (refreshError) {
        // Silently handle refresh error
      }
      
      onClose();
    } catch (error) {
      alert(`Failed to save service: ${(error as Error).message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!service || isCreating || !onDelete) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${service.name}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await onDelete(service);
      onClose();
    } catch (error) {
      // // // console.error('Error deleting service:', error);
      alert(`Failed to delete service: ${(error as Error).message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const isValid = formData.name?.trim() && formData.description?.trim() && formData.category && formData.unit && categories.length > 0;

  const handleDuplicate = async () => {
    if (!service) return;
    
    try {
      setIsDuplicating(true);
      // Create a duplicate with a new name and unique ID
      const duplicateService = {
        ...service,
        id: `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${service.name} (Copy)`,
        categoryId: service.categoryId, // Ensure categoryId is set
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      
      await onSave(duplicateService);
      onClose();
    } catch (error) {
      console.error('❌ SimpleServiceEditor: Failed to duplicate service:', error);
      alert(`Failed to duplicate service: ${(error as Error).message || 'Unknown error'}`);
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <StandardDialog
      isOpen={isOpen}
      onClose={onClose}
      title={isCreating ? 'Create New Service' : 'Edit Service'}
      description={
        isCreating 
          ? 'Add a new pricing service to the system with configurable options and tiered pricing support.'
          : 'Modify the selected pricing service settings, pricing tiers, and configuration options.'
      }
      size="lg"
      hasUnsavedChanges={hasUnsavedChanges}
      onAutoSave={handleSave}
      destructiveActions={!isCreating && service && onDelete ? [{
        label: isDeleting ? 'Deleting...' : 'Delete',
        onClick: handleDelete,
        loading: isDeleting,
        disabled: isSaving || isDuplicating,
        icon: <Trash2 className="h-4 w-4" />
      }] : []}
      secondaryActions={[
        ...(!isCreating && service ? [{
          label: isDuplicating ? 'Duplicating...' : 'Duplicate',
          onClick: handleDuplicate,
          loading: isDuplicating,
          disabled: isSaving || isDeleting,
          icon: <Copy className="h-4 w-4" />
        }] : []),
        {
          label: 'Cancel',
          onClick: onClose,
          disabled: isSaving || isDeleting || isDuplicating
        }
      ]}
      primaryAction={{
        label: isSaving ? 'Saving...' : 'Save Service',
        onClick: handleSave,
        loading: isSaving,
        disabled: !isValid || isDeleting || isDuplicating
      }}
    >
      <div className="space-y-6">
          <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Service Name *</Label>
              <Input
                id="item-name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Enter service name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => {
                updateField('category', value);
                updateField('categoryId', value);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-description">Description *</Label>
            <Textarea
              id="item-description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe this service"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item-unit">Unit *</Label>
              <Select value={formData.unit} onValueChange={(value) => updateField('unit', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-price">Default Price *</Label>
              <NumberInput
                value={formData.defaultPrice}
                onChange={(value) => updateField('defaultPrice', value)}
                placeholder="0.00"
                step={0.01}
                min={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pricing Type</Label>
              <Select 
                value={formData.pricingType} 
                onValueChange={(value: 'one_time' | 'recurring' | 'per_unit' | 'tiered') => {
                  updateField('pricingType', value);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availablePricingTypes.length > 0 ? (
                    availablePricingTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))
                  ) : (
                    // Fallback options if no data is loaded
                    <>
                      <SelectItem value="one_time">One Time</SelectItem>
                      <SelectItem value="recurring">Recurring</SelectItem>
                      <SelectItem value="per_unit">Per Unit</SelectItem>
                      <SelectItem value="tiered">Tiered</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Billing Cycle</Label>
              <Select 
                value={formData.billingCycle} 
                onValueChange={(value: 'one_time' | 'monthly' | 'quarterly' | 'yearly') => updateField('billingCycle', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableBillingCycles.map((cycle) => (
                    <SelectItem key={cycle.value} value={cycle.value}>
                      {cycle.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.pricingType === 'tiered' && (
            <div className="space-y-2">
              <Label>Tiered Pricing</Label>
              <TieredPricingEditor
                tiers={formData.tiers}
                unit={formData.unit}
                onUpdateTiers={(tiers) => updateField('tiers', tiers)}
              />
            </div>
          )}

          {/* Divider between service info and configuration sections */}
          <div className="border-t border-border my-6"></div>

          <MultiSelectInput
            label="Tags"
            placeholder="Type to add a new tag or select from existing..."
            selectedValues={formData.tags || []}
            options={[...existingTags, ...temporaryTags].sort().map(tag => ({
              id: tag,
              label: tag,
              searchText: tag.toLowerCase()
            }))}
            onAdd={(tag) => {
              const currentTags = formData.tags || [];
              const trimmedTag = tag.trim();
              if (!currentTags.includes(trimmedTag)) {
                updateField('tags', [...currentTags, trimmedTag]);
                
                // Immediately add new tag to available options for better UX
                if (!existingTags.includes(trimmedTag) && !temporaryTags.includes(trimmedTag)) {
                  setTemporaryTags(prev => [...prev, trimmedTag]);
                }
              }
            }}
            onRemove={(tag) => {
              const currentTags = formData.tags || [];
              updateField('tags', currentTags.filter(t => t !== tag));
            }}
            allowCreateNew={true}
            helpText={`${existingTags.length + temporaryTags.length} tag${(existingTags.length + temporaryTags.length) !== 1 ? 's' : ''} available${temporaryTags.length > 0 ? ` (${temporaryTags.length} new this session)` : ''}`}
            multiple={true}
          />

          {/* Configuration-Based Quantity Matching */}
          <div className="space-y-3">
            <MultiSelectInput
              label="Configuration-Based Quantity (Auto-quantity from client config)"
              placeholder="Search configuration fields to add auto-quantity..."
              selectedValues={formData.quantitySourceFields || []}
              options={configurations.flatMap(config => 
                (config.fields || [])
                  .filter(field => field.type === 'number') // Only show number input fields
                  .map(field => ({
                    id: field.id,
                    label: field.label || field.name,
                    description: field.description,
                    groupName: config.name,
                    searchText: `${config.name} ${field.label} ${field.description || ''}`.toLowerCase()
                  }))
              )}
              onAdd={(fieldId) => {
                const currentFields = formData.quantitySourceFields || [];
                updateField('quantitySourceFields', [...currentFields, fieldId]);
              }}
              onRemove={(fieldId) => {
                const currentFields = formData.quantitySourceFields || [];
                updateField('quantitySourceFields', currentFields.filter(f => f !== fieldId));
              }}
              groupBy={true}
              helpText="Service quantity will automatically match values from selected client configuration fields. Leave empty for manual quantity entry."
              emptyMessage="No number configuration fields found. Create number fields in the admin panel to enable auto-quantity mapping."
              multiple={true}
            />
          </div>

          {/* Auto-Add Related Services */}
          <MultiSelectInput
            label="Auto-Add Related Services"
            placeholder="Search configuration fields for auto-add triggers..."
            selectedValues={formData.autoAddServices || []}
            options={configurations.flatMap(config => 
              (config.fields || []).map(field => ({
                id: field.id,
                label: field.label || field.name,
                description: `${field.type}${field.description ? ` • ${field.description}` : ''}`,
                groupName: config.name,
                searchText: `${config.name} ${field.label} ${field.description || ''}`.toLowerCase()
              }))
            )}
            onAdd={(fieldId) => {
              const currentServices = formData.autoAddServices || [];
              updateField('autoAddServices', [...currentServices, fieldId]);
            }}
            onRemove={(fieldId) => {
              const currentServices = formData.autoAddServices || [];
              updateField('autoAddServices', currentServices.filter(f => f !== fieldId));
            }}
            groupBy={true}
            helpText="When this service is added to a scenario, check specific client configuration field values to determine auto-add behavior. Select which configuration fields should trigger the auto-add."
            emptyMessage="No configuration fields available. Create configuration fields in the admin panel."
            multiple={true}
          />
          </div>
        </div>
    </StandardDialog>
  );
}