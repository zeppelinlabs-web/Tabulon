import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Table2, Code2 } from 'lucide-react';

interface PreviewPanelProps {
  content: string;
  format: 'csv' | 'json' | 'xml';
  previewMode?: 'table' | 'structured';
  onPreviewModeChange?: (mode: 'table' | 'structured') => void;
}

export function PreviewPanel({ content, format, previewMode, onPreviewModeChange }: PreviewPanelProps) {
  const [localMode, setLocalMode] = useState<'table' | 'structured'>('table');
  const currentMode = previewMode ?? localMode;
  
  const handleModeChange = (mode: 'table' | 'structured') => {
    if (onPreviewModeChange) {
      onPreviewModeChange(mode);
    } else {
      setLocalMode(mode);
    }
  };

  const showToggle = format === 'json' || format === 'xml';

  const renderedContent = useMemo(() => {
    if (format === 'csv') {
      return <CsvPreview content={content} />;
    }
    if (format === 'json') {
      return currentMode === 'table' ? <JsonTablePreview content={content} /> : <JsonPreview content={content} />;
    }
    if (format === 'xml') {
      return currentMode === 'table' ? <XmlTablePreview content={content} /> : <XmlPreview content={content} />;
    }
    return null;
  }, [content, format, currentMode]);

  return (
    <div className="space-y-4">
      {showToggle && (
        <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
          <span className="text-sm font-medium text-foreground">Preview Mode</span>
          <div className="flex gap-2">
            <Button
              variant={currentMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModeChange('table')}
            >
              <Table2 className="w-4 h-4" />
              Table
            </Button>
            <Button
              variant={currentMode === 'structured' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModeChange('structured')}
            >
              <Code2 className="w-4 h-4" />
              Structured
            </Button>
          </div>
        </div>
      )}
      
      <div className="paper-surface p-8 min-h-[400px] animate-scale-in">
        <div className="max-w-none">
          {renderedContent}
        </div>
      </div>
    </div>
  );
}

function CsvPreview({ content }: { content: string }) {
  const rows = useMemo(() => {
    const lines = content.trim().split('\n');
    return lines.map(line => {
      // Simple CSV parsing (handles basic cases)
      const cells: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cells.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      cells.push(current.trim());
      return cells;
    });
  }, [content]);

  const headers = rows[0] || [];
  const dataRows = rows.slice(1);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-border">
            <th className="py-3 px-4 text-left font-mono text-xs text-muted-foreground w-12">#</th>
            {headers.map((header, i) => (
              <th key={i} className="py-3 px-4 text-left font-semibold text-foreground">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={cn(
                "border-b border-border/50 transition-colors hover:bg-muted/30",
                rowIndex % 2 === 1 && "bg-muted/20"
              )}
            >
              <td className="py-2.5 px-4 font-mono text-xs text-muted-foreground">
                {rowIndex + 1}
              </td>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="py-2.5 px-4 text-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function JsonPreview({ content }: { content: string }) {
  const formatted = useMemo(() => {
    try {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return content;
    }
  }, [content]);

  const highlighted = useMemo(() => {
    return formatted.split('\n').map((line, i) => {
      // Simple syntax highlighting
      const highlighted = line
        .replace(/"([^"]+)":/g, '<span class="text-primary font-medium">"$1"</span>:')
        .replace(/: "([^"]+)"/g, ': <span class="text-emerald-600">"$1"</span>')
        .replace(/: (\d+)/g, ': <span class="text-amber-600">$1</span>')
        .replace(/: (true|false)/g, ': <span class="text-blue-600">$1</span>')
        .replace(/: (null)/g, ': <span class="text-muted-foreground">$1</span>');
      
      return (
        <div key={i} className="flex">
          <span className="w-10 text-right pr-4 text-muted-foreground select-none text-xs">
            {i + 1}
          </span>
          <span dangerouslySetInnerHTML={{ __html: highlighted }} />
        </div>
      );
    });
  }, [formatted]);

  return (
    <pre className="font-mono text-sm leading-relaxed overflow-x-auto">
      {highlighted}
    </pre>
  );
}

function XmlPreview({ content }: { content: string }) {
  const formatted = useMemo(() => {
    // Simple XML formatting
    let formatted = content;
    let indent = 0;
    const lines: string[] = [];
    
    formatted = formatted.replace(/></g, '>\n<');
    formatted.split('\n').forEach(line => {
      line = line.trim();
      if (!line) return;
      
      if (line.startsWith('</')) {
        indent = Math.max(0, indent - 1);
      }
      
      lines.push('  '.repeat(indent) + line);
      
      if (!line.startsWith('<?') && !line.startsWith('</') && !line.endsWith('/>') && !line.includes('</')) {
        indent++;
      }
    });
    
    return lines.join('\n');
  }, [content]);

  const highlighted = useMemo(() => {
    return formatted.split('\n').map((line, i) => {
      const highlighted = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/&lt;(\/?[\w:-]+)/g, '&lt;<span class="text-primary font-medium">$1</span>')
        .replace(/(\w+)=/g, '<span class="text-amber-600">$1</span>=')
        .replace(/"([^"]+)"/g, '<span class="text-emerald-600">"$1"</span>');
      
      return (
        <div key={i} className="flex">
          <span className="w-10 text-right pr-4 text-muted-foreground select-none text-xs">
            {i + 1}
          </span>
          <span dangerouslySetInnerHTML={{ __html: highlighted }} />
        </div>
      );
    });
  }, [formatted]);

  return (
    <pre className="font-mono text-sm leading-relaxed overflow-x-auto">
      {highlighted}
    </pre>
  );
}

