// Template Builder Component
// Manages PDF template creation and editing

import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { TableCell } from '../../../components/ui/table';
import { Input } from '../../../components/ui/input';
import { DataTable } from '../../../components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Copy,
  Play,
  FileText,
  Settings,
  Layout,
  List,
  Hash
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { 
  PdfTemplate, 
  UserPermissions,
  CreateTemplateForm,
  UpdateTemplateForm
} from '../../../types/pdfBuilder';
import { usePdfTemplates, useAvailableSimulatorTypes } from '../hooks/usePdfBuilder';
import { DragDropTemplateBuilder } from './DragDropComponents';
import { TemplatePresets } from './TemplatePresets';
import { TemplateNumberingManager } from './TemplateNumberingManager';
import { DocumentOutline } from './DocumentOutline';
import { TemplateBuilderInterface } from './TemplateBuilderInterface';
import { toast } from 'sonner';

interface TemplateBuilderProps {
  permissions: UserPermissions;
}

export function TemplateBuilder({ permissions }: TemplateBuilderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [simulatorTypeFilter, setSimulatorTypeFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PdfTemplate | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('templates');
  const [showBuilderInterface, setShowBuilderInterface] = useState(false);
  const [selectedSimulatorType, setSelectedSimulatorType] = useState<string>('');
  const [templateNumbering, setTemplateNumbering] = useState<{[level: number]: 'roman' | 'letters' | 'numbers' | 'decimal' | 'none'}>({});

  // Fetch templates with filters
  const { 
    templates, 
    loading, 
    error, 
    total,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    activateTemplate,
    bulkDeleteTemplates
  } = usePdfTemplates({
    search: searchTerm || undefined,
    simulator_type: simulatorTypeFilter !== 'all' ? simulatorTypeFilter : undefined,
    page: 1,
    limit: 50
  });

  // Fetch available simulator types
  const { simulatorTypes } = useAvailableSimulatorTypes();

  const handleCreateTemplate = async (templateData: CreateTemplateForm) => {
    try {
      await createTemplate(templateData);
      setShowCreateDialog(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleStartVisualBuilder = (simulatorType: string) => {
    setSelectedSimulatorType(simulatorType);
    setShowBuilderInterface(true);
  };

  const handleSaveFromBuilder = async (templateData: Partial<PdfTemplate>) => {
    try {
      await createTemplate(templateData as CreateTemplateForm);
      setShowBuilderInterface(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleCancelBuilder = () => {
    setShowBuilderInterface(false);
    setSelectedSimulatorType('');
  };

  const handleUpdateTemplate = async (id: string, templateData: UpdateTemplateForm) => {
    try {
      await updateTemplate(id, templateData);
      setEditingTemplate(null);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleDeleteTemplate = async (template: PdfTemplate) => {
    if (confirm(`Are you sure you want to delete "${template.template_name}"?`)) {
      try {
        await deleteTemplate(template.id);
      } catch (error) {
        // Error is handled by the hook
      }
    }
  };

  const handleDuplicateTemplate = async (template: PdfTemplate) => {
    const newName = prompt(`Enter new name for "${template.template_name}":`, `${template.template_name} (Copy)`);
    if (newName && newName.trim()) {
      try {
        await duplicateTemplate(template.id, newName.trim());
      } catch (error) {
        // Error is handled by the hook
      }
    }
  };

  const handleActivateTemplate = async (template: PdfTemplate) => {
    try {
      await activateTemplate(template.id);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTemplates.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedTemplates.length} templates?`)) {
      try {
        await bulkDeleteTemplates(selectedTemplates);
        setSelectedTemplates([]);
      } catch (error) {
        // Error is handled by the hook
      }
    }
  };

  const handleSelectPreset = (preset: any) => {
    // TODO: Implement preset selection logic
    // // console.log('Selected preset:', preset);
    toast.success(`Selected ${preset.name} template structure`);
  };

  const handleCreateCustom = () => {
    setShowCreateDialog(true);
  };

  const handleUpdateNumbering = (sectionId: string, numbering: 'roman' | 'letters' | 'numbers' | 'decimal' | 'none') => {
    // TODO: Implement numbering update logic
    // // console.log('Update numbering for section:', sectionId, 'to:', numbering);
    toast.success('Numbering updated');
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.template_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = simulatorTypeFilter === 'all' || template.simulator_type === simulatorTypeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Visual Builder
          </TabsTrigger>
          <TabsTrigger value="presets" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Presets
          </TabsTrigger>
          <TabsTrigger value="numbering" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Numbering
          </TabsTrigger>
          <TabsTrigger value="outline" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Outline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <DataTable
            title="PDF Templates"
            description="Create and manage PDF templates for different simulator types"
            headers={['Template', 'Simulator', 'Status', 'Version', 'Created', 'Actions']}
            items={filteredTemplates}
            getItemKey={(template) => template.id}
            renderRow={(template) => (
              <>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{template.template_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {template.section_count || 0} sections
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {template.simulator_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={template.is_active ? "default" : "secondary"}>
                    {template.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    v{template.version_number}
                  </span>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-muted-foreground">
                    {new Date(template.created_at).toLocaleDateString()}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTemplate(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {!template.is_active && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleActivateTemplate(template)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </>
            )}
            actionButton={
              permissions.can_create_templates ? (
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Create New Template</DialogTitle>
                      <DialogDescription>
                        Create a new PDF template for your simulator.
                      </DialogDescription>
                    </DialogHeader>
                    <TemplateForm
                      onSubmit={handleCreateTemplate}
                      onCancel={() => setShowCreateDialog(false)}
                      simulatorTypes={simulatorTypes}
                    />
                  </DialogContent>
                </Dialog>
              ) : undefined
            }
            searchPlaceholder="Search templates..."
            searchFields={['template_name']}
            filterOptions={[
              {
                key: 'simulator_type',
                label: 'Simulator',
                options: [
                  { value: 'all', label: 'All Simulators' },
                  ...simulatorTypes.map((type) => ({
                    value: type.value,
                    label: type.label
                  }))
                ]
              }
            ]}
            emptyStateTitle="No PDF Templates"
            emptyStateDescription="Create your first PDF template to start building custom documents."
            emptyStateIcon={<FileText className="h-12 w-12 text-muted-foreground" />}
            emptyStateAction={
              permissions.can_create_templates ? (
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Template
                </Button>
              ) : undefined
            }
          />
        </TabsContent>

        <TabsContent value="builder" className="space-y-4">
          {showBuilderInterface ? (
            <TemplateBuilderInterface
              simulatorType={selectedSimulatorType}
              onSave={handleSaveFromBuilder}
              onCancel={handleCancelBuilder}
            />
          ) : (
            <div className="text-center py-12">
              <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Visual Template Builder</h3>
              <p className="text-muted-foreground mb-6">
                Create templates with a drag-and-drop interface and live preview
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {simulatorTypes.map((type) => (
                  <Button
                    key={type.value}
                    onClick={() => handleStartVisualBuilder(type.value)}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Create {type.label} Template
                  </Button>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <TemplatePresets
            onSelectPreset={handleSelectPreset}
            onCreateCustom={handleCreateCustom}
          />
        </TabsContent>

        <TabsContent value="numbering" className="space-y-4">
          <TemplateNumberingManager
            sections={editingTemplate?.sections?.map(ts => ({
              id: ts.section_id,
              title: ts.section?.title || 'Untitled',
              section_type: ts.section?.section_type || 'title',
              content: ts.section?.content || { level: 1 }
            })) || []}
            onUpdateNumbering={handleUpdateNumbering}
          />
        </TabsContent>

        <TabsContent value="outline" className="space-y-4">
          <DocumentOutline
            sections={editingTemplate?.sections?.map(ts => ({
              id: ts.section_id,
              title: ts.section?.title || 'Untitled',
              section_type: ts.section?.section_type || 'title',
              content: ts.section?.content || { level: 1 },
              order: ts.position
            })) || []}
            numbering={templateNumbering as {[level: number]: 'roman' | 'letters' | 'numbers' | 'decimal' | 'none'}}
            onEdit={(sectionId) => {
              // console.log('Edit section:', sectionId);
            }}
            onDelete={(sectionId) => {
              // console.log('Delete section:', sectionId);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Create Template Dialog for Empty State */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a new PDF template for your simulator.
            </DialogDescription>
          </DialogHeader>
          <TemplateForm
            onSubmit={handleCreateTemplate}
            onCancel={() => setShowCreateDialog(false)}
            simulatorTypes={simulatorTypes}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      {editingTemplate && (
        <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
          <DialogContent className="max-w-6xl">
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>
                Update the template configuration and sections.
              </DialogDescription>
            </DialogHeader>
            <TemplateForm
              template={editingTemplate}
              onSubmit={(data) => handleUpdateTemplate(editingTemplate.id, data)}
              onCancel={() => setEditingTemplate(null)}
              simulatorTypes={simulatorTypes}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Template Form Component
function TemplateForm({
  template,
  onSubmit,
  onCancel,
  simulatorTypes
}: {
  template?: PdfTemplate;
  onSubmit: (data: CreateTemplateForm) => void;
  onCancel: () => void;
  simulatorTypes: {value: string, label: string}[];
}) {
  const [formData, setFormData] = useState<CreateTemplateForm>({
    template_name: template?.template_name || '',
    simulator_type: template?.simulator_type || '',
    section_ids: template?.sections?.map(s => s.section_id) || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.template_name.trim()) {
      toast.error('Template name is required');
      return;
    }

    if (!formData.simulator_type) {
      toast.error('Simulator type is required');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Template Name</label>
          <Input
            value={formData.template_name}
            onChange={(e) => setFormData(prev => ({ ...prev, template_name: e.target.value }))}
            placeholder="Enter template name"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Simulator Type</label>
          <Select
            value={formData.simulator_type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, simulator_type: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select simulator type" />
            </SelectTrigger>
            <SelectContent>
              {simulatorTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Template Sections</label>
        <div className="mt-2 p-4 border rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">
            Template section management will be implemented with the drag-and-drop builder.
            This is a placeholder for the full template builder interface.
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {template ? 'Update Template' : 'Create Template'}
        </Button>
      </DialogFooter>
    </form>
  );
}
