// Image Upload Component for PDF Builder
// Handles image uploads to Supabase Storage with preview and validation

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { Badge } from '../../../components/ui/badge';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { toast } from 'sonner';
import { PdfBuilderService } from '../api/pdfBuilderService';
import { ImageUploadOptions, DEFAULT_IMAGE_UPLOAD_OPTIONS } from '../../../types/pdfBuilder';

interface ImageUploadProps {
  onImageUpload: (result: { url: string; public_url: string; path: string }) => void;
  onImageRemove?: () => void;
  currentImageUrl?: string;
  disabled?: boolean;
  className?: string;
  options?: ImageUploadOptions;
  showPreview?: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

export function ImageUpload({
  onImageUpload,
  onImageRemove,
  currentImageUrl,
  disabled = false,
  className,
  options = DEFAULT_IMAGE_UPLOAD_OPTIONS,
  showPreview = true,
  maxWidth = 400,
  maxHeight = 300
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > options.max_size!) {
      return `File size exceeds maximum allowed size of ${Math.round(options.max_size! / (1024 * 1024))}MB`;
    }

    // Check file type
    if (!options.allowed_types!.includes(file.type)) {
      return `File type ${file.type} is not allowed. Allowed types: ${options.allowed_types!.join(', ')}`;
    }

    return null;
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Create preview
      const previewUrl = await createPreview(file);
      setPreview(previewUrl);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      // Upload to Supabase
      const result = await PdfBuilderService.uploadImage(file, options);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      onImageUpload(result);
      toast.success('Image uploaded successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setError(errorMessage);
      toast.error(errorMessage);
      setPreview(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onImageUpload, options]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setError(null);
    onImageRemove?.();
  };

  const handleReset = () => {
    setPreview(null);
    setError(null);
    setZoom(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.1));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled && "cursor-not-allowed opacity-50",
          error && "border-destructive"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="p-6 text-center">
          {uploading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploading image...</p>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
              </div>
            </div>
          ) : preview ? (
            <div className="space-y-4">
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full max-h-48 rounded-lg shadow-sm"
                  style={{
                    transform: `scale(${zoom})`,
                    transition: 'transform 0.2s ease-in-out'
                  }}
                />
                {zoom !== 1 && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleZoomOut();
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <ZoomOut className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetZoom();
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleZoomIn();
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <ZoomIn className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, JPEG, SVG up to {Math.round(options.max_size! / (1024 * 1024))}MB
                </p>
              </div>
              <Button variant="outline" size="sm" disabled={disabled}>
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={options.allowed_types!.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Options */}
      {options.resize && (
        <div className="text-xs text-muted-foreground">
          <p>Images will be resized to {options.resize.width}x{options.resize.height}px</p>
          <p>Quality: {options.quality}%</p>
        </div>
      )}
    </div>
  );
}

// Simple image preview component
export function ImagePreview({
  src,
  alt = "Preview",
  className,
  maxWidth = 200,
  maxHeight = 200
}: {
  src: string;
  alt?: string;
  className?: string;
  maxWidth?: number;
  maxHeight?: number;
}) {
  return (
    <div className={cn("inline-block", className)}>
      <img
        src={src}
        alt={alt}
        className="rounded-lg shadow-sm border"
        style={{
          maxWidth: `${maxWidth}px`,
          maxHeight: `${maxHeight}px`,
          width: 'auto',
          height: 'auto'
        }}
      />
    </div>
  );
}

// Image upload with crop functionality (basic implementation)
export function ImageUploadWithCrop({
  onImageUpload,
  currentImageUrl,
  disabled = false,
  className
}: {
  onImageUpload: (result: { url: string; public_url: string; path: string }) => void;
  currentImageUrl?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [cropArea, setCropArea] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // This is a basic implementation
  // For production, consider using a library like react-image-crop
  return (
    <div className={cn("space-y-4", className)}>
      <ImageUpload
        onImageUpload={onImageUpload}
        currentImageUrl={currentImageUrl}
        disabled={disabled}
        showPreview={true}
      />
      
      {preview && (
        <div className="text-xs text-muted-foreground">
          <p>Note: Image cropping functionality can be enhanced with a dedicated crop library</p>
        </div>
      )}
    </div>
  );
}
