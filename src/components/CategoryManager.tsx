"use client"

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus } from 'lucide-react';
import { Category, PricingItem } from '../types/domain';
import { CategoryDialog } from './dialogs/CategoryDialog';
import { DataTable } from './DataTable';
import { createCategoryColumns } from './categories-columns';

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
      // // console.error('Error saving category:', error);
      throw error; // Re-throw to let the dialog handle the error display
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    try {
      // Check if category is being used by any services
      const servicesUsingCategory = services.filter(service => service.categoryId === category.id);
      
      if (servicesUsingCategory.length > 0) {
        throw new Error(`Cannot delete category "${category.name}" because it is being used by ${servicesUsingCategory.length} service(s). Please reassign or delete those services first.`);
      }
      
      const updatedCategories = categories.filter(c => c.id !== category.id);
      await onUpdateCategories(updatedCategories);
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
    } catch (error) {
      // // console.error('Error deleting category:', error);
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
      // // console.error('Error duplicating category:', error);
      throw error;
    }
  };

  const handleToggleActive = async (categoryId: string) => {
    try {
      const updatedCategories = categories.map(c => 
        c.id === categoryId ? { ...c, is_active: !c.is_active } : c
      );
      await onUpdateCategories(updatedCategories);
    } catch (error) {
      // // console.error('Error toggling category status:', error);
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
      alert(`Failed to delete category: ${(error as Error).message || 'Unknown error'}`);
    }
  };

  const columns = createCategoryColumns(
    services,
    handleEditCategory,
    handleQuickDelete,
    handleDuplicateCategory,
    handleToggleActive
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Category Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Organize pricing services into logical categories
            </p>
          </div>
          <Button onClick={handleCreateCategory}>
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable 
          columns={columns} 
          data={categories}
          searchKey="name"
          searchPlaceholder="Search categories..."
          onRowClick={(category) => handleEditCategory(category)}
        />
      </CardContent>

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
    </Card>
  );
}