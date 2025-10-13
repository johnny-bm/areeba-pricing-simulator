# PDF Builder System Documentation

## Overview

The PDF Builder System is a comprehensive solution for creating dynamic PDF templates and generating customized PDF documents for the areeba Pricing Simulator. It provides a complete admin interface for managing content sections, building templates, and generating versioned proposals.

## Features

### 🎯 Core Functionality
- **Content Section Management**: Create and manage reusable content blocks
- **Template Builder**: Drag-and-drop interface for building PDF templates
- **Version Control**: Track and manage template versions
- **Dynamic PDF Generation**: Generate PDFs with dynamic content and variables
- **Image Upload**: Supabase storage integration for image management
- **Rich Text Editor**: Full-featured text editing capabilities
- **Role-based Access Control**: Owner, Admin, and Member permissions

### 📋 Content Section Types
- **Title**: Headings with configurable levels (H1-H6)
- **Description**: Rich text content with formatting
- **Image**: Uploaded images with captions and alt text
- **Table**: Dynamic tables with headers and rows
- **Bullet List**: Hierarchical bullet point lists
- **Callout**: Highlighted content boxes with different styles

### 🔧 Template Features
- **Dynamic Variables**: Support for `{{client_name}}`, `{{project_name}}`, `{{pricing_data}}`, `{{simulator_type}}`
- **Section Ordering**: Drag-and-drop reordering of template sections
- **Version History**: Track changes and manage template versions
- **Active Templates**: One active template per simulator type
- **Template Duplication**: Create new versions from existing templates

## Database Schema

### Tables Created
1. **content_sections** - Reusable content blocks
2. **pdf_templates** - Template definitions
3. **template_sections** - Template-section relationships
4. **generated_pdfs** - PDF generation history

### Key Features
- **Row Level Security (RLS)**: Secure access control
- **Automatic Versioning**: Auto-increment version numbers
- **Single Active Template**: Ensures only one active template per simulator
- **Storage Integration**: Supabase storage for image uploads

## Installation & Setup

### 1. Database Setup
Run the SQL migration file to create the required tables:

```sql
-- Execute the schema file
\i create_pdf_builder_schema.sql
```

### 2. Storage Bucket Setup
The system automatically creates a Supabase storage bucket named `pdf-section-images` for image uploads.

### 3. Environment Variables
Ensure your Supabase configuration is properly set up in your environment variables.

## Usage

### Admin Interface Access
Navigate to `/admin/pdf-builder` to access the PDF Builder admin interface.

### Creating Content Sections

1. **Navigate to Sections Tab**
2. **Click "Create Section"**
3. **Fill in the form**:
   - Title: Section name
   - Type: Choose from available section types
   - Content: Use the rich text editor
   - Image: Upload if section type is "image"

### Building Templates

1. **Navigate to Templates Tab**
2. **Click "Create Template"**
3. **Configure template**:
   - Template name
   - Simulator type
   - Drag sections to build the template
4. **Save and activate**

### Generating PDFs

The system integrates with the existing PDF generation workflow:

1. **In the Pricing Simulator**, click "Generate PDF"
2. **Choose generation options**:
   - Use PDF Template (if available)
   - Include Preliminary Proposal
3. **Configure and generate**

## API Reference

### Content Sections API

```typescript
// Get sections with filters
const sections = await PdfBuilderService.getSections({
  section_type: 'title',
  search: 'search term',
  page: 1,
  limit: 50
});

// Create new section
const newSection = await PdfBuilderService.createSection({
  title: 'Section Title',
  section_type: 'title',
  content: { text: 'Content here' }
});
```

### Templates API

```typescript
// Get templates
const templates = await PdfBuilderService.getTemplates({
  simulator_type: 'payment-processing',
  is_active: true
});

// Create template
const template = await PdfBuilderService.createTemplate({
  template_name: 'My Template',
  simulator_type: 'payment-processing',
  section_ids: ['section1', 'section2']
});
```

### PDF Generation API

```typescript
// Generate PDF with template
const pdfData = {
  template_id: 'template-id',
  client_name: 'Client Name',
  project_name: 'Project Name',
  simulator_type: 'payment-processing',
  pricing_data: { /* pricing data */ }
};

const generatedPdf = await PdfBuilderService.createGeneratedPdf(pdfData);
```

## Components

### Core Components

- **PdfBuilderAdmin**: Main admin interface
- **SectionManager**: Content section management
- **TemplateBuilder**: Template creation and editing
- **VersionControl**: Template version management
- **GeneratedPdfsManager**: PDF history and management

### UI Components

- **RichTextEditor**: Full-featured text editor
- **ImageUpload**: Image upload with preview
- **DragDropComponents**: Drag-and-drop functionality
- **PdfGenerator**: PDF generation interface

### Integration Components

- **PdfBuilderIntegration**: Integration with existing system
- **EnhancedPdfButton**: Enhanced PDF generation button

## Hooks

### Data Management Hooks

```typescript
// Content sections
const { sections, loading, createSection, updateSection, deleteSection } = useContentSections();

// PDF templates
const { templates, createTemplate, updateTemplate, activateTemplate } = usePdfTemplates();

// Generated PDFs
const { pdfs, createGeneratedPdf, deleteGeneratedPdf } = useGeneratedPdfs();

// Template hierarchy
const { hierarchy } = useTemplateHierarchy(simulatorType);
```

### Utility Hooks

```typescript
// User permissions
const permissions = useUserPermissions(userRole);

// Available simulator types
const { simulatorTypes } = useAvailableSimulatorTypes();

// Active template
const { template } = useActiveTemplate(simulatorType);
```

## Permissions

### Role-based Access Control

| Permission | Owner | Admin | Member |
|------------|-------|-------|--------|
| View Sections | ✅ | ✅ | ✅ |
| Create Sections | ✅ | ✅ | ❌ |
| Edit Sections | ✅ | ✅ | ❌ |
| Delete Sections | ✅ | ✅ | ❌ |
| View Templates | ✅ | ✅ | ✅ |
| Create Templates | ✅ | ✅ | ❌ |
| Edit Templates | ✅ | ✅ | ❌ |
| Delete Templates | ✅ | ✅ | ❌ |
| Generate PDFs | ✅ | ✅ | ✅ |
| View Generated PDFs | ✅ | ✅ | ✅ |
| Delete Generated PDFs | ✅ | ✅ | ❌ |

## Dynamic Variables

### Supported Variables

- `{{client_name}}` - Client name from form
- `{{project_name}}` - Project name from form
- `{{simulator_type}}` - Current simulator type
- `{{pricing_data}}` - Complete pricing data object
- `{{generated_date}}` - PDF generation date
- `{{prepared_by}}` - User who prepared the proposal

### Usage in Content

```html
<h1>Proposal for {{client_name}}</h1>
<p>Project: {{project_name}}</p>
<p>Simulator: {{simulator_type}}</p>
<p>Generated: {{generated_date}}</p>
```

## Image Management

### Supported Formats
- PNG
- JPEG/JPG
- SVG

### Upload Limits
- Maximum file size: 5MB
- Automatic resizing to 1200x800px
- Quality: 90%

### Storage
- Images stored in Supabase storage bucket `pdf-section-images`
- Public URLs generated for easy access
- Automatic cleanup on section deletion

## Error Handling

### Common Errors

1. **Template Not Found**: No active template for simulator type
2. **Permission Denied**: User lacks required permissions
3. **Image Upload Failed**: File size or format issues
4. **PDF Generation Failed**: Template or data issues

### Error Recovery

- Automatic retry for transient errors
- User-friendly error messages
- Fallback to standard PDF generation
- Detailed logging for debugging

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Components load data on demand
2. **Caching**: Template and section data cached
3. **Pagination**: Large datasets paginated
4. **Image Optimization**: Automatic resizing and compression

### Monitoring

- Track template usage
- Monitor PDF generation performance
- Log errors and user actions
- Analytics for popular sections

## Security

### Data Protection

- Row Level Security (RLS) policies
- User authentication required
- Role-based access control
- Secure image uploads
- Input validation and sanitization

### Best Practices

- Regular security audits
- User permission reviews
- Secure file uploads
- Data encryption in transit and at rest

## Troubleshooting

### Common Issues

1. **PDF Generation Fails**
   - Check template configuration
   - Verify section content
   - Ensure all required variables are provided

2. **Image Upload Issues**
   - Check file size and format
   - Verify storage bucket permissions
   - Ensure network connectivity

3. **Permission Errors**
   - Verify user role
   - Check RLS policies
   - Ensure proper authentication

### Debug Mode

Enable debug logging by setting environment variable:
```bash
DEBUG_PDF_BUILDER=true
```

## Future Enhancements

### Planned Features

1. **Template Themes**: Pre-designed template themes
2. **Advanced Variables**: Custom variable definitions
3. **Template Sharing**: Share templates between users
4. **Bulk Operations**: Bulk section and template management
5. **Template Analytics**: Usage statistics and insights
6. **Advanced Image Editing**: Crop, resize, and filter tools
7. **Template Validation**: Automatic template validation
8. **Export/Import**: Template configuration export/import

### Integration Opportunities

1. **Email Integration**: Send PDFs via email
2. **Cloud Storage**: Additional storage providers
3. **Advanced Analytics**: Detailed usage analytics
4. **API Webhooks**: Real-time notifications
5. **Third-party Integrations**: CRM and other system integrations

## Support

### Documentation
- API documentation available in `/docs/API.md`
- Architecture details in `/docs/ARCHITECTURE.md`
- Component examples in `/src/features/pdfBuilder/components/`

### Getting Help
- Check the troubleshooting section
- Review error logs
- Contact development team for advanced issues

## License

This PDF Builder system is part of the areeba Pricing Simulator and follows the same licensing terms.
