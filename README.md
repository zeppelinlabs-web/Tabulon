# Tabulon

Transform structured data into readable documents. Convert CSV, JSON, and XML files into clean, print-ready PDFs with proper formatting, typography, and hierarchy preservation.

## Overview

Tabulon is a web-based tool designed for data professionals who need to generate professional documentation from machine-readable formats without manual formatting work. It processes files locally in the browser and provides instant preview before export.

## Features

### Smart Data Processing
- **CSV Tables**: Auto-sized columns, text wrapping, and pagination-aware splitting
- **JSON Hierarchy**: Nested structures rendered with proper indentation and visual depth
- **XML Parsing**: Automatic detection of repeating elements and attribute handling

### Export Options
- **Page Formats**: A4 and Letter sizes
- **Orientations**: Portrait and landscape layouts
- **Font Sizes**: Small, medium, and large presets
- **Layout Modes**: 
  - Auto (intelligent format detection)
  - Table (tabular data representation)
  - Structured (code-like formatting with syntax highlighting)
- **Customization**: Toggle row numbers and metadata display

### User Experience
- **Instant Preview**: Real-time formatted document preview
- **Privacy Focused**: Files processed locally in browser
- **Sample Data**: Built-in examples for CSV, JSON, and XML
- **Drag & Drop**: Easy file upload interface
- **Print-First Design**: Typography optimized for both digital and physical output

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **PDF Generation**: jsPDF with jspdf-autotable
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Testing**: Vitest with Testing Library
- **Linting**: ESLint 9

## Getting Started

### Prerequisites

- Node.js 16+ and npm (or use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

```sh
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode
```

## Usage

1. **Upload a File**: Drag and drop or click to select a CSV, JSON, or XML file
2. **Try Samples**: Click one of the sample data buttons to see examples
3. **Configure Export**: Adjust page size, orientation, font size, and layout options
4. **Preview**: Review the formatted document in real-time
5. **Export**: Click "Export to PDF" to download your document

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── ExportOptions.tsx
│   ├── FeatureCard.tsx
│   ├── FormatBadge.tsx
│   ├── Header.tsx
│   ├── PreviewPanel.tsx
│   └── UploadZone.tsx
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── pdf-generator.ts  # PDF generation logic
│   └── utils.ts
├── pages/              # Route pages
│   ├── Index.tsx
│   └── NotFound.tsx
└── test/               # Test files
```

## Development

### Adding New Features

The project uses a component-based architecture. Key areas:

- **PDF Generation**: Modify `src/lib/pdf-generator.ts` for export logic
- **UI Components**: Add to `src/components/` following shadcn/ui patterns
- **Styling**: Use Tailwind utility classes with the configured theme

### Testing

```sh
# Run all tests
npm run test

# Watch mode for development
npm run test:watch
```

## Browser Support

Modern browsers with ES2020+ support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

This project is private and proprietary.

## Acknowledgments

Built with [Lovable](https://lovable.dev) - AI-powered web development platform
