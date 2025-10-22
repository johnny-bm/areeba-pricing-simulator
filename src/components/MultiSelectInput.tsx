import { useState, useEffect, useRef } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Plus } from 'lucide-react';

/**
 * A unified multi-select input component that supports:
 * - Tags (with create new functionality)
 * - Configuration fields (grouped by parent configuration)
 * - Auto-add services (multiple selection with grouping)
 * - Consistent styling across all use cases
 */

interface MultiSelectOption {
  id: string;
  label: string;
  description?: string;
  groupName?: string;
  searchText?: string;
  canCreate?: boolean;
}

interface MultiSelectInputProps {
  label: string;
  placeholder: string;
  selectedValues: string[];
  options: MultiSelectOption[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  allowCreateNew?: boolean;
  helpText?: string;
  emptyMessage?: string;
  groupBy?: boolean;
  multiple?: boolean;
}

export function MultiSelectInput({ 
  label,
  placeholder,
  selectedValues, 
  options, 
  onAdd, 
  onRemove,
  allowCreateNew = false,
  helpText,
  emptyMessage = 'No options available',
  groupBy = false,
  multiple = true
}: MultiSelectInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMouseOverDropdown, setIsMouseOverDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsMouseOverDropdown(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
      }, {} as Record<string, MultiSelectOption[]>)
    : { 'All': filteredOptions };

  const handleAdd = (value: string) => {
    if (value.trim() && (multiple || !selectedValues.includes(value.trim()))) {
      onAdd(value.trim());
      setInputValue('');
      
      // For single select, close dropdown after selection
      if (!multiple) {
        setIsOpen(false);
      }
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim() && allowCreateNew) {
        handleAdd(inputValue);
      }
    } else if (e.key === 'Escape') {
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

  const canCreateNew = allowCreateNew && inputValue.trim() && !options.some(opt => opt.label.toLowerCase() === inputValue.trim().toLowerCase());

  return (
    <div ref={containerRef} className="space-y-2">
      <Label>{label}</Label>
      
      {/* Selected Values Display */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedOptions.map(option => (
            <Badge key={option.id} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900">
              {option.groupName && (
                <span className="font-medium">{option.groupName}:</span>
              )}
              <span className={option.groupName ? "ml-1" : ""}>{option.label}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-auto p-0 ml-1"
                onClick={() => onRemove(option.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input with Suggestions */}
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={handleInputClick}
          onBlur={() => {
            // Close dropdown when input loses focus (outside click handler will take care of the rest)
            if (!isMouseOverDropdown) {
              setIsOpen(false);
            }
          }}
        />
        
        {/* Create new button (inline) */}
        {canCreateNew && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2"
            onClick={() => handleAdd(inputValue)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add "{inputValue}"
          </Button>
        )}
        
        {/* Dropdown positioned absolutely */}
        {isOpen && (
          <div 
            className="multi-select-dropdown absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-md"
            onMouseEnter={() => setIsMouseOverDropdown(true)}
            onMouseLeave={() => setIsMouseOverDropdown(false)}
          >
            <div className="border-b px-3 py-2">
              <div className="text-xs font-medium text-muted-foreground mb-1">
                {Object.keys(groupedOptions).some(key => groupedOptions[key].length > 0)
                  ? multiple 
                    ? 'Select options:'
                    : 'Select option:'
                  : inputValue.trim() 
                    ? 'No matching options found' 
                    : emptyMessage
                }
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {Object.keys(groupedOptions).some(key => groupedOptions[key].length > 0) ? (
                <div className="py-1">
                  {Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                    groupOptions.length > 0 && (
                      <div key={groupName}>
                        {groupBy && Object.keys(groupedOptions).length > 1 && (
                          <div className="px-3 py-1 text-xs font-medium text-muted-foreground bg-muted/50 border-b">
                            {groupName}
                          </div>
                        )}
                        {groupOptions.map((option) => (
                          <div
                            key={option.id}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAdd(option.id);
                            }}
                            className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  {option.groupName && !groupBy && (
                                    <Badge variant="outline" className="text-xs">
                                      {option.groupName}
                                    </Badge>
                                  )}
                                  <span className="font-medium">{option.label}</span>
                                </div>
                                {option.description && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {option.description}
                                  </div>
                                )}
                              </div>
                              <Plus className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                  {options.length === 0 
                    ? emptyMessage
                    : inputValue.trim() 
                      ? `No options match "${inputValue}"`
                      : multiple && selectedOptions.length === options.length
                        ? 'All available options are selected'
                        : 'No options available'
                  }
                </div>
              )}
              
              {/* Create new option (in dropdown) */}
              {canCreateNew && (
                <div className="py-1 border-t">
                  <div
                    onClick={() => handleAdd(inputValue)}
                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center bg-muted/50"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Create new: <strong>"{inputValue.trim()}"</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {helpText && (
        <p className="text-xs text-muted-foreground">
          {helpText}
        </p>
      )}
    </div>
  );
}