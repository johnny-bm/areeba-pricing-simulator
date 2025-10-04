import { useState, useEffect } from 'react';
import { StandardDialog } from '../StandardDialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tags, Trash2, Package } from 'lucide-react';

interface TagDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tag: { name: string; count: number; items: any[] } | null;
  onDeleteTag: (tagName: string) => void;
  onCreateTag?: (tagName: string) => void;
  isCreating?: boolean;
}

export function TagDialog({ 
  isOpen, 
  onClose, 
  tag, 
  onDeleteTag, 
  onCreateTag,
  isCreating = false 
}: TagDialogProps) {
  const [newTagName, setNewTagName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isCreating) {
        setNewTagName('');
      }
    }
  }, [isOpen, isCreating]);

  const handleDelete = async () => {
    if (!tag) return;
    
    if (confirm(`Delete tag "${tag.name}" from all items?`)) {
      try {
        setIsDeleting(true);
        await onDeleteTag(tag.name);
        onClose();
      } catch (error) {
        console.error('Failed to delete tag:', error);
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
      console.error('Failed to create tag:', error);
      alert(`Failed to create tag: ${(error as Error).message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
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
        size="sm"
        secondaryActions={[
          {
            label: 'Cancel',
            onClick: onClose
          }
        ]}
        primaryAction={{
          label: isSaving ? 'Creating...' : 'Create Tag',
          onClick: handleCreateTag,
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
      destructiveActions={[{
        label: isDeleting ? 'Deleting...' : 'Delete Tag',
        onClick: handleDelete,
        loading: isDeleting,
        icon: <Trash2 className="h-4 w-4" />
      }]}
      secondaryActions={[
        {
          label: 'Close',
          onClick: onClose
        }
      ]}
    >
      <div className="space-y-4">
          {/* Tag Information */}
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  {tag.name}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 py-2">
              <div className="flex items-center gap-4">
                <div className="space-y-0.5">
                  <div className="text-sm text-muted-foreground">Usage Count</div>
                  <Badge variant="secondary">
                    {tag.count} item{tag.count !== 1 ? 's' : ''}
                  </Badge>
                </div>
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
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tag.items.map((item, index) => (
                  <div key={item.id || index} className="flex items-center justify-between p-2 rounded-md border">
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
    </StandardDialog>
  );
}