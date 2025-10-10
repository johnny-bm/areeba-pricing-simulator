// Generated PDFs Manager Component
// Manages generated PDF documents and history

import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { TableCell } from '../../../components/ui/table';
import { DataTable } from '../../../components/DataTable';
import { 
  Download, 
  Trash2, 
  Eye,
  FileText,
  Calendar,
  User,
  ExternalLink
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { 
  GeneratedPdf, 
  UserPermissions
} from '../../../types/pdfBuilder';
import { useGeneratedPdfs, useAvailableSimulatorTypes } from '../hooks/usePdfBuilder';
import { toast } from 'sonner';

interface GeneratedPdfsManagerProps {
  permissions: UserPermissions;
}

export function GeneratedPdfsManager({ permissions }: GeneratedPdfsManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [simulatorTypeFilter, setSimulatorTypeFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedPdfs, setSelectedPdfs] = useState<string[]>([]);

  // Fetch available simulator types
  const { simulatorTypes } = useAvailableSimulatorTypes();

  // Fetch generated PDFs with filters
  const { 
    pdfs, 
    loading, 
    error, 
    total,
    deleteGeneratedPdf,
    bulkDeleteGeneratedPdfs
  } = useGeneratedPdfs({
    search: searchTerm || undefined,
    simulator_type: simulatorTypeFilter !== 'all' ? simulatorTypeFilter : undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    page: 1,
    limit: 50
  });

  const handleDownloadPdf = (pdf: GeneratedPdf) => {
    if (pdf.pdf_url) {
      // Open PDF in new tab or trigger download
      window.open(pdf.pdf_url, '_blank');
    } else {
      toast.error('PDF URL not available');
    }
  };

  const handleViewPdf = (pdf: GeneratedPdf) => {
    if (pdf.pdf_url) {
      // Open PDF in new tab
      window.open(pdf.pdf_url, '_blank');
    } else {
      toast.error('PDF URL not available');
    }
  };

  const handleDeletePdf = async (pdf: GeneratedPdf) => {
    if (confirm(`Are you sure you want to delete PDF for "${pdf.client_name}"?`)) {
      try {
        await deleteGeneratedPdf(pdf.id);
      } catch (error) {
        // Error is handled by the hook
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPdfs.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedPdfs.length} generated PDFs?`)) {
      try {
        await bulkDeleteGeneratedPdfs(selectedPdfs);
        setSelectedPdfs([]);
      } catch (error) {
        // Error is handled by the hook
      }
    }
  };

  const filteredPdfs = pdfs.filter(pdf => {
    const matchesSearch = 
      pdf.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pdf.project_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = simulatorTypeFilter === 'all' || pdf.simulator_type === simulatorTypeFilter;
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
    <>
      <DataTable
        title="Generated PDFs"
        description="View and manage generated PDF documents"
        headers={['Client', 'Project', 'Simulator', 'Template', 'Generated', 'Status', 'Actions']}
        items={filteredPdfs}
        getItemKey={(pdf) => pdf.id}
        renderRow={(pdf) => (
          <>
            <TableCell>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{pdf.client_name}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <p className="font-medium">{pdf.project_name}</p>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {pdf.simulator_type}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {pdf.template?.template_name || 'Unknown'}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(pdf.generated_at).toLocaleDateString()}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={pdf.pdf_url ? "default" : "secondary"}>
                {pdf.pdf_url ? "Available" : "Processing"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewPdf(pdf)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadPdf(pdf)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                {pdf.pdf_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(pdf.pdf_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePdf(pdf)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </>
        )}
        searchPlaceholder="Search PDFs..."
        searchFields={['client_name', 'project_name']}
        filterOptions={[
          {
            key: 'simulator_type',
            label: 'Simulator',
            options: [
              { value: 'all', label: 'All Simulators' },
              ...simulatorTypes.map((type) => ({
                value: type,
                label: type
              }))
            ]
          }
        ]}
        emptyStateTitle="No Generated PDFs"
        emptyStateDescription="No generated PDFs found matching your criteria."
        emptyStateIcon={<FileText className="h-12 w-12 text-muted-foreground" />}
      />
    </>
  );
}
