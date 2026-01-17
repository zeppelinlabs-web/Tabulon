import { Download, FileText, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface ExportOptionsProps {
  options: {
    pageSize: 'a4' | 'letter';
    orientation: 'portrait' | 'landscape';
    fontSize: 'small' | 'medium' | 'large';
    showRowNumbers: boolean;
    showMetadata: boolean;
  };
  onChange: (options: ExportOptionsProps['options']) => void;
  onExport: () => void;
}

export function ExportOptions({ options, onChange, onExport }: ExportOptionsProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 pb-4 border-b border-border">
        <Settings2 className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">Export Options</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Page Size</Label>
          <Select
            value={options.pageSize}
            onValueChange={(value: 'a4' | 'letter') => 
              onChange({ ...options, pageSize: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
              <SelectItem value="letter">Letter (8.5 × 11 in)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Orientation</Label>
          <Select
            value={options.orientation}
            onValueChange={(value: 'portrait' | 'landscape') => 
              onChange({ ...options, orientation: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="portrait">Portrait</SelectItem>
              <SelectItem value="landscape">Landscape</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Font Size</Label>
          <Select
            value={options.fontSize}
            onValueChange={(value: 'small' | 'medium' | 'large') => 
              onChange({ ...options, fontSize: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small (9pt)</SelectItem>
              <SelectItem value="medium">Medium (11pt)</SelectItem>
              <SelectItem value="large">Large (13pt)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between py-2">
          <Label className="text-sm font-medium cursor-pointer">Row Numbers</Label>
          <Switch
            checked={options.showRowNumbers}
            onCheckedChange={(checked) => 
              onChange({ ...options, showRowNumbers: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <Label className="text-sm font-medium cursor-pointer">Show Metadata</Label>
          <Switch
            checked={options.showMetadata}
            onCheckedChange={(checked) => 
              onChange({ ...options, showMetadata: checked })
            }
          />
        </div>
      </div>

      <Button 
        onClick={onExport} 
        variant="hero" 
        size="lg" 
        className="w-full mt-6"
      >
        <Download className="w-5 h-5" />
        Export as PDF
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Your file will be processed securely and deleted after download
      </p>
    </div>
  );
}
