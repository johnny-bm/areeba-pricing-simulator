// Drag and Drop Components for PDF Builder
// Comprehensive drag and drop functionality for template building

import React, { useState, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  Eye, 
  Edit,
  Image,
  Type,
  List,
  Table,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ContentSection, SectionType, SECTION_TYPES } from '../../../types/pdfBuilder';

interface DragDropSectionListProps {
  sections: ContentSection[];
  onSectionSelect: (section: ContentSection) => void;
  onSectionEdit: (section: ContentSection) => void;
  onSectionDelete: (section: ContentSection) => void;
  selectedSectionId?: string;
  className?: string;
}

export function DragDropSectionList({
  sections,
  onSectionSelect,
  onSectionEdit,
  onSectionDelete,
  selectedSectionId,
  className
}: DragDropSectionListProps) {
  const getSectionIcon = (type: SectionType) => {
    switch (type) {
      case 'title':
        return <Type className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'table':
        return <Table className="h-4 w-4" />;
      case 'bullet_list':
        return <List className="h-4 w-4" />;
      case 'callout':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-sm font-medium text-muted-foreground">Available Sections</h3>
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {sections.map((section) => (
          <Card
            key={section.id}
            className={cn(
              "cursor-pointer transition-colors hover:bg-muted/50",
              selectedSectionId === section.id && "ring-2 ring-primary"
            )}
            onClick={() => onSectionSelect(section)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getSectionIcon(section.section_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{section.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {SECTION_TYPES[section.section_type]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSectionEdit(section);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSectionDelete(section);
                    }}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Sortable Item Component
function SortableItem({ 
  id, 
  children, 
  isDragging = false 
}: { 
  id: string; 
  children: React.ReactNode; 
  isDragging?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children}
    </div>
  );
}

interface DragDropTemplateBuilderProps {
  templateSections: Array<{
    id: string;
    section_id: string;
    position: number;
    section?: ContentSection;
  }>;
  onSectionReorder: (startIndex: number, endIndex: number) => void;
  onSectionRemove: (index: number) => void;
  onSectionAdd: (section: ContentSection) => void;
  availableSections: ContentSection[];
  className?: string;
}

export function DragDropTemplateBuilder({
  templateSections,
  onSectionReorder,
  onSectionRemove,
  onSectionAdd,
  availableSections,
  className
}: DragDropTemplateBuilderProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeIndex = templateSections.findIndex(item => item.id === active.id);
    const overIndex = templateSections.findIndex(item => item.id === over.id);

    if (activeIndex !== overIndex) {
      onSectionReorder(activeIndex, overIndex);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    // Handle adding new sections from available sections
    if (active.id.toString().startsWith('available-') && over.id === 'template-sections') {
      const sectionId = active.id.toString().replace('available-', '');
      const section = availableSections.find(s => s.id === sectionId);
      if (section) {
        onSectionAdd(section);
      }
    }
  };

  const getSectionIcon = (type: SectionType) => {
    switch (type) {
      case 'title':
        return <Type className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'table':
        return <Table className="h-4 w-4" />;
      case 'bullet_list':
        return <List className="h-4 w-4" />;
      case 'callout':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className={cn("space-y-4", className)}>
        {/* Available Sections */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Available Sections</h3>
          <div className="min-h-[100px] p-2 border-2 border-dashed rounded-lg border-muted-foreground/25">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {availableSections.map((section) => (
                <div
                  key={`available-${section.id}`}
                  data-id={`available-${section.id}`}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        {getSectionIcon(section.section_type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{section.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {SECTION_TYPES[section.section_type]}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Template Sections */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Template Sections</h3>
          <div className="min-h-[200px] p-2 border-2 border-dashed rounded-lg border-muted-foreground/25">
            {templateSections.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <p className="text-sm">Drag sections here to build your template</p>
              </div>
            ) : (
              <SortableContext items={templateSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {templateSections.map((templateSection, index) => (
                    <SortableItem key={templateSection.id} id={templateSection.id}>
                      <Card className="transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div {...listeners}>
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                              </div>
                              {templateSection.section && getSectionIcon(templateSection.section.section_type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {templateSection.section?.title || 'Unknown Section'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {templateSection.section && SECTION_TYPES[templateSection.section.section_type]}
                                </p>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                #{index + 1}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onSectionRemove(index)}
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            )}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="opacity-50">
            {/* Render the dragged item */}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

interface DragDropListProps {
  items: Array<{
    id: string;
    title: string;
    type?: string;
    [key: string]: any;
  }>;
  onReorder: (startIndex: number, endIndex: number) => void;
  onRemove?: (index: number) => void;
  renderItem?: (item: any, index: number) => React.ReactNode;
  className?: string;
}

export function DragDropList({
  items,
  onReorder,
  onRemove,
  renderItem,
  className
}: DragDropListProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeIndex = items.findIndex(item => item.id === active.id);
    const overIndex = items.findIndex(item => item.id === over.id);

    if (activeIndex !== overIndex) {
      onReorder(activeIndex, overIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <div className={cn("space-y-2", className)}>
          {items.map((item, index) => (
            <SortableItem key={item.id} id={item.id}>
              <Card className="transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      {renderItem ? renderItem(item, index) : (
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.title}</p>
                          {item.type && (
                            <p className="text-xs text-muted-foreground">{item.type}</p>
                          )}
                        </div>
                      )}
                    </div>
                    {onRemove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(index)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}