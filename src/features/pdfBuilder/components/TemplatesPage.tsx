// Templates Page Component
// Manages PDF templates with section selection and predefined sections

import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { TableCell } from '../../../components/ui/table';
import { DataTable } from '../../../components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { AdminPageLayout, AdminPageActions } from '../../admin/components/AdminPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Separator } from '../../../components/ui/separator';
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
  GripVertical,
  Minus,
  Lock,
  DollarSign,
  MessageSquare,
  BookOpen,
  Download
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { 
  PdfTemplate, 
  UserPermissions,
  CreateTemplateForm,
  UpdateTemplateForm,
  ContentSection
} from '../../../types/pdfBuilder';
import { usePdfTemplates, useAvailableSimulatorTypes, useContentSections } from '../hooks/usePdfBuilder';
import { PdfBuilderService } from '../api/pdfBuilderService';
import { toast } from 'sonner';
import { supabase } from '../../../utils/supabase/client';

interface TemplatesPageProps {
  permissions: UserPermissions;
}

interface TemplateSection {
  id: string;
  title: string;
  type: 'custom' | 'pricing' | 'cover' | 'cta';
  content?: any;
  order: number;
  removable: boolean;
}

export function TemplatesPage({ permissions }: TemplatesPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [simulatorTypeFilter, setSimulatorTypeFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PdfTemplate | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [templateSections, setTemplateSections] = useState<TemplateSection[]>([]);
  const [availableSections, setAvailableSections] = useState<ContentSection[]>([]);

  // Column definitions for Templates table
  const templateColumns: ColumnDef<PdfTemplate>[] = [
    {
      accessorKey: "template_name",
      header: "Template",
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{template.template_name}</p>
              <p className="text-sm text-muted-foreground">
                {template.section_count || 0} sections
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "simulator_type",
      header: "Simulator",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.getValue("simulator_type")}
        </Badge>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "version_number",
      header: "Version",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          v{row.getValue("version_number")}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <p className="text-sm text-muted-foreground">
          {new Date(row.getValue("created_at")).toLocaleDateString()}
        </p>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditTemplate(template)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownloadPreview()}
              title="Preview PDF"
            >
              <Download className="h-4 w-4" />
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
        );
      },
    },
  ];

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

  // Fetch available content sections
  const { sections: allSections } = useContentSections();

  useEffect(() => {
    if (allSections) {
      setAvailableSections(allSections);
    }
  }, [allSections]);

  const handleCreateTemplate = async (templateData: CreateTemplateForm) => {
    try {
      // Filter out predefined sections from section_ids
      const customSectionIds = templateData.section_ids?.filter(id => 
        id !== 'cover' && id !== 'pricing' && id !== 'cta'
      ) || [];
      
      // Create template with only custom sections
      const templateResult = await createTemplate({
        ...templateData,
        section_ids: customSectionIds
      });
      
      // Save all template sections (both custom and predefined)
      if (templateSections.length > 0) {
        // First, delete any existing sections for this template
        const { error: deleteError } = await supabase
          .from('template_sections')
          .delete()
          .eq('template_id', templateResult.id);
          
        if (deleteError) {
          // // console.error('Failed to delete existing sections:', deleteError);
          toast.error('Failed to clear existing template sections');
          return;
        }

        const allSections = templateSections.map((section, index) => {
          if (section.type === 'cover' || section.type === 'pricing' || section.type === 'cta') {
            // Predefined section
            return {
              template_id: templateResult.id,
              section_id: null,
              predefined_section: section.type,
              section_type: 'predefined',
              position: index
            };
          } else {
            // Custom section
            return {
              template_id: templateResult.id,
              section_id: section.id,
              predefined_section: null,
              section_type: 'custom',
              position: index
            };
          }
        });
        
        const { error } = await supabase
          .from('template_sections')
          .insert(allSections);
          
        if (error) {
          // // console.error('Failed to add template sections:', error);
          if (error.code === '23505') {
            toast.error('Duplicate section detected. Please check your template sections.');
          } else {
            toast.error('Failed to save template sections');
          }
          return;
        }
      }
      
      setShowCreateDialog(false);
      toast.success('Template created successfully');
      
      // Reset template sections for next creation
      setTemplateSections([]);
    } catch (error) {
      // // console.error('Failed to create template:', error);
      toast.error('Failed to create template');
    }
  };


  const handleUpdateTemplate = async (id: string, templateData: UpdateTemplateForm) => {
    try {
      // Filter out predefined sections from section_ids
      const customSectionIds = templateData.section_ids?.filter(id => 
        id !== 'cover' && id !== 'pricing' && id !== 'cta'
      ) || [];
      
      // Update template with only custom sections
      const templateResult = await updateTemplate(id, {
        ...templateData,
        section_ids: customSectionIds
      });
      
      // First, remove existing template sections
      await supabase
        .from('template_sections')
        .delete()
        .eq('template_id', id);
      
      // Save all template sections (both custom and predefined)
      const allSections = templateSections.map((section, index) => {
        if (section.type === 'cover' || section.type === 'pricing' || section.type === 'cta') {
          // Predefined section
          return {
            template_id: id,
            section_id: null,
            predefined_section: section.type,
            section_type: 'predefined',
            position: index
          };
        } else {
          // Custom section
          return {
            template_id: id,
            section_id: section.id,
            predefined_section: null,
            section_type: 'custom',
            position: index
          };
        }
      });
      
      if (allSections.length > 0) {
        const { error } = await supabase
          .from('template_sections')
          .insert(allSections);
          
        if (error) {
          // // console.error('Failed to add template sections:', error);
          if (error.code === '23505') {
            toast.error('Duplicate section detected. Please check your template sections.');
          } else {
            toast.error('Failed to update template sections');
          }
          return;
        }
      }
      
      setEditingTemplate(null);
      toast.success('Template updated successfully');
    } catch (error) {
      // // console.error('Failed to update template:', error);
      toast.error('Failed to update template');
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

  // Get the structured template sections with fixed order
  const getStructuredTemplateSections = () => {
    const customSections = templateSections.filter(ts => ts.type === 'custom');
    
    const sections = [
      {
        id: 'cover',
        title: 'Cover Page',
        type: 'cover' as const,
        content: '',
        order: 0,
        removable: false,
        isPredefined: true
      },
      {
        id: 'toc',
        title: 'Table of Contents',
        type: 'toc' as const,
        content: '',
        order: 1,
        removable: false,
        isPredefined: true
      }
    ];

    // Add custom sections
    customSections.forEach((section, index) => {
            sections.push({
              ...section,
              order: 2 + index,
              isPredefined: false,
              type: section.type === 'pricing' ? 'cover' : section.type === 'cta' ? 'cover' : section.type === 'custom' ? 'cover' : 'cover',
              content: section.content || ''
            });
    });

    // Add final predefined sections
    sections.push(
      {
        id: 'pricing',
        title: 'Pricing Section',
        type: 'cover' as const,
        content: '',
        order: 2 + customSections.length,
        removable: false,
        isPredefined: true
      },
      {
        id: 'cta',
        title: 'Call to Action',
        type: 'cover' as const,
        content: '',
        order: 3 + customSections.length,
        removable: false,
        isPredefined: true
      }
    );

    return sections;
  };

  const handleAddSection = (section: ContentSection) => {
    const newSection: TemplateSection = {
      id: section.id,
      title: section.title,
      type: 'custom',
      content: section.content,
      order: templateSections.length,
      removable: true
    };
    setTemplateSections(prev => [...prev, newSection]);
    toast.success(`Added "${section.title}" to template`);
  };

  const isSectionInTemplate = (sectionId: string) => {
    return templateSections.some(ts => ts.id === sectionId);
  };

  const handleRemoveSectionFromTemplate = (sectionId: string) => {
    setTemplateSections(prev => prev.filter(s => s.id !== sectionId));
    toast.success('Section removed from template');
  };

  const handleRemoveSection = (sectionId: string) => {
    setTemplateSections(prev => prev.filter(s => s.id !== sectionId));
    toast.success('Section removed from template');
  };

  const handleReorderSections = (fromIndex: number, toIndex: number) => {
    const newSections = [...templateSections];
    const [movedSection] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, movedSection);
    
    // Update order
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }));
    
    setTemplateSections(updatedSections);
  };

  const handleEditTemplate = async (template: PdfTemplate) => {
    // Show loading state
    const loadingToast = toast.loading('Loading template sections...');
    
    try {
      // Load the template with its sections
      const fullTemplate = await PdfBuilderService.getTemplate(template.id);
      
      // Convert template sections to TemplateSection format
      const loadedSections: TemplateSection[] = (fullTemplate.template_sections || [])
        .sort((a, b) => a.position - b.position)
        .map((ts, index) => {
          if (ts.section_type === 'predefined') {
            // Predefined section
            return {
              id: ts.predefined_section || '',
              title: ts.predefined_section === 'cover' ? 'Cover Page' :
                     ts.predefined_section === 'pricing' ? 'Pricing Section' :
                     ts.predefined_section === 'cta' ? 'Call to Action' : ts.predefined_section || '',
              type: ts.predefined_section as 'cover' | 'pricing' | 'cta',
              content: '',
              order: index,
              removable: false
            };
          } else {
            // Custom section
            return {
              id: ts.section_id || '',
              title: ts.content_sections?.title || 'Unknown Section',
              type: 'custom',
              content: ts.content_sections?.content || '',
              order: index,
              removable: true
            };
          }
        });

      setTemplateSections(loadedSections);
      setEditingTemplate(fullTemplate);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`Loaded ${loadedSections.length} sections for editing`);
    } catch (error) {
      // // console.error('Failed to load template for editing:', error);
      
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      toast.error('Failed to load template sections');
    }
  };


  const handleDownloadPreview = async () => {
    if (templateSections.length === 0) {
      toast.error('Please add at least one section to preview the template');
      return;
    }

    try {
      // Get current date and platform version dynamically
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Get platform version from Supabase
      let platformVersion = 'v2.2.0'; // fallback
      try {
        const { supabase } = await import('../../../utils/supabase/client');
        const { data, error } = await supabase.rpc('get_current_version');
        if (!error && data) {
          platformVersion = `v${data}`;
        }
      } catch (error) {
        // // console.warn('Could not fetch platform version from database, using fallback:', error);
      }
      
      // areeba logo SVG (from the actual logo used in the app)
      const areebaLogoSVG = `
        <svg width="200" height="50" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 2821 720" style="margin: 0 auto 20px auto; display: block;">
          <path clip-rule="evenodd" d="M312.359 512.203C312.359 583.777 267.236 626.08 196.635 626.08C144.899 626.08 116.697 605.366 116.697 562.966C116.697 525.331 144.024 501.797 215.501 495.185L312.359 487.697V512.203ZM0 567.731C0 655.254 60.1963 712.727 159 712.727C231.449 712.727 294.466 679.761 314.207 631.72L322.667 700.474H423.319V418.067C423.319 289.117 346.201 221.335 221.044 221.335C95.8861 221.335 12.2532 287.172 12.2532 387.921H110.084C110.084 339.005 147.719 310.706 215.403 310.706C273.752 310.706 311.387 336.088 311.387 399.201V409.51L172.128 419.818C62.044 428.278 0 481.959 0 567.634L0 567.731ZM796.36 233.491V339.88H754.058C671.3 339.88 619.564 384.128 619.564 474.471V700.474H504.812V236.312H612.951L619.564 304.093C639.306 257.998 683.553 226.879 745.597 226.879C761.546 226.879 777.592 228.726 796.36 233.491ZM931.146 421.86C942.426 352.231 983.854 315.471 1051.54 315.471C1119.22 315.471 1164.44 357.871 1164.44 421.86H931.146ZM819.214 467.955C819.214 611.979 916.072 712.727 1054.36 712.727C1175.72 712.727 1260.33 651.559 1280.17 549.838H1173.88C1160.75 594.085 1119.32 618.592 1056.3 618.592C980.061 618.592 936.786 577.164 928.325 495.282L1278.22 494.309V459.495C1278.22 314.499 1189.82 221.335 1050.57 221.335C911.307 221.335 819.116 322.084 819.116 468.053L819.214 467.955ZM1553.53 315.471C1485.85 315.471 1444.42 352.231 1433.14 421.86H1666.43C1666.43 357.871 1622.19 315.471 1553.53 315.471ZM1556.35 712.727C1418.06 712.727 1321.21 611.979 1321.21 467.955C1321.21 323.932 1416.22 221.238 1552.65 221.238C1689.09 221.238 1780.31 314.401 1780.31 459.398V494.212L1430.41 495.185C1438.88 577.067 1482.15 618.495 1558.39 618.495C1621.41 618.495 1662.84 593.988 1675.96 549.741H1782.26C1762.52 651.461 1677.81 712.63 1556.45 712.63L1556.35 712.727ZM2702.9 512.203C2702.9 583.777 2657.78 626.08 2587.17 626.08C2535.44 626.80 2507.24 605.366 2507.24 562.966C2507.24 525.331 2534.56 501.797 2606.04 495.185L2702.9 487.697V512.203ZM2389.66 567.731C2389.66 655.254 2449.86 712.727 2548.66 712.727C2621.11 712.727 2684.13 679.761 2703.87 631.72L2712.33 700.474H2812.98V418.067C2812.98 289.117 2735.87 221.335 2610.71 221.335C2485.55 221.335 2401.92 287.269 2401.92 388.018H2499.75C2499.75 339.102 2537.38 310.803 2605.07 310.803C2663.42 310.803 2701.05 336.185 2701.05 399.299V409.607L2561.79 419.915C2451.71 428.376 2389.66 482.056 2389.66 567.731ZM2096.95 607.311C2017.89 607.311 1966.15 549.838 1966.15 466.108C1966.15 382.377 2017.89 323.932 2096.95 323.932C2176.01 323.932 2225.8 383.253 2225.8 466.108C2225.8 548.963 2177.86 607.311 2096.95 607.311ZM1850.43 700.474H1956.72L1964.21 628.025C1991.53 681.705 2050.76 712.727 2120.39 712.727C2254 712.727 2341.43 613.827 2341.43 470.775C2341.43 327.724 2260.52 220.363 2127.87 220.363C2057.37 220.363 1995.23 251.385 1965.18 303.218V0H1850.43V700.474Z" fill="#FF2929" fill-rule="evenodd" />
        </svg>
      `;

      // Create a clean A4 PDF template matching the app's design system
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Template Preview</title>
          <style>
            @page { 
              size: A4; 
              margin: 0;
              @bottom-center {
                content: "Page " counter(page) " of " counter(pages);
                font-size: 10px;
                color: #000000;
              }
            }
            * { box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              margin: 0; padding: 0; line-height: 1.6; color: #000000; 
              background: #f5f5f5; min-height: 100vh; display: flex; flex-direction: column; align-items: center;
            }
            .page { 
              width: 210mm; min-height: 297mm; padding: 20mm; background: #ffffff; 
              page-break-after: always; margin: 20px 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              position: relative;
            }
            .cover-page { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; height: 297mm; }
            .logo { width: 200px; height: auto; margin-bottom: 40px; }
            .title { font-size: 2.5em; font-weight: 700; color: #000000; margin-bottom: 20px; }
            .subtitle { font-size: 1.2em; color: #666666; margin-bottom: 40px; }
            .cover-details { margin-top: 40px; }
            .cover-details p { font-size: 1em; color: #666666; margin-bottom: 12px; }
            .prepared-by { font-weight: 600; color: #000000; }
            .simulator-name { font-weight: 500; color: #000000; }
            .date { font-size: 1em; color: #666666; }
            .version { font-size: 0.9em; color: #666666; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 1.5em; font-weight: 600; color: #000000; margin-bottom: 15px; border-bottom: 2px solid #cccccc; padding-bottom: 10px; }
            .content { font-size: 1em; line-height: 1.6; color: #000000; }
            .divider { height: 1px; background: #cccccc; margin: 20px 0; }
            
            /* Table of Contents Styling */
            .toc-item { 
              display: flex; justify-content: space-between; align-items: center; 
              padding: 8px 0; border-bottom: 1px solid #cccccc; 
            }
            .toc-item a { 
              color: #000000; text-decoration: none; font-weight: 500;
            }
            .toc-item a:hover { text-decoration: underline; }
            .toc-page-number { 
              color: #666666; font-size: 0.9em; 
            }
            
            /* Pricing Colors */
            .price-original { color: #ff0000; text-decoration: line-through; }
            .price-free { color: #00aa00; font-weight: bold; }
            .price-discount { color: #ff0000; }
            .price-normal { color: #000000; }
            
            /* Page Footer */
            .page::after {
              content: "Page " counter(page) " of " counter(pages);
              position: absolute;
              bottom: 10mm;
              left: 50%;
              transform: translateX(-50%);
              font-size: 10px;
              color: #000000;
            }
            
            /* Disclaimer Footer */
            .disclaimer {
              position: absolute;
              bottom: 5mm;
              left: 20mm;
              right: 20mm;
              font-size: 8px;
              color: #666666;
              text-align: center;
              border-top: 1px solid #cccccc;
              padding-top: 5px;
            }
            
            .toc-header {
              border-bottom: 2px solid #059669;
              padding-bottom: 16px;
              margin-bottom: 32px;
            }
            
            .toc-title {
              font-size: 1.8em;
              font-weight: 700;
              color: #0f172a;
              margin: 0;
            }
            
            .toc-subtitle {
              font-size: 0.9em;
              color: #64748b;
              margin-top: 8px;
            }
            
            .toc-content {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 24px;
            }
            
            .toc-column {
              display: flex;
              flex-direction: column;
              gap: 12px;
            }
            
            .toc-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0;
              border-bottom: 1px solid #f1f5f9;
            }
            
            .toc-item-text {
              font-size: 0.9em;
              color: #0f172a;
              font-weight: 500;
            }
            
            .toc-item-number {
              font-size: 0.8em;
              color: #059669;
              font-weight: 600;
            }
            
            /* Content Sections - Professional Layout */
            .content-section {
              page-break-after: always;
              width: 210mm;
              min-height: 297mm;
              padding: 20mm;
              background: #ffffff;
            }
            
            .section-header {
              border-bottom: 2px solid #059669;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            
            .section-title {
              font-size: 1.6em;
              font-weight: 700;
              color: #0f172a;
              margin: 0;
            }
            
            .section-content {
              font-size: 0.9em;
              line-height: 1.7;
              color: #334155;
            }
            
            .section-content h1, .section-content h2, .section-content h3 {
              color: #0f172a;
              font-weight: 600;
              margin-top: 24px;
              margin-bottom: 12px;
            }
            
            .section-content h1 { font-size: 1.4em; }
            .section-content h2 { font-size: 1.2em; }
            .section-content h3 { font-size: 1.1em; }
            
            .section-content p {
              margin-bottom: 16px;
            }
            
            .section-content ul, .section-content ol {
              margin-bottom: 16px;
              padding-left: 24px;
            }
            
            .section-content li {
              margin-bottom: 8px;
            }
            
            /* Pricing Section - Professional Table */
            .pricing-section {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 24px;
              margin: 24px 0;
            }
            
            .pricing-header {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 20px;
            }
            
            .pricing-icon {
              width: 24px;
              height: 24px;
              background: #059669;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
            }
            
            .pricing-title {
              font-size: 1.2em;
              font-weight: 600;
              color: #0f172a;
              margin: 0;
            }
            
            .pricing-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 16px;
              background: white;
              border-radius: 6px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .pricing-table th {
              background: #059669;
              color: white;
              font-weight: 600;
              padding: 12px 16px;
              text-align: left;
              font-size: 0.85em;
            }
            
            .pricing-table td {
              padding: 12px 16px;
              border-bottom: 1px solid #f1f5f9;
              font-size: 0.85em;
            }
            
            .pricing-table tr:last-child td {
              border-bottom: none;
            }
            
            .pricing-table tr.total-row {
              background: #f8fafc;
              font-weight: 600;
            }
            
            .pricing-table tr.total-row td {
              border-top: 2px solid #059669;
            }
            
            /* CTA Section - Professional Design */
            .cta-section {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 24px;
              margin: 24px 0;
            }
            
            .cta-header {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 20px;
            }
            
            .cta-icon {
              width: 24px;
              height: 24px;
              background: #f59e0b;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
            }
            
            .cta-title {
              font-size: 1.2em;
              font-weight: 600;
              color: #92400e;
              margin: 0;
            }
            
            .cta-content {
              color: #92400e;
            }
            
            .cta-content h3 {
              color: #92400e;
              font-size: 1.1em;
              margin-bottom: 12px;
            }
            
            .cta-content p {
              margin-bottom: 12px;
            }
            
            .cta-contact {
              background: rgba(255, 255, 255, 0.7);
              border-radius: 6px;
              padding: 16px;
              margin-top: 16px;
            }
            
            .cta-contact h4 {
              color: #92400e;
              font-size: 1em;
              margin-bottom: 8px;
              font-weight: 600;
            }
            
            .cta-contact p {
              margin: 4px 0;
              font-size: 0.9em;
            }
            
            /* Print Styles */
            @media print {
              body { 
                margin: 0; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .page-break { page-break-after: always; }
              .no-break { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <!-- Cover Page -->
          <div class="page cover-page" id="cover">
            ${areebaLogoSVG}
            <h1 class="title">Pricing Proposal</h1>
            <p class="subtitle">Client Name - Project Name</p>
            <div class="cover-details">
              <p class="prepared-by">Prepared by: areeba Team</p>
              <p class="simulator-name">Simulator: ${editingTemplate?.simulator_type || 'Pricing Simulator'}</p>
              <p class="date">Date: ${currentDate}</p>
              <p class="version">Platform Version: ${platformVersion}</p>
            </div>
            <div class="disclaimer">
              © ${new Date().getFullYear()} areeba. All rights reserved. This document is confidential and proprietary.
            </div>
          </div>
          
          <!-- Table of Contents -->
          <div class="page" id="toc">
            <h1 class="section-title">Table of Contents</h1>
            <div class="content">
              ${templateSections.filter(section => section.type === 'custom').map((section, index) => `
                <div class="toc-item">
                  <a href="#section-${index + 3}">${section.title}</a>
                  <span class="toc-page-number">${index + 3}</span>
                </div>
              `).join('')}
              <div class="toc-item">
                <a href="#pricing">Pricing Details</a>
                <span class="toc-page-number">${templateSections.filter(s => s.type === 'custom').length + 3}</span>
              </div>
              <div class="toc-item">
                <a href="#cta">Contact Information</a>
                <span class="toc-page-number">${templateSections.filter(s => s.type === 'custom').length + 4}</span>
              </div>
            </div>
            <div class="disclaimer">
              © ${new Date().getFullYear()} areeba. All rights reserved. This document is confidential and proprietary.
            </div>
          </div>
          
          <!-- Custom Sections -->
          ${templateSections.filter(section => section.type === 'custom').map((section, index) => `
            <div class="page" id="section-${index + 3}">
              <h1 class="section-title">${section.title}</h1>
              <div class="content">${typeof section.content === 'string' ? section.content : (section.content?.html || section.content?.content || 'Content will be added here...')}</div>
            </div>
          `).join('')}
          
          <!-- Pricing Section -->
          <div class="page" id="pricing">
            <h1 class="section-title">Pricing Details</h1>
            <div class="content">
              <p>This section contains auto-generated pricing data from the simulator based on your configuration.</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                  <tr style="background: #f5f5f5;">
                    <th style="border: 1px solid #cccccc; padding: 12px; text-align: left;">Service</th>
                    <th style="border: 1px solid #cccccc; padding: 12px; text-align: left;">Description</th>
                    <th style="border: 1px solid #cccccc; padding: 12px; text-align: right;">Price</th>
                    <th style="border: 1px solid #cccccc; padding: 12px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="border: 1px solid #cccccc; padding: 12px;">Card Processing</td>
                    <td style="border: 1px solid #cccccc; padding: 12px;">Visa/Mastercard transactions</td>
                    <td style="border: 1px solid #cccccc; padding: 12px; text-align: right;" class="price-normal">$0.15</td>
                    <td style="border: 1px solid #cccccc; padding: 12px; text-align: right;" class="price-normal">$150.00</td>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #cccccc; padding: 12px;">Monthly Fee</td>
                    <td style="border: 1px solid #cccccc; padding: 12px;">Platform maintenance</td>
                    <td style="border: 1px solid #cccccc; padding: 12px; text-align: right;" class="price-free">FREE</td>
                    <td style="border: 1px solid #cccccc; padding: 12px; text-align: right;" class="price-free">$0.00</td>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #cccccc; padding: 12px;">Setup Fee</td>
                    <td style="border: 1px solid #cccccc; padding: 12px;">Initial configuration</td>
                    <td style="border: 1px solid #cccccc; padding: 12px; text-align: right;">
                      <span class="price-original">$200.00</span> 
                      <span class="price-discount">$100.00</span>
                    </td>
                    <td style="border: 1px solid #cccccc; padding: 12px; text-align: right;" class="price-discount">$100.00</td>
                  </tr>
                  <tr style="background: #f5f5f5; font-weight: bold;">
                    <td colspan="3" style="border: 1px solid #cccccc; padding: 12px;">Total</td>
                    <td style="border: 1px solid #cccccc; padding: 12px; text-align: right;">$250.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="disclaimer">
              © ${new Date().getFullYear()} areeba. All rights reserved. This document is confidential and proprietary.
            </div>
          </div>
          
          <!-- CTA Section -->
          <div class="page" id="cta">
            <h1 class="section-title">Get Started</h1>
            <div class="content">
              <p>Ready to implement this solution? Contact our team to get started with your payment processing needs.</p>
              <p><strong>Email:</strong> info@areeba.com</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              <p><strong>Website:</strong> www.areeba.com</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Create a blob and download as PDF
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Open in new window for printing
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      toast.success('Template preview opened for printing. Use "Save as PDF" in the print dialog.');
      
    } catch (error) {
      // // console.error('Preview generation error:', error);
      toast.error('Failed to generate PDF preview');
    }
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'cover': return <BookOpen className="h-4 w-4" />;
      case 'toc': return <FileText className="h-4 w-4" />;
      case 'divider': return <div className="w-4 h-4 flex items-center justify-center"><div className="w-full h-px bg-gray-400"></div></div>;
      case 'pricing': return <DollarSign className="h-4 w-4" />;
      case 'cta': return <MessageSquare className="h-4 w-4" />;
      case 'custom': return <Layout className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.template_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = simulatorTypeFilter === 'all' || template.simulator_type === simulatorTypeFilter;
    return matchesSearch && matchesType;
  });

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <AdminPageLayout
      title="PDF Templates"
      description="Create and manage PDF templates for different simulator types. Use the visual builder to add sections and create professional documents."
      actions={permissions.can_create_templates ? AdminPageActions.addNew(() => setShowCreateDialog(true), 'Create Template') : undefined}
      isLoading={loading}
    >
      <DataTable 
        columns={templateColumns} 
        data={filteredTemplates}
        searchKey="template_name"
        searchPlaceholder="Search templates..."
        onRowClick={(template) => handleEditTemplate(template)}
      />

      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a new PDF template by setting the name, assigning a simulator type, and building the template structure.
            </DialogDescription>
          </DialogHeader>
        <CreateTemplateDialog
          onSubmit={handleCreateTemplate}
          onCancel={() => setShowCreateDialog(false)}
          simulatorTypes={simulatorTypes}
          availableSections={availableSections}
          onAddSection={handleAddSection}
          templateSections={templateSections}
          setTemplateSections={setTemplateSections}
          onDownloadPreview={handleDownloadPreview}
          existingTemplates={templates}
          isSectionInTemplate={isSectionInTemplate}
          handleRemoveSectionFromTemplate={handleRemoveSectionFromTemplate}
          getStructuredTemplateSections={getStructuredTemplateSections}
        />
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      {editingTemplate && (
        <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
          <DialogContent className="max-w-6xl h-[90vh]">
            <DialogHeader className="pb-2">
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>
                Update the template configuration and sections.
              </DialogDescription>
            </DialogHeader>
        <EditTemplateDialog
          template={editingTemplate}
          onSubmit={(data) => handleUpdateTemplate(editingTemplate.id, data)}
          onCancel={() => setEditingTemplate(null)}
          simulatorTypes={simulatorTypes}
          availableSections={availableSections}
          onAddSection={handleAddSection}
          templateSections={templateSections}
          setTemplateSections={setTemplateSections}
          onDownloadPreview={handleDownloadPreview}
          existingTemplates={templates}
          isSectionInTemplate={isSectionInTemplate}
          handleRemoveSectionFromTemplate={handleRemoveSectionFromTemplate}
          getStructuredTemplateSections={getStructuredTemplateSections}
        />
          </DialogContent>
        </Dialog>
      )}
    </AdminPageLayout>
  );
}

// Create Template Dialog Component
function CreateTemplateDialog({
  onSubmit,
  onCancel,
  simulatorTypes,
  availableSections,
  onAddSection,
  templateSections,
  setTemplateSections,
  onDownloadPreview,
  existingTemplates,
  isSectionInTemplate,
  handleRemoveSectionFromTemplate,
  getStructuredTemplateSections
}: {
  onSubmit: (data: CreateTemplateForm) => void;
  onCancel: () => void;
  simulatorTypes: {value: string, label: string}[];
  availableSections: ContentSection[];
  onAddSection: (section: ContentSection) => void;
  templateSections: TemplateSection[];
  setTemplateSections: React.Dispatch<React.SetStateAction<TemplateSection[]>>;
  onDownloadPreview: () => void;
  existingTemplates: PdfTemplate[];
  isSectionInTemplate: (sectionId: string) => boolean;
  handleRemoveSectionFromTemplate: (sectionId: string) => void;
  getStructuredTemplateSections: () => any[];
}) {
  const [formData, setFormData] = useState<CreateTemplateForm>({
    template_name: '',
    simulator_type: '',
    section_ids: []
  });

  // Check if there's already an active template for the selected simulator type
  const hasActiveTemplate = formData.simulator_type && 
    existingTemplates.some(t => t.simulator_type === formData.simulator_type && t.is_active);

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

    if (templateSections.length === 0) {
      toast.error('Please add at least one section to the template');
      return;
    }

    // Update section_ids with current template sections
    const updatedFormData = {
      ...formData,
      section_ids: templateSections.map(section => section.id)
    };

    onSubmit(updatedFormData);
  };

  const handleAddPredefinedSection = (type: 'cover' | 'pricing' | 'cta') => {
    const newSection: TemplateSection = {
      id: type,
      title: type === 'cover' ? 'Cover Section' : type === 'pricing' ? 'Pricing Section' : 'Call to Action',
      type: type,
      order: templateSections.length,
      removable: true
    };
    setTemplateSections(prev => [...prev, newSection]);
    toast.success(`Added ${newSection.title}`);
  };

  const handleRemoveSection = (sectionId: string) => {
    setTemplateSections(prev => prev.filter(s => s.id !== sectionId));
    toast.success('Section removed from template');
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'cover': return <BookOpen className="h-4 w-4" />;
      case 'toc': return <FileText className="h-4 w-4" />;
      case 'divider': return <div className="w-4 h-4 flex items-center justify-center"><div className="w-full h-px bg-gray-400"></div></div>;
      case 'pricing': return <DollarSign className="h-4 w-4" />;
      case 'cta': return <MessageSquare className="h-4 w-4" />;
      case 'custom': return <Layout className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

      {/* Template Builder Interface */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Side - Available Sections */}
        <div className="w-1/2 flex flex-col border rounded-lg min-h-0">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Available Sections</h3>
          </div>
          <ScrollArea className="flex-1 p-4 max-h-96">
            <div className="space-y-4">
              {/* Template Structure Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Template Structure</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h5 className="font-medium text-blue-800 mb-1">Fixed Structure</h5>
                      <p className="text-sm text-blue-700">
                        Every template automatically includes: Cover Page, Table of Contents, 
                        Dividers, Pricing Section, and Call to Action in a fixed order.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Sections */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Sections</h4>
                <div className="space-y-2">
                  {availableSections.map((section) => {
                    const isInTemplate = isSectionInTemplate(section.id);
                    return (
                      <Card 
                        key={section.id} 
                        className={`cursor-pointer hover:shadow-md transition-shadow ${
                          isInTemplate ? 'bg-green-50 border-green-300' : ''
                        }`}
                        onClick={() => onAddSection(section)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <Layout className={`h-4 w-4 ${isInTemplate ? 'text-green-600' : ''}`} />
                            <div className="flex-1">
                              <h4 className={`font-medium ${isInTemplate ? 'text-green-800' : ''}`}>
                                {section.title}
                                {isInTemplate && <span className="ml-2 text-xs text-green-600">(Added)</span>}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Custom Section
                              </p>
                            </div>
                            <div className="flex gap-1">
                              {isInTemplate ? (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveSectionFromTemplate(section.id);
                                  }}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Right Side - Template Sections & Preview */}
        <div className="w-1/2 flex flex-col border rounded-lg min-h-0">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Template Sections</h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onDownloadPreview}
                  disabled={templateSections.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-4 max-h-96">
            {templateSections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No sections added yet</p>
                <p className="text-sm">Click on sections from the left to add them</p>
              </div>
            ) : (
              <div className="space-y-2">
                {getStructuredTemplateSections().map((section, index, array) => {
                  // Show divider after TOC and after the last custom section
                  const showDividerAfter = section.type === 'toc' || 
                    (section.type === 'custom' && (!array[index + 1] || array[index + 1].type !== 'custom'));
                  
                  return (
                    <React.Fragment key={section.id}>
                      {section.isPredefined ? (
                        // Compact predefined sections
                        <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-md border border-gray-200">
                          <Lock className="h-3 w-3 text-gray-400" />
                          {getSectionIcon(section.type)}
                          <span className="flex-1 text-sm font-medium text-gray-600">
                            {section.title}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {index + 1}
                          </Badge>
                        </div>
                      ) : (
                        // Full card for custom sections
                        <Card className="group">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                              {getSectionIcon(section.type)}
                              <div className="flex-1">
                                <h4 className="font-medium">{section.title}</h4>
                                <p className="text-sm text-gray-500">Custom Section</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {index + 1}
                                </Badge>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleRemoveSection(section.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      {showDividerAfter && (
                        <div className="flex items-center gap-2 py-2">
                          <div className="flex-1 h-px bg-gray-300"></div>
                          <span className="text-xs text-gray-400">•</span>
                          <div className="flex-1 h-px bg-gray-300"></div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Footer */}
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" onClick={handleSubmit}>
          Create Template
        </Button>
      </DialogFooter>
    </div>
  );
}

// Edit Template Dialog Component
function EditTemplateDialog({
  template,
  onSubmit,
  onCancel,
  simulatorTypes,
  availableSections,
  onAddSection,
  templateSections,
  setTemplateSections,
  onDownloadPreview,
  existingTemplates,
  isSectionInTemplate,
  handleRemoveSectionFromTemplate,
  getStructuredTemplateSections
}: {
  template: PdfTemplate;
  onSubmit: (data: UpdateTemplateForm) => void;
  onCancel: () => void;
  simulatorTypes: {value: string, label: string}[];
  availableSections: ContentSection[];
  onAddSection: (section: ContentSection) => void;
  templateSections: TemplateSection[];
  setTemplateSections: React.Dispatch<React.SetStateAction<TemplateSection[]>>;
  onDownloadPreview: () => void;
  existingTemplates: PdfTemplate[];
  isSectionInTemplate: (sectionId: string) => boolean;
  handleRemoveSectionFromTemplate: (sectionId: string) => void;
  getStructuredTemplateSections: () => any[];
}) {
  const [formData, setFormData] = useState<UpdateTemplateForm>({
    template_name: template.template_name,
    simulator_type: template.simulator_type,
    section_ids: template.sections?.map(s => s.section_id) || []
  });

  // Check if there's already an active template for the selected simulator type (excluding current template)
  const hasActiveTemplate = formData.simulator_type && 
    existingTemplates.some(t => t.simulator_type === formData.simulator_type && t.is_active && t.id !== template.id);

  // Initialize template sections from existing template
  useEffect(() => {
    if (template.sections) {
      const existingSections: TemplateSection[] = template.sections.map((section, index) => ({
        id: section.section_id,
        template_id: template.id,
        section_id: section.section_id,
        position: index,
        created_at: new Date().toISOString(),
        title: section.title || 'Section',
        section_type: section.section_type || 'custom',
        content: section.content,
        removable: true,
        type: 'cover' as const,
        order: index
      }));
      setTemplateSections(existingSections);
    }
  }, [template, setTemplateSections]);

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

    if (templateSections.length === 0) {
      toast.error('Please add at least one section to the template');
      return;
    }

    // Update section_ids with current template sections
    const updatedFormData = {
      ...formData,
      section_ids: templateSections.map(section => section.id)
    };

    onSubmit(updatedFormData);
  };

  const handleAddPredefinedSection = (type: 'cover' | 'pricing' | 'cta') => {
    const newSection: TemplateSection = {
      id: type,
      title: type === 'cover' ? 'Cover Section' : type === 'pricing' ? 'Pricing Section' : 'Call to Action',
      type: type,
      order: templateSections.length,
      removable: true
    };
    setTemplateSections(prev => [...prev, newSection]);
    toast.success(`Added ${newSection.title}`);
  };

  const handleRemoveSection = (sectionId: string) => {
    setTemplateSections(prev => prev.filter(s => s.id !== sectionId));
    toast.success('Section removed from template');
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'cover': return <BookOpen className="h-4 w-4" />;
      case 'toc': return <FileText className="h-4 w-4" />;
      case 'divider': return <div className="w-4 h-4 flex items-center justify-center"><div className="w-full h-px bg-gray-400"></div></div>;
      case 'pricing': return <DollarSign className="h-4 w-4" />;
      case 'cta': return <MessageSquare className="h-4 w-4" />;
      case 'custom': return <Layout className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

      {/* Template Builder Interface */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Side - Available Sections */}
        <div className="w-1/2 flex flex-col border rounded-lg min-h-0">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Available Sections</h3>
          </div>
          <ScrollArea className="flex-1 p-4 max-h-96">
            <div className="space-y-4">
              {/* Template Structure Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Template Structure</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h5 className="font-medium text-blue-800 mb-1">Fixed Structure</h5>
                      <p className="text-sm text-blue-700">
                        Every template automatically includes: Cover Page, Table of Contents, 
                        Dividers, Pricing Section, and Call to Action in a fixed order.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Sections */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Sections</h4>
                <div className="space-y-2">
                  {availableSections.map((section) => {
                    const isInTemplate = isSectionInTemplate(section.id);
                    return (
                      <Card 
                        key={section.id} 
                        className={`cursor-pointer hover:shadow-md transition-shadow ${
                          isInTemplate ? 'bg-green-50 border-green-300' : ''
                        }`}
                        onClick={() => onAddSection(section)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <Layout className={`h-4 w-4 ${isInTemplate ? 'text-green-600' : ''}`} />
                            <div className="flex-1">
                              <h4 className={`font-medium ${isInTemplate ? 'text-green-800' : ''}`}>
                                {section.title}
                                {isInTemplate && <span className="ml-2 text-xs text-green-600">(Added)</span>}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Custom Section
                              </p>
                            </div>
                            <div className="flex gap-1">
                              {isInTemplate ? (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveSectionFromTemplate(section.id);
                                  }}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Right Side - Template Sections & Preview */}
        <div className="w-1/2 flex flex-col border rounded-lg min-h-0">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Template Sections</h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onDownloadPreview}
                  disabled={templateSections.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-4 max-h-96">
            {templateSections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No sections added yet</p>
                <p className="text-sm">Click on sections from the left to add them</p>
              </div>
            ) : (
              <div className="space-y-2">
                {getStructuredTemplateSections().map((section, index, array) => {
                  // Show divider after TOC and after the last custom section
                  const showDividerAfter = section.type === 'toc' || 
                    (section.type === 'custom' && (!array[index + 1] || array[index + 1].type !== 'custom'));
                  
                  return (
                    <React.Fragment key={section.id}>
                      {section.isPredefined ? (
                        // Compact predefined sections
                        <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-md border border-gray-200">
                          <Lock className="h-3 w-3 text-gray-400" />
                          {getSectionIcon(section.type)}
                          <span className="flex-1 text-sm font-medium text-gray-600">
                            {section.title}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {index + 1}
                          </Badge>
                        </div>
                      ) : (
                        // Full card for custom sections
                        <Card className="group">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                              {getSectionIcon(section.type)}
                              <div className="flex-1">
                                <h4 className="font-medium">{section.title}</h4>
                                <p className="text-sm text-gray-500">Custom Section</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {index + 1}
                                </Badge>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleRemoveSection(section.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      {showDividerAfter && (
                        <div className="flex items-center gap-2 py-2">
                          <div className="flex-1 h-px bg-gray-300"></div>
                          <span className="text-xs text-gray-400">•</span>
                          <div className="flex-1 h-px bg-gray-300"></div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Footer */}
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" onClick={handleSubmit}>
          Update Template
        </Button>
      </DialogFooter>
    </div>
  );
}

// Template Form Component (for editing) - Legacy, keeping for compatibility
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
