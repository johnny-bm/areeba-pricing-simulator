// PDF Builder Setup Component
// Checks if the PDF builder system is properly set up

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Database,
  Settings,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../../utils/supabase/client';

interface SetupStatus {
  tablesExist: boolean;
  storageBucketExists: boolean;
  permissionsSet: boolean;
  error?: string;
}

export function PdfBuilderSetup() {
  const [status, setStatus] = useState<SetupStatus>({
    tablesExist: false,
    storageBucketExists: false,
    permissionsSet: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      setLoading(true);
      
      // Check if tables exist
      const { data: tables, error: tablesError } = await supabase
        .from('content_sections')
        .select('id')
        .limit(1);

      const tablesExist = !tablesError;

      // Check if storage bucket exists - try multiple methods
      let storageBucketExists = false;
      let bucketError = null;

      try {
        // Method 1: Try to access the bucket directly (most reliable)
        const { data: files, error: filesError } = await supabase.storage
          .from('pdf-section-images')
          .list('', { limit: 1 });
        
        // If we can list files (even empty), bucket exists
        storageBucketExists = !filesError;
        if (filesError) {
          bucketError = filesError.message;
        }
      } catch (error) {
        // Method 2: Try to list buckets
        try {
          const { data: buckets, error: bucketsError } = await supabase.storage
            .listBuckets();
          
          if (!bucketsError && buckets) {
            storageBucketExists = buckets.some(bucket => bucket.name === 'pdf-section-images');
          } else {
            bucketError = bucketsError?.message;
          }
        } catch (listError) {
          bucketError = listError instanceof Error ? listError.message : 'Unknown bucket error';
        }
      }

      // Check permissions (basic check)
      const { data: { user } } = await supabase.auth.getUser();
      const permissionsSet = !!user;

      setStatus({
        tablesExist,
        storageBucketExists,
        permissionsSet,
        error: tablesError?.message || bucketError
      });


    } catch (error) {
      setStatus({
        tablesExist: false,
        storageBucketExists: false,
        permissionsSet: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const createStorageBucket = async () => {
    try {
      // Try to create the bucket using the SQL function
      const { data, error } = await supabase.rpc('create_storage_bucket', {
        bucket_name: 'pdf-section-images',
        is_public: true
      });

      if (error) {
        // // console.error('Failed to create bucket via RPC:', error);
        throw new Error(`Failed to create storage bucket: ${error.message}`);
      }

      if (data && !data.success) {
        throw new Error(data.message || 'Failed to create storage bucket');
      }

      // Recheck setup after creating bucket
      await checkSetup();
    } catch (error) {
      // // console.error('Error creating storage bucket:', error);
      throw error;
    }
  };

  const testStorageBucket = async () => {
    try {
      // Try to upload a test file to verify bucket access
      const testContent = new Blob(['test'], { type: 'text/plain' });
      const { data, error } = await supabase.storage
        .from('pdf-section-images')
        .upload('test.txt', testContent);

      if (error) {
        // // console.error('Storage bucket test failed:', error);
        return false;
      }

      // Clean up test file
      if (data?.path) {
        await supabase.storage
          .from('pdf-section-images')
          .remove([data.path]);
      }

      return true;
    } catch (error) {
      // // console.error('Storage bucket test error:', error);
      return false;
    }
  };

  const isSetupComplete = status.tablesExist && status.storageBucketExists && status.permissionsSet;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          PDF Builder Setup Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Database Tables */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="text-sm">Database Tables</span>
          </div>
          <Badge variant={status.tablesExist ? "default" : "destructive"}>
            {status.tablesExist ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <XCircle className="h-3 w-3 mr-1" />
            )}
            {status.tablesExist ? "Ready" : "Missing"}
          </Badge>
        </div>

        {/* Storage Bucket */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="text-sm">Storage Bucket</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={status.storageBucketExists ? "default" : "destructive"}>
              {status.storageBucketExists ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {status.storageBucketExists ? "Ready" : "Missing"}
            </Badge>
            {!status.storageBucketExists && (
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={createStorageBucket}
                  className="h-6 px-2 text-xs"
                >
                  Create
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={async () => {
                    const testResult = await testStorageBucket();
                    await checkSetup();
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Test
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Permissions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">User Permissions</span>
          </div>
          <Badge variant={status.permissionsSet ? "default" : "destructive"}>
            {status.permissionsSet ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <XCircle className="h-3 w-3 mr-1" />
            )}
            {status.permissionsSet ? "Ready" : "Missing"}
          </Badge>
        </div>

        {/* Error Message */}
        {status.error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Setup Error</span>
            </div>
            <p className="text-sm text-destructive mt-1">{status.error}</p>
            <div className="mt-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={checkSetup}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry Check
              </Button>
            </div>
          </div>
        )}

        {/* Setup Instructions */}
        {!isSetupComplete && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Setup Required</h4>
            <p className="text-sm text-muted-foreground mb-3">
              The PDF Builder system needs to be set up before it can be used.
            </p>
            <div className="space-y-2 text-sm">
              <p>1. Run the database migration:</p>
              <code className="block p-2 bg-muted rounded text-xs">
                \i create_pdf_builder_schema.sql
              </code>
              <p>2. Ensure Supabase storage is configured</p>
              <p>3. Verify user authentication is working</p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={checkSetup} variant="outline" size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Recheck Setup
              </Button>
              <Button 
                onClick={() => window.open('/docs/PDF_BUILDER.md', '_blank')} 
                variant="outline" 
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Documentation
              </Button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {isSetupComplete && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Setup Complete</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              PDF Builder is ready to use!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
