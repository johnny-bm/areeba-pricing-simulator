"use client"

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { DataTable } from '../../../../components/ui/data-table';
import { createBillingCycleColumns } from './billing-cycles-columns';
import { api } from '../../../../utils/api';

interface BillingCycle {
  id: string;
  name: string;
  value: string;
  description: string;
  months: number | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export function BillingCyclesConfiguration() {
  const [billingCycles, setBillingCycles] = useState<BillingCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load billing cycles from database
  useEffect(() => {
    const loadBillingCycles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.loadPricingCycles();
        setBillingCycles(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load billing cycles');
        console.error('Error loading billing cycles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBillingCycles();
  }, []);

  const handleCreateBillingCycle = async (billingCycle: Omit<BillingCycle, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newBillingCycle = await api.savePricingCycle({
        ...billingCycle,
        id: `cycle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      });
      setBillingCycles(prev => [...prev, newBillingCycle]);
    } catch (err: any) {
      console.error('Error creating billing cycle:', err);
      throw err;
    }
  };

  const handleUpdateBillingCycle = async (billingCycle: BillingCycle) => {
    try {
      const updatedBillingCycle = await api.savePricingCycle(billingCycle);
      setBillingCycles(prev => prev.map(bc => bc.id === billingCycle.id ? updatedBillingCycle : bc));
    } catch (err: any) {
      console.error('Error updating billing cycle:', err);
      throw err;
    }
  };

  const handleDeleteBillingCycle = async (cycleId: string) => {
    try {
      await api.deletePricingCycle(cycleId);
      setBillingCycles(prev => prev.filter(bc => bc.id !== cycleId));
    } catch (err: any) {
      console.error('Error deleting billing cycle:', err);
      throw err;
    }
  };

  const handleToggleActive = async (cycleId: string) => {
    try {
      const billingCycle = billingCycles.find(bc => bc.id === cycleId);
      if (!billingCycle) return;
      
      await api.togglePricingCycleActive(cycleId, !billingCycle.is_active);
      setBillingCycles(prev => prev.map(bc => 
        bc.id === cycleId ? { ...bc, is_active: !bc.is_active } : bc
      ));
    } catch (err: any) {
      console.error('Error toggling billing cycle status:', err);
    }
  };

  const handleDuplicateBillingCycle = async (billingCycle: BillingCycle) => {
    try {
      const duplicatedBillingCycle = {
        ...billingCycle,
        id: `cycle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${billingCycle.name} (Copy)`,
        display_order: billingCycles.length + 1
      };
      
      const newBillingCycle = await api.savePricingCycle(duplicatedBillingCycle);
      setBillingCycles(prev => [...prev, newBillingCycle]);
    } catch (err: any) {
      console.error('Error duplicating billing cycle:', err);
      throw err;
    }
  };

  const columns = createBillingCycleColumns(
    handleUpdateBillingCycle,
    handleDeleteBillingCycle,
    handleDuplicateBillingCycle,
    handleToggleActive
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing Cycles</CardTitle>
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
          <CardTitle>Billing Cycles</CardTitle>
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
            <CardTitle>Billing Cycles</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage global billing cycles available across all simulators
            </p>
          </div>
          <Button onClick={() => handleCreateBillingCycle({
            name: '',
            value: '',
            description: '',
            months: null,
            display_order: billingCycles.length + 1,
            is_active: true
          })}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Cycle
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable 
          columns={columns} 
          data={billingCycles}
          searchKey="name"
          onRowClick={(billingCycle) => handleUpdateBillingCycle(billingCycle)}
        />
      </CardContent>
    </Card>
  );
}