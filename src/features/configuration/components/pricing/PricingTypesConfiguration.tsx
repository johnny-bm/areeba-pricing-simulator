"use client"

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { DataTable } from '../../../../shared/components/ui/data-table';
import { createPricingTypeColumns } from './pricing-types-columns';
import { api } from '../../../../utils/api';

interface PricingType {
  id: string;
  name: string;
  description: string;
  value: string;
  isActive: boolean;
  supportsRecurring?: boolean;
  supportsTiered?: boolean;
  display_order?: number;
}

export function PricingTypesConfiguration() {
  const { simulator } = useParams<{ simulator: string }>();
  const [pricingTypes, setPricingTypes] = useState<PricingType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load pricing types from database
  useEffect(() => {
    const loadTypes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.loadPricingTypes();
        
        // Transform database data to component format
        const transformedTypes: PricingType[] = data.map((type: any) => ({
          id: type.id,
          name: type.name,
          description: type.description || '',
          value: type.value,
          isActive: type.is_active ?? true,
          supportsRecurring: type.supports_recurring ?? false,
          supportsTiered: type.supports_tiered ?? false,
          display_order: type.display_order
        }));
        
        setPricingTypes(transformedTypes);
      } catch (err: any) {
        setError(err.message || 'Failed to load pricing types');
      } finally {
        setIsLoading(false);
      }
    };

    loadTypes();
  }, [simulator]);

  const handleCreateType = () => {
    // TODO: Implement create type dialog
  };

  const handleEditType = (type: PricingType) => {
    // TODO: Implement edit type dialog
  };

  const handleDeleteType = async (type: PricingType) => {
    try {
      setError(null);
      await api.deletePricingType(type.id);
      setPricingTypes(prev => prev.filter(t => t.id !== type.id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete pricing type');
    }
  };

  const handleDuplicateType = async (type: PricingType) => {
    try {
      const duplicatedType = {
        ...type,
        id: `type-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${type.name} (Copy)`
      };
      await api.createPricingType(duplicatedType);
      setPricingTypes(prev => [...prev, duplicatedType]);
    } catch (err: any) {
      setError(err.message || 'Failed to duplicate pricing type');
    }
  };

  const handleToggleActive = async (typeId: string) => {
    try {
      setError(null);
      const type = pricingTypes.find(t => t.id === typeId);
      if (!type) return;
      
      await api.togglePricingTypeActive(typeId, !type.isActive);
      setPricingTypes(prev => prev.map(t => 
        t.id === typeId ? { ...t, isActive: !t.isActive } : t
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to toggle pricing type status');
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Pricing Types</h2>
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
            <CardTitle>Pricing Types</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage the available pricing types for services
            </p>
          </div>
          <Button onClick={handleCreateType}>
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
            columns={createPricingTypeColumns(
              handleEditType,
              handleDeleteType,
              handleDuplicateType,
              handleToggleActive
            )} 
            data={pricingTypes}
            searchKey="name"
            searchPlaceholder="Search pricing types..."
          />
        )}
      </CardContent>
    </Card>
  );
}