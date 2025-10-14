"use client"

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { DataTable } from '../../../../shared/components/ui/data-table';
import { createTieredTemplateColumns } from './tiered-templates-columns';
import { api } from '../../../../utils/api';

interface TieredTemplate {
  id: string;
  name: string;
  value: string;
  description: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export function TieredTemplatesConfiguration() {
  const [tieredTemplates, setTieredTemplates] = useState<TieredTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tiered templates from database
  useEffect(() => {
    const loadTieredTemplates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.loadPricingTemplates();
        setTieredTemplates(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load tiered templates');
        console.error('Error loading tiered templates:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTieredTemplates();
  }, []);

  const handleCreateTieredTemplate = async (tieredTemplate: Omit<TieredTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newTieredTemplate = await api.savePricingTemplate({
        ...tieredTemplate,
        id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      });
      setTieredTemplates(prev => [...prev, newTieredTemplate]);
    } catch (err: any) {
      console.error('Error creating tiered template:', err);
      throw err;
    }
  };

  const handleUpdateTieredTemplate = async (tieredTemplate: TieredTemplate) => {
    try {
      const updatedTieredTemplate = await api.savePricingTemplate(tieredTemplate);
      setTieredTemplates(prev => prev.map(tt => tt.id === tieredTemplate.id ? updatedTieredTemplate : tt));
    } catch (err: any) {
      console.error('Error updating tiered template:', err);
      throw err;
    }
  };

  const handleDeleteTieredTemplate = async (templateId: string) => {
    try {
      await api.deletePricingTemplate(templateId);
      setTieredTemplates(prev => prev.filter(tt => tt.id !== templateId));
    } catch (err: any) {
      console.error('Error deleting tiered template:', err);
      throw err;
    }
  };

  const handleToggleActive = async (templateId: string) => {
    try {
      const tieredTemplate = tieredTemplates.find(tt => tt.id === templateId);
      if (!tieredTemplate) return;
      
      await api.togglePricingTemplateActive(templateId, !tieredTemplate.is_active);
      setTieredTemplates(prev => prev.map(tt => 
        tt.id === templateId ? { ...tt, is_active: !tt.is_active } : tt
      ));
    } catch (err: any) {
      console.error('Error toggling tiered template status:', err);
    }
  };

  const handleDuplicateTieredTemplate = async (tieredTemplate: TieredTemplate) => {
    try {
      const duplicatedTieredTemplate = {
        ...tieredTemplate,
        id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${tieredTemplate.name} (Copy)`,
        display_order: tieredTemplates.length + 1
      };
      
      const newTieredTemplate = await api.savePricingTemplate(duplicatedTieredTemplate);
      setTieredTemplates(prev => [...prev, newTieredTemplate]);
    } catch (err: any) {
      console.error('Error duplicating tiered template:', err);
      throw err;
    }
  };

  const columns = createTieredTemplateColumns(
    handleUpdateTieredTemplate,
    handleDeleteTieredTemplate,
    handleDuplicateTieredTemplate,
    handleToggleActive
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tiered Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tiered Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tiered Templates</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage global tiered pricing templates available across all simulators
            </p>
          </div>
          <Button onClick={() => handleCreateTieredTemplate({
            name: '',
            value: '',
            description: '',
            display_order: tieredTemplates.length + 1,
            is_active: true
          })}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable 
          columns={columns} 
          data={tieredTemplates}
          searchKey="name"
          onRowClick={(tieredTemplate) => handleUpdateTieredTemplate(tieredTemplate)}
        />
      </CardContent>
    </Card>
  );
}