// Sections Page Component
// Manages content sections with rich text editor

import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { TableCell } from '../../../components/ui/table';
import { DataTable } from '../../../components/DataTable';
import { AdminPageLayout, AdminPageActions } from '../../../components/AdminPageLayout';
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
  Plus, 
  Pencil, 
  Trash2, 
  FileText,
  Layout
} from 'lucide-react';
import { 
  ContentSection, 
  UserPermissions,
  CreateSectionForm,
  UpdateSectionForm
} from '../../../types/pdfBuilder';
import { useContentSections } from '../hooks/usePdfBuilder';
import { SimpleTiptapEditor } from './SimpleTiptapEditor';
import { toast } from 'sonner';

// Utility function to strip HTML tags
const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

interface SectionsPageProps {
  permissions: UserPermissions;
}

export function SectionsPage({ permissions }: SectionsPageProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);

  // Fetch sections
  const { 
    sections, 
    loading, 
    error, 
    total,
    createSection,
    updateSection,
    deleteSection
  } = useContentSections();

  const handleCreateSection = async (sectionData: CreateSectionForm) => {
    try {
      await createSection(sectionData);
      setShowCreateDialog(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleUpdateSection = async (id: string, sectionData: UpdateSectionForm) => {
    try {
      await updateSection(id, sectionData);
      setEditingSection(null);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleDeleteSection = async (section: ContentSection) => {
    if (confirm(`Are you sure you want to delete "${section.title}"?`)) {
      try {
        await deleteSection(section.id);
      } catch (error) {
        // Error is handled by the hook
      }
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error: {error}</p>
        <p className="text-sm text-muted-foreground mt-2">
          This might be because the PDF Builder database tables haven't been created yet.
        </p>
      </div>
    );
  }

  return (
    <AdminPageLayout
      title="Content Sections"
      description="Create and manage reusable content sections for your PDF templates. Use the rich text editor to create titles, subtitles, bullet points, numbered lists, tables, and add images."
      actions={permissions.can_create_sections ? AdminPageActions.addNew(() => setShowCreateDialog(true), 'Create Section') : undefined}
      isLoading={loading}
    >
      <DataTable
        title="Content Sections"
        headers={['Section', 'Type', 'Created', 'Actions']}
        items={sections}
        getItemKey={(section) => section.id}
        renderRow={(section) => (
          <>
            <TableCell>
              <div className="flex items-center gap-2">
                <Layout className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{section.title}</p>
                  <p className="text-sm text-muted-foreground truncate max-w-xs">
                    {section.content.html 
                      ? stripHtml(section.content.html).substring(0, 100) + (stripHtml(section.content.html).length > 100 ? '...' : '')
                      : 'No content available'
                    }
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge 
                variant="outline"
                className="bg-blue-100 text-blue-800 hover:bg-blue-100"
              >
                Content Section
              </Badge>
            </TableCell>
            <TableCell>
              <p className="text-sm text-muted-foreground">
                {new Date(section.created_at).toLocaleDateString()}
              </p>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingSection(section)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSection(section)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </>
        )}
        searchPlaceholder="Search sections..."
        searchFields={['title']}
        filterOptions={[]}
        emptyStateTitle="No Content Sections"
        emptyStateDescription="Create your first content section to start building PDF templates. Use the rich text editor to create professional content with headings, lists, tables, and images."
        emptyStateIcon={<Layout className="h-12 w-12 text-muted-foreground" />}
        emptyStateAction={
          permissions.can_create_sections ? (
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Section
            </Button>
          ) : undefined
        }
      />

      {/* Create Section Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Section</DialogTitle>
            <DialogDescription>
              Create a new content section for your PDF templates. Use the rich text editor to format your content with headings, lists, tables, and images.
            </DialogDescription>
          </DialogHeader>
          <SectionForm
            onSubmit={handleCreateSection}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      {editingSection && (
        <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Section</DialogTitle>
              <DialogDescription>
                Update the content section details.
              </DialogDescription>
            </DialogHeader>
            <SectionForm
              section={editingSection}
              onSubmit={(data) => handleUpdateSection(editingSection.id, data)}
              onCancel={() => setEditingSection(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </AdminPageLayout>
  );
}

// Section Form Component
function SectionForm({
  section,
  onSubmit,
  onCancel
}: {
  section?: ContentSection;
  onSubmit: (data: CreateSectionForm) => void;
  onCancel: () => void;
}) {
  
  const [formData, setFormData] = useState<CreateSectionForm>({
    title: section?.title || '',
    section_type: 'description', // Default to description for all sections
    content: section?.content || { 
      text: '', 
      html: section?.content?.html || ''
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Section name is required');
      return;
    }

    if (!formData.content.html?.trim()) {
      toast.error('Content is required');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Section Name</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter section name (for admin reference only)"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            This name is only visible to admins and won't appear in the final document
          </p>
        </div>

        <div>
          <label className="text-sm font-medium">Content</label>
          <SimpleTiptapEditor
            value={formData.content.html || ''}
            onChange={(html) => setFormData(prev => ({ 
              ...prev, 
              content: { ...prev.content, html }
            }))}
            placeholder="Create your content here... Use headings, lists, images, tables, and more!"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use the toolbar to format text, add headings (H1-H6), create lists, insert images, and add tables
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {section ? 'Update Section' : 'Create Section'}
        </Button>
      </DialogFooter>
    </form>
  );
}
