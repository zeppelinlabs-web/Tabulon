import { Download, Settings2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

export interface ExportOptionsType {
  pageSize: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
  fontSize: 'small' | 'medium' | 'large';
  layout: 'auto' | 'table' | 'structured';
  showRowNumbers: boolean;
  showMetadata: boolean;
  customTitle?: string;
  companyLogo?: string;
  headerText?: string;
  footerText?: string;
  watermark?: string;
}

interface ExportOptionsProps {
  options: ExportOptionsType;
  format: 'csv' | 'json' | 'xml';
  onChange: (options: ExportOptionsType) => void;
  onExport: () => void;
}

export function ExportOptions({ options, format, onChange, onExport }: ExportOptionsProps) {
  const showLayoutOption = format === 'json' || format === 'xml';
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for logo
        alert('Logo file size must be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({ ...options, companyLogo: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    onChange({ ...options, companyLogo: undefined });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 pb-4 border-b border-border">
        <Settings2 className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">Export Options</h3>
      </div>

      <div className="space-y-4">
        {showLayoutOption && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Layout</Label>
            <Select
              value={options.layout}
              onValueChange={(value: 'auto' | 'table' | 'structured') => 
                onChange({ ...options, layout: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (Best fit)</SelectItem>
                <SelectItem value="table">Table View</SelectItem>
                <SelectItem value="structured">Structured View</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {options.layout === 'table' 
                ? 'Flatten data into rows and columns'
                : options.layout === 'structured'
                ? 'Preserve hierarchy with indentation'
                : 'Automatically choose best layout'}
            </p>
          </div>
        )}

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

      {/* Advanced Customization */}
      <div className="border-t border-border pt-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full mb-4"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </Button>

        {showAdvanced && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Document Title</Label>
              <Input
                placeholder="e.g., Q4 Sales Report"
                value={options.customTitle || ''}
                onChange={(e) => onChange({ ...options, customTitle: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Company Logo</Label>
              {options.companyLogo ? (
                <div className="relative">
                  <img 
                    src={options.companyLogo} 
                    alt="Company Logo" 
                    className="h-16 w-auto border border-border rounded p-2"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2"
                    onClick={removeLogo}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleLogoUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG or JPG, max 1MB
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Header Text</Label>
              <Input
                placeholder="e.g., Confidential"
                value={options.headerText || ''}
                onChange={(e) => onChange({ ...options, headerText: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Footer Text</Label>
              <Input
                placeholder="e.g., © 2024 Company Name"
                value={options.footerText || ''}
                onChange={(e) => onChange({ ...options, footerText: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Watermark</Label>
              <Input
                placeholder="e.g., DRAFT"
                value={options.watermark || ''}
                onChange={(e) => onChange({ ...options, watermark: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Diagonal text across each page
              </p>
            </div>
          </div>
        )}
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
