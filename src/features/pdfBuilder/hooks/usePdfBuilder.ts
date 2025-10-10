// PDF Builder Hooks
// Custom hooks for managing PDF builder state and operations

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  ContentSection, 
  PdfTemplate, 
  GeneratedPdf, 
  TemplateHierarchy,
  CreateSectionForm,
  CreateTemplateForm,
  UpdateSectionForm,
  UpdateTemplateForm,
  SectionFilters,
  TemplateFilters,
  GeneratedPdfFilters,
  UserPermissions
} from '../../../types/pdfBuilder';
import { PdfBuilderService } from '../api/pdfBuilderService';
import { ROLES } from '../../../config/database';

// Hook for managing content sections
export function useContentSections(filters: SectionFilters = {}) {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await PdfBuilderService.getSections(filters);
      setSections(response.sections);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sections';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const createSection = useCallback(async (sectionData: CreateSectionForm) => {
    try {
      const newSection = await PdfBuilderService.createSection(sectionData);
      setSections(prev => [newSection, ...prev]);
      setTotal(prev => prev + 1);
      toast.success('Section created successfully');
      return newSection;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create section';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updateSection = useCallback(async (id: string, sectionData: UpdateSectionForm) => {
    try {
      const updatedSection = await PdfBuilderService.updateSection(id, sectionData);
      setSections(prev => prev.map(section => 
        section.id === id ? updatedSection : section
      ));
      toast.success('Section updated successfully');
      return updatedSection;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update section';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const deleteSection = useCallback(async (id: string) => {
    try {
      await PdfBuilderService.deleteSection(id);
      setSections(prev => prev.filter(section => section.id !== id));
      setTotal(prev => prev - 1);
      toast.success('Section deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete section';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const bulkDeleteSections = useCallback(async (ids: string[]) => {
    try {
      await PdfBuilderService.bulkDeleteSections(ids);
      setSections(prev => prev.filter(section => !ids.includes(section.id)));
      setTotal(prev => prev - ids.length);
      toast.success(`${ids.length} sections deleted successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete sections';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  return {
    sections,
    loading,
    error,
    total,
    refetch: fetchSections,
    createSection,
    updateSection,
    deleteSection,
    bulkDeleteSections
  };
}

// Hook for managing PDF templates
export function usePdfTemplates(filters: TemplateFilters = {}) {
  const [templates, setTemplates] = useState<PdfTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await PdfBuilderService.getTemplates(filters);
      setTemplates(response.templates);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = useCallback(async (templateData: CreateTemplateForm) => {
    try {
      const newTemplate = await PdfBuilderService.createTemplate(templateData);
      setTemplates(prev => [newTemplate, ...prev]);
      setTotal(prev => prev + 1);
      toast.success('Template created successfully');
      return newTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updateTemplate = useCallback(async (id: string, templateData: UpdateTemplateForm) => {
    try {
      const updatedTemplate = await PdfBuilderService.updateTemplate(id, templateData);
      setTemplates(prev => prev.map(template => 
        template.id === id ? updatedTemplate : template
      ));
      toast.success('Template updated successfully');
      return updatedTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update template';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      await PdfBuilderService.deleteTemplate(id);
      setTemplates(prev => prev.filter(template => template.id !== id));
      setTotal(prev => prev - 1);
      toast.success('Template deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const duplicateTemplate = useCallback(async (id: string, newName: string) => {
    try {
      const newTemplateId = await PdfBuilderService.duplicateTemplate(id, newName);
      await fetchTemplates(); // Refresh the list
      toast.success('Template duplicated successfully');
      return newTemplateId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate template';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchTemplates]);

  const activateTemplate = useCallback(async (id: string) => {
    try {
      await PdfBuilderService.activateTemplate(id);
      setTemplates(prev => prev.map(template => ({
        ...template,
        is_active: template.id === id
      })));
      toast.success('Template activated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to activate template';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const bulkDeleteTemplates = useCallback(async (ids: string[]) => {
    try {
      await PdfBuilderService.bulkDeleteTemplates(ids);
      setTemplates(prev => prev.filter(template => !ids.includes(template.id)));
      setTotal(prev => prev - ids.length);
      toast.success(`${ids.length} templates deleted successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete templates';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  return {
    templates,
    loading,
    error,
    total,
    refetch: fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    activateTemplate,
    bulkDeleteTemplates
  };
}

// Hook for managing generated PDFs
export function useGeneratedPdfs(filters: GeneratedPdfFilters = {}) {
  const [pdfs, setPdfs] = useState<GeneratedPdf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchPdfs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await PdfBuilderService.getGeneratedPdfs(filters);
      setPdfs(response.pdfs);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch generated PDFs';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchPdfs();
  }, [fetchPdfs]);

  const createGeneratedPdf = useCallback(async (pdfData: {
    template_id: string;
    client_name: string;
    project_name: string;
    simulator_type: string;
    pricing_data: any;
    pdf_url?: string;
  }) => {
    try {
      const newPdf = await PdfBuilderService.createGeneratedPdf(pdfData);
      setPdfs(prev => [newPdf, ...prev]);
      setTotal(prev => prev + 1);
      toast.success('PDF generated successfully');
      return newPdf;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate PDF';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const deleteGeneratedPdf = useCallback(async (id: string) => {
    try {
      await PdfBuilderService.deleteGeneratedPdf(id);
      setPdfs(prev => prev.filter(pdf => pdf.id !== id));
      setTotal(prev => prev - 1);
      toast.success('Generated PDF deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete generated PDF';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const bulkDeleteGeneratedPdfs = useCallback(async (ids: string[]) => {
    try {
      await PdfBuilderService.bulkDeleteGeneratedPdfs(ids);
      setPdfs(prev => prev.filter(pdf => !ids.includes(pdf.id)));
      setTotal(prev => prev - ids.length);
      toast.success(`${ids.length} generated PDFs deleted successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete generated PDFs';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  return {
    pdfs,
    loading,
    error,
    total,
    refetch: fetchPdfs,
    createGeneratedPdf,
    deleteGeneratedPdf,
    bulkDeleteGeneratedPdfs
  };
}

// Hook for template hierarchy
export function useTemplateHierarchy(simulatorType: string) {
  const [hierarchy, setHierarchy] = useState<TemplateHierarchy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHierarchy = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PdfBuilderService.getTemplateHierarchy(simulatorType);
      setHierarchy(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch template hierarchy';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [simulatorType]);

  useEffect(() => {
    if (simulatorType) {
      fetchHierarchy();
    }
  }, [fetchHierarchy]);

  return {
    hierarchy,
    loading,
    error,
    refetch: fetchHierarchy
  };
}

// Hook for user permissions
export function useUserPermissions(userRole: string): UserPermissions {
  const isAdmin = userRole === ROLES.OWNER || userRole === ROLES.ADMIN;
  const isOwner = userRole === ROLES.OWNER;

  return {
    can_view_sections: true,
    can_create_sections: isAdmin,
    can_edit_sections: isAdmin,
    can_delete_sections: isAdmin,
    can_view_templates: true,
    can_create_templates: isAdmin,
    can_edit_templates: isAdmin,
    can_delete_templates: isAdmin,
    can_generate_pdfs: true,
    can_view_generated_pdfs: true,
    can_delete_generated_pdfs: isAdmin
  };
}

// Hook for available simulator types
export function useAvailableSimulatorTypes() {
  const [simulatorTypes, setSimulatorTypes] = useState<{value: string, label: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSimulatorTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const types = await PdfBuilderService.getAvailableSimulatorTypes();
      setSimulatorTypes(types);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch simulator types';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSimulatorTypes();
  }, [fetchSimulatorTypes]);

  return {
    simulatorTypes,
    loading,
    error,
    refetch: fetchSimulatorTypes
  };
}

// Hook for active template
export function useActiveTemplate(simulatorType: string) {
  const [template, setTemplate] = useState<PdfTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveTemplate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const activeTemplate = await PdfBuilderService.getActiveTemplate(simulatorType);
      setTemplate(activeTemplate);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch active template';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [simulatorType]);

  useEffect(() => {
    if (simulatorType) {
      fetchActiveTemplate();
    }
  }, [fetchActiveTemplate]);

  return {
    template,
    loading,
    error,
    refetch: fetchActiveTemplate
  };
}

// Hook for template sections
export function useTemplateSections(templateId: string) {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplateSections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const templateSections = await PdfBuilderService.getTemplateSections(templateId);
      setSections(templateSections);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch template sections';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    if (templateId) {
      fetchTemplateSections();
    }
  }, [fetchTemplateSections]);

  return {
    sections,
    loading,
    error,
    refetch: fetchTemplateSections
  };
}
