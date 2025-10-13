"use client"

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { DataTable } from '../../../../shared/components/ui/data-table';
import { createTieredTemplateColumns } from './tiered-templates-columns';
import { api } from '../../../../utils/api';

interface TieredTemplate {
  id: string;
  name: string;
  description: string;
  tiers: Array<{
    min: number;
    max: number | null;
    price: number;
    unit: string;
  }>;
  isActive: boolean;
  display_order?: number;
}

export function TieredTemplatesConfiguration() {
  const { simulator } = useParams<{ simulator: string }>();
  const [templates, setTemplates] = useState<TieredTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load templates from database
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.loadPricingTemplates();
        
        // Transform database data to component format
        const transformedTemplates: TieredTemplate[] = data.map((template: any) => ({
          id: template.id,
          name: template.name,
          description: template.description || '',
          tiers: template.tiers || [],
          isActive: template.is_active ?? true,
          display_order: template.display_order
        }));
        
        setTemplates(transformedTemplates);
      } catch (err: any) {
        setError(err.message || 'Failed to load tiered templates');
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, [simulator]);

  const handleCreateTemplate = () => {
    // TODO: Implement create template dialog
  };

  const handleEditTemplate = (template: TieredTemplate) => {
    // TODO: Implement edit template dialog
  };

  const handleDeleteTemplate = async (template: TieredTemplate) => {
    try {
      setError(null);
      await api.deletePricingTemplate(template.id);
      setTemplates(prev => prev.filter(t => t.id !== template.id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete tiered template');
    }
  };

  const handleDuplicateTemplate = async (template: TieredTemplate) => {
    try {
      const duplicatedTemplate = {
        ...template,
        id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${template.name} (Copy)`
      };
      await api.createTieredTemplate(duplicatedTemplate);
      setTemplates(prev => [...prev, duplicatedTemplate]);
    } catch (err: any) {
      setError(err.message || 'Failed to duplicate tiered template');
    }
  };

  const handleToggleActive = async (templateId: string) => {
    try {
      setError(null);
      const template = templates.find(t => t.id === templateId);
      if (!template) return;
      
      await api.togglePricingTemplateActive(templateId, !template.isActive);
      setTemplates(prev => prev.map(t => 
        t.id === templateId ? { ...t, isActive: !t.isActive } : t
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to toggle tiered template status');
    }
  };

  const formatTiers = (tiers: TieredTemplate['tiers']) => {
    if (!tiers || tiers.length === 0) return 'No tiers';
    return `${tiers.length} tier${tiers.length !== 1 ? 's' : ''}`;
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Tiered Templates</h2>
            <p className="text-red-600">{error}</p>
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
              Manage pricing templates with multiple tiers
            </p>
          </div>
          <Button onClick={handleCreateTemplate}>
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <DataTable 
            columns={createTieredTemplateColumns(
              handleEditTemplate,
              handleDeleteTemplate,
              handleDuplicateTemplate,
              handleToggleActive
            )} 
            data={templates}
            searchKey="name"
            searchPlaceholder="Search tiered templates..."
          />
        )}
      </CardContent>
    </Card>
  );
}