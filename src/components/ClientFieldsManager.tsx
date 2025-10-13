"use client"

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus } from 'lucide-react';
import { ConfigurationDefinition } from '../types/domain';
import { ConfigurationDialog } from './dialogs/ConfigurationDialog';
import { DataTable } from '../shared/components/ui/data-table';
import { createClientFieldColumns } from './client-fields-columns';

interface ClientFieldsManagerProps {
  configurations: ConfigurationDefinition[];
  onUpdateConfigurations: (configurations: ConfigurationDefinition[]) => Promise<void>;
  simulatorId: string;
}

export function ClientFieldsManager({
  configurations,
  onUpdateConfigurations,
  simulatorId
}: ClientFieldsManagerProps) {
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ConfigurationDefinition | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateConfig = () => {
    setEditingConfig(null);
    setIsCreating(true);
    setIsConfigDialogOpen(true);
  };

  const handleEditConfig = (config: ConfigurationDefinition) => {
    setEditingConfig(config);
    setIsCreating(false);
    setIsConfigDialogOpen(true);
  };

  const handleSaveConfig = async (config: ConfigurationDefinition) => {
    try {
      let updatedConfigurations: ConfigurationDefinition[];
      
      if (isCreating) {
        // Add new configuration
        updatedConfigurations = [...configurations, config];
      } else {
        // Update existing configuration
        updatedConfigurations = configurations.map(c => c.id === config.id ? config : c);
      }
      
      await onUpdateConfigurations(updatedConfigurations);
      setIsConfigDialogOpen(false);
      setEditingConfig(null);
    } catch (error) {
      // // console.error('Error saving configuration:', error);
      throw error; // Re-throw to let the dialog handle the error display
    }
  };

  const handleDeleteConfig = async (config: ConfigurationDefinition) => {
    try {
      const updatedConfigurations = configurations.filter(c => c.id !== config.id);
      await onUpdateConfigurations(updatedConfigurations);
      setIsConfigDialogOpen(false);
      setEditingConfig(null);
    } catch (error) {
      // // console.error('Error deleting configuration:', error);
      throw error; // Re-throw to let the dialog handle the error display
    }
  };

  const handleDuplicateConfig = async (config: ConfigurationDefinition) => {
    try {
      const duplicatedConfig = {
        ...config,
        id: `config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${config.name} (Copy)`
      };
      
      const updatedConfigurations = [...configurations, duplicatedConfig];
      await onUpdateConfigurations(updatedConfigurations);
    } catch (error) {
      // // console.error('Error duplicating configuration:', error);
      throw error;
    }
  };

  const handleToggleActive = async (configId: string) => {
    try {
      const updatedConfigurations = configurations.map(c => 
        c.id === configId ? { ...c, is_active: !c.is_active } : c
      );
      await onUpdateConfigurations(updatedConfigurations);
    } catch (error) {
      // // console.error('Error toggling configuration status:', error);
    }
  };

  const handleQuickDelete = async (config: ConfigurationDefinition) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${config.name}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      await handleDeleteConfig(config);
    } catch (error) {
      alert(`Failed to delete configuration: ${(error as Error).message || 'Unknown error'}`);
    }
  };

  const columns = createClientFieldColumns(
    handleEditConfig,
    handleQuickDelete,
    handleDuplicateConfig,
    handleToggleActive
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Client Fields Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage client field configurations for this simulator
            </p>
          </div>
          <Button onClick={handleCreateConfig}>
            <Plus className="mr-2 h-4 w-4" />
            Add Configuration
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable 
          columns={columns} 
          data={configurations}
          searchKey="name"
          searchPlaceholder="Search configurations..."
        />
      </CardContent>

      {/* Configuration Dialog */}
      <ConfigurationDialog
        isOpen={isConfigDialogOpen}
        onClose={() => {
          setIsConfigDialogOpen(false);
          setEditingConfig(null);
        }}
        onSave={handleSaveConfig}
        onDelete={handleDeleteConfig}
        onDuplicate={handleDuplicateConfig}
        configuration={editingConfig}
        configurations={configurations}
        isCreating={isCreating}
        simulator_id={simulatorId}
      />
    </Card>
  );
}
