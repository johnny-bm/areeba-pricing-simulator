"use client"

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus, Package } from 'lucide-react';
import { toast } from "sonner";
import { PricingItem, Category } from '../types/domain';
import { SimpleServiceEditor } from './SimpleServiceEditor';
import { DataTable } from '../shared/components/ui/data-table';
import { createServiceColumns } from './services-columns';

interface SimpleServiceManagerProps {
  services: PricingItem[];
  categories: Category[];
  onUpdateServices: (services: PricingItem[]) => Promise<void>;
  onRefresh?: () => void;
}

export function SimpleServiceManager({
  services,
  categories,
  onUpdateServices,
  onRefresh
}: SimpleServiceManagerProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingService, setEditingService] = useState<PricingItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState('');

  // Component version logging
  useEffect(() => {
    const componentVersion = '6.0.0-TANSTACK';
    // // console.log(`%c✅ SimpleServiceManager v${componentVersion} loaded (TanStack Table Edition)`, 'color: #22c55e; font-weight: bold');
    // // console.log('%c   ➜ Layout: TanStack Table with sorting, filtering, pagination', 'color: #22c55e');
  }, []);

  const handleCreateService = () => {
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
      
      if (isCreating) {
        // Add new service
        setSaveProgress('Creating new service...');
        updatedServices = [...services, service];
      } else {
        // Update existing service
        setSaveProgress('Updating service...');
        updatedServices = services.map(s => s.id === service.id ? service : s);
      }
      
      setSaveProgress(`Saving ${updatedServices.length} services...`);
      await onUpdateServices(updatedServices);
      
      setSaveProgress('Service saved successfully');
      
      toast.success(isCreating ? 'Service created!' : 'Service updated!', {
        description: `"${service.name}" has been ${isCreating ? 'created' : 'updated'} successfully`,
        duration: 3000
      });
      
      // Clear progress after a moment
      setTimeout(() => {
        setSaveProgress('');
        setIsSaving(false);
      }, 500);
      
    } catch (error: any) {
      // // console.error('Error saving service:', error);
      setSaveProgress('');
      setIsSaving(false);
      
      toast.error('Failed to save service', {
        description: error.message || 'Please try again',
        duration: 5000
      });
      
      throw error; // Re-throw to let the editor handle the error display
    }
  };

  const handleDeleteService = async (service: PricingItem) => {
    try {
      const updatedServices = services.filter(s => s.id !== service.id);
      await onUpdateServices(updatedServices);
    } catch (error) {
      // // console.error('Error deleting service:', error);
      throw error; // Re-throw to let the editor handle the error display
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
    } catch (error: any) {
      alert(`Failed to delete service: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDuplicateService = async (service: PricingItem) => {
    try {
      const duplicatedService: PricingItem = {
        ...service,
        id: `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${service.name} (Copy)`
      };
      
      const updatedServices = [...services, duplicatedService];
      await onUpdateServices(updatedServices);
    } catch (error: any) {
      // // console.error('Error duplicating service:', error);
      alert(`Failed to duplicate service: ${error.message || 'Unknown error'}`);
    }
  };

  const columns = createServiceColumns(
    categories,
    handleEditService,
    handleQuickDelete,
    handleDuplicateService,
    handleToggleActive
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
          <Button onClick={handleCreateService}>
            <Plus className="mr-2 h-4 w-4" />
            Create New
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
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveService}
        onDelete={handleDeleteService}
        service={editingService}
        categories={categories}
        isCreating={isCreating}
        isSaving={isSaving}
        saveProgress={saveProgress}
      />
    </Card>
  );
}