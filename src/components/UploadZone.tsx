import { useCallback, useState } from 'react';
import { Upload, FileText, FileJson, FileCode, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['.csv', '.json', '.xml'];
const ALLOWED_MIME_TYPES = ['text/csv', 'application/json', 'text/xml', 'application/xml', 'text/plain'];

export function UploadZone({ onFileSelect }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds 5MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB. Please use a smaller file.`
      };
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        valid: false,
        error: `Invalid file format. Please upload a CSV, JSON, or XML file. Detected: ${extension}`
      };
    }

    // Check MIME type (if available)
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Expected CSV, JSON, or XML but got: ${file.type}`
      };
    }

    return { valid: true };
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error('File Validation Failed', {
          description: validation.error,
          icon: <AlertCircle className="w-4 h-4" />,
        });
        return;
      }
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error('File Validation Failed', {
          description: validation.error,
          icon: <AlertCircle className="w-4 h-4" />,
        });
        e.target.value = ''; // Reset input
        return;
      }
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "upload-zone p-12 text-center cursor-pointer animate-fade-in",
        isDragging && "upload-zone-active"
      )}
    >
      <input
        type="file"
        accept=".csv,.json,.xml"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        id="file-upload"
      />
      
      <div className="flex justify-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
          <FileText className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
          <FileJson className="w-6 h-6 text-amber-600" />
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
          <FileCode className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mb-2">
        <Upload className="w-5 h-5 text-muted-foreground" />
        <p className="text-lg font-medium text-foreground">
          Drop your file here
        </p>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        or click to browse
      </p>

      <div className="flex justify-center gap-2">
        <span className="format-badge format-badge-csv">CSV</span>
        <span className="format-badge format-badge-json">JSON</span>
        <span className="format-badge format-badge-xml">XML</span>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Maximum file size: 5MB
      </p>
    </div>
  );
}
