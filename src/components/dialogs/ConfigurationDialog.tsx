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
import { ConfigurationDefinition, ConfigurationField } from '../../types/domain';
import { NumberInput } from '../NumberInput';
import { DraggableTable } from '../DraggableTable';

interface ConfigurationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ConfigurationDefinition) => Promise<void>;
  onDelete?: (config: ConfigurationDefinition) => Promise<void>;
  onDuplicate?: (config: ConfigurationDefinition) => Promise<void>;
  configuration?: ConfigurationDefinition | null;
  configurations: ConfigurationDefinition[];
  isCreating: boolean;
  simulator_id: string;
}

export function ConfigurationDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  onDuplicate,
  configuration, 
  configurations, 
  isCreating,
  simulator_id
}: ConfigurationDialogProps) {
  const [formData, setFormData] = useState<ConfigurationDefinition>({
    id: '',
    name: '',
    description: '',
    simulator_id: '',
    is_active: true,
    display_order: 1,
    fields: []
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Prevent ESC from bubbling up to parent when dialog is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
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
      } else {
        // Create mode
        setFormData({
          id: '',
          name: '',
          description: '',
          simulator_id: simulator_id,
          is_active: true,
          display_order: (configurations.length + 1),
          fields: []
        });
      }
    }
  }, [isOpen, configuration, isCreating, configurations]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const newConfig: ConfigurationDefinition = {
        ...formData,
        id: formData.id || `config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      await onSave(newConfig);
      onClose();
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert(`Failed to save configuration: ${(error as Error).message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!configuration || isCreating || !onDelete) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete the configuration "${configuration.name}"? This action cannot be undone.`);
    if (!confirmDelete) return;
    
    try {
      setIsDeleting(true);
      await onDelete(configuration);
      onClose();
    } catch (error) {
      console.error('Failed to delete configuration:', error);
      alert(`Failed to delete configuration: ${(error as Error).message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!configuration || !onDuplicate) return;
    
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
    } catch (error) {
      console.error('Failed to duplicate configuration:', error);
      alert(`Failed to duplicate configuration: ${(error as Error).message || 'Unknown error'}`);
    } finally {
      setIsDuplicating(false);
    }
  };

  const updateField = (field: keyof ConfigurationDefinition, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addConfigurationField = () => {
    const newField: ConfigurationField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      label: '',
      type: 'string',
      defaultValue: '',
      required: false,
      display_order: formData.fields.length + 1
    };
    
    updateField('fields', [...formData.fields, newField]);
  };

  const updateConfigurationFieldData = (fieldId: string, updates: Partial<ConfigurationField>) => {
    const updatedFields = formData.fields.map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    );
    
    updateField('fields', updatedFields);
  };

  const removeConfigurationField = (fieldId: string) => {
    const updatedFields = formData.fields.filter(field => field.id !== fieldId);
    updateField('fields', updatedFields);
  };

  const handleFieldReorder = (reorderedFields: ConfigurationField[]) => {
    // Update order values based on new positions
    const fieldsWithUpdatedOrder = reorderedFields.map((field, index) => ({
      ...field,
      order: index + 1
    }));
    updateField('fields', fieldsWithUpdatedOrder);
  };

  const isValid = formData.name.trim() && formData.description.trim();

  return (
    <StandardDialog
      isOpen={isOpen}
      onClose={onClose}
      title={isCreating ? 'Create New Client Fields' : 'Edit Client Fields'}
      description={
        isCreating 
          ? 'Create a new client fields template with custom form fields for data collection.'
          : 'Modify the client fields template and its associated form fields.'
      }
      size="lg"
      destructiveActions={!isCreating && configuration && onDelete ? [{
        label: isDeleting ? 'Deleting...' : 'Delete',
        onClick: handleDelete,
        loading: isDeleting,
        disabled: isSaving || isDuplicating,
        icon: <Trash2 className="h-4 w-4" />
      }] : []}
      secondaryActions={[
        ...(!isCreating && configuration && onDuplicate ? [{
          label: isDuplicating ? 'Duplicating...' : 'Duplicate',
          onClick: handleDuplicate,
          loading: isDuplicating,
          disabled: isSaving || isDeleting,
          icon: <Copy className="h-4 w-4" />
        }] : []),
        {
          label: 'Cancel',
          onClick: onClose
        }
      ]}
      primaryAction={{
        label: isSaving ? 'Saving...' : 'Save Configuration',
        onClick: handleSave,
        loading: isSaving,
        disabled: !isValid || isDeleting || isDuplicating
      }}
    >
      <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="config-name">Client Fields Name *</Label>
              <Input
                id="config-name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Enter configuration name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="config-order">Display Order</Label>
              <NumberInput
                value={formData.display_order}
                onChange={(value) => updateField('display_order', value)}
                placeholder="1"
                allowDecimals={false}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="config-description">Description *</Label>
            <Textarea
              id="config-description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe this configuration (required)"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.is_active}
              onCheckedChange={(checked) => updateField('is_active', checked)}
            />
            <Label>Active Client Fields</Label>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Form Fields</Label>
              <Button onClick={addConfigurationField} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Field
              </Button>
            </div>

            {formData.fields.length > 0 ? (
              <DraggableTable
                headers={['Field Name', 'Label', 'Type', 'Default', 'Required', 'Order', 'Actions']}
                items={formData.fields.sort((a, b) => a.display_order - b.display_order)}
                onReorder={handleFieldReorder}
                getItemKey={(field) => field.id}
                renderRow={(field) => (
                  <>
                    <TableCell>
                      <Input
                        value={field.name}
                        onChange={(e) => updateConfigurationFieldData(field.id, { name: e.target.value })}
                        placeholder="field_name"
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={field.label || ''}
                        onChange={(e) => updateConfigurationFieldData(field.id, { label: e.target.value })}
                        placeholder="Display Label"
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={field.type}
                        onValueChange={(value: 'string' | 'number' | 'boolean') => 
                          updateConfigurationFieldData(field.id, { type: value })
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Checkbox</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {field.type === 'boolean' ? (
                        <Checkbox
                          checked={field.defaultValue as boolean}
                          onCheckedChange={(checked) => updateConfigurationFieldData(field.id, { defaultValue: checked === true })}
                        />
                      ) : field.type === 'number' ? (
                        <NumberInput
                          value={field.defaultValue as number}
                          onChange={(value) => updateConfigurationFieldData(field.id, { defaultValue: value })}
                          className="h-8"
                        />
                      ) : (
                        <Input
                          value={field.defaultValue as string}
                          onChange={(e) => updateConfigurationFieldData(field.id, { defaultValue: e.target.value })}
                          placeholder="Default value"
                          className="h-8"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={field.required || false}
                        onCheckedChange={(checked) => updateConfigurationFieldData(field.id, { required: checked === true })}
                      />
                    </TableCell>
                    <TableCell>
                      <NumberInput
                        value={field.display_order}
                        onChange={(value) => updateConfigurationFieldData(field.id, { display_order: value })}
                        min={1}
                        max={100}
                        className="h-8 w-16"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => removeConfigurationField(field.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </>
                )}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                <p>No fields added yet.</p>
                <p className="text-xs">Click "Add Field" to create configuration fields.</p>
              </div>
            )}
          </div>
        </div>
    </StandardDialog>
  );
}