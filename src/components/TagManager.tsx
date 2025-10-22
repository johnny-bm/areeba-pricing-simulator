"use client"

import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus } from 'lucide-react';
import { PricingItem } from '../types/domain';
import { TagDialog } from './dialogs/TagDialog';
import { DataTable } from './DataTable';
import { createTagColumns } from './tags-columns';

interface TagData {
  name: string;
  count: number;
  items: PricingItem[];
}

interface TagManagerProps {
  services: PricingItem[];
  onUpdateServices: (services: PricingItem[]) => Promise<void>;
}

export function TagManager({
  services,
  onUpdateServices
}: TagManagerProps) {
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagData | null>(null);
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  // Extract and organize tags from services
  const tagData = useMemo(() => {
    const tagMap = new Map<string, { count: number; items: PricingItem[] }>();
    
    services.forEach(service => {
      if (service.tags && service.tags.length > 0) {
        service.tags.forEach(tag => {
          if (!tagMap.has(tag)) {
            tagMap.set(tag, { count: 0, items: [] });
          }
          const tagInfo = tagMap.get(tag)!;
          tagInfo.count++;
          tagInfo.items.push(service);
        });
      }
    });

    // Include tags with zero items (empty tags should still be shown)
    const allTags = Array.from(tagMap.entries())
      .map(([name, info]) => ({ name, ...info }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return allTags;
  }, [services]);

  const handleCreateTag = () => {
    setSelectedTag(null);
    setIsCreatingTag(true);
    setIsTagDialogOpen(true);
  };

  const handleSaveNewTag = async (tagName: string) => {
    // Check if tag already exists
    if (tagData.some(tag => tag.name.toLowerCase() === tagName.toLowerCase())) {
      alert('Tag already exists');
      throw new Error('Tag already exists');
    }
    
    // Show success message and guidance
    alert(`Tag "${tagName}" created successfully! You can now assign it to services through the service editor.`);
  };

  const handleViewTag = (tag: TagData) => {
    setSelectedTag(tag);
    setIsCreatingTag(false);
    setIsTagDialogOpen(true);
  };

  const handleDeleteTag = async (tagName: string) => {
    // Remove the tag from all services that have it
    const updatedServices = services.map(service => ({
      ...service,
      tags: service.tags ? service.tags.filter(tag => tag !== tagName) : []
    }));
    
    await onUpdateServices(updatedServices);
  };

  const handleRemoveTagFromService = async (tagName: string, serviceId: string) => {
    // Remove the tag from a specific service
    const updatedServices = services.map(service => {
      if (service.id === serviceId) {
        return {
          ...service,
          tags: service.tags ? service.tags.filter(tag => tag !== tagName) : []
        };
      }
      return service;
    });
    
    await onUpdateServices(updatedServices);
    
    // Force update the selected tag data by recalculating it
    if (selectedTag && selectedTag.name === tagName) {
      // Recalculate the tag data for this specific tag
      const remainingServices = updatedServices.filter(service => 
        service.tags && service.tags.includes(tagName)
      );
      
      const updatedTagData = {
        name: tagName,
        count: remainingServices.length,
        items: remainingServices
      };
      
      setSelectedTag(updatedTagData);
    }
  };

  const handleUpdateTagName = async (oldName: string, newName: string) => {
    // Update the tag name in all services that have it
    const updatedServices = services.map(service => ({
      ...service,
      tags: service.tags ? service.tags.map(tag => tag === oldName ? newName : tag) : []
    }));
    
    await onUpdateServices(updatedServices);
    
    // Update the selected tag data
    if (selectedTag && selectedTag.name === oldName) {
      const updatedTagData = {
        name: newName,
        count: selectedTag.count,
        items: selectedTag.items
      };
      setSelectedTag(updatedTagData);
    }
  };

  const handleQuickDelete = async (tagName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete tag "${tagName}" from all services? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      await handleDeleteTag(tagName);
    } catch (error) {
      alert(`Failed to delete tag: ${(error as Error).message || 'Unknown error'}`);
    }
  };

  const handleDuplicateTag = (tagName: string) => {
    const newTagName = prompt(`Create a duplicate of tag "${tagName}".\n\nEnter the new tag name:`, `${tagName} Copy`);
    
    if (!newTagName || newTagName.trim() === '') return;
    
    // Check if tag already exists
    if (tagData.some(tag => tag.name.toLowerCase() === newTagName.toLowerCase())) {
      alert('A tag with this name already exists. Please choose a different name.');
      return;
    }
    
    alert(`Tag "${newTagName}" created successfully! You can now assign it to services through the service editor.`);
  };

  const columns = createTagColumns(
    handleViewTag,
    handleQuickDelete,
    handleDuplicateTag
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tag Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage tags for organizing services with advanced table features
            </p>
          </div>
          <Button onClick={handleCreateTag}>
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable 
          key={`tags-${services.length}-${JSON.stringify(services.map(s => s.tags).flat())}`}
          columns={columns} 
          data={tagData}
          searchKey="name"
          searchPlaceholder="Search tags..."
          onRowClick={(tag) => handleViewTag(tag)}
        />
      </CardContent>

      {/* Tag Dialog */}
      <TagDialog
        key={selectedTag ? `${selectedTag.name}-${selectedTag.count}` : 'new-tag'}
        isOpen={isTagDialogOpen}
        onClose={() => {
          setIsTagDialogOpen(false);
          setSelectedTag(null);
          setIsCreatingTag(false);
        }}
        tag={selectedTag}
        onDeleteTag={handleDeleteTag}
        onCreateTag={handleSaveNewTag}
        isCreating={isCreatingTag}
        onRemoveTagFromService={handleRemoveTagFromService}
        onUpdateTagName={handleUpdateTagName}
      />
    </Card>
  );
}