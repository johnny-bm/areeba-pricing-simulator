// PDF Builder Admin Interface
// Main admin interface for managing PDF builder functionality

import React, { useState } from 'react';
import { PdfBuilderAdminProps, UserPermissions } from '../../../types/pdfBuilder';
import { useUserPermissions } from '../hooks/usePdfBuilder';
import { SectionsPage } from './SectionsPage';
import { TemplatesPage } from './TemplatesPage';
import { ArchivedTemplatesPage } from './ArchivedTemplatesPage';
import { VersionControl } from './VersionControl';
import { GeneratedPdfsManager } from './GeneratedPdfsManager';
import { PdfBuilderErrorBoundary } from './PdfBuilderErrorBoundary';
import { PdfBuilderSetup } from './PdfBuilderSetup';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Image, FileText, Settings, History } from 'lucide-react';

export function PdfBuilderAdmin({
  userRole,
  userId,
  onClose,
  section = 'sections'
}: PdfBuilderAdminProps & { section?: string }) {
  const permissions = useUserPermissions(userRole);


  const renderContent = () => {
    switch (section) {
      case 'sections':
        return <SectionsPage permissions={permissions} />;
      case 'templates':
        return <TemplatesPage permissions={permissions} />;
      case 'archived':
        return <ArchivedTemplatesPage />;
      case 'versions':
        return <VersionControl permissions={permissions} />;
      case 'generated':
        return <GeneratedPdfsManager permissions={permissions} />;
      default:
        return <SectionsPage permissions={permissions} />;
    }
  };

  return (
    <PdfBuilderErrorBoundary>
      <div className="space-y-6">
        {/* Content based on section */}
        {renderContent()}
      </div>
    </PdfBuilderErrorBoundary>
  );
}

// Quick stats component for dashboard
export function PdfBuilderStats({
  permissions
}: {
  permissions: UserPermissions;
}) {
  const [stats, setStats] = useState({
    sections: 0,
    templates: 0,
    generatedPdfs: 0,
    activeTemplates: 0
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Content Sections</CardTitle>
          <Image className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.sections}</div>
          <p className="text-xs text-muted-foreground">
            Reusable content blocks
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">PDF Templates</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.templates}</div>
          <p className="text-xs text-muted-foreground">
            Template configurations
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeTemplates}</div>
          <p className="text-xs text-muted-foreground">
            Currently active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Generated PDFs</CardTitle>
          <History className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.generatedPdfs}</div>
          <p className="text-xs text-muted-foreground">
            Total generated
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
