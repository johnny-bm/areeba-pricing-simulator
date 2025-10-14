import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { DataTable } from '../shared/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { StandardDialog } from './StandardDialog';
import { SimulatorDialog } from './dialogs/SimulatorDialog.tsx';
import { 
  Plus, 
  Edit, 
  Trash2, 
  CreditCard,
  Copy,
  MoreHorizontal
} from 'lucide-react';
import { Simulator, CreateSimulatorData, UpdateSimulatorData, SIMULATOR_ICONS } from '../types/simulator';
import { SimulatorApi } from '../utils/simulatorApi';
import { SIMULATOR_ICON_MAP_SMALL } from '../utils/icons';
import { toast } from 'sonner';

interface SimulatorManagerProps {
  onClose?: () => void;
}

export function SimulatorManager({ onClose }: SimulatorManagerProps) {
  const [simulators, setSimulators] = useState<Simulator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSimulatorDialog, setShowSimulatorDialog] = useState(false);
  const [editingSimulator, setEditingSimulator] = useState<Simulator | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templateSimulator, setTemplateSimulator] = useState<Simulator | null>(null);

  // Load simulators
  const loadSimulators = async () => {
    try {
      setIsLoading(true);
      const data = await SimulatorApi.loadAllSimulators();
      setSimulators(data);
    } catch (error) {
      // // console.error('Failed to load simulators:', error);
      toast.error('Failed to load simulators');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSimulators();
  }, []);

  const handleCreateSimulator = () => {
    setEditingSimulator(null);
    setIsCreating(true);
    setShowSimulatorDialog(true);
  };

  const handleCreateFromTemplate = () => {
    setShowTemplateDialog(true);
  };

  const handleSelectTemplate = (template: Simulator) => {
    setTemplateSimulator(template);
    setShowTemplateDialog(false);
    setEditingSimulator(null);
    setIsCreating(true);
    setShowSimulatorDialog(true);
  };

  const handleEditSimulator = (simulator: Simulator) => {
    setEditingSimulator(simulator);
    setIsCreating(false);
    setShowSimulatorDialog(true);
  };

  const handleDeleteSimulator = async (simulator: Simulator) => {
    if (!confirm(`Are you sure you want to delete "${simulator.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await SimulatorApi.deleteSimulator(simulator.id);
      toast.success('Simulator deleted successfully');
      loadSimulators();
    } catch (error) {
      // // console.error('Failed to delete simulator:', error);
      toast.error('Failed to delete simulator');
    }
  };

  const handleSaveSimulator = async (simulatorData: CreateSimulatorData | UpdateSimulatorData) => {
    try {
      if (isCreating) {
        if (templateSimulator) {
          // Create from template
          await SimulatorApi.createSimulatorFromTemplate(
            templateSimulator.id, 
            simulatorData as CreateSimulatorData
          );
          toast.success(`Simulator created successfully from template "${templateSimulator.title}"`);
          setTemplateSimulator(null);
        } else {
          // Create new simulator
          await SimulatorApi.createSimulator(simulatorData as CreateSimulatorData);
          toast.success('Simulator created successfully');
        }
      } else if (editingSimulator) {
        await SimulatorApi.updateSimulator(editingSimulator.id, simulatorData as UpdateSimulatorData);
        toast.success('Simulator updated successfully');
      }
      
      setShowSimulatorDialog(false);
      loadSimulators();
    } catch (error) {
      // // console.error('Failed to save simulator:', error);
      toast.error('Failed to save simulator');
    }
  };

  // Define columns for the modern DataTable
  const columns: ColumnDef<Simulator>[] = [
    {
      accessorKey: "title",
      header: "Simulator",
      cell: ({ row }) => {
        const simulator = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {SIMULATOR_ICON_MAP_SMALL[simulator.iconName] || <CreditCard className="h-4 w-4" />}
            </div>
            <div>
              <div className="font-medium">{simulator.title}</div>
              <div className="text-sm text-muted-foreground">{simulator.name}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const simulator = row.original;
        return (
          <div className="flex gap-1">
            {simulator.is_active && (
              <Badge variant="default" className="text-xs">Active</Badge>
            )}
            {simulator.isAvailable && (
              <Badge variant="outline" className="text-xs">Available</Badge>
            )}
            {simulator.comingSoon && (
              <Badge variant="outline" className="text-xs">Coming Soon</Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "urlSlug",
      header: "URL Slug",
      cell: ({ row }) => {
        const simulator = row.original;
        return (
          <code className="text-sm bg-muted px-2 py-1 rounded">
            {simulator.urlSlug}
          </code>
        );
      },
    },
    {
      accessorKey: "sort_order",
      header: "Order",
      cell: ({ row }) => {
        const simulator = row.original;
        return (
          <span className="text-sm font-mono text-muted-foreground">
            {simulator.sort_order}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const simulator = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEditSimulator(simulator)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDeleteSimulator(simulator)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Simulators</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your pricing simulators and their configurations
            </p>
          </div>
          <Button onClick={handleCreateSimulator}>
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable 
          columns={columns} 
          data={simulators}
          searchKey="title"
          searchPlaceholder="Search simulators..."
          onRowClick={(simulator) => handleEditSimulator(simulator)}
        />
      </CardContent>

      {showSimulatorDialog && (
        <SimulatorDialog
          isOpen={showSimulatorDialog}
          onClose={() => setShowSimulatorDialog(false)}
          onSave={handleSaveSimulator}
          simulator={editingSimulator}
          isCreating={isCreating}
        />
      )}

      {showTemplateDialog && (
        <StandardDialog
          isOpen={showTemplateDialog}
          onClose={() => setShowTemplateDialog(false)}
          title="Select Template"
          description="Choose a simulator to copy data from"
        >
          <div className="space-y-4">
            <div className="grid gap-3">
              {simulators.map((simulator) => (
                <Card 
                  key={simulator.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSelectTemplate(simulator)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {SIMULATOR_ICON_MAP_SMALL[simulator.iconName] || <CreditCard className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{simulator.title}</h3>
                        <p className="text-sm text-muted-foreground">{simulator.description}</p>
                      </div>
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {simulators.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Templates Available</h3>
                <p className="text-muted-foreground">
                  Create some simulators first to use them as templates
                </p>
              </div>
            )}
          </div>
        </StandardDialog>
      )}
    </Card>
  );
}
