import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Plus } from 'lucide-react';
import { ConfigurationDefinition } from '../types/domain';

interface ConfigurationFieldsInputProps {
  selectedFieldIds: string[];
  configurations: ConfigurationDefinition[];
  onAddField: (fieldId: string) => void;
  onRemoveField: (fieldId: string) => void;
}

export function ConfigurationFieldsInput({ 
  selectedFieldIds, 
  configurations, 
  onAddField, 
  onRemoveField 
}: ConfigurationFieldsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Create a flat list of all available fields with config context
  const allFields = configurations.flatMap(config => 
    (config.fields || []).map(field => ({
      ...field,
      configName: config.name,
      configId: config.id,
      displayName: `${config.name}: ${field.label}`,
      searchText: `${config.name} ${field.label} ${field.description || ''}`.toLowerCase()
    }))
  );

  // Get selected field objects for display
  const selectedFields = allFields.filter(field => selectedFieldIds.includes(field.id));

  // Filter available fields to exclude already selected ones
  const availableFields = allFields.filter(field => !selectedFieldIds.includes(field.id));
  
  // Filter based on input value
  const filteredFields = availableFields.filter(field => 
    field.searchText.includes(inputValue.toLowerCase())
  );

  const handleAddField = (fieldId: string) => {
    if (fieldId && !selectedFieldIds.includes(fieldId)) {
      onAddField(fieldId);
      setInputValue('');
      // Keep dropdown open for adding multiple fields
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setInputValue('');
    }
  };

  const handleInputClick = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Configuration-Based Quantity (Auto-quantity from client config)</Label>
      
      {/* Selected Fields Display */}
      {selectedFields.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedFields.map(field => (
            <Badge key={field.id} variant="secondary" className="text-xs">
              <span className="font-medium">{field.configName}:</span>
              <span className="ml-1">{field.label}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-auto p-0 ml-1"
                onClick={() => onRemoveField(field.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Field Input with Suggestions */}
      <div className="relative">
        <Input
          placeholder="Search configuration fields to add auto-quantity..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={handleInputClick}
          onBlur={(e) => {
            // Only close if not clicking on the dropdown
            setTimeout(() => {
              if (!e.relatedTarget?.closest('.config-fields-dropdown')) {
                setIsOpen(false);
              }
            }, 100);
          }}
        />
        
        {/* Dropdown positioned absolutely */}
        {isOpen && (
          <div className="config-fields-dropdown absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-md">
            <div className="border-b px-3 py-2">
              <div className="text-xs font-medium text-muted-foreground mb-1">
                {filteredFields.length > 0 
                  ? 'Select configuration fields for auto-quantity:' 
                  : inputValue.trim() 
                    ? 'No matching fields found' 
                    : 'Available configuration fields:'
                }
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredFields.length > 0 ? (
                <div className="py-1">
                  {filteredFields.map((field) => (
                    <div
                      key={field.id}
                      onClick={() => handleAddField(field.id)}
                      className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {field.configName}
                            </Badge>
                            <span className="font-medium">{field.label}</span>
                          </div>
                          {field.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {field.description}
                            </div>
                          )}
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : availableFields.length === 0 ? (
                <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                  {selectedFields.length > 0 
                    ? 'All available fields are selected'
                    : 'No configuration fields available'
                  }
                </div>
              ) : (
                <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                  No fields match "{inputValue}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {configurations.length === 0 && (
        <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-md">
          No active configuration fields found. Create configuration fields in the admin panel to enable auto-quantity mapping.
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        Service quantity will automatically match values from selected client configuration fields. 
        Leave empty for manual quantity entry.
      </p>
    </div>
  );
}