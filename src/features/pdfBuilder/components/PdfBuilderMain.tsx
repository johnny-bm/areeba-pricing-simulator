// PDF Builder Main Component
// Simplified 2-page structure: Sections and Templates

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { FileText, Layout, Archive } from 'lucide-react';
import { UserPermissions } from '../../../types/pdfBuilder';
import { SectionsPage } from './SectionsPage';
import { TemplatesPage } from './TemplatesPage';
import { ArchivedTemplatesPage } from './ArchivedTemplatesPage';

interface PdfBuilderMainProps {
  permissions: UserPermissions;
}

export function PdfBuilderMain({ permissions }: PdfBuilderMainProps) {
  const [activeTab, setActiveTab] = useState('sections');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Archived
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-4">
          <SectionsPage permissions={permissions} />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <TemplatesPage permissions={permissions} />
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <ArchivedTemplatesPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
