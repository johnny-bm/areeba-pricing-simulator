import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminPageLayout, AdminPageActions } from '@/components/AdminPageLayout';
import { DataTable } from '@/components/DataTable';
import { TableCell } from '@/components/ui/table';
import { 
  Archive, 
  RotateCcw, 
  Eye, 
  Download, 
  Calendar,
  User,
  Clock,
  FileText,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useGeneratedPdfs } from '../hooks/usePdfBuilder';
import { GeneratedPdf } from '@/types/pdfBuilder';

export function ArchivedTemplatesPage() {
  const [selectedPdfs, setSelectedPdfs] = useState<string[]>([]);

  // Fetch generated PDFs (the actual history)
  const { 
    pdfs, 
    loading, 
    error, 
    total,
    deleteGeneratedPdf,
    bulkDeleteGeneratedPdfs
  } = useGeneratedPdfs({
    page: 1,
    limit: 50
  });

  // Debug logging
  useEffect(() => {
    console.log('ArchivedTemplatesPage: PDFs data:', { pdfs, loading, error, total });
    if (pdfs.length === 0 && !loading) {
      console.log('ArchivedTemplatesPage: No PDFs found. This could mean:');
      console.log('1. No PDFs have been generated yet');
      console.log('2. The generated_pdfs table might not exist');
      console.log('3. There might be a database connection issue');
    }
  }, [pdfs, loading, error, total]);

  const handleDownloadPdf = (pdf: GeneratedPdf) => {
    if (pdf.pdf_url) {
      window.open(pdf.pdf_url, '_blank');
    } else {
      toast.error('PDF URL not available');
    }
  };

  const handleViewPdf = (pdf: GeneratedPdf) => {
    if (pdf.pdf_url) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSimulatorTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'issuing': 'bg-blue-100 text-blue-800',
      'acquiring': 'bg-green-100 text-green-800',
      'digital-banking': 'bg-purple-100 text-purple-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.default;
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <AdminPageLayout
      title="PDF History"
      description="History of all generated PDFs from the PDF builder. View, download, and manage your generated documents."
      actions={AdminPageActions.withRefresh(() => window.location.reload())}
      isLoading={loading}
    >
      <DataTable
        title="Generated PDFs"
        headers={['Client & Project', 'Template', 'Simulator', 'Generated', 'Actions']}
        items={pdfs}
        getItemKey={(pdf) => pdf.id}
        renderRow={(pdf) => (
          <>
            <TableCell>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{pdf.client_name}</p>
                  <p className="text-sm text-muted-foreground">{pdf.project_name}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {pdf.template?.template_name || 'Unknown Template'}
              </div>
            </TableCell>
            <TableCell>
              <Badge className={getSimulatorTypeColor(pdf.simulator_type)}>
                {pdf.simulator_type.replace('-', ' ').toUpperCase()}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="text-sm text-muted-foreground">
                {formatDate(pdf.generated_at)}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewPdf(pdf)}
                  title="View PDF"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadPdf(pdf)}
                  title="Download PDF"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePdf(pdf)}
                  className="text-destructive hover:text-destructive"
                  title="Delete PDF"
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
            label: 'Simulator Type',
            options: [
              { value: 'issuing', label: 'Issuing' },
              { value: 'acquiring', label: 'Acquiring' },
              { value: 'digital-banking', label: 'Digital Banking' }
            ]
          }
        ]}
        emptyStateTitle="No Generated PDFs"
        emptyStateDescription="No PDFs have been generated yet. Use the PDF builder to create your first document."
        emptyStateIcon={<FileText className="h-12 w-12 text-muted-foreground" />}
        emptyStateAction={
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              <strong>To generate PDFs:</strong>
              <br />1. Go to the Templates tab and create a template
              <br />2. Use the PDF generator in a simulator to create PDFs
              <br />3. Generated PDFs will appear here in the history
            </p>
          </div>
        }
      />
    </AdminPageLayout>
  );
}
