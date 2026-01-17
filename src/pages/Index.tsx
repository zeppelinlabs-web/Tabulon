import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { UploadZone } from '@/components/UploadZone';
import { PreviewPanel } from '@/components/PreviewPanel';
import { ExportOptions, type ExportOptionsType } from '@/components/ExportOptions';
import { FormatBadge, detectFormat } from '@/components/FormatBadge';
import { FeatureCard } from '@/components/FeatureCard';
import { Button } from '@/components/ui/button';
import { 
  Table2, 
  Braces, 
  Code2, 
  Printer, 
  Zap, 
  Shield,
  X,
  FileText,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  generatePdfFromCsv, 
  generatePdfFromJson, 
  generatePdfFromXml 
} from '@/lib/pdf-generator';

// Sample data for demo
const sampleData = {
  csv: `Name,Role,Department,Location,Start Date
Sarah Chen,Engineering Lead,Product,San Francisco,2021-03-15
Marcus Johnson,Senior Designer,Design,New York,2020-08-22
Elena Rodriguez,Data Scientist,Analytics,Austin,2022-01-10
James Wilson,Product Manager,Product,Seattle,2019-11-05
Aisha Patel,DevOps Engineer,Infrastructure,Remote,2023-02-28`,
  json: `{
  "company": "Tabulon",
  "employees": [
    {
      "name": "Sarah Chen",
      "role": "Engineering Lead",
      "active": true,
      "projects": 12
    },
    {
      "name": "Marcus Johnson", 
      "role": "Senior Designer",
      "active": true,
      "projects": 8
    }
  ],
  "founded": 2024,
  "public": false
}`,
  xml: `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <product id="P001" status="active">
    <name>Premium Widget</name>
    <price currency="USD">29.99</price>
    <category>Electronics</category>
  </product>
  <product id="P002" status="active">
    <name>Standard Widget</name>
    <price currency="USD">19.99</price>
    <category>Electronics</category>
  </product>
</catalog>`
};

export default function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState<string>('');
  const [format, setFormat] = useState<'csv' | 'json' | 'xml' | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptionsType>({
    pageSize: 'a4',
    orientation: 'portrait',
    fontSize: 'medium',
    layout: 'auto',
    showRowNumbers: true,
    showMetadata: true,
  });

  const handleFileSelect = useCallback((selectedFile: File) => {
    const detectedFormat = detectFormat(selectedFile.name);
    
    if (!detectedFormat) {
      toast.error('Unsupported file format. Please use CSV, JSON, or XML.');
      return;
    }

    setFile(selectedFile);
    setFormat(detectedFormat);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setContent(text);
      toast.success(`${detectedFormat.toUpperCase()} file loaded successfully`);
    };
    reader.readAsText(selectedFile);
  }, []);

  const handleDemoClick = (demoFormat: 'csv' | 'json' | 'xml') => {
    setFile(null);
    setFormat(demoFormat);
    setContent(sampleData[demoFormat]);
    toast.success(`Sample ${demoFormat.toUpperCase()} loaded`);
  };

  const handleExport = useCallback(() => {
    if (!content || !format) return;

    const filename = file?.name 
      ? file.name.replace(/\.(csv|json|xml)$/i, '.pdf')
      : `${format}-export.pdf`;

    try {
      const options = {
        ...exportOptions,
        filename,
      };

      if (format === 'csv') {
        generatePdfFromCsv(content, options);
      } else if (format === 'json') {
        generatePdfFromJson(content, options);
      } else if (format === 'xml') {
        generatePdfFromXml(content, options);
      }

      toast.success('PDF exported successfully!', {
        description: `Saved as ${filename}`,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF', {
        description: 'Please check your file format and try again.',
      });
    }
  }, [content, format, file, exportOptions]);

  const handleClear = () => {
    setFile(null);
    setContent('');
    setFormat(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        {!content && (
          <section className="py-20 px-4">
            <div className="container mx-auto max-w-4xl text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight text-balance">
                Transform structured data into
                <span className="text-primary"> readable documents</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto text-balance">
                Convert CSV, JSON, and XML files into clean, print-ready PDFs with 
                proper formatting, typography, and hierarchy preservation.
              </p>

              <div className="max-w-xl mx-auto mb-12">
                <UploadZone onFileSelect={handleFileSelect} />
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <span className="text-sm text-muted-foreground py-2">Try a sample:</span>
                <Button variant="subtle" size="sm" onClick={() => handleDemoClick('csv')}>
                  <Table2 className="w-4 h-4" />
                  CSV Table
                </Button>
                <Button variant="subtle" size="sm" onClick={() => handleDemoClick('json')}>
                  <Braces className="w-4 h-4" />
                  JSON Data
                </Button>
                <Button variant="subtle" size="sm" onClick={() => handleDemoClick('xml')}>
                  <Code2 className="w-4 h-4" />
                  XML Schema
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Editor Section */}
        {content && format && (
          <section className="py-8 px-4">
            <div className="container mx-auto max-w-7xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <FormatBadge format={format} />
                  {file && (
                    <span className="text-sm text-muted-foreground font-mono">
                      {file.name}
                    </span>
                  )}
                  {!file && (
                    <span className="text-sm text-muted-foreground">
                      Sample data
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              </div>

              <div className="grid lg:grid-cols-[1fr,320px] gap-6">
                <div className="order-2 lg:order-1">
                  <PreviewPanel content={content} format={format} />
                </div>
                <aside className="order-1 lg:order-2">
                  <div className="lg:sticky lg:top-24 p-6 rounded-xl bg-card border border-border">
                    <ExportOptions
                      options={exportOptions}
                      format={format}
                      onChange={setExportOptions}
                      onExport={handleExport}
                    />
                  </div>
                </aside>
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        {!content && (
          <section id="features" className="py-20 px-4 bg-muted/30">
            <div className="container mx-auto max-w-5xl">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Built for data professionals
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Generate professional documentation from machine-readable formats 
                  without manual formatting work.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <FeatureCard
                  icon={<Table2 className="w-6 h-6 text-primary" />}
                  title="Smart Tables"
                  description="Auto-sized columns, text wrapping, and pagination-aware splitting for CSV data."
                />
                <FeatureCard
                  icon={<Braces className="w-6 h-6 text-primary" />}
                  title="Hierarchy Preservation"
                  description="Nested JSON and XML structures rendered with proper indentation and visual depth."
                />
                <FeatureCard
                  icon={<Printer className="w-6 h-6 text-primary" />}
                  title="Print-First Design"
                  description="Typography and spacing optimized for both digital viewing and physical printing."
                />
                <FeatureCard
                  icon={<Zap className="w-6 h-6 text-primary" />}
                  title="Instant Preview"
                  description="See your formatted document in real-time before exporting to PDF."
                />
                <FeatureCard
                  icon={<Shield className="w-6 h-6 text-primary" />}
                  title="Privacy Focused"
                  description="Files are processed locally when possible and deleted immediately after export."
                />
                <FeatureCard
                  icon={<FileText className="w-6 h-6 text-primary" />}
                  title="Multiple Formats"
                  description="Support for CSV, JSON, and XML with format-specific optimizations."
                />
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        {!content && (
          <section className="py-20 px-4">
            <div className="container mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Ready to transform your data?
              </h2>
              <p className="text-muted-foreground mb-8">
                Upload your first file and see the difference.
              </p>
              <Button variant="hero" size="xl" asChild>
                <a href="#top">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>Tabulon</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Transform structured data into documents people can actually read.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
