// PDF Builder API Service
// Comprehensive API service for managing PDF builder functionality

import { supabase } from '../../../utils/supabase/client';
import { 
  ContentSection, 
  PdfTemplate, 
  GeneratedPdf, 
  TemplateSectionWithDetails,
  TemplateHierarchy,
  CreateSectionForm,
  CreateTemplateForm,
  UpdateSectionForm,
  UpdateTemplateForm,
  SectionFilters,
  TemplateFilters,
  GeneratedPdfFilters,
  SectionListResponse,
  TemplateListResponse,
  GeneratedPdfListResponse,
  ImageUploadResult,
  ImageUploadOptions,
  DEFAULT_IMAGE_UPLOAD_OPTIONS
} from '../../../types/pdfBuilder';

export class PdfBuilderService {
  // Content Sections API
  static async getSections(filters: SectionFilters = {}): Promise<SectionListResponse> {
    const { section_type, created_by, search, page = 1, limit = 50 } = filters;
    
    let query = supabase
      .from('content_sections')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (section_type) {
      query = query.eq('section_type', section_type);
    }

    if (created_by) {
      query = query.eq('created_by', created_by);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content->text.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch sections: ${error.message}`);
    }

    return {
      sections: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  static async getSection(id: string): Promise<ContentSection> {
    const { data, error } = await supabase
      .from('content_sections')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch section: ${error.message}`);
    }

