"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Spinner } from '../../../components/ui/spinner';
import { Plus, Package } from 'lucide-react';
import { toast } from "sonner";
import { PricingItem, Category } from '../../../types/domain';
import { SimpleServiceEditor } from './SimpleServiceEditor';
import { DataTable } from '../../../components/ui/data-table';
import { createServiceColumns } from '../../../components/services-columns';

interface SimpleServiceManagerProps {
  services: PricingItem[];
  categories: Category[];
  onUpdateServices: (services: PricingItem[]) => Promise<void>;
  onRefresh?: () => void;
  simulatorId?: string; // Add simulator ID prop
}

export const SimpleServiceManager = React.memo(function SimpleServiceManager({
  services,
  categories,
  onUpdateServices,
  onRefresh,
  simulatorId
}: SimpleServiceManagerProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingService, setEditingService] = useState<PricingItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState('');
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [isCreatingService, setIsCreatingService] = useState(false);

  // Component version tracking
  useEffect(() => {
    const componentVersion = '6.0.0-TANSTACK';
    // Component loaded successfully
  }, []);

  const handleCreateService = () => {
    setIsCreatingService(true);
    setEditingService(null);
    setIsCreating(true);
    setIsEditorOpen(true);
  };

  const handleEditService = (service: PricingItem) => {
    setEditingService(service);
    setIsCreating(false);
    setIsEditorOpen(true);
  };

  const handleSaveService = async (service: PricingItem) => {
    setIsSaving(true);
    setSaveProgress('Preparing to save...');
    
    try {
      let updatedServices: PricingItem[];
      
      // Check if this service already exists in our services array
      const isExistingService = services.some(s => s.id === service.id);
      
      // If service doesn't exist in our array, treat it as new (regardless of isCreating state)
      if (!isExistingService) {
        // Add new service (either creating new or duplicating)
        setSaveProgress('Adding new service...');
        updatedServices = [...services, service];
      } else {
        // Update existing service
        setSaveProgress('Updating service...');
        updatedServices = services.map(s => s.id === service.id ? service : s);
      }
      
      setSaveProgress(`Saving ${updatedServices.length} services...`);
      
      await onUpdateServices(updatedServices);
      
      setSaveProgress('Service saved successfully');
      
      const action = !isExistingService ? 'created' : 'updated';
      
      toast.success(!isExistingService ? 'Service created!' : 'Service updated!', {
        description: `"${service.name}" has been ${action} successfully`,
        duration: 3000
      });
      
      // Clear progress after a moment
      setTimeout(() => {
        setSaveProgress('');
        setIsSaving(false);
        setIsCreatingService(false);
        setIsEditorOpen(false); // Close the dialog
      }, 500);
      
    } catch (error) {
      setSaveProgress('');
      setIsSaving(false);
      setIsCreatingService(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Please try again';
      toast.error('Failed to save service', {
        description: errorMessage,
        duration: 5000
      });
      
      throw error; // Re-throw to let the editor handle the error display
    }
  };

  const handleDeleteService = async (service: PricingItem) => {
    try {
      setDeletingServiceId(service.id);
      const updatedServices = services.filter(s => s.id !== service.id);
      await onUpdateServices(updatedServices);
      toast.success('Service deleted successfully', {
        description: `"${service.name}" has been deleted`
      });
    } catch (error) {
      console.error('❌ Error deleting service:', error);
      toast.error('Failed to delete service', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      throw error; // Re-throw to let the editor handle the error display
    } finally {
      setDeletingServiceId(null);
    }
  };

  const handleToggleActive = async (serviceId: string) => {
    try {
      const updatedServices = services.map(s => 
        s.id === serviceId ? { ...s, is_active: !s.is_active } : s
      );
      await onUpdateServices(updatedServices);
    } catch (error) {
      // // console.error('Error toggling service status:', error);
    }
  };

  const handleQuickDelete = async (service: PricingItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${service.name}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      await handleDeleteService(service);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to delete service: ${errorMessage}`);
    }
  };

  const handleDuplicateService = async (service: PricingItem) => {
    try {
      const duplicatedService: PricingItem = {
        ...service,
        id: `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${service.name} (Copy)`,
        categoryId: service.categoryId || service.category, // Ensure categoryId is set
        category: service.categoryId || service.category, // Also set category field for API compatibility
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Set the state to indicate we're creating a new service
      setIsCreating(true);
      setIsCreatingService(true);
      
      // Use the proper save flow instead of direct onUpdateServices
      await handleSaveService(duplicatedService);
      
      // Reset the creating state after successful duplication
      setIsCreating(false);
      setIsCreatingService(false);
      
    } catch (error) {
      console.error('❌ Error duplicating service:', error);
      
      // Reset the creating state on error
      setIsCreating(false);
      setIsCreatingService(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to duplicate service: ${errorMessage}`);
    }
  };

  const columns = createServiceColumns(
    categories,
    handleEditService,
    handleQuickDelete,
    handleDuplicateService,
    handleToggleActive,
    deletingServiceId
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Service Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your pricing services with advanced table features
            </p>
          </div>
          <Button onClick={handleCreateService} disabled={isCreatingService}>
            {isCreatingService ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create New
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable 
          columns={columns} 
          data={services}
          searchKey="name"
          searchPlaceholder="Search services by name, description, or tags..."
          onRowClick={(service) => handleEditService(service)}
        />
      </CardContent>

      {/* Service Editor Dialog */}
      <SimpleServiceEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setIsCreatingService(false);
        }}
        onSave={handleSaveService}
        onDelete={handleDeleteService}
        service={editingService}
        categories={categories}
        isCreating={isCreating}
        isSaving={isSaving}
        saveProgress={saveProgress}
        simulatorId={simulatorId}
      />
    </Card>
  );
});