import { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TableCell } from './ui/table';
import { Plus, Edit, Trash2, Package, Copy } from 'lucide-react';
import { Category, PricingItem } from '../types/pricing';
import { DataTable } from './DataTable';
import { CategoryDialog } from './dialogs/CategoryDialog';

interface CategoryManagerProps {
  categories: Category[];
  services: PricingItem[];
  onUpdateCategories: (categories: Category[]) => Promise<void>;
}

export function CategoryManager({
  categories,
  services,
  onUpdateCategories
}: CategoryManagerProps) {
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsCreating(true);
    setIsCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCreating(false);
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = async (category: Category) => {
    try {
      let updatedCategories: Category[];
      
      if (isCreating) {
        // Add new category
        updatedCategories = [...categories, category];
      } else {
        // Update existing category
        updatedCategories = categories.map(c => c.id === category.id ? category : c);
      }
      
      await onUpdateCategories(updatedCategories);
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
      throw error; // Re-throw to let the dialog handle the error display
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    try {
      // Check if category is being used by any services
      const servicesUsingCategory = services.filter(service => service.category === category.id);
      
      if (servicesUsingCategory.length > 0) {
        throw new Error(`Cannot delete category "${category.name}" because it is being used by ${servicesUsingCategory.length} service(s). Please reassign or delete those services first.`);
      }
      
      const updatedCategories = categories.filter(c => c.id !== category.id);
      await onUpdateCategories(updatedCategories);
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error; // Re-throw to let the dialog handle the error display
    }
  };

  const handleDuplicateCategory = async (category: Category) => {
    try {
      const duplicatedCategory = {
        ...category,
        id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${category.name} (Copy)`,
        order_index: categories.length + 1
      };
      
      const updatedCategories = [...categories, duplicatedCategory];
      await onUpdateCategories(updatedCategories);
    } catch (error) {
      console.error('Error duplicating category:', error);
      throw error;
    }
  };

  const handleQuickDelete = async (category: Category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      await handleDeleteCategory(category);
    } catch (error) {
      alert(`Failed to delete category: ${error.message || 'Unknown error'}`);
    }
  };

  const handleReorderCategories = async (reorderedCategories: Category[]) => {
    try {
      await onUpdateCategories(reorderedCategories);
    } catch (error) {
      console.error('Error reordering categories:', error);
    }
  };

  // Get services count for each category
  const getCategoryServiceCount = (categoryId: string) => {
    return services.filter(service => service.category === categoryId).length;
  };

  return (
    <div>
      <DataTable
        title="Category Management"
        description="Organize pricing services into logical categories"
        headers={['Name', 'Description', 'Order', 'Services', 'Actions']}
        items={categories}
        getItemKey={(category) => category.id}
        onReorder={handleReorderCategories}
        onRowClick={handleEditCategory}
        searchFields={['name', 'description']}
        searchPlaceholder="Search categories..."
        actionButton={
          <Button onClick={handleCreateCategory}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        }
        emptyStateTitle="No categories created yet"
        emptyStateDescription="Create your first category to organize pricing services"
        emptyStateIcon={<Package className="h-12 w-12 text-muted-foreground" />}
        emptyStateAction={
          <Button onClick={handleCreateCategory}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Category
          </Button>
        }
        renderRow={(category) => (
          <>
            <TableCell>
              <div className="font-medium">{category.name}</div>
            </TableCell>
            <TableCell>
              <div className="text-sm text-muted-foreground max-w-xs truncate">
                {category.description}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {category.order_index}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">
                {getCategoryServiceCount(category.id)} services
              </Badge>
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditCategory(category)}
                  title="Edit category"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDuplicateCategory(category)}
                  title="Duplicate category"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleQuickDelete(category)}
                  className="text-red-600 hover:text-red-700"
                  title="Delete category"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </TableCell>
          </>
        )}
      />

      {/* Category Dialog */}
      <CategoryDialog
        isOpen={isCategoryDialogOpen}
        onClose={() => {
          setIsCategoryDialogOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
        onDuplicate={handleDuplicateCategory}
        category={editingCategory}
        categories={categories}
        isCreating={isCreating}
      />
    </div>
  );
}