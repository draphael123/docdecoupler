# Doc Decoupler

A Next.js web application for comparing two PDF documents and identifying shared vs. unique content.

## Features

- **PDF Upload**: Upload two PDF files (Doc A and Doc B) for comparison
- **Text Extraction**: Extracts text per page using pdfjs-dist, splits into line units
- **Smart Matching**: 
  - Exact matches using fingerprint hashing
  - Fuzzy matches using token-based similarity (Jaccard index)
- **Interactive Compare UI**: View all matches with confidence scores and page numbers
- **Manual Overrides**: Mark matches as shared or unique to refine results
- **Export Results**: Download comprehensive JSON file with all matches and provenance

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **pdfjs-dist** for PDF text extraction
- **Web Workers** for non-blocking processing
- **Tailwind CSS** for styling

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## How It Works

1. **Upload**: Select two PDF files to compare
2. **Extract**: The app extracts text from each page, normalizes it, and creates fingerprints
3. **Match**: 
   - First pass: Find exact matches using fingerprint hashing
   - Second pass: Find fuzzy matches using token similarity on remaining text
4. **Review**: Browse matches in the Compare UI, see confidence scores
5. **Override**: Manually adjust any incorrect matches
6. **Export**: Download a JSON file with:
   - Canonical shared units with occurrences
   - Unique content by document
   - All matches with metadata and confidence scores

## Project Structure

```
├── app/
│   ├── page.tsx          # Main application page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── FileUpload.tsx    # File upload UI
│   ├── ProgressBar.tsx   # Processing progress indicator
│   ├── ResultsSummary.tsx # Results statistics
│   └── CompareView.tsx   # Match comparison UI
├── lib/
│   ├── types.ts          # TypeScript type definitions
│   ├── normalize.ts      # Text normalization utilities
│   ├── extract.ts        # PDF extraction logic
│   ├── match.ts          # Matching pipeline
│   ├── export.ts         # Export functionality
│   └── useWorker.ts      # Web Worker hook
└── public/
    └── worker.js         # Web Worker for processing
```

## Key Features Explained

### Text Normalization
- Converts to lowercase
- Removes punctuation
- Collapses whitespace
- Creates fingerprint hash for exact matching

### Matching Pipeline
1. **Exact Matching**: Uses fingerprint hashing for 100% identical content
2. **Fuzzy Matching**: Uses Jaccard similarity on tokenized text (default threshold: 65%)

### Web Worker
All PDF extraction and matching runs in a Web Worker to keep the UI responsive during heavy processing.

### Export Format
The exported JSON includes:
- Metadata (dates, file names, match counts)
- Canonical shared units with all occurrences
- Unique content organized by document
- Complete match details with confidence scores and user overrides

## Error Handling

- Validates PDF file types
- Handles encrypted PDFs with clear error messages
- Handles empty PDFs gracefully
- Provides progress feedback during long operations

## Browser Support

Works in all modern browsers that support:
- Web Workers
- File API
- ES2017+

## License

MIT
