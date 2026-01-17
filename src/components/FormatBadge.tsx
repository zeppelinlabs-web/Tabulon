import { FileText, FileJson, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';

type FileFormat = 'csv' | 'json' | 'xml';

interface FormatBadgeProps {
  format: FileFormat;
  className?: string;
}

const formatConfig = {
  csv: {
    icon: FileText,
    label: 'CSV',
    className: 'format-badge-csv',
  },
  json: {
    icon: FileJson,
    label: 'JSON',
    className: 'format-badge-json',
  },
  xml: {
    icon: FileCode,
    label: 'XML',
    className: 'format-badge-xml',
  },
};

export function FormatBadge({ format, className }: FormatBadgeProps) {
  const config = formatConfig[format];
  const Icon = config.icon;

  return (
    <span className={cn('format-badge', config.className, className)}>
      <Icon className="w-3.5 h-3.5 mr-1.5" />
      {config.label}
    </span>
  );
}

export function detectFormat(filename: string): FileFormat | null {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'csv') return 'csv';
  if (ext === 'json') return 'json';
  if (ext === 'xml') return 'xml';
  return null;
}
