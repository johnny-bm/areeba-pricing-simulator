import { useState, useEffect } from 'react';
import { StandardDialog } from '../StandardDialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Trash2, Copy } from 'lucide-react';
import { Category } from '../../types/domain';
import { NumberInput } from '../NumberInput';

interface CategoryFormData {
  id: string;
  name: string;
  description: string;
  order_index: number;
}

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => Promise<void>;
  onDelete?: (category: Category) => Promise<void>;
  onDuplicate?: (category: Category) => Promise<void>;
  category?: Category | null;
  categories: Category[];
  isCreating: boolean;
}



export function CategoryDialog({ isOpen, onClose, onSave, onDelete, onDuplicate, category, categories, isCreating }: CategoryDialogProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    id: '',
    name: '',
    description: '',
    order_index: 1
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (category && !isCreating) {
        // Edit mode
        setFormData({
          id: category.id,
          name: category.name,
          description: category.description,
          order_index: category.order_index
        });
      } else {
        // Create mode
        const maxOrderIndex = categories.length > 0 
          ? Math.max(...categories.map(cat => cat.order_index))
          : 0;
        
        setFormData({
          id: '',
          name: '',
          description: '',
          order_index: maxOrderIndex + 1
        });
      }
    }
  }, [isOpen, category, isCreating, categories]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const newCategory: Category = {
        id: formData.id || `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name,
        description: formData.description,
        order_index: formData.order_index
      };

      await onSave(newCategory);
      onClose();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert(`Failed to save category: ${(error as Error).message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!category || isCreating || !onDelete) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`);
    if (!confirmDelete) return;
    
    try {
      setIsDeleting(true);
      await onDelete(category);
      onClose();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert(`Failed to delete category: ${(error as Error).message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!category || !onDuplicate) return;
    
    try {
      setIsDuplicating(true);
      const duplicatedCategory = {
        ...category,
        id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${category.name} (Copy)`,
        order_index: categories.length + 1
      };
      await onDuplicate(duplicatedCategory);
      onClose();
    } catch (error) {
      console.error('Failed to duplicate category:', error);
      alert(`Failed to duplicate category: ${(error as Error).message || 'Unknown error'}`);
    } finally {
      setIsDuplicating(false);
    }
  };

  const updateField = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isValid = formData.name.trim() && formData.description.trim();

  return (
    <StandardDialog
      isOpen={isOpen}
      onClose={onClose}
      title={isCreating ? 'Create New Category' : 'Edit Category'}
      description={
        isCreating 
          ? 'Create a new category to organize pricing items in the library.'
          : 'Modify the selected category details and display settings.'
      }
      size="lg"
      destructiveActions={!isCreating && category && onDelete ? [{
        label: isDeleting ? 'Deleting...' : 'Delete',
        onClick: handleDelete,
        loading: isDeleting,
        disabled: isSaving || isDuplicating,
        icon: <Trash2 className="h-4 w-4" />
      }] : []}
      secondaryActions={[
        ...(!isCreating && category && onDuplicate ? [{
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
        label: isSaving ? 'Saving...' : 'Save Category',
        onClick: handleSave,
        loading: isSaving,
        disabled: !isValid || isDeleting || isDuplicating
      }}
    >
      <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Category Name *</Label>
              <Input
                id="cat-name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Enter category name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-order">Display Order</Label>
              <NumberInput
                value={formData.order_index}
                onChange={(value) => updateField('order_index', value)}
                placeholder="1"
                allowDecimals={false}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-description">Description *</Label>
            <Textarea
              id="cat-description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe this category"
              rows={3}
            />
          </div>
        </div>
    </StandardDialog>
  );
}