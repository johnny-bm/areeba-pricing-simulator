"use client"

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { DataTable } from '../../../../shared/components/ui/data-table';
import { createUnitColumns } from './units-columns';
import { api } from '../../../../utils/api';

interface Unit {
  id: string;
  name: string;
  value: string;
  description: string;
  category: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export function UnitsConfiguration() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load units from database
  useEffect(() => {
    const loadUnits = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.loadPricingUnits();
        setUnits(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load pricing units');
        console.error('Error loading units:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUnits();
  }, []);

  const handleCreateUnit = async (unit: Omit<Unit, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newUnit = await api.savePricingUnit({
        ...unit,
        id: `unit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      });
      setUnits(prev => [...prev, newUnit]);
    } catch (err: any) {
      console.error('Error creating unit:', err);
      throw err;
    }
  };

  const handleUpdateUnit = async (unit: Unit) => {
    try {
      const updatedUnit = await api.savePricingUnit(unit);
      setUnits(prev => prev.map(u => u.id === unit.id ? updatedUnit : u));
    } catch (err: any) {
      console.error('Error updating unit:', err);
      throw err;
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    try {
      await api.deletePricingUnit(unitId);
      setUnits(prev => prev.filter(u => u.id !== unitId));
    } catch (err: any) {
      console.error('Error deleting unit:', err);
      throw err;
    }
  };

  const handleToggleActive = async (unitId: string) => {
    try {
      const unit = units.find(u => u.id === unitId);
      if (!unit) return;
      
      await api.togglePricingUnitActive(unitId, !unit.is_active);
      setUnits(prev => prev.map(u => 
        u.id === unitId ? { ...u, is_active: !u.is_active } : u
      ));
    } catch (err: any) {
      console.error('Error toggling unit status:', err);
    }
  };

  const handleDuplicateUnit = async (unit: Unit) => {
    try {
      const duplicatedUnit = {
        ...unit,
        id: `unit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${unit.name} (Copy)`,
        display_order: units.length + 1
      };
      
      const newUnit = await api.savePricingUnit(duplicatedUnit);
      setUnits(prev => [...prev, newUnit]);
    } catch (err: any) {
      console.error('Error duplicating unit:', err);
      throw err;
    }
  };

  const columns = createUnitColumns(
    handleUpdateUnit,
    handleDeleteUnit,
    handleDuplicateUnit,
    handleToggleActive
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pricing Units</CardTitle>
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
          <CardTitle>Pricing Units</CardTitle>
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
            <CardTitle>Pricing Units</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage global pricing units available across all simulators
            </p>
          </div>
          <Button onClick={() => handleCreateUnit({
            name: '',
            value: '',
            description: '',
            category: '',
            display_order: units.length + 1,
            is_active: true
          })}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Unit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable 
          columns={columns} 
          data={units}
          searchKey="name"
          onRowClick={(unit) => handleUpdateUnit(unit)}
        />
      </CardContent>
    </Card>
  );
}