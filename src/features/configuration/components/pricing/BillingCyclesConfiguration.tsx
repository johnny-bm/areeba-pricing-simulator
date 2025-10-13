"use client"

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { DataTable } from '../../../../shared/components/ui/data-table';
import { createBillingCycleColumns } from './billing-cycles-columns';
import { api } from '../../../../utils/api';

interface BillingCycle {
  id: string;
  name: string;
  description: string;
  value: string;
  isActive: boolean;
  months?: number | null;
  display_order?: number;
}

export function BillingCyclesConfiguration() {
  const { simulator } = useParams<{ simulator: string }>();
  const [billingCycles, setBillingCycles] = useState<BillingCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load billing cycles from database
  useEffect(() => {
    const loadCycles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.loadPricingCycles();
        
        // Transform database data to component format
        const transformedCycles: BillingCycle[] = data.map((cycle: any) => ({
          id: cycle.id,
          name: cycle.name,
          description: cycle.description || '',
          value: cycle.value,
          isActive: cycle.is_active ?? true,
          months: cycle.months,
          display_order: cycle.display_order
        }));
        
        setBillingCycles(transformedCycles);
      } catch (err: any) {
        setError(err.message || 'Failed to load billing cycles');
      } finally {
        setIsLoading(false);
      }
    };

    loadCycles();
  }, [simulator]);

  const handleCreateCycle = () => {
    // TODO: Implement create cycle dialog
  };

  const handleEditCycle = (cycle: BillingCycle) => {
    // TODO: Implement edit cycle dialog
  };

  const handleDeleteCycle = async (cycle: BillingCycle) => {
    try {
      setError(null);
      await api.deletePricingCycle(cycle.id);
      setBillingCycles(prev => prev.filter(c => c.id !== cycle.id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete billing cycle');
    }
  };

  const handleDuplicateCycle = async (cycle: BillingCycle) => {
    try {
      const duplicatedCycle = {
        ...cycle,
        id: `cycle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${cycle.name} (Copy)`
      };
      await api.createBillingCycle(duplicatedCycle);
      setBillingCycles(prev => [...prev, duplicatedCycle]);
    } catch (err: any) {
      setError(err.message || 'Failed to duplicate billing cycle');
    }
  };

  const handleToggleActive = async (cycleId: string) => {
    try {
      setError(null);
      const cycle = billingCycles.find(c => c.id === cycleId);
      if (!cycle) return;
      
      await api.togglePricingCycleActive(cycleId, !cycle.isActive);
      setBillingCycles(prev => prev.map(c => 
        c.id === cycleId ? { ...c, isActive: !c.isActive } : c
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to toggle billing cycle status');
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Billing Cycles</h2>
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
            <CardTitle>Billing Cycles</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage the available billing cycles for recurring services
            </p>
          </div>
          <Button onClick={handleCreateCycle}>
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
            columns={createBillingCycleColumns(
              handleEditCycle,
              handleDeleteCycle,
              handleDuplicateCycle,
              handleToggleActive
            )} 
            data={billingCycles}
            searchKey="name"
            searchPlaceholder="Search billing cycles..."
          />
        )}
      </CardContent>
    </Card>
  );
}