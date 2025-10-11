// PDF Generator Component
// Integrates with existing PDF generation system to create dynamic PDFs from templates

import React, { useState, useEffect } from 'react';
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
  Eye, 
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { 
  PdfTemplate, 
  ContentSection, 
  TemplateSectionWithDetails,
  PdfGenerationData,
  PdfGenerationOptions,
  DEFAULT_PDF_GENERATION_OPTIONS
} from '../../../types/pdfBuilder';
import { useActiveTemplate, useTemplateSections } from '../hooks/usePdfBuilder';
import { PdfBuilderService } from '../api/pdfBuilderService';
import { downloadPDF } from '../../../utils/pdfHelpers';
import { toast } from 'sonner';

interface PdfGeneratorProps {
  simulatorType: string;
  clientName: string;
  projectName: string;
  pricingData: any;
  onPdfGenerated?: (pdfUrl: string) => void;
  className?: string;
}

export function PdfGenerator({
  simulatorType,
  clientName,
  projectName,
  pricingData,
  onPdfGenerated,
  className
}: PdfGeneratorProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [includePreliminary, setIncludePreliminary] = useState(false);
  const [generationOptions, setGenerationOptions] = useState<PdfGenerationOptions>(DEFAULT_PDF_GENERATION_OPTIONS);
  const [activeTemplate, setActiveTemplate] = useState<PdfTemplate | null>(null);
  const [templateSections, setTemplateSections] = useState<TemplateSectionWithDetails[]>([]);

  // Fetch active template for the simulator type
  const { template, loading: templateLoading, error: templateError } = useActiveTemplate(simulatorType);
  
  // Fetch template sections when template is available
  const { sections, loading: sectionsLoading } = useTemplateSections(template?.id || '');

  useEffect(() => {
    if (template) {
      console.log('PdfGenerator: Template loaded:', template);
      setActiveTemplate(template);
    }
  }, [template]);

  useEffect(() => {
    if (sections) {
      console.log('PdfGenerator: Template sections loaded:', sections);
      setTemplateSections(sections);
    }
  }, [sections]);

  const handleGeneratePdf = async () => {
    try {
      setIsGenerating(true);
      console.log('PdfGenerator: Starting PDF generation...');

      if (activeTemplate) {
        console.log('PdfGenerator: Using active template:', activeTemplate.template_name);
        console.log('PdfGenerator: Template sections count:', templateSections.length);
        
        // Create the PDF content from template
        const pdfContent = await generatePdfFromTemplate({
          template: activeTemplate,
          sections: templateSections,
          clientName,
          projectName,
          simulatorType,
          pricingData,
          includePreliminary,
          options: generationOptions
        });

        console.log('PdfGenerator: Generated PDF content:', pdfContent);

      // Use existing PDF download functionality
      await downloadPDF({
        config: {
          clientName,
          projectName,
          preparedBy: pricingData.preparedBy || 'System'
        },
        selectedItems: pricingData.selected_items || [],
        categories: pricingData.categories || [],
        globalDiscount: pricingData.global_discount || 0,
        globalDiscountType: pricingData.global_discount_type || 'percentage',
        globalDiscountApplication: pricingData.global_discount_application || 'none',
        simulator: {
          id: simulatorType,
          name: simulatorType,
          description: `PDF generated from template: ${activeTemplate.template_name}`,
          urlSlug: simulatorType
        },
        summary: pricingData.summary || {
          oneTimeTotal: 0,
          monthlyTotal: 0,
          yearlyTotal: 0,
          totalProjectCost: 0,
          itemCount: 0
        },
        customContent: pdfContent
      });

      // Record the generated PDF in the database
      console.log('PdfGenerator: Attempting to save generated PDF to database...');
      try {
        const savedPdf = await PdfBuilderService.createGeneratedPdf({
          template_id: activeTemplate.id,
          client_name: clientName,
          project_name: projectName,
          simulator_type: simulatorType,
          pricing_data: pricingData
        });
        console.log('PdfGenerator: Successfully saved generated PDF:', savedPdf);
      } catch (error) {
        console.error('PdfGenerator: Failed to save generated PDF to database:', error);
        // Don't throw here - we still want the PDF to be generated even if saving fails
        toast.error('PDF generated but failed to save to history');
      }
      } else {
        // No template found - show error
        toast.error('No PDF template configured for this simulator. Please create a template in the admin panel.');
        return;
      }

      toast.success('PDF generated successfully!');
      setShowDialog(false);
      onPdfGenerated?.(window.location.href);

    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePdfFromTemplate = async ({
    template,
    sections,
    clientName,
    projectName,
    simulatorType,
    pricingData,
    includePreliminary,
    options
  }: {
    template: PdfTemplate;
    sections: TemplateSectionWithDetails[];
    clientName: string;
    projectName: string;
    simulatorType: string;
    pricingData: any;
    includePreliminary: boolean;
    options: PdfGenerationOptions;
  }) => {
    console.log('PdfGenerator: generatePdfFromTemplate called with:', {
      template: template.template_name,
      sectionsCount: sections.length,
      clientName,
      projectName
    });
    
    const processedSections = sections.map(section => {
      return {
        ...section,
        content: processSectionContent(section.content, {
          clientName,
          projectName,
          simulatorType,
          pricingData
        })
      };
    });

    const result = {
      template: template.template_name,
      sections: processedSections,
      metadata: {
        clientName,
        projectName,
        simulatorType,
        generatedAt: new Date().toISOString(),
        includePreliminary
      }
    };
    
    console.log('PdfGenerator: Generated PDF content:', result);
    return result;
  };

  const processSectionContent = (content: any, variables: any) => {
    // Process template variables in content
    let processedContent = { ...content };
    
    if (processedContent.text) {
      processedContent.text = processedContent.text
        .replace(/\{\{client_name\}\}/g, variables.clientName)
        .replace(/\{\{project_name\}\}/g, variables.projectName)
        .replace(/\{\{simulator_type\}\}/g, variables.simulatorType)
        .replace(/\{\{pricing_data\}\}/g, JSON.stringify(variables.pricingData, null, 2));
    }

    return processedContent;
  };

  if (templateLoading || sectionsLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">Loading template...</span>
      </div>
    );
  }

  if (templateError) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Error loading template: {templateError}</span>
      </div>
    );
  }

  // Debug: Log template status
  console.log('PdfGenerator: Template status:', {
    template: template ? { id: template.id, name: template.template_name, active: template.is_active } : null,
    templateLoading,
    templateError,
    sections: sections ? sections.length : 0,
    sectionsLoading,
    activeTemplate: activeTemplate ? { id: activeTemplate.id, name: activeTemplate.template_name } : null,
    templateSections: templateSections ? templateSections.length : 0
  });

  if (!activeTemplate) {
    console.log('PdfGenerator: No active template found');
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">
          No active template found for {simulatorType}
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={() => window.open('/admin/pdf-builder', '_blank')}
        >
          <Settings className="h-4 w-4 mr-2" />
          Manage Templates
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Template Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span>PDF Template</span>
            </div>
            <Badge variant="outline">
              {activeTemplate.template_name}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Template:</span>
              <span className="font-medium">{activeTemplate.template_name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Version:</span>
              <span className="font-medium">v{activeTemplate.version_number}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sections:</span>
              <span className="font-medium">{templateSections.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate PDF Button */}
      <div className="flex gap-2">
        <Button 
          onClick={() => setShowDialog(true)}
          className="flex-1"
        >
          <Download className="h-4 w-4 mr-2" />
          Generate PDF
        </Button>
        <Button 
          variant="outline"
          onClick={() => setShowDialog(true)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </div>

      {/* Generation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate PDF</DialogTitle>
            <DialogDescription>
              Configure PDF generation options for {clientName} - {projectName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Template Info */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Template Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Template:</span>
                  <p className="font-medium">{activeTemplate.template_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Version:</span>
                  <p className="font-medium">v{activeTemplate.version_number}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Sections:</span>
                  <p className="font-medium">{templateSections.length}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Simulator:</span>
                  <p className="font-medium">{simulatorType}</p>
                </div>
              </div>
            </div>

            {/* Generation Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preliminary"
                  checked={includePreliminary}
                  onCheckedChange={setIncludePreliminary}
                />
                <label htmlFor="preliminary" className="text-sm font-medium">
                  Include Preliminary Sections
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                When enabled, includes all preliminary sections in the generated PDF.
              </p>
            </div>

            {/* Client Info */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Client Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Client:</span>
                  <p className="font-medium">{clientName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Project:</span>
                  <p className="font-medium">{projectName}</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGeneratePdf}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate PDF
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// PDF Preview Component
export function PdfPreview({
  template,
  sections,
  clientName,
  projectName,
  simulatorType,
  pricingData,
  className
}: {
  template: PdfTemplate;
  sections: TemplateSectionWithDetails[];
  clientName: string;
  projectName: string;
  simulatorType: string;
  pricingData: any;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold">PDF Preview</h3>
      <div className="border rounded-lg p-4 bg-muted/20">
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={section.id} className="border-l-4 border-primary pl-4">
              <h4 className="font-medium">{section.section_title}</h4>
              <p className="text-sm text-muted-foreground">
                Type: {section.section_type}
              </p>
              {section.content.text && (
                <div className="mt-2 text-sm">
                  {section.content.text.substring(0, 100)}...
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
