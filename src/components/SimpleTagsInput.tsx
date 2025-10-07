import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Plus } from 'lucide-react';

interface SimpleTagsInputProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  placeholder?: string;
}

export function SimpleTagsInput({ tags = [], onAddTag, onRemoveTag, placeholder = "Add tags..." }: SimpleTagsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onAddTag(trimmedValue);
      setInputValue('');
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-2">
      {/* Selected Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={`${tag}-${index}`} variant="secondary" className="text-xs">
              {tag}
              <Button
                size="sm"
                variant="ghost"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => onRemoveTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Tag Input */}
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleAddTag}
          disabled={!inputValue.trim() || tags.includes(inputValue.trim())}
          size="sm"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}