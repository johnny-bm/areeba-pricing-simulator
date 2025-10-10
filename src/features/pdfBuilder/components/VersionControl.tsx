// Version Control Component
// Manages template versions and version history

import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { TableCell } from '../../../components/ui/table';
import { DataTable } from '../../../components/DataTable';
import { 
  Copy, 
  Play, 
  Eye,
  FileText,
  Clock,
  User
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { 
  TemplateHierarchy, 
  UserPermissions
} from '../../../types/pdfBuilder';
import { useTemplateHierarchy, useAvailableSimulatorTypes } from '../hooks/usePdfBuilder';
import { toast } from 'sonner';

interface VersionControlProps {
  permissions: UserPermissions;
}

export function VersionControl({ permissions }: VersionControlProps) {
  const [selectedSimulatorType, setSelectedSimulatorType] = useState<string>('');
  
  // Fetch available simulator types
  const { simulatorTypes, loading: simulatorTypesLoading } = useAvailableSimulatorTypes();
  
  // Fetch template hierarchy for selected simulator type
  const { 
    hierarchy, 
    loading, 
    error 
  } = useTemplateHierarchy(selectedSimulatorType);

  const handleActivateTemplate = async (templateId: string) => {
    try {
      // This would call the activate template API
      toast.success('Template activated successfully');
    } catch (error) {
      toast.error('Failed to activate template');
    }
  };

  const handleDuplicateTemplate = async (templateId: string, newName: string) => {
    try {
      // This would call the duplicate template API
      toast.success('Template duplicated successfully');
    } catch (error) {
      toast.error('Failed to duplicate template');
    }
  };

  const handlePreviewTemplate = (templateId: string) => {
    // This would open a preview dialog
    toast.info('Preview functionality coming soon');
  };

  if (simulatorTypesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-2 text-muted-foreground">Loading simulator types...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-2 text-muted-foreground">Loading template versions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error: {error}</p>
        <p className="text-sm text-muted-foreground mt-2">
          This might be because the PDF Builder database tables haven't been created yet.
        </p>
      </div>
    );
  }

  // Show message if no simulator type is selected
  if (!selectedSimulatorType) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Select a Simulator Type</h3>
        <p className="text-muted-foreground mb-4">
          Choose a simulator type to view template versions.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {simulatorTypes.map((type) => (
            <Button
              key={type.value}
              variant="outline"
              onClick={() => setSelectedSimulatorType(type.value)}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <DataTable
        title="Template Versions"
        description="Manage template versions and version history"
        headers={['Template', 'Version', 'Status', 'Sections', 'Created', 'Actions']}
        items={hierarchy}
        getItemKey={(template) => template.template_id}
        renderRow={(template) => (
          <>
            <TableCell>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{template.template_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {template.section_count} sections
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                v{template.version_number}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={template.is_active ? "default" : "secondary"}>
                {template.is_active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              <span className="text-sm text-muted-foreground">
                {template.section_count}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(template.created_at).toLocaleDateString()}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePreviewTemplate(template.template_id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newName = prompt(`Enter new name for "${template.template_name}":`, `${template.template_name} (Copy)`);
                    if (newName && newName.trim()) {
                      handleDuplicateTemplate(template.template_id, newName.trim());
                    }
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {!template.is_active && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleActivateTemplate(template.template_id)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </>
        )}
        searchPlaceholder="Search templates..."
        searchFields={['template_name']}
        filterOptions={[
          {
            key: 'template_name',
            label: 'Template',
            options: [
              { value: 'all', label: 'All Templates' }
            ]
          }
        ]}
        emptyStateTitle="No Template Versions"
        emptyStateDescription="No template versions found for the selected simulator type."
        emptyStateIcon={<FileText className="h-12 w-12 text-muted-foreground" />}
      />
    </>
  );
}
