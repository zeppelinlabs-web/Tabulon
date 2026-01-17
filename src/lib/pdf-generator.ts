import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PdfOptions {
  pageSize: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
  fontSize: 'small' | 'medium' | 'large';
  layout: 'auto' | 'table' | 'structured';
  showRowNumbers: boolean;
  showMetadata: boolean;
  filename?: string;
  customTitle?: string;
  companyLogo?: string;
  headerText?: string;
  footerText?: string;
  watermark?: string;
}

const fontSizeMap = {
  small: { body: 8, header: 9, title: 14 },
  medium: { body: 10, header: 11, title: 16 },
  large: { body: 12, header: 13, title: 18 },
};

const primaryColor: [number, number, number] = [13, 148, 136]; // Teal

export function generatePdfFromCsv(content: string, options: PdfOptions): void {
  const { pageSize, orientation, fontSize, showRowNumbers, showMetadata, filename, customTitle, companyLogo, headerText, footerText, watermark } = options;
  const sizes = fontSizeMap[fontSize];
  
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize,
  });

  const rows = parseCsv(content);
  const headers = rows[0] || [];
  const dataRows = rows.slice(1);

  let currentY = 20;

  // Add company logo if provided
  if (companyLogo) {
    try {
      doc.addImage(companyLogo, 'PNG', 14, currentY, 30, 15);
      currentY += 20;
    } catch (e) {
      console.error('Failed to add logo:', e);
    }
  }

  // Add custom header text
  if (headerText) {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(headerText, pageWidth - 14, 10, { align: 'right' });
  }

  // Add title
  doc.setFontSize(sizes.title);
  doc.setTextColor(30, 41, 59);
  doc.text(customTitle || 'Data Export', 14, currentY);
  currentY += 8;

  // Add metadata
  if (showMetadata) {
    doc.setFontSize(sizes.body);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, currentY);
    currentY += 6;
    doc.text(`Rows: ${dataRows.length} | Columns: ${headers.length}`, 14, currentY);
    currentY += 8;
  }

  const startY = currentY;

  // Prepare table data
  const tableHeaders = showRowNumbers ? ['#', ...headers] : headers;
  const tableData = dataRows.map((row, index) => 
    showRowNumbers ? [String(index + 1), ...row] : row
  );

  // Generate table with autotable
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY,
    styles: {
      fontSize: sizes.body,
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: sizes.header,
      fontStyle: 'bold',
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: showRowNumbers ? {
      0: { cellWidth: 12, halign: 'center', textColor: [100, 116, 139] },
    } : {},
    didDrawPage: (data) => {
      addPageFooter(doc, data.pageNumber, undefined, footerText);
      if (watermark) {
        addWatermark(doc, watermark);
      }
    },
  });

  doc.save(filename || 'export.pdf');
}

export function generatePdfFromJson(content: string, options: PdfOptions): void {
  const { layout } = options;
  
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    // If parsing fails, use structured view
    generateStructuredJsonPdf(content, options);
    return;
  }

  // Determine best layout
  const useTable = layout === 'table' || (layout === 'auto' && canFlattenToTable(parsed));

  if (useTable) {
    generateTableJsonPdf(parsed, options);
  } else {
    generateStructuredJsonPdf(content, options);
  }
}

export function generatePdfFromXml(content: string, options: PdfOptions): void {
  const { layout } = options;
  
  // Parse XML and determine if it can be flattened
  const parsed = parseXmlToObjects(content);
  const useTable = layout === 'table' || (layout === 'auto' && parsed.length > 0);

  if (useTable && parsed.length > 0) {
    generateTableXmlPdf(parsed, options);
  } else {
    generateStructuredXmlPdf(content, options);
  }
}

// Helper: Check if JSON can be flattened to a table
function canFlattenToTable(data: unknown): boolean {
  // Array of objects is ideal for tables
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
    return true;
  }
  // Object with array property
  if (typeof data === 'object' && data !== null) {
    const values = Object.values(data as Record<string, unknown>);
    for (const val of values) {
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
        return true;
      }
    }
  }
  return false;
}

// Helper: Flatten JSON to table data
function flattenJsonToTable(data: unknown): { headers: string[]; rows: string[][] } {
  let items: Record<string, unknown>[] = [];

  if (Array.isArray(data)) {
    items = data.filter(item => typeof item === 'object' && item !== null) as Record<string, unknown>[];
  } else if (typeof data === 'object' && data !== null) {
    // Find the first array of objects
    const values = Object.values(data as Record<string, unknown>);
    for (const val of values) {
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
        items = val as Record<string, unknown>[];
        break;
      }
    }
  }

  if (items.length === 0) {
    return { headers: [], rows: [] };
  }

  // Extract all unique keys
  const headerSet = new Set<string>();
  items.forEach(item => {
    Object.keys(item).forEach(key => headerSet.add(key));
  });
  const headers = Array.from(headerSet);

  // Build rows
  const rows = items.map(item => 
    headers.map(header => {
      const value = item[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    })
  );

  return { headers, rows };
}

// Generate table-style PDF for JSON
function generateTableJsonPdf(data: unknown, options: PdfOptions): void {
  const { pageSize, orientation, fontSize, showRowNumbers, showMetadata, filename, customTitle, companyLogo, headerText, footerText, watermark } = options;
  const sizes = fontSizeMap[fontSize];
  
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize,
  });

  const { headers, rows } = flattenJsonToTable(data);

  let currentY = 20;

  // Add company logo if provided
  if (companyLogo) {
    try {
      doc.addImage(companyLogo, 'PNG', 14, currentY, 30, 15);
      currentY += 20;
    } catch (e) {
      console.error('Failed to add logo:', e);
    }
  }

  // Add custom header text
  if (headerText) {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(headerText, pageWidth - 14, 10, { align: 'right' });
  }

  // Add title
  doc.setFontSize(sizes.title);
  doc.setTextColor(30, 41, 59);
  doc.text(customTitle || 'JSON Data Export', 14, currentY);
  currentY += 8;

  // Add metadata
  if (showMetadata) {
    doc.setFontSize(sizes.body);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, currentY);
    currentY += 6;
    doc.text(`Rows: ${rows.length} | Columns: ${headers.length}`, 14, currentY);
    currentY += 8;
  }

  const startY = currentY;

  // Prepare table data
  const tableHeaders = showRowNumbers ? ['#', ...headers] : headers;
  const tableData = rows.map((row, index) => 
    showRowNumbers ? [String(index + 1), ...row] : row
  );

  // Generate table
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY,
    styles: {
      fontSize: sizes.body,
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [217, 119, 6], // Amber for JSON
      textColor: [255, 255, 255],
      fontSize: sizes.header,
      fontStyle: 'bold',
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [255, 251, 235],
    },
    columnStyles: showRowNumbers ? {
      0: { cellWidth: 12, halign: 'center', textColor: [100, 116, 139] },
    } : {},
    didDrawPage: (data) => {
      addPageFooter(doc, data.pageNumber, undefined, footerText);
      if (watermark) {
        addWatermark(doc, watermark);
      }
    },
  });

  doc.save(filename || 'json-export.pdf');
}

// Generate structured PDF for JSON
function generateStructuredJsonPdf(content: string, options: PdfOptions): void {
  const { pageSize, orientation, fontSize, showMetadata, filename, customTitle, companyLogo, headerText, footerText, watermark } = options;
  const sizes = fontSizeMap[fontSize];
  
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize,
  });

  let formatted: string;
  try {
    const parsed = JSON.parse(content);
    formatted = JSON.stringify(parsed, null, 2);
  } catch {
    formatted = content;
  }

  const lines = formatted.split('\n');

  let currentY = 20;

  // Add company logo if provided
  if (companyLogo) {
    try {
      doc.addImage(companyLogo, 'PNG', 14, currentY, 30, 15);
      currentY += 20;
    } catch (e) {
      console.error('Failed to add logo:', e);
    }
  }

  // Add custom header text
  if (headerText) {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(headerText, pageWidth - 14, 10, { align: 'right' });
  }

  // Add title
  doc.setFontSize(sizes.title);
  doc.setTextColor(30, 41, 59);
  doc.text(customTitle || 'JSON Document', 14, currentY);
  currentY += 8;

  // Add metadata
  if (showMetadata) {
    doc.setFontSize(sizes.body);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, currentY);
    currentY += 6;
    doc.text(`Lines: ${lines.length}`, 14, currentY);
    currentY += 10;
  } else {
    currentY += 4;
  }

  // Render JSON
  doc.setFont('courier', 'normal');
  doc.setFontSize(sizes.body);
  
  const pageHeight = doc.internal.pageSize.getHeight();
  const lineHeight = sizes.body * 0.5;
  const marginBottom = 20;

  lines.forEach((line, index) => {
    if (currentY > pageHeight - marginBottom) {
      doc.addPage();
      currentY = 20;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('JSON Document (continued)', 14, 12);
      doc.setFont('courier', 'normal');
      doc.setFontSize(sizes.body);
      currentY = 20;
    }

    // Line number
    doc.setTextColor(150, 150, 150);
    doc.text(String(index + 1).padStart(4, ' '), 14, currentY);

    // Syntax coloring
    if (line.includes('":')) {
      doc.setTextColor(13, 148, 136);
    } else if (line.includes('"') && !line.includes(':')) {
      doc.setTextColor(22, 163, 74);
    } else if (/:\s*\d/.test(line)) {
      doc.setTextColor(217, 119, 6);
    } else if (/:\s*(true|false)/.test(line)) {
      doc.setTextColor(37, 99, 235);
    } else {
      doc.setTextColor(30, 41, 59);
    }

    doc.text(line, 28, currentY);
    currentY += lineHeight;
  });

  // Add page numbers and watermark
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addPageFooter(doc, i, pageCount, footerText);
    if (watermark) {
      addWatermark(doc, watermark);
    }
  }

  doc.save(filename || 'json-export.pdf');
}

// Parse XML to array of objects
function parseXmlToObjects(xml: string): Record<string, string>[] {
  const results: Record<string, string>[] = [];
  
  // Find repeating elements (simple parsing)
  const elementRegex = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>/g;
  const matches = [...xml.matchAll(elementRegex)];
  
  // Group by element name to find repeating structures
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

  // Find the group with most items (likely the data rows)
  let maxGroup = '';
  let maxCount = 0;
  
  Object.entries(groups).forEach(([name, items]) => {
    if (items.length > maxCount && items.length > 1) {
      maxCount = items.length;
      maxGroup = name;
    }
  });

  if (maxGroup && groups[maxGroup]) {
    groups[maxGroup].forEach(item => {
      const obj: Record<string, string> = {};
      
      // Parse attributes
      const attrRegex = /(\w+)="([^"]*)"/g;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(item.attributes)) !== null) {
        obj[`@${attrMatch[1]}`] = attrMatch[2];
      }
      
      // Parse child elements
      const childRegex = /<(\w+)([^>]*)>([^<]*)<\/\1>/g;
      let childMatch;
      while ((childMatch = childRegex.exec(item.content)) !== null) {
        obj[childMatch[1]] = childMatch[3].trim();
      }
      
      if (Object.keys(obj).length > 0) {
        results.push(obj);
      }
    });
  }

  return results;
}

// Generate table-style PDF for XML
function generateTableXmlPdf(data: Record<string, string>[], options: PdfOptions): void {
  const { pageSize, orientation, fontSize, showRowNumbers, showMetadata, filename, customTitle, companyLogo, headerText, footerText, watermark } = options;
  const sizes = fontSizeMap[fontSize];
  
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize,
  });

  // Extract headers from all objects
  const headerSet = new Set<string>();
  data.forEach(item => {
    Object.keys(item).forEach(key => headerSet.add(key));
  });
  const headers = Array.from(headerSet);

  // Build rows
  const rows = data.map(item => 
    headers.map(header => item[header] || '')
  );

  let currentY = 20;

  // Add company logo if provided
  if (companyLogo) {
    try {
      doc.addImage(companyLogo, 'PNG', 14, currentY, 30, 15);
      currentY += 20;
    } catch (e) {
      console.error('Failed to add logo:', e);
    }
  }

  // Add custom header text
  if (headerText) {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(headerText, pageWidth - 14, 10, { align: 'right' });
  }

  // Add title
  doc.setFontSize(sizes.title);
  doc.setTextColor(30, 41, 59);
  doc.text(customTitle || 'XML Data Export', 14, currentY);
  currentY += 8;

  // Add metadata
  if (showMetadata) {
    doc.setFontSize(sizes.body);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, currentY);
    currentY += 6;
    doc.text(`Rows: ${rows.length} | Columns: ${headers.length}`, 14, currentY);
    currentY += 8;
  }

  const startY = currentY;

  // Prepare table data
  const tableHeaders = showRowNumbers ? ['#', ...headers] : headers;
  const tableData = rows.map((row, index) => 
    showRowNumbers ? [String(index + 1), ...row] : row
  );

  // Generate table
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY,
    styles: {
      fontSize: sizes.body,
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [37, 99, 235], // Blue for XML
      textColor: [255, 255, 255],
      fontSize: sizes.header,
      fontStyle: 'bold',
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [239, 246, 255],
    },
    columnStyles: showRowNumbers ? {
      0: { cellWidth: 12, halign: 'center', textColor: [100, 116, 139] },
    } : {},
    didDrawPage: (data) => {
      addPageFooter(doc, data.pageNumber, undefined, footerText);
      if (watermark) {
        addWatermark(doc, watermark);
      }
    },
  });

  doc.save(filename || 'xml-export.pdf');
}

// Generate structured PDF for XML
function generateStructuredXmlPdf(content: string, options: PdfOptions): void {
  const { pageSize, orientation, fontSize, showMetadata, filename, customTitle, companyLogo, headerText, footerText, watermark } = options;
  const sizes = fontSizeMap[fontSize];
  
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize,
  });

  const formatted = formatXml(content);
  const lines = formatted.split('\n');

  let currentY = 20;

  // Add company logo if provided
  if (companyLogo) {
    try {
      doc.addImage(companyLogo, 'PNG', 14, currentY, 30, 15);
      currentY += 20;
    } catch (e) {
      console.error('Failed to add logo:', e);
    }
  }

  // Add custom header text
  if (headerText) {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(headerText, pageWidth - 14, 10, { align: 'right' });
  }

  // Add title
  doc.setFontSize(sizes.title);
  doc.setTextColor(30, 41, 59);
  doc.text(customTitle || 'XML Document', 14, currentY);
  currentY += 8;

  // Add metadata
  if (showMetadata) {
    doc.setFontSize(sizes.body);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, currentY);
    currentY += 6;
    doc.text(`Lines: ${lines.length}`, 14, currentY);
    currentY += 10;
  } else {
    currentY += 4;
  }

  // Render XML
  doc.setFont('courier', 'normal');
  doc.setFontSize(sizes.body);
  
  const pageHeight = doc.internal.pageSize.getHeight();
  const lineHeight = sizes.body * 0.5;
  const marginBottom = 20;

  lines.forEach((line, index) => {
    if (currentY > pageHeight - marginBottom) {
      doc.addPage();
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('XML Document (continued)', 14, 12);
      doc.setFont('courier', 'normal');
      doc.setFontSize(sizes.body);
      currentY = 20;
    }

    // Line number
    doc.setTextColor(150, 150, 150);
    doc.text(String(index + 1).padStart(4, ' '), 14, currentY);

    // Syntax coloring
    if (line.includes('<?') || line.includes('?>')) {
      doc.setTextColor(100, 116, 139);
    } else if (line.includes('</') || line.match(/<\w/)) {
      doc.setTextColor(37, 99, 235);
    } else {
      doc.setTextColor(30, 41, 59);
    }

    const maxChars = orientation === 'landscape' ? 120 : 80;
    const displayLine = line.length > maxChars ? line.substring(0, maxChars) + '...' : line;
    
    doc.text(displayLine, 28, currentY);
    currentY += lineHeight;
  });

  // Add page numbers and watermark
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addPageFooter(doc, i, pageCount, footerText);
    if (watermark) {
      addWatermark(doc, watermark);
    }
  }

  doc.save(filename || 'xml-export.pdf');
}

// Helper: Add page footer
function addPageFooter(doc: jsPDF, pageNumber: number, totalPages?: number, customFooter?: string): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const total = totalPages || doc.getNumberOfPages();
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Page ${pageNumber} of ${total}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
  
  if (customFooter) {
    doc.text(customFooter, pageWidth - 14, pageHeight - 10, { align: 'right' });
  }
  
  doc.text('Generated by Tabulon', 14, pageHeight - 10);
}

// Helper: Add watermark
function addWatermark(doc: jsPDF, text: string): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.saveGraphicsState();
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(60);
  doc.setFont('helvetica', 'bold');
  
  // Rotate and center the watermark
  const angle = -45;
  const x = pageWidth / 2;
  const y = pageHeight / 2;
  
  doc.text(text, x, y, {
    align: 'center',
    angle: angle,
  });
  
  doc.restoreGraphicsState();
}

function parseCsv(content: string): string[][] {
  const lines = content.trim().split('\n');
  return lines.map(line => {
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
}

function formatXml(xml: string): string {
  let formatted = '';
  let indent = 0;
  
  xml = xml.replace(/></g, '>\n<');
  
  xml.split('\n').forEach(line => {
    line = line.trim();
    if (!line) return;
    
    if (line.startsWith('</')) {
      indent = Math.max(0, indent - 1);
    }
    
    formatted += '  '.repeat(indent) + line + '\n';
    
    if (!line.startsWith('<?') && !line.startsWith('</') && !line.endsWith('/>') && !line.includes('</')) {
      indent++;
    }
  });
  
  return formatted;
}
