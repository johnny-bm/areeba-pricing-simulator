// PDF Builder Feature Index
// Main export file for the PDF builder feature

// Components
export { PdfBuilderAdmin } from './components/PdfBuilderAdmin';
export { SectionManager } from './components/SectionManager';
export { TemplateBuilder } from './components/TemplateBuilder';
export { VersionControl } from './components/VersionControl';
export { GeneratedPdfsManager } from './components/GeneratedPdfsManager';
export { PdfGenerator } from './components/PdfGenerator';
export { PdfBuilderIntegration } from './components/PdfBuilderIntegration';
export { EnhancedPdfButton } from './components/PdfBuilderIntegration';
export { RichTextEditor, SimpleTextEditor } from './components/RichTextEditor';
export { ImageUpload, ImagePreview, ImageUploadWithCrop } from './components/ImageUpload';
export { 
  DragDropSectionList, 
  DragDropTemplateBuilder, 
  DragDropList 
} from './components/DragDropComponents';

// Hooks
export {
  useContentSections,
  usePdfTemplates,
  useGeneratedPdfs,
  useTemplateHierarchy,
  useUserPermissions,
  useAvailableSimulatorTypes,
  useActiveTemplate,
  useTemplateSections
} from './hooks/usePdfBuilder';

// API Service
export { PdfBuilderService } from './api/pdfBuilderService';

// Types
export * from '../../types/pdfBuilder';
