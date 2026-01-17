import { useCallback, useState } from 'react';
import { Upload, FileText, FileJson, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
}

export function UploadZone({ onFileSelect }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

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
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
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
    </div>
  );
}
