import { lazy, Suspense } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Loader2 } from 'lucide-react';

const AdminDashboard = lazy(() => import('./AdminDashboard'));

interface AdminDashboardLazyProps {
  onExportData?: () => void;
}

export function AdminDashboardLazy({ onExportData }: AdminDashboardLazyProps) {
  return (
    <Suspense
      fallback={
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading dashboard...</span>
            </div>
          </CardContent>
        </Card>
      }
    >
      <AdminDashboard onExportData={onExportData} />
    </Suspense>
  );
}
