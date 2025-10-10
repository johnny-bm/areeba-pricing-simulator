import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Separator } from '../../../components/ui/separator';
import { 
  Plus, 
  GripVertical, 
  Eye, 
  Trash2, 
  Save,
  ArrowLeft,
  FileText,
  Image,
  Type,
  List,
  Table,
  Quote,
  Hash
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ContentSection, PdfTemplate } from '../../../types/pdfBuilder';
import { useContentSections } from '../hooks/usePdfBuilder';
import { toast } from 'sonner';

interface TemplateBuilderInterfaceProps {
  template?: PdfTemplate;
  simulatorType: string;
  onSave: (template: Partial<PdfTemplate>) => void;
  onCancel: () => void;
}

interface SectionItem {
  id: string;
  title: string;
  type: string;
  content: any;
  order: number;
}

export function TemplateBuilderInterface({
  template,
  simulatorType,
  onSave,
  onCancel
}: TemplateBuilderInterfaceProps) {
  const [templateName, setTemplateName] = useState(template?.template_name || '');
  const [selectedSections, setSelectedSections] = useState<SectionItem[]>([]);
  const [availableSections, setAvailableSections] = useState<ContentSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load available sections
  const { sections: allSections, loading: sectionsLoading } = useContentSections();

  useEffect(() => {
    if (allSections) {
      setAvailableSections(allSections);
      setIsLoading(false);
    }
  }, [allSections]);

  // Initialize with existing template sections
  useEffect(() => {
    if (template?.sections) {
      const templateSections = template.sections.map((section, index) => ({
        id: section.section_id,
        title: section.title,
        type: section.section_type,
        content: section.content,
        order: index
      }));
      setSelectedSections(templateSections);
    }
  }, [template]);

  const handleAddSection = (section: ContentSection) => {
    const newSection: SectionItem = {
      id: section.id,
      title: section.title,
      type: section.section_type,
      content: section.content,
      order: selectedSections.length
    };
    setSelectedSections(prev => [...prev, newSection]);
    toast.success(`Added "${section.title}" to template`);
  };

  const handleRemoveSection = (sectionId: string) => {
    setSelectedSections(prev => prev.filter(s => s.id !== sectionId));
    toast.success('Section removed from template');
  };

  const handleReorderSections = (fromIndex: number, toIndex: number) => {
    const newSections = [...selectedSections];
    const [movedSection] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, movedSection);
    
    // Update order
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }));
    
    setSelectedSections(updatedSections);
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    if (selectedSections.length === 0) {
      toast.error('Please add at least one section to the template');
      return;
    }

    setIsSaving(true);
    try {
      const templateData: Partial<PdfTemplate> = {
        template_name: templateName,
        simulator_type: simulatorType,
        sections: selectedSections.map(section => ({
          section_id: section.id,
          title: section.title,
          section_type: section.type,
          content: section.content,
          order: section.order
        }))
      };

      await onSave(templateData);
      toast.success('Template saved successfully');
    } catch (error) {
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'title': return <Hash className="h-4 w-4" />;
      case 'description': return <Type className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'list': return <List className="h-4 w-4" />;
      case 'table': return <Table className="h-4 w-4" />;
      case 'quote': return <Quote className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const renderSectionPreview = (section: SectionItem) => {
    const { type, content } = section;
    
    switch (type) {
      case 'title':
        const level = content?.level || 1;
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag className="font-bold text-lg mb-2">
            {content?.text || 'Title'}
          </HeadingTag>
        );
      
      case 'description':
        return (
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: content?.html || 'Description content' }}
          />
        );
      
      case 'image':
        return (
          <div className="my-4">
            <img 
              src={content?.src || '/placeholder-image.jpg'} 
              alt={content?.alt || 'Image'} 
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        );
      
      case 'list':
        const ListTag = content?.ordered ? 'ol' : 'ul';
        return (
          <ListTag className="ml-4 mb-2">
            {(content?.items || ['List item']).map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ListTag>
        );
      
      case 'table':
        return (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  {(content?.headers || ['Header 1', 'Header 2']).map((header: string, index: number) => (
                    <th key={index} className="border border-gray-300 px-4 py-2 text-left">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(content?.rows || [['Cell 1', 'Cell 2']]).map((row: string[], rowIndex: number) => (
                  <tr key={rowIndex}>
                    {row.map((cell: string, cellIndex: number) => (
                      <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case 'quote':
        return (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
            {content?.text || 'Quote content'}
          </blockquote>
        );
      
      default:
        return (
          <div className="text-gray-500 italic">
            {content?.text || 'Section content'}
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Side - Builder */}
      <div className="w-1/2 flex flex-col border-r">
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button onClick={handleSave} disabled={isSaving || !templateName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{simulatorType}</Badge>
            <span className="text-sm text-gray-500">
              {selectedSections.length} section{selectedSections.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Available Sections */}
        <div className="flex-1 p-4">
          <h3 className="text-lg font-semibold mb-4">Available Sections</h3>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {availableSections.map((section) => (
                <Card 
                  key={section.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleAddSection(section)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {getSectionIcon(section.section_type)}
                      <div className="flex-1">
                        <h4 className="font-medium">{section.title}</h4>
                        <p className="text-sm text-gray-500 capitalize">
                          {section.section_type}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Selected Sections */}
        <div className="p-4 border-t bg-white">
          <h3 className="text-lg font-semibold mb-4">Template Sections</h3>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {selectedSections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No sections added yet</p>
                  <p className="text-sm">Click on sections above to add them</p>
                </div>
              ) : (
                selectedSections.map((section, index) => (
                  <Card key={section.id} className="group">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                        {getSectionIcon(section.type)}
                        <div className="flex-1">
                          <h4 className="font-medium">{section.title}</h4>
                          <p className="text-sm text-gray-500 capitalize">
                            {section.type}
                          </p>
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
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Right Side - Live Preview */}
      <div className="w-1/2 flex flex-col bg-white">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Live Preview</h3>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {selectedSections.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No sections added</h3>
                <p>Add sections from the left panel to see the preview</p>
              </div>
            ) : (
              <div className="space-y-6">
                {selectedSections.map((section, index) => (
                  <div key={section.id} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {index + 1}
                      </Badge>
                      <span className="text-sm text-gray-500 capitalize">
                        {section.type}
                      </span>
                    </div>
                    {renderSectionPreview(section)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
