"use client"

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { DataTable } from '../../../../shared/components/ui/data-table';
import { createPricingTypeColumns } from './pricing-types-columns';
import { api } from '../../../../utils/api';

interface PricingType {
  id: string;
  name: string;
  value: string;
  description: string;
  supports_tiered: boolean;
  supports_recurring: boolean;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export function PricingTypesConfiguration() {
  const [pricingTypes, setPricingTypes] = useState<PricingType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load pricing types from database
  useEffect(() => {
    const loadPricingTypes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.loadPricingTypes();
        setPricingTypes(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load pricing types');
        console.error('Error loading pricing types:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPricingTypes();
  }, []);

  const handleCreatePricingType = async (pricingType: Omit<PricingType, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newPricingType = await api.savePricingType({
        ...pricingType,
        id: `type-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      });
      setPricingTypes(prev => [...prev, newPricingType]);
    } catch (err: any) {
      console.error('Error creating pricing type:', err);
      throw err;
    }
  };

  const handleUpdatePricingType = async (pricingType: PricingType) => {
    try {
      const updatedPricingType = await api.savePricingType(pricingType);
      setPricingTypes(prev => prev.map(pt => pt.id === pricingType.id ? updatedPricingType : pt));
    } catch (err: any) {
      console.error('Error updating pricing type:', err);
      throw err;
    }
  };

  const handleDeletePricingType = async (typeId: string) => {
    try {
      await api.deletePricingType(typeId);
      setPricingTypes(prev => prev.filter(pt => pt.id !== typeId));
    } catch (err: any) {
      console.error('Error deleting pricing type:', err);
      throw err;
    }
  };

  const handleToggleActive = async (typeId: string) => {
    try {
      const pricingType = pricingTypes.find(pt => pt.id === typeId);
      if (!pricingType) return;
      
      await api.togglePricingTypeActive(typeId, !pricingType.is_active);
      setPricingTypes(prev => prev.map(pt => 
        pt.id === typeId ? { ...pt, is_active: !pt.is_active } : pt
      ));
    } catch (err: any) {
      console.error('Error toggling pricing type status:', err);
    }
  };

  const handleDuplicatePricingType = async (pricingType: PricingType) => {
    try {
      const duplicatedPricingType = {
        ...pricingType,
        id: `type-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${pricingType.name} (Copy)`,
        display_order: pricingTypes.length + 1
      };
      
      const newPricingType = await api.savePricingType(duplicatedPricingType);
      setPricingTypes(prev => [...prev, newPricingType]);
    } catch (err: any) {
      console.error('Error duplicating pricing type:', err);
      throw err;
    }
  };

  const columns = createPricingTypeColumns(
    handleUpdatePricingType,
    handleDeletePricingType,
    handleDuplicatePricingType,
    handleToggleActive
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pricing Types</CardTitle>
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
          <CardTitle>Pricing Types</CardTitle>
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
            <CardTitle>Pricing Types</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage global pricing types available across all simulators
            </p>
          </div>
          <Button onClick={() => handleCreatePricingType({
            name: '',
            value: '',
            description: '',
            supports_tiered: false,
            supports_recurring: false,
            display_order: pricingTypes.length + 1,
            is_active: true
          })}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Type
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable 
          columns={columns} 
          data={pricingTypes}
          searchKey="name"
          onRowClick={(pricingType) => handleUpdatePricingType(pricingType)}
        />
      </CardContent>
    </Card>
  );
}