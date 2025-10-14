import { useState, useEffect } from 'react';
import { StandardDialog } from '../StandardDialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tags, Trash2, Package, X } from 'lucide-react';
import { Button } from '../ui/button';

interface TagDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tag: { name: string; count: number; items: any[] } | null;
  onDeleteTag: (tagName: string) => void;
  onCreateTag?: (tagName: string) => void;
  isCreating?: boolean;
  onRemoveTagFromService?: (tagName: string, serviceId: string) => void;
  onUpdateTagName?: (oldName: string, newName: string) => void;
}

export function TagDialog({ 
  isOpen, 
  onClose, 
  tag, 
  onDeleteTag, 
  onCreateTag,
  isCreating = false,
  onRemoveTagFromService,
  onUpdateTagName
}: TagDialogProps) {
  const [newTagName, setNewTagName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tagName, setTagName] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (isCreating) {
        setNewTagName('');
      } else if (tag) {
        setTagName(tag.name);
      }
    }
  }, [isOpen, isCreating, tag]);

  const handleDelete = async () => {
    if (!tag) return;
    
    if (confirm(`Delete tag "${tag.name}" from all items?`)) {
      try {
        setIsDeleting(true);
        await onDeleteTag(tag.name);
        onClose();
      } catch (error) {
        // // console.error('Failed to delete tag:', error);
        alert(`Failed to delete tag: ${(error as Error).message || 'Unknown error'}`);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim() || !onCreateTag) return;
    
    try {
      setIsSaving(true);
      await onCreateTag(newTagName.trim());
      onClose();
    } catch (error) {
      // // console.error('Failed to create tag:', error);
      alert(`Failed to create tag: ${(error as Error).message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveFromService = async (serviceId: string) => {
    if (!tag || !onRemoveTagFromService) return;
    
    if (confirm(`Remove tag "${tag.name}" from this service?`)) {
      try {
        await onRemoveTagFromService(tag.name, serviceId);
      } catch (error) {
        alert(`Failed to remove tag: ${(error as Error).message || 'Unknown error'}`);
      }
    }
  };

  const handleSaveTag = async () => {
    if (isCreating) {
      if (!newTagName.trim() || !onCreateTag) return;
      try {
        setIsSaving(true);
        await onCreateTag(newTagName.trim());
        onClose();
      } catch (error) {
        alert(`Failed to create tag: ${(error as Error).message || 'Unknown error'}`);
      } finally {
        setIsSaving(false);
      }
    } else {
      if (!tag || !onUpdateTagName || !tagName.trim()) return;
      
      if (tagName.trim() === tag.name) {
        onClose();
        return;
      }
      
      try {
        setIsSaving(true);
        await onUpdateTagName(tag.name, tagName.trim());
        onClose();
      } catch (error) {
        alert(`Failed to update tag name: ${(error as Error).message || 'Unknown error'}`);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Creating new tag
  if (isCreating) {
    return (
      <StandardDialog
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            <span>Create New Tag</span>
          </div>
        }
        description="Create a new tag that can be assigned to services"
        size="lg"
        secondaryActions={[
          {
            label: 'Cancel',
            onClick: onClose
          }
        ]}
        primaryAction={{
          label: isSaving ? 'Creating...' : 'Create Tag',
          onClick: handleSaveTag,
          loading: isSaving,
          disabled: !newTagName.trim()
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="tag-name">Tag Name *</Label>
          <Input
            id="tag-name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Enter tag name"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTagName.trim()) {
                handleCreateTag();
              }
            }}
          />
        </div>
      </StandardDialog>
    );
  }

  // Viewing existing tag
  if (!tag) return null;

  return (
    <StandardDialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Tags className="h-5 w-5" />
          <span>Tag Details</span>
        </div>
      }
      description={`View and manage the "${tag.name}" tag`}
      size="lg"
      primaryAction={{
        label: isSaving ? 'Saving...' : 'Save Changes',
        onClick: handleSaveTag,
        loading: isSaving,
        disabled: !tagName.trim() || tagName.trim() === tag.name
      }}
      destructiveActions={[{
        label: isDeleting ? 'Deleting...' : 'Delete Tag',
        onClick: handleDelete,
        loading: isDeleting,
        icon: <Trash2 className="h-4 w-4" />
      }]}
      secondaryActions={[
        {
          label: 'Cancel',
          onClick: onClose
        }
      ]}
    >
      <div className="space-y-4">
          {/* Tag Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Tags className="h-4 w-4" />
                Tag Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tag Name Section */}
              <div className="space-y-2">
                <Label htmlFor="tag-name" className="text-sm font-medium">Tag Name</Label>
                <Input
                  id="tag-name"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="Enter tag name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTag();
                  }}
                />
              </div>

              {/* Usage Count */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Usage Count</Label>
                <Badge variant="secondary" className="text-sm">
                  {tag.count} service{tag.count !== 1 ? 's' : ''} using this tag
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Items using this tag */}
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Items using this tag
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              {tag.items.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {tag.items.map((item, index) => (
                    <div key={item.id || index} className="flex items-center justify-between p-2 rounded-md border">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                      {onRemoveTagFromService && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromService(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Remove tag from this service"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">No services using this tag</p>
                  <p className="text-xs text-muted-foreground">This tag is not currently assigned to any services</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </StandardDialog>
  );
}