import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PreviewPanelProps {
  content: string;
  format: 'csv' | 'json' | 'xml';
}

export function PreviewPanel({ content, format }: PreviewPanelProps) {
  const renderedContent = useMemo(() => {
    if (format === 'csv') {
      return <CsvPreview content={content} />;
    }
    if (format === 'json') {
      return <JsonPreview content={content} />;
    }
    if (format === 'xml') {
      return <XmlPreview content={content} />;
    }
    return null;
  }, [content, format]);

  return (
    <div className="paper-surface p-8 min-h-[400px] animate-scale-in">
      <div className="max-w-none">
        {renderedContent}
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
