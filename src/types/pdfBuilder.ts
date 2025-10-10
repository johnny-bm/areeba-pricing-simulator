// PDF Builder System Types
// Comprehensive type definitions for the PDF builder system

export type SectionType = 'title' | 'description' | 'image' | 'table' | 'bullet_list' | 'callout';

// Content section interfaces
export interface ContentSection {
  id: string;
  title: string;
  section_type: SectionType;
  content: SectionContent;
  image_url?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface SectionContent {
  // Base content that all sections have
  text?: string;
  html?: string; // Rich HTML content from the editor
  style?: SectionStyle;
  
  // Legacy fields for backward compatibility
  level?: 1 | 2 | 3 | 4 | 5 | 6; // Heading level for title sections
  auto_numbering?: 'none' | 'roman' | 'letters' | 'numbers' | 'decimal'; // Auto-numbering for title sections
  
  // Image-specific content
  alt_text?: string;
  caption?: string;
  
  // Table-specific content
  headers?: string[];
  rows?: TableRow[];
  
  // Bullet list-specific content
  items?: BulletItem[];
  
  // Callout-specific content
  callout_type?: 'info' | 'warning' | 'success' | 'error';
  icon?: string;
}

export interface SectionStyle {
  font_size?: string;
  font_weight?: 'normal' | 'bold' | 'lighter' | 'bolder';
  color?: string;
  background_color?: string;
  text_align?: 'left' | 'center' | 'right' | 'justify';
  margin_top?: string;
  margin_bottom?: string;
  padding?: string;
  border_radius?: string;
  border?: string;
}

export interface TableRow {
  id: string;
  cells: string[];
}

export interface BulletItem {
  id: string;
  text: string;
  sub_items?: BulletItem[];
}

// PDF Template interfaces
export interface PdfTemplate {
  id: string;
  template_name: string;
  simulator_type: string;
  is_active: boolean;
  version_number: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  sections?: TemplateSection[];
  section_count?: number;
}

export interface TemplateSection {
  id: string;
  template_id: string;
  section_id: string;
  position: number;
  created_at: string;
  section?: ContentSection;
}

export interface TemplateSectionWithDetails {
  id: string;
  template_id: string;
  section_id: string;
  position: number;
  created_at: string;
  section_title: string;
  section_type: SectionType;
  content: SectionContent;
  image_url?: string;
}

// Generated PDF interfaces
export interface GeneratedPdf {
  id: string;
  template_id: string;
  client_name: string;
  project_name: string;
  simulator_type: string;
  pricing_data: PricingData;
  pdf_url?: string;
  generated_at: string;
  generated_by: string;
  template?: PdfTemplate;
}

export interface PricingData {
  selected_items: any[];
  client_config: any;
  categories: any[];
  global_discount: number;
  global_discount_type: string;
  global_discount_application: string;
  summary: {
    oneTimeTotal: number;
    monthlyTotal: number;
    yearlyTotal: number;
    totalProjectCost: number;
    itemCount: number;
  };
}

// Template hierarchy interfaces
export interface TemplateHierarchy {
  template_id: string;
  template_name: string;
  version_number: number;
  is_active: boolean;
  created_at: string;
  section_count: number;
}

// Form interfaces for creating/editing
export interface CreateSectionForm {
  title: string;
  section_type: SectionType;
  content: SectionContent;
  image_file?: File;
}

export interface CreateTemplateForm {
  template_name: string;
  simulator_type: string;
  section_ids: string[];
}

export interface UpdateSectionForm {
  title?: string;
  content?: SectionContent;
  image_file?: File;
}

export interface UpdateTemplateForm {
  template_name?: string;
  section_ids?: string[];
}

// API response interfaces
export interface SectionListResponse {
  sections: ContentSection[];
  total: number;
  page: number;
  limit: number;
}

export interface TemplateListResponse {
  templates: PdfTemplate[];
  total: number;
  page: number;
  limit: number;
}

export interface GeneratedPdfListResponse {
  pdfs: GeneratedPdf[];
  total: number;
  page: number;
  limit: number;
}

// Filter and search interfaces
export interface SectionFilters {
  section_type?: SectionType;
  created_by?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TemplateFilters {
  simulator_type?: string;
  is_active?: boolean;
  created_by?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GeneratedPdfFilters {
  template_id?: string;
  simulator_type?: string;
  generated_by?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Drag and drop interfaces
export interface DragItem {
  id: string;
  type: 'section' | 'template_section';
  section?: ContentSection;
  template_section?: TemplateSectionWithDetails;
}

export interface DropResult {
  destination?: {
    droppableId: string;
    index: number;
  };
  source: {
    droppableId: string;
    index: number;
  };
  draggableId: string;
}

// PDF generation interfaces
export interface PdfGenerationData {
  template_id: string;
  client_name: string;
  project_name: string;
  simulator_type: string;
  pricing_data: PricingData;
  include_preliminary?: boolean;
}

export interface PdfGenerationOptions {
  format?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  margin?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  header?: boolean;
  footer?: boolean;
  page_numbers?: boolean;
}

// Image upload interfaces
export interface ImageUploadResult {
  url: string;
  public_url: string;
  path: string;
}

export interface ImageUploadOptions {
  max_size?: number; // in bytes
  allowed_types?: string[];
  quality?: number; // 0-100
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill';
  };
}

// Rich text editor interfaces
export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export interface RichTextToolbar {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  heading1?: boolean;
  heading2?: boolean;
  heading3?: boolean;
  bulletList?: boolean;
  orderedList?: boolean;
  link?: boolean;
  image?: boolean;
  code?: boolean;
  blockquote?: boolean;
}

// Permission interfaces
export interface UserPermissions {
  can_view_sections: boolean;
  can_create_sections: boolean;
  can_edit_sections: boolean;
  can_delete_sections: boolean;
  can_view_templates: boolean;
  can_create_templates: boolean;
  can_edit_templates: boolean;
  can_delete_templates: boolean;
  can_generate_pdfs: boolean;
  can_view_generated_pdfs: boolean;
  can_delete_generated_pdfs: boolean;
}

// Admin interface props
export interface PdfBuilderAdminProps {
  userRole: string;
  userId: string;
  onClose?: () => void;
}

export interface SectionManagerProps {
  sections: ContentSection[];
  onSectionCreate: (section: CreateSectionForm) => Promise<void>;
  onSectionUpdate: (id: string, section: UpdateSectionForm) => Promise<void>;
  onSectionDelete: (id: string) => Promise<void>;
  permissions: UserPermissions;
  loading?: boolean;
}

export interface TemplateBuilderProps {
  templates: PdfTemplate[];
  sections: ContentSection[];
  onTemplateCreate: (template: CreateTemplateForm) => Promise<void>;
  onTemplateUpdate: (id: string, template: UpdateTemplateForm) => Promise<void>;
  onTemplateDelete: (id: string) => Promise<void>;
  onTemplateDuplicate: (id: string, newName: string) => Promise<string>;
  onTemplateActivate: (id: string) => Promise<void>;
  permissions: UserPermissions;
  loading?: boolean;
}

export interface VersionControlProps {
  templates: TemplateHierarchy[];
  onTemplateActivate: (id: string) => Promise<void>;
  onTemplateDuplicate: (id: string, newName: string) => Promise<string>;
  onTemplatePreview: (id: string) => void;
  permissions: UserPermissions;
  loading?: boolean;
}

// Error interfaces
export interface PdfBuilderError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Constants
export const SECTION_TYPES: Record<SectionType, string> = {
  title: 'Title',
  description: 'Description',
  image: 'Image',
  table: 'Table',
  bullet_list: 'Bullet List',
  callout: 'Callout'
};

export const CALLOUT_TYPES = {
  info: 'Info',
  warning: 'Warning',
  success: 'Success',
  error: 'Error'
} as const;

export const DEFAULT_SECTION_STYLE: SectionStyle = {
  font_size: '16px',
  font_weight: 'normal',
  color: '#000000',
  text_align: 'left',
  margin_top: '0',
  margin_bottom: '16px',
  padding: '0',
  border_radius: '0',
  border: 'none'
};

export const DEFAULT_IMAGE_UPLOAD_OPTIONS: ImageUploadOptions = {
  max_size: 5 * 1024 * 1024, // 5MB
  allowed_types: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'],
  quality: 90,
  resize: {
    width: 1200,
    height: 800,
    fit: 'contain'
  }
};

export const DEFAULT_PDF_GENERATION_OPTIONS: PdfGenerationOptions = {
  format: 'A4',
  orientation: 'portrait',
  margin: {
    top: '20mm',
    right: '20mm',
    bottom: '20mm',
    left: '20mm'
  },
  header: true,
  footer: true,
  page_numbers: true
};
