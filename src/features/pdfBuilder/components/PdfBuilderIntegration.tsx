// PDF Builder Integration Component
// Integrates PDF builder functionality with existing PricingSimulator

import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { 
  Checkbox
} from '../../../components/ui/checkbox';
import { 
  FileText, 
  Download, 
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle,
  Plus
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { PdfGenerator } from './PdfGenerator';
import { useActiveTemplate } from '../hooks/usePdfBuilder';
import { toast } from 'sonner';

interface PdfBuilderIntegrationProps {
  simulatorType: string;
  clientName: string;
  projectName: string;
  pricingData: any;
  onPdfGenerated?: (pdfUrl: string) => void;
  className?: string;
}

export function PdfBuilderIntegration({
  simulatorType,
  clientName,
  projectName,
  pricingData,
  onPdfGenerated,
  className
}: PdfBuilderIntegrationProps) {
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [useTemplatePdf, setUseTemplatePdf] = useState(false);
  const [includePreliminary, setIncludePreliminary] = useState(false);

  // Check if there's an active template for this simulator type
  const { template, loading: templateLoading, error: templateError } = useActiveTemplate(simulatorType);

  const handleGeneratePdf = () => {
    if (useTemplatePdf && template) {
      setShowPdfDialog(true);
    } else {
      // Use existing PDF generation
      // This would call the existing downloadPDF function
      toast.info('Generating standard PDF...');
    }
  };

  const handleTemplatePdfGenerated = (pdfUrl: string) => {
    setShowPdfDialog(false);
    onPdfGenerated?.(pdfUrl);
  };

  if (templateLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">Loading PDF options...</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* PDF Generation Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>Generate PDF</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template PDF Option */}
          {template && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-template"
                  checked={useTemplatePdf}
                  onCheckedChange={setUseTemplatePdf}
                />
                <label htmlFor="use-template" className="text-sm font-medium">
                  Use PDF Template
                </label>
              </div>
              
              {useTemplatePdf && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Template: {template.template_name}</span>
                    <Badge variant="outline">v{template.version_number}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This will generate a PDF using the configured template with dynamic content.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Preliminary PDF Option */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="preliminary"
                checked={includePreliminary}
                onCheckedChange={setIncludePreliminary}
              />
              <label htmlFor="preliminary" className="text-sm font-medium">
                Generate as Preliminary Proposal
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              When enabled, includes all preliminary sections and additional proposal content.
            </p>
          </div>

          {/* No Template Available */}
          {!template && !templateError && (
            <div className="p-4 border border-dashed rounded-lg text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                No PDF template configured for {simulatorType}
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('/admin/pdf-builder', '_blank')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure Templates
              </Button>
            </div>
          )}

          {/* Template Error */}
          {templateError && (
            <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Error loading template: {templateError}</span>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleGeneratePdf}
              className="flex-1"
              disabled={!template && useTemplatePdf}
            >
              <Download className="h-4 w-4 mr-2" />
              Generate PDF
            </Button>
            
            {template && (
              <Button 
                variant="outline"
                onClick={() => setShowPdfDialog(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PDF Generation Dialog */}
      {showPdfDialog && template && (
        <Dialog open={showPdfDialog} onOpenChange={setShowPdfDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Generate PDF with Template</DialogTitle>
              <DialogDescription>
                Configure and generate a PDF using the {template.template_name} template.
              </DialogDescription>
            </DialogHeader>
            
            <PdfGenerator
              simulatorType={simulatorType}
              clientName={clientName}
              projectName={projectName}
              pricingData={pricingData}
              onPdfGenerated={handleTemplatePdfGenerated}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Enhanced PDF Generation Button for existing components
export function EnhancedPdfButton({
  simulatorType,
  clientName,
  projectName,
  pricingData,
  onPdfGenerated,
  className
}: {
  simulatorType: string;
  clientName: string;
  projectName: string;
  pricingData: any;
  onPdfGenerated?: (pdfUrl: string) => void;
  className?: string;
}) {
  const [showOptions, setShowOptions] = useState(false);
  const { template, loading } = useActiveTemplate(simulatorType);

  if (loading) {
    return (
      <Button disabled className={className}>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button 
        onClick={() => setShowOptions(true)}
        className={className}
      >
        <Download className="h-4 w-4 mr-2" />
        Generate PDF
        {template && (
          <Badge variant="secondary" className="ml-2">
            Template
          </Badge>
        )}
      </Button>
      
      {showOptions && (
        <Dialog open={showOptions} onOpenChange={setShowOptions}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>PDF Generation Options</DialogTitle>
              <DialogDescription>
                Choose how to generate the PDF for this proposal.
              </DialogDescription>
            </DialogHeader>
            
            <PdfBuilderIntegration
              simulatorType={simulatorType}
              clientName={clientName}
              projectName={projectName}
              pricingData={pricingData}
              onPdfGenerated={(url) => {
                onPdfGenerated?.(url);
                setShowOptions(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
