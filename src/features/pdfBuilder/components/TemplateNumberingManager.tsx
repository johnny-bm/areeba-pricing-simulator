// Template Numbering Manager Component
// Handles automatic numbering for sections in templates

import React from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { 
  Hash, 
  List, 
  Type,
  Settings
} from 'lucide-react';

interface TemplateNumberingManagerProps {
  sections: Array<{
    id: string;
    title: string;
    section_type: string;
    content: {
      level?: number;
    };
  }>;
  onUpdateNumbering: (sectionId: string, numbering: string) => void;
}

export function TemplateNumberingManager({ 
  sections, 
  onUpdateNumbering 
}: TemplateNumberingManagerProps) {
  
  // Group sections by heading level
  const groupedSections = sections.reduce((acc, section) => {
    if (section.section_type === 'title' && section.content.level) {
      const level = section.content.level;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(section);
    }
    return acc;
  }, {} as Record<number, typeof sections>);

  const getNumberingOptions = (level: number) => {
    switch (level) {
      case 1:
        return [
          { value: 'roman', label: 'Roman Numerals (I, II, III)', icon: <Type className="h-4 w-4" /> },
          { value: 'numbers', label: 'Numbers (1, 2, 3)', icon: <Hash className="h-4 w-4" /> },
          { value: 'none', label: 'No Numbering', icon: <List className="h-4 w-4" /> }
        ];
      case 2:
        return [
          { value: 'letters', label: 'Letters (A, B, C)', icon: <Type className="h-4 w-4" /> },
          { value: 'numbers', label: 'Numbers (1, 2, 3)', icon: <Hash className="h-4 w-4" /> },
          { value: 'decimal', label: 'Decimal (1.1, 1.2, 2.1)', icon: <Settings className="h-4 w-4" /> },
          { value: 'none', label: 'No Numbering', icon: <List className="h-4 w-4" /> }
        ];
      case 3:
        return [
          { value: 'numbers', label: 'Numbers (1, 2, 3)', icon: <Hash className="h-4 w-4" /> },
          { value: 'decimal', label: 'Decimal (1.1.1, 1.1.2)', icon: <Settings className="h-4 w-4" /> },
          { value: 'none', label: 'No Numbering', icon: <List className="h-4 w-4" /> }
        ];
      default:
        return [
          { value: 'numbers', label: 'Numbers (1, 2, 3)', icon: <Hash className="h-4 w-4" /> },
          { value: 'none', label: 'No Numbering', icon: <List className="h-4 w-4" /> }
        ];
    }
  };

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1: return 'Main Sections (H1)';
      case 2: return 'Sub-Sections (H2)';
      case 3: return 'Sub-Sub-Sections (H3)';
      case 4: return 'Minor Sections (H4)';
      case 5: return 'Small Sections (H5)';
      case 6: return 'Smallest Sections (H6)';
      default: return `Level ${level} Sections`;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Auto-Numbering Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure automatic numbering for different heading levels in your template.
          Numbering will be applied based on the order of sections in your template.
        </p>
      </div>

      {Object.entries(groupedSections)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([level, levelSections]) => (
          <div key={level} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium">{getLevelLabel(parseInt(level))}</h4>
                <p className="text-sm text-muted-foreground">
                  {levelSections.length} section{levelSections.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {levelSections.map(s => s.title).join(', ')}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getNumberingOptions(parseInt(level)).map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className="justify-start h-auto p-3"
                  onClick={() => {
                    levelSections.forEach(section => {
                      onUpdateNumbering(section.id, option.value);
                    });
                  }}
                >
                  <div className="flex items-center gap-3">
                    {option.icon}
                    <div className="text-left">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {getNumberingPreview(option.value, levelSections.length)}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ))}

      {Object.keys(groupedSections).length === 0 && (
        <div className="text-center py-8">
          <List className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Title Sections Found</h3>
          <p className="text-muted-foreground">
            Add title sections to your template to configure auto-numbering.
          </p>
        </div>
      )}
    </div>
  );
}

function getNumberingPreview(type: string, count: number): string {
  switch (type) {
    case 'roman':
      return count === 1 ? 'I' : count === 2 ? 'I, II' : count === 3 ? 'I, II, III' : 'I, II, III...';
    case 'letters':
      return count === 1 ? 'A' : count === 2 ? 'A, B' : count === 3 ? 'A, B, C' : 'A, B, C...';
    case 'numbers':
      return count === 1 ? '1' : count === 2 ? '1, 2' : count === 3 ? '1, 2, 3' : '1, 2, 3...';
    case 'decimal':
      return count === 1 ? '1.1' : count === 2 ? '1.1, 1.2' : count === 3 ? '1.1, 1.2, 1.3' : '1.1, 1.2, 1.3...';
    default:
      return 'No numbering applied';
  }
}