    return data;
  }

  static async createSection(section: CreateSectionForm): Promise<ContentSection> {
    const { image_file, ...sectionData } = section;
    
    let image_url: string | undefined;
    
    if (image_file) {
      const uploadResult = await this.uploadImage(image_file);
      image_url = uploadResult.url;
    }

    const { data, error } = await supabase
      .from('content_sections')
      .insert({
        ...sectionData,
        image_url
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create section: ${error.message}`);
    }

    return data;
  }

  static async updateSection(id: string, section: UpdateSectionForm): Promise<ContentSection> {
    const { image_file, ...sectionData } = section;
    
    let updateData: any = { ...sectionData };
    
    if (image_file) {
      const uploadResult = await this.uploadImage(image_file);
      updateData.image_url = uploadResult.url;
    }

    const { data, error } = await supabase
      .from('content_sections')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update section: ${error.message}`);
    }

    return data;
  }

  static async deleteSection(id: string): Promise<void> {
    const { error } = await supabase
      .from('content_sections')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete section: ${error.message}`);
    }
  }

  // PDF Templates API
  static async getTemplates(filters: TemplateFilters = {}): Promise<TemplateListResponse> {
    const { simulator_type, is_active, created_by, search, page = 1, limit = 50 } = filters;
    
    let query = supabase
      .from('pdf_templates')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (simulator_type) {
      query = query.eq('simulator_type', simulator_type);
    }

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active);
    }

    if (created_by) {
      query = query.eq('created_by', created_by);
    }

    if (search) {
      query = query.ilike('template_name', `%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch templates: ${error.message}`);
    }

    // Get section counts for each template separately
    const processedTemplates = await Promise.all(
      (data || []).map(async (template) => {
        const { count: sectionCount } = await supabase
          .from('template_sections')
          .select('*', { count: 'exact', head: true })
          .eq('template_id', template.id);

        return {
          ...template,
          section_count: sectionCount || 0
        };
      })
    );

    return {
      templates: processedTemplates,
      total: count || 0,
      page,
      limit
    };
  }

  static async getTemplate(id: string): Promise<PdfTemplate> {
    // First get the template with sections data
    const { data: templateData, error: templateError } = await supabase
      .from('pdf_templates')
      .select(`
        *,
        template_sections (
          id,
          section_id,
          position,
          section_type,
          predefined_section,
          content_sections (
            id,
            title,
            section_type,
            content,
            image_url
          )
        )
      `)
      .eq('id', id)
      .single();

    if (templateError) {
      throw new Error(`Failed to fetch template: ${templateError.message}`);
    }

    // Then get the section count separately
    const { count: sectionCount, error: countError } = await supabase
      .from('template_sections')
      .select('*', { count: 'exact', head: true })
      .eq('template_id', id);

    if (countError) {
      console.warn('Failed to fetch section count:', countError);
    }

    // Process the data to include section count
    const processedTemplate = {
      ...templateData,
      section_count: sectionCount || 0
    };

    return processedTemplate;
  }

  static async createTemplate(template: CreateTemplateForm): Promise<PdfTemplate> {
    const { section_ids, ...templateData } = template;

    // Create the template
    const { data: templateResult, error: templateError } = await supabase
      .from('pdf_templates')
      .insert(templateData)
      .select()
      .single();

    if (templateError) {
      throw new Error(`Failed to create template: ${templateError.message}`);
    }

    // Add sections to template
    if (section_ids && section_ids.length > 0) {
      const templateSections = section_ids.map((section_id, index) => ({
        template_id: templateResult.id,
        section_id,
        position: index
      }));

      const { error: sectionsError } = await supabase
        .from('template_sections')
        .insert(templateSections);

      if (sectionsError) {
        throw new Error(`Failed to add sections to template: ${sectionsError.message}`);
      }
    }

    return templateResult;
  }

  static async updateTemplate(id: string, template: UpdateTemplateForm): Promise<PdfTemplate> {
    const { section_ids, ...templateData } = template;

    // Update template data
    const { error: templateError } = await supabase
      .from('pdf_templates')
      .update(templateData)
      .eq('id', id);

    if (templateError) {
      throw new Error(`Failed to update template: ${templateError.message}`);
    }

    // Update sections if provided
    if (section_ids !== undefined) {
      // Delete existing sections
      const { error: deleteError } = await supabase
        .from('template_sections')
        .delete()
        .eq('template_id', id);

      if (deleteError) {
        throw new Error(`Failed to remove existing sections: ${deleteError.message}`);
      }

      // Add new sections
      if (section_ids.length > 0) {
        const templateSections = section_ids.map((section_id, index) => ({
          template_id: id,
          section_id,
          position: index
        }));

        const { error: sectionsError } = await supabase
          .from('template_sections')
          .insert(templateSections);

        if (sectionsError) {
          throw new Error(`Failed to add new sections: ${sectionsError.message}`);
        }
      }
    }

    return this.getTemplate(id);
  }

  static async deleteTemplate(id: string): Promise<void> {
    try {
      console.log('PdfBuilderService: Deleting template:', id);
      
      // First, delete any generated_pdfs records that reference this template
      // since template_id is NOT NULL, we can't set it to null
      const { error: deleteGeneratedPdfsError } = await supabase
        .from('generated_pdfs')
        .delete()
        .eq('template_id', id);

      if (deleteGeneratedPdfsError) {
        console.error('PdfBuilderService: Failed to delete generated_pdfs:', deleteGeneratedPdfsError);
        // Continue with deletion even if this fails
      } else {
        console.log('PdfBuilderService: Deleted generated_pdfs records for template:', id);
      }

      // Delete template sections first (if they exist)
      const { error: sectionsError } = await supabase
        .from('template_sections')
        .delete()
        .eq('template_id', id);

      if (sectionsError) {
        console.error('PdfBuilderService: Failed to delete template sections:', sectionsError);
        // Continue with template deletion even if this fails
      }

      // Now delete the template
      const { error } = await supabase
        .from('pdf_templates')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete template: ${error.message}`);
      }

      console.log('PdfBuilderService: Template deleted successfully');
    } catch (error) {
      console.error('PdfBuilderService: Template deletion failed:', error);
      throw error;
    }
  }

  static async duplicateTemplate(sourceId: string, newName: string): Promise<string> {
    const { data, error } = await supabase.rpc('duplicate_template', {
      source_template_id: sourceId,
      new_template_name: newName,
      new_created_by: (await supabase.auth.getUser()).data.user?.id
    });

    if (error) {
      throw new Error(`Failed to duplicate template: ${error.message}`);
    }

    return data;
  }

  static async activateTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('pdf_templates')
      .update({ is_active: true })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to activate template: ${error.message}`);
    }
  }

  static async getTemplateHierarchy(simulatorType: string): Promise<TemplateHierarchy[]> {
    const { data, error } = await supabase.rpc('get_template_hierarchy', {
      simulator_type_param: simulatorType
    });

    if (error) {
      throw new Error(`Failed to fetch template hierarchy: ${error.message}`);
    }

    return data || [];
  }

  static async getTemplateSections(templateId: string): Promise<TemplateSectionWithDetails[]> {
    console.log('PdfBuilderService: Fetching template sections for template:', templateId);
    
    const { data, error } = await supabase
      .from('template_sections_with_details')
      .select('*')
      .eq('template_id', templateId)
      .order('position');

    if (error) {
      console.error('PdfBuilderService: Error fetching template sections:', error);
      throw new Error(`Failed to fetch template sections: ${error.message}`);
    }

    console.log('PdfBuilderService: Template sections found:', data?.length || 0);
    console.log('PdfBuilderService: Template sections data:', data);
    
    return data || [];
  }

  // Archived Templates API
  static async getArchivedTemplates(): Promise<any[]> {
    console.log('PdfBuilderService: Fetching archived templates...');
    
    // First, let's check if the is_archived column exists by trying a simple query
    try {
      const { data: allTemplates, error: allError } = await supabase
        .from('pdf_templates')
        .select(`
          id,
          template_name,
          simulator_type,
          version_number,
          archived_at,
          created_by,
          is_archived,
          is_active
        `)
        .order('created_at', { ascending: false });

      console.log('PdfBuilderService: All templates query result:', { data: allTemplates, error: allError });
      
      if (allError) {
        console.error('PdfBuilderService: Error fetching all templates:', allError);
        // If the is_archived column doesn't exist, return empty array
        if (allError.message.includes('is_archived') || allError.message.includes('column')) {
          console.log('PdfBuilderService: is_archived column does not exist. Database migration may be needed.');
          return [];
        }
        throw new Error(`Failed to fetch templates: ${allError.message}`);
      }

      // Filter for archived templates
      const archivedTemplates = allTemplates?.filter(template => template.is_archived === true) || [];
      console.log('PdfBuilderService: Found', archivedTemplates.length, 'archived templates out of', allTemplates?.length || 0, 'total templates');

      // Get section counts for each template separately
      const processedTemplates = await Promise.all(
        archivedTemplates.map(async (template) => {
          const { count: sectionCount } = await supabase
            .from('template_sections')
            .select('*', { count: 'exact', head: true })
            .eq('template_id', template.id);

          return {
            ...template,
            section_count: sectionCount || 0
          };
        })
      );

      console.log('PdfBuilderService: Processed templates:', processedTemplates);
      return processedTemplates;
      
    } catch (error) {
      console.error('PdfBuilderService: Error in getArchivedTemplates:', error);
      throw error;
    }
  }

  static async restoreArchivedTemplate(templateId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('restore_archived_template', {
      template_id: templateId
    });

    if (error) {
      throw new Error(`Failed to restore archived template: ${error.message}`);
    }

    return data === true;
  }

  // Generated PDFs API
  static async getGeneratedPdfs(filters: GeneratedPdfFilters = {}): Promise<GeneratedPdfListResponse> {
    console.log('PdfBuilderService: Fetching generated PDFs with filters:', filters);
    
    // First, let's test if the table exists by doing a simple count query
    try {
      const { count, error: countError } = await supabase
        .from('generated_pdfs')
        .select('*', { count: 'exact', head: true });
      
      console.log('PdfBuilderService: Table exists check:', { count, countError });
      
      if (countError) {
        console.error('PdfBuilderService: Table does not exist or has permission issues:', countError);
        throw new Error(`Database table 'generated_pdfs' does not exist or is not accessible: ${countError.message}`);
      }
    } catch (error) {
      console.error('PdfBuilderService: Error checking table existence:', error);
      throw error;
    }
    
    const { 
      template_id, 
      simulator_type, 
      generated_by, 
      date_from, 
      date_to, 
      search, 
      page = 1, 
      limit = 50 
    } = filters;
    
    let query = supabase
      .from('generated_pdfs')
      .select(`
        *,
        pdf_templates (
          id,
          template_name,
          simulator_type
        )
      `, { count: 'exact' })
      .order('generated_at', { ascending: false });

    if (template_id) {
      query = query.eq('template_id', template_id);
    }

    if (simulator_type) {
      query = query.eq('simulator_type', simulator_type);
    }

    if (generated_by) {
      query = query.eq('generated_by', generated_by);
    }

    if (date_from) {
      query = query.gte('generated_at', date_from);
    }

    if (date_to) {
      query = query.lte('generated_at', date_to);
    }

    if (search) {
      query = query.or(`client_name.ilike.%${search}%,project_name.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to);

    console.log('PdfBuilderService: Generated PDFs query result:', { data, error, count });

    if (error) {
      console.error('PdfBuilderService: Database error fetching generated PDFs:', error);
      throw new Error(`Failed to fetch generated PDFs: ${error.message}`);
    }

    console.log('PdfBuilderService: Found', data?.length || 0, 'generated PDFs out of', count || 0, 'total');

    return {
      pdfs: data || [],
      total: count || 0,
      page,
      limit
    };
  }

  static async createGeneratedPdf(pdfData: {
    template_id: string;
    client_name: string;
    project_name: string;
    simulator_type: string;
    pricing_data: any;
    pdf_url?: string;
  }): Promise<GeneratedPdf> {
    console.log('PdfBuilderService: Creating generated PDF record:', pdfData);
    
    const { data, error } = await supabase
      .from('generated_pdfs')
      .insert(pdfData)
      .select()
      .single();

    console.log('PdfBuilderService: Create generated PDF result:', { data, error });

    if (error) {
      console.error('PdfBuilderService: Failed to create generated PDF record:', error);
      throw new Error(`Failed to create generated PDF record: ${error.message}`);
    }

    console.log('PdfBuilderService: Successfully created generated PDF record:', data);
    return data;
  }

  static async deleteGeneratedPdf(id: string): Promise<void> {
    const { error } = await supabase
      .from('generated_pdfs')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete generated PDF: ${error.message}`);
    }
  }

  // Image Upload API
  static async uploadImage(
    file: File, 
    options: ImageUploadOptions = DEFAULT_IMAGE_UPLOAD_OPTIONS
  ): Promise<ImageUploadResult> {
    // Validate file
    if (file.size > options.max_size!) {
      throw new Error(`File size exceeds maximum allowed size of ${options.max_size! / (1024 * 1024)}MB`);
    }

    if (!options.allowed_types!.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `sections/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('pdf-section-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('pdf-section-images')
      .getPublicUrl(filePath);

    return {
      url: data.path,
      public_url: urlData.publicUrl,
      path: filePath
    };
  }

  static async deleteImage(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from('pdf-section-images')
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  // Utility methods
  static async getActiveTemplate(simulatorType: string): Promise<PdfTemplate | null> {
    try {
      console.log('PdfBuilderService: Fetching active template for simulator:', simulatorType);
      console.log('PdfBuilderService: Simulator type type:', typeof simulatorType);
      
      // First, let's check if the table exists and what templates are available
      const { data: allTemplates, error: allError } = await supabase
        .from('pdf_templates')
        .select('*');
      
      console.log('PdfBuilderService: All templates:', { allTemplates, allError });
      
      if (allTemplates && allTemplates.length > 0) {
        console.log('PdfBuilderService: Available simulator types in templates:', 
          allTemplates.map(t => ({ 
            id: t.id, 
            name: t.template_name, 
            simulator_type: t.simulator_type, 
            is_active: t.is_active,
            type: typeof t.simulator_type,
            length: t.simulator_type?.length
          }))
        );
        
        // Also log the exact simulator type we're looking for
        console.log('PdfBuilderService: Looking for simulator type:', {
          value: simulatorType,
          type: typeof simulatorType,
          length: simulatorType?.length,
          trimmed: simulatorType?.trim()
        });
      }
      
      // Try to find active template for the simulator type
      console.log('PdfBuilderService: Trying to find active template...');
      const { data: activeTemplates, error: queryError } = await supabase
        .from('pdf_templates')
        .select('*')
        .eq('simulator_type', simulatorType)
        .eq('is_active', true);

      console.log('PdfBuilderService: Query result:', { activeTemplates, queryError });

      if (queryError) {
        console.error('PdfBuilderService: Query error:', queryError);
        // Try case-insensitive search as fallback
        console.log('PdfBuilderService: Trying case-insensitive search...');
        const { data: caseInsensitive, error: caseError } = await supabase
          .from('pdf_templates')
          .select('*')
          .ilike('simulator_type', simulatorType)
          .eq('is_active', true);

        console.log('PdfBuilderService: Case-insensitive result:', { caseInsensitive, caseError });

        if (caseInsensitive && caseInsensitive.length > 0) {
          return caseInsensitive[0];
        }
        return null;
      }

      if (activeTemplates && activeTemplates.length > 0) {
        console.log('PdfBuilderService: Found active template, returning first one');
        return activeTemplates[0];
      }

      // Try case-insensitive search
      console.log('PdfBuilderService: Trying case-insensitive search...');
      const { data: caseInsensitive, error: caseError } = await supabase
        .from('pdf_templates')
        .select('*')
        .ilike('simulator_type', simulatorType)
        .eq('is_active', true);

      console.log('PdfBuilderService: Case-insensitive result:', { caseInsensitive, caseError });

      if (caseInsensitive && caseInsensitive.length > 0) {
        return caseInsensitive[0];
      }

      console.log('PdfBuilderService: No active template found for simulator type:', simulatorType);
      return null;

    } catch (error) {
      console.error('PdfBuilderService: Failed to fetch active template:', error);
      return null;
    }
  }

  static async getAvailableSimulatorTypes(): Promise<{value: string, label: string}[]> {
    const { data, error } = await supabase
      .from('simulators')
      .select('url_slug, name')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch simulator types: ${error.message}`);
    }

    // Return simulator data with both slug and name
    return data?.map(simulator => ({
      value: simulator.url_slug,
      label: simulator.name
    })) || [];
  }

  static async getSectionTypes(): Promise<string[]> {
    const { data, error } = await supabase
      .from('content_sections')
      .select('section_type')
      .not('section_type', 'is', null);

    if (error) {
      throw new Error(`Failed to fetch section types: ${error.message}`);
    }

    // Get unique section types
    const uniqueTypes = [...new Set(data?.map(item => item.section_type) || [])];
    return uniqueTypes;
  }

  // Bulk operations
  static async bulkDeleteSections(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('content_sections')
      .delete()
      .in('id', ids);

    if (error) {
      throw new Error(`Failed to bulk delete sections: ${error.message}`);
    }
  }

  static async bulkDeleteTemplates(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('pdf_templates')
      .delete()
      .in('id', ids);

    if (error) {
      throw new Error(`Failed to bulk delete templates: ${error.message}`);
    }
  }

  static async bulkDeleteGeneratedPdfs(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('generated_pdfs')
      .delete()
      .in('id', ids);

    if (error) {
      throw new Error(`Failed to bulk delete generated PDFs: ${error.message}`);
    }
  }
}
