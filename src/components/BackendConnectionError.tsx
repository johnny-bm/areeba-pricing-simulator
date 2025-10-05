/**
 * BackendConnectionError - Component to display when backend is not available
 */
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { EXTERNAL_URLS } from '../config/api';

interface BackendConnectionErrorProps {
  onRetry?: () => void;
  projectId?: string;
}

export function BackendConnectionError({ onRetry, projectId }: BackendConnectionErrorProps) {
  // Get projectId from environment variables if not provided
  const envProjectId = import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0];
  const displayProjectId = projectId || envProjectId;
  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-4">
        <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg">Backend Connection Failed</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>
              The application cannot connect to the backend server. This usually means the Supabase Edge Function is not deployed or not responding.
            </p>
            
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-md text-sm">
              <p className="font-semibold mb-1">Common causes:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Backend Edge Function not deployed</li>
                <li>Supabase project is paused or inactive</li>
                <li>Network connectivity issues</li>
                <li>Invalid API keys or project configuration</li>
              </ul>
            </div>

            {displayProjectId && (
              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md text-sm border border-blue-200 dark:border-blue-800">
                <p className="font-semibold mb-1">🔧 How to fix:</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>
                    Open your Supabase dashboard for project: <code className="bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded">{displayProjectId}</code>
                  </li>
                  <li>Navigate to Edge Functions</li>
                  <li>Deploy the <code className="bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded">make-server-228aa219</code> function</li>
                  <li>Ensure the function is running and healthy</li>
                </ol>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {onRetry && (
                <Button onClick={onRetry} size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retry Connection
                </Button>
              )}
              {displayProjectId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => window.open(EXTERNAL_URLS.SUPABASE_DASHBOARD(displayProjectId), '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Supabase Dashboard
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>

        <div className="text-center text-sm text-muted-foreground">
          <p>Need help? Check the browser console for detailed error messages.</p>
        </div>
      </div>
    </div>
  );
}