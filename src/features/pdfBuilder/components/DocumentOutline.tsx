// Document Outline Component
// Shows the hierarchical structure of the document with auto-numbering

import React from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  ChevronRight, 
  ChevronDown,
  FileText,
  Image,
  Table,
  List,
  AlertCircle,
  Hash,
  Type,
  List as ListIcon
} from 'lucide-react';

interface DocumentSection {
  id: string;
  title: string;
  section_type: string;
  content: {
    level?: number;
    text?: string;
  };
  order: number;
}

interface DocumentOutlineProps {
  sections: DocumentSection[];
  numbering: {
    [level: number]: 'roman' | 'letters' | 'numbers' | 'decimal' | 'none';
  };
  onReorder?: (sections: DocumentSection[]) => void;
  onEdit?: (sectionId: string) => void;
  onDelete?: (sectionId: string) => void;
}

export function DocumentOutline({ 
  sections, 
  numbering, 
  onReorder, 
  onEdit, 
  onDelete 
}: DocumentOutlineProps) {
  const [expandedLevels, setExpandedLevels] = React.useState<Set<number>>(new Set([1, 2]));
  const [showNumbering, setShowNumbering] = React.useState(true);

  // Group sections by heading level
  const groupedSections = sections.reduce((acc, section) => {
    if (section.section_type === 'title' && section.content.level) {
      const level = section.content.level;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(section);
    } else {
      // Non-title sections go under the last title section
      if (!acc['content']) {
        acc['content'] = [];
      }
      acc['content'].push(section);
    }
    return acc;
  }, {} as Record<number | 'content', DocumentSection[]>);

  const getSectionIcon = (sectionType: string) => {
    switch (sectionType) {
      case 'title': return <Hash className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'table': return <Table className="h-4 w-4" />;
      case 'bullet': return <ListIcon className="h-4 w-4" />;
      case 'callout': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getNumberingForLevel = (level: number, index: number) => {
    const numberingType = numbering[level] || 'none';
    
    if (numberingType === 'none') return '';
    
    switch (numberingType) {
      case 'roman':
        return `${toRoman(index + 1)}. `;
      case 'letters':
        return `${String.fromCharCode(65 + index)}. `;
      case 'numbers':
        return `${index + 1}. `;
      case 'decimal':
        return `${level}.${index + 1}. `;
      default:
        return '';
    }
  };

  const toRoman = (num: number): string => {
    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
    let result = '';
    
    for (let i = 0; i < values.length; i++) {
      while (num >= values[i]) {
        result += symbols[i];
        num -= values[i];
      }
    }
    return result;
  };

  const toggleLevel = (level: number) => {
    setExpandedLevels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(level)) {
        newSet.delete(level);
      } else {
        newSet.add(level);
      }
      return newSet;
    });
  };

  const renderSection = (section: DocumentSection, level: number, index: number) => {
    const isExpanded = expandedLevels.has(level);
    const hasChildren = level < 6 && groupedSections[level + 1]?.length > 0;
    const numbering = showNumbering ? getNumberingForLevel(level, index) : '';

    return (
      <div key={section.id} className="space-y-1">
        <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 group">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => toggleLevel(level)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            )}
            {!hasChildren && <div className="w-6" />}
            
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {getSectionIcon(section.section_type)}
              <span className="text-sm font-medium truncate">
                {numbering}{section.title}
              </span>
              {section.section_type === 'title' && (
                <Badge variant="outline" className="text-xs">
                  H{section.content.level}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onEdit(section.id)}
              >
                <Type className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                onClick={() => onDelete(section.id)}
              >
                ×
              </Button>
            )}
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="ml-6 space-y-1">
            {groupedSections[level + 1]?.map((childSection, childIndex) => 
              renderSection(childSection, level + 1, childIndex)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Document Outline</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNumbering(!showNumbering)}
            >
              {showNumbering ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span className="ml-2">
                {showNumbering ? 'Hide' : 'Show'} Numbering
              </span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {Object.keys(groupedSections)
            .filter(key => key !== 'content')
            .sort((a, b) => parseInt(a as string) - parseInt(b as string))
            .map(level => (
              <div key={level}>
                {groupedSections[parseInt(level as string)]?.map((section, index) => 
                  renderSection(section, parseInt(level as string), index)
                )}
              </div>
            ))}
          
          {groupedSections['content'] && groupedSections['content'].length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-xs font-medium text-muted-foreground mb-2">Content Sections</div>
              {groupedSections['content'].map((section, index) => (
                <div key={section.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50">
                  {getSectionIcon(section.section_type)}
                  <span className="text-sm truncate">{section.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {sections.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2" />
            <p>No sections added yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