function JsonTablePreview({ content }: { content: string }) {
  const tableData = useMemo(() => {
    try {
      const parsed = JSON.parse(content);
      let items: Record<string, unknown>[] = [];

      if (Array.isArray(parsed)) {
        items = parsed.filter(item => typeof item === 'object' && item !== null) as Record<string, unknown>[];
      } else if (typeof parsed === 'object' && parsed !== null) {
        const values = Object.values(parsed as Record<string, unknown>);
        for (const val of values) {
          if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
            items = val as Record<string, unknown>[];
            break;
          }
        }
      }

      if (items.length === 0) {
        return null;
      }

      const headerSet = new Set<string>();
      items.forEach(item => {
        Object.keys(item).forEach(key => headerSet.add(key));
      });
      const headers = Array.from(headerSet);

      return { headers, items };
    } catch {
      return null;
    }
  }, [content]);

  if (!tableData) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Cannot display as table. Switch to structured view.</p>
      </div>
    );
  }

  const { headers, items } = tableData;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-border">
            <th className="py-3 px-4 text-left font-mono text-xs text-muted-foreground w-12">#</th>
            {headers.map((header, i) => (
              <th key={i} className="py-3 px-4 text-left font-semibold text-foreground">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={cn(
                "border-b border-border/50 transition-colors hover:bg-muted/30",
                rowIndex % 2 === 1 && "bg-muted/20"
              )}
            >
              <td className="py-2.5 px-4 font-mono text-xs text-muted-foreground">
                {rowIndex + 1}
              </td>
              {headers.map((header, cellIndex) => {
                const value = item[header];
                const displayValue = value === null || value === undefined 
                  ? '' 
                  : typeof value === 'object' 
                  ? JSON.stringify(value) 
                  : String(value);
                return (
                  <td key={cellIndex} className="py-2.5 px-4 text-foreground">
                    {displayValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function XmlTablePreview({ content }: { content: string }) {
  const tableData = useMemo(() => {
    try {
      const elementRegex = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>/g;
      const matches = [...content.matchAll(elementRegex)];
      
      const groups: Record<string, { attributes: string; content: string }[]> = {};
      
      matches.forEach(match => {
        const tagName = match[1];
        const attributes = match[2];
        const content = match[3];
        
        if (!groups[tagName]) {
          groups[tagName] = [];
        }
        groups[tagName].push({ attributes, content });
      });

      let maxGroup = '';
      let maxCount = 0;
      
      Object.entries(groups).forEach(([name, items]) => {
        if (items.length > maxCount && items.length > 1) {
          maxCount = items.length;
          maxGroup = name;
        }
      });

      if (!maxGroup || !groups[maxGroup]) {
        return null;
      }

      const items: Record<string, string>[] = [];
      groups[maxGroup].forEach(item => {
        const obj: Record<string, string> = {};
        
        const attrRegex = /(\w+)="([^"]*)"/g;
        let attrMatch;
        while ((attrMatch = attrRegex.exec(item.attributes)) !== null) {
          obj[`@${attrMatch[1]}`] = attrMatch[2];
        }
        
        const childRegex = /<(\w+)([^>]*)>([^<]*)<\/\1>/g;
        let childMatch;
        while ((childMatch = childRegex.exec(item.content)) !== null) {
          obj[childMatch[1]] = childMatch[3].trim();
        }
        
        if (Object.keys(obj).length > 0) {
          items.push(obj);
        }
      });

      if (items.length === 0) {
        return null;
      }

      const headerSet = new Set<string>();
      items.forEach(item => {
        Object.keys(item).forEach(key => headerSet.add(key));
      });
      const headers = Array.from(headerSet);

      return { headers, items };
    } catch {
      return null;
    }
  }, [content]);

  if (!tableData) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Cannot display as table. Switch to structured view.</p>
      </div>
    );
  }

  const { headers, items } = tableData;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-border">
            <th className="py-3 px-4 text-left font-mono text-xs text-muted-foreground w-12">#</th>
            {headers.map((header, i) => (
              <th key={i} className="py-3 px-4 text-left font-semibold text-foreground">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={cn(
                "border-b border-border/50 transition-colors hover:bg-muted/30",
                rowIndex % 2 === 1 && "bg-muted/20"
              )}
            >
              <td className="py-2.5 px-4 font-mono text-xs text-muted-foreground">
                {rowIndex + 1}
              </td>
              {headers.map((header, cellIndex) => (
                <td key={cellIndex} className="py-2.5 px-4 text-foreground">
                  {item[header] || ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
