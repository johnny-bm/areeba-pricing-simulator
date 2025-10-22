"use client"

import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { DataTable } from '../../../../components/ui/data-table';
import { createUnitColumns } from './units-columns';
import { api } from '../../../../utils/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Switch } from '../../../../components/ui/switch';
import { BulkDeleteButton } from '../../../../components/common/BulkDeleteButton';

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
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    description: '',
    category: '',
    display_order: 0,
    is_active: true
  });
  
  // Bulk operations state
  const [selectedRows, setSelectedRows] = useState<Unit[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

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

  const handleOpenCreateDialog = () => {
    setEditingUnit(null);
    setFormData({
      name: '',
      value: '',
      description: '',
      category: '',
      display_order: units.length + 1,
      is_active: true
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      value: unit.value,
      description: unit.description,
      category: unit.category,
      display_order: unit.display_order,
      is_active: unit.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSaveUnit = async () => {
    try {
      if (editingUnit) {
        // Update existing unit
        const updatedUnit = await api.savePricingUnit({
          ...editingUnit,
          ...formData
        });
        setUnits(prev => prev.map(u => u.id === editingUnit.id ? updatedUnit : u));
      } else {
        // Create new unit
        const newUnit = await api.savePricingUnit({
          ...formData,
          id: `unit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
        setUnits(prev => [...prev, newUnit]);
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      console.error('Error saving unit:', err);
      alert(`Failed to save unit: ${err.message || 'Unknown error'}`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedRows.length} unit(s)? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    setIsBulkDeleting(true);
    try {
      // Delete each selected unit
      for (const unit of selectedRows) {
        await api.deletePricingUnit(unit.id);
      }
      
      // Remove deleted units from state
      setUnits(prev => prev.filter(unit => !selectedRows.some(selected => selected.id === unit.id)));
      setSelectedRows([]);
      
      alert(`Successfully deleted ${selectedRows.length} unit(s)`);
    } catch (err: any) {
      console.error('Error bulk deleting units:', err);
      alert(`Failed to delete units: ${err.message || 'Unknown error'}`);
    } finally {
      setIsBulkDeleting(false);
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
          <div className="flex items-center gap-2">
            <BulkDeleteButton
              selectedCount={selectedRows.length}
              onDelete={handleBulkDelete}
              isDeleting={isBulkDeleting}
              itemName="unit"
            />
            <Button onClick={handleOpenCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Unit
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable 
          columns={columns} 
          data={units}
          searchKey="name"
          onRowClick={(unit) => handleOpenEditDialog(unit)}
          onSelectionChange={setSelectedRows}
        />
      </CardContent>
      
      {/* Unit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingUnit ? 'Edit Unit' : 'Create New Unit'}
            </DialogTitle>
            <DialogDescription>
              {editingUnit ? 'Update the unit details below.' : 'Fill in the details to create a new pricing unit.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="Unit name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                Value
              </Label>
              <Input
                id="value"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                className="col-span-3"
                placeholder="Unit value"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
                placeholder="Unit description"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="col-span-3"
                placeholder="Unit category"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="display_order" className="text-right">
                Display Order
              </Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_active" className="text-right">
                Active
              </Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUnit}>
              {editingUnit ? 'Update Unit' : 'Create Unit'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}