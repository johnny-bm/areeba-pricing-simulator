/**
 * ConnectionDiagnostics - Component to help debug connection issues
 */
import { useState } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../utils/api';
// Get projectId and API key from environment variables
const projectId = import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0];
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function ConnectionDiagnostics() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostics = async () => {
    setIsChecking(true);
    const diagnosticResults: any = {
      timestamp: new Date().toISOString(),
      projectId: projectId,
      hasApiKey: !!publicAnonKey,
      checks: []
    };

    try {
      // Check 1: Basic connectivity
      diagnosticResults.checks.push({
        name: 'Basic Connectivity',
        status: 'checking',
        message: 'Testing network connection...'
      });

      // Check 2: Health endpoint
      try {
        const healthOk = await api.healthCheck();
        diagnosticResults.checks.push({
          name: 'Backend Health',
          status: healthOk ? 'success' : 'failed',
          message: healthOk ? 'Backend is responding' : 'Backend is not responding'
        });
      } catch (error) {
        diagnosticResults.checks.push({
          name: 'Backend Health',
          status: 'failed',
          message: `Error: ${(error as Error).message}`
        });
      }

      // Check 3: Ping endpoint
      try {
        const pingOk = await api.ping();
        diagnosticResults.checks.push({
          name: 'Ping Test',
          status: pingOk ? 'success' : 'failed',
          message: pingOk ? 'Ping successful' : 'Ping failed'
        });
      } catch (error) {
        diagnosticResults.checks.push({
          name: 'Ping Test',
          status: 'failed',
          message: `Error: ${(error as Error).message}`
        });
      }

      // Check 4: Try loading categories (lightweight)
      try {
        await api.loadCategories();
        diagnosticResults.checks.push({
          name: 'Data Loading',
          status: 'success',
          message: 'Successfully loaded data from backend'
        });
      } catch (error) {
        diagnosticResults.checks.push({
          name: 'Data Loading',
          status: 'failed',
          message: `Error: ${(error as Error).message}`
        });
      }

    } catch (error) {
      diagnosticResults.error = (error as Error).message;
    }

    setResults(diagnosticResults);
    setIsChecking(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'checking':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-card border rounded-lg shadow-lg max-w-md">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 flex items-center justify-between hover:bg-accent rounded-lg transition-colors"
        >
          <span className="text-sm font-medium">Connection Diagnostics</span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </button>

        {isExpanded && (
          <div className="p-4 border-t space-y-3">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>Project ID:</strong>{' '}
                <code className="bg-muted px-1 py-0.5 rounded">{projectId}</code>
              </p>
              <p>
                <strong>API Key:</strong>{' '}
                {publicAnonKey ? (
                  <span className="text-green-600">✓ Configured</span>
                ) : (
                  <span className="text-red-600">✗ Missing</span>
                )}
              </p>
            </div>

            <Button
              onClick={runDiagnostics}
              disabled={isChecking}
              size="sm"
              className="w-full"
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run Connection Tests'
              )}
            </Button>

            {results && (
              <div className="space-y-2 text-xs">
                <div className="text-muted-foreground">
                  <strong>Test Results:</strong> {new Date(results.timestamp).toLocaleTimeString()}
                </div>

                {results.checks.map((check: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 bg-muted rounded"
                  >
                    {getStatusIcon(check.status)}
                    <div className="flex-1">
                      <div className="font-medium">{check.name}</div>
                      <div className="text-muted-foreground">{check.message}</div>
                    </div>
                  </div>
                ))}

                {results.error && (
                  <Alert variant="destructive" className="text-xs">
                    <AlertDescription>{results.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}