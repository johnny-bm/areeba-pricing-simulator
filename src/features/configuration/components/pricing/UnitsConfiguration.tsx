"use client"

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { DataTable } from '../../../../shared/components/ui/data-table';
import { createUnitColumns } from './units-columns';
import { api } from '../../../../utils/api';

interface Unit {
  id: string;
  name: string;
  description: string;
  category: 'one-time' | 'monthly-recurring' | 'transaction-based' | 'event-activity-based';
  isActive: boolean;
  value?: string;
  display_order?: number;
}

export function UnitsConfiguration() {
  const { simulator } = useParams<{ simulator: string }>();
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load units from database
  useEffect(() => {
    const loadUnits = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // For global config routes, simulator can be undefined - that's OK
        const data = await api.loadPricingUnits(simulator || 'global');
        
        // Transform database data to component format
        const transformedUnits: Unit[] = data.map((unit: any) => ({
          id: unit.id,
          name: unit.name,
          description: unit.description || '',
          category: unit.category || 'one-time',
          isActive: unit.is_active ?? true,
          value: unit.value,
          display_order: unit.display_order
        }));
        
        setUnits(transformedUnits);
      } catch (err: any) {
        setError(err.message || 'Failed to load pricing units');
      } finally {
        setIsLoading(false);
      }
    };

    loadUnits();
  }, [simulator]);

  const handleCreateUnit = () => {
    // TODO: Implement create unit dialog
  };

  const handleEditUnit = (unit: Unit) => {
    // TODO: Implement edit unit dialog
  };

  const handleDeleteUnit = async (unit: Unit) => {
    try {
      setError(null);
      await api.deletePricingUnit(unit.id);
      setUnits(prev => prev.filter(u => u.id !== unit.id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete unit');
    }
  };

  const handleDuplicateUnit = async (unit: Unit) => {
    try {
      const duplicatedUnit = {
        ...unit,
        id: `unit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${unit.name} (Copy)`
      };
      await api.createPricingUnit(duplicatedUnit);
      setUnits(prev => [...prev, duplicatedUnit]);
    } catch (err: any) {
      setError(err.message || 'Failed to duplicate unit');
    }
  };

  const handleToggleActive = async (unitId: string) => {
    try {
      setError(null);
      const unit = units.find(u => u.id === unitId);
      if (!unit) return;
      
      await api.togglePricingUnitActive(unitId, !unit.isActive);
      setUnits(prev => prev.map(u => 
        u.id === unitId ? { ...u, isActive: !u.isActive } : u
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to toggle unit status');
    }
  };


  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'one-time': return 'One Time';
      case 'monthly-recurring': return 'Monthly';
      case 'transaction-based': return 'Transaction';
      case 'event-activity-based': return 'Event';
      default: return category;
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Pricing Units</h2>
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
            <CardTitle>Pricing Units</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage the available units for pricing services
            </p>
          </div>
          <Button onClick={handleCreateUnit}>
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
            columns={createUnitColumns(
              handleEditUnit,
              handleDeleteUnit,
              handleDuplicateUnit,
              handleToggleActive
            )} 
            data={units}
            searchKey="name"
            searchPlaceholder="Search units..."
          />
        )}
      </CardContent>
    </Card>
  );
}