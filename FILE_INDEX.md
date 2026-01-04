# Doc Decoupler - File Index

## 📁 Complete File Structure

### Root Directory
```
Decouple Project/
├── 📄 .eslintrc.json          # ESLint configuration
├── 📄 next-env.d.ts           # Next.js TypeScript declarations
├── 📄 next.config.js          # Next.js configuration
├── 📄 package.json            # Dependencies and scripts
├── 📄 postcss.config.js       # PostCSS configuration
├── 📄 tailwind.config.js      # Tailwind CSS configuration
├── 📄 tsconfig.json           # TypeScript configuration
├── 📄 README.md               # Main project documentation
├── 📄 QUICKSTART.md           # Quick start guide
├── 📄 USAGE_GUIDE.md          # Detailed user guide
├── 📄 DEPLOYMENT.md           # Deployment and technical guide
├── 📄 PROJECT_SUMMARY.md      # Comprehensive project summary
├── 📄 FILE_INDEX.md           # This file
└── 📄 INSTRUCTIONS.md         # Original project instructions
```

### `/app` - Next.js App Router
```
app/
├── 📄 layout.tsx              # Root layout component
├── 📄 page.tsx                # Main application page
└── 📄 globals.css             # Global CSS styles
```

**Purpose**: Next.js App Router pages and layouts

**Key Files**:
- `page.tsx` - Main app with state management, file upload flow
- `layout.tsx` - Root HTML structure and metadata
- `globals.css` - Base styles and scrollbar customization

### `/components` - React Components
```
components/
├── 📄 FileUpload.tsx          # PDF file upload component
├── 📄 ProgressBar.tsx         # Processing progress indicator
├── 📄 ResultsSummary.tsx      # Results statistics dashboard
└── 📄 CompareView.tsx         # Match comparison UI
```

**Purpose**: Reusable UI components

**Key Files**:
- `FileUpload.tsx` - Handles PDF selection and validation
- `ProgressBar.tsx` - Shows processing progress
- `ResultsSummary.tsx` - Displays match statistics and actions
- `CompareView.tsx` - Side-by-side match comparison with filters

### `/lib` - Core Logic
```
lib/
├── 📄 types.ts                # TypeScript type definitions
├── 📄 normalize.ts            # Text normalization utilities
├── 📄 extract.ts              # PDF text extraction
├── 📄 match.ts                # Matching algorithms
├── 📄 export.ts               # JSON export functionality
└── 📄 useWorker.ts            # Web Worker React hook
```

**Purpose**: Core business logic and utilities

**Key Files**:
- `types.ts` - All TypeScript interfaces (TextUnit, Match, etc.)
- `normalize.ts` - Text normalization and fingerprinting
- `extract.ts` - PDF.js integration for text extraction
- `match.ts` - Exact and fuzzy matching algorithms
- `export.ts` - JSON export data generation
- `useWorker.ts` - Web Worker management hook

### `/public` - Static Assets
```
public/
└── 📄 worker.js               # Web Worker for processing
```

**Purpose**: Static files served directly

**Key Files**:
- `worker.js` - Web Worker that runs PDF extraction and matching

---

## 📊 File Statistics

### By Type
- **TypeScript/TSX**: 11 files
- **JavaScript**: 3 files
- **CSS**: 1 file
- **JSON**: 2 files
- **Markdown**: 6 files
- **Total**: 23 files (excluding node_modules, .next)

### By Category
- **Source Code**: 12 files (app, components, lib)
- **Configuration**: 6 files (configs)
- **Documentation**: 6 files (markdown)
- **Static Assets**: 1 file (worker.js)

### Lines of Code (Approximate)
- **TypeScript/TSX**: ~1,800 lines
- **JavaScript**: ~300 lines
- **CSS**: ~50 lines
- **Total**: ~2,150 lines

---

## 🔍 File Descriptions

### Configuration Files

#### `package.json`
- Dependencies: next, react, pdfjs-dist
- Dev dependencies: TypeScript, ESLint, Tailwind
- Scripts: dev, build, start, lint

#### `tsconfig.json`
- TypeScript compiler options
- Path aliases (@/*)
- Strict mode enabled

#### `next.config.js`
- Webpack configuration for pdfjs-dist
- Canvas module aliasing fix

#### `tailwind.config.js`
- Content paths for Tailwind
- Theme extensions

#### `postcss.config.js`
- Tailwind and Autoprefixer plugins

#### `.eslintrc.json`
- Extends next/core-web-vitals

---

### Application Files

#### `app/page.tsx` (215 lines)
**Purpose**: Main application page with state management

**Key Features**:
- File upload handling
- Processing state management
- Progress tracking
- Results display
- Override management
- Export functionality

**State Variables**:
- `state`: App state (idle/processing/complete/error)
- `progress`: Processing progress (0-100)
- `result`: Processing results
- `overrides`: User manual overrides
- `fileNames`: Uploaded file names

#### `app/layout.tsx` (20 lines)
**Purpose**: Root layout and metadata

**Features**:
- HTML structure
- Metadata (title, description)
- Global CSS import

#### `app/globals.css` (47 lines)
**Purpose**: Global styles

**Features**:
- CSS reset
- Font definitions
- Scrollbar styling

---

### Component Files

#### `components/FileUpload.tsx` (204 lines)
**Purpose**: PDF file upload interface

**Features**:
- Two file inputs (Doc A and B)
- File validation
- Error messaging
- File info display
- Submit button

#### `components/ProgressBar.tsx` (62 lines)
**Purpose**: Processing progress indicator

**Features**:
- Progress percentage
- Status message
- Animated progress bar

#### `components/ResultsSummary.tsx` (204 lines)
**Purpose**: Results statistics dashboard

**Features**:
- Match statistics
- Shared/unique counts
- Export button
- Reset button
- Override count display

#### `components/CompareView.tsx` (346 lines)
**Purpose**: Match comparison UI

**Features**:
- Match list display
- Filter by type (all/exact/fuzzy)
- Sort by confidence/page
- Match cards with details
- Override buttons

---

### Library Files

#### `lib/types.ts` (90 lines)
**Purpose**: TypeScript type definitions

**Key Types**:
- `TextUnit`: Extracted text line
- `Match`: Match between two units
- `ProcessingResult`: Complete results
- `ExportData`: Export format
- `WorkerMessage/Response`: Worker communication

#### `lib/normalize.ts` (66 lines)
**Purpose**: Text normalization utilities

**Functions**:
- `normalizeText()`: Normalize text for comparison
- `createFingerprint()`: Generate hash for exact matching
- `tokenize()`: Split text into tokens
- `calculateSimilarity()`: Jaccard similarity
- `isMeaningfulLine()`: Filter short lines

#### `lib/extract.ts` (124 lines)
**Purpose**: PDF text extraction

**Functions**:
- `extractTextUnits()`: Main extraction function
- `extractLinesFromTextContent()`: Group text by lines
- `isPdfFile()`: Validate PDF files
- `formatFileSize()`: Format bytes for display

**Features**:
- PDF.js integration
- Progress callbacks
- Error handling for encrypted PDFs
- Line grouping by Y-coordinate

#### `lib/match.ts` (239 lines)
**Purpose**: Matching algorithms

**Functions**:
- `findMatches()`: Main matching pipeline
- `findExactMatches()`: Fingerprint-based matching
- `findFuzzyMatches()`: Token similarity matching
- `applyUserOverrides()`: Apply manual corrections

**Features**:
- Two-phase matching
- Progress callbacks
- Configurable fuzzy threshold
- Override support

#### `lib/export.ts` (96 lines)
**Purpose**: JSON export functionality

**Functions**:
- `generateExportData()`: Create export object
- `downloadJson()`: Trigger file download

**Features**:
- Comprehensive export format
- Metadata inclusion
- Canonical shared units
- Unique content by document
- All matches with details

#### `lib/useWorker.ts` (72 lines)
**Purpose**: Web Worker React hook

**Features**:
- Worker lifecycle management
- Message handling
- Progress callbacks
- Error handling
- Extract and match coordination

---

### Public Files

#### `public/worker.js` (302 lines)
**Purpose**: Web Worker for processing

**Functions**:
- `handleExtract()`: Extract text from PDFs
- `extractTextUnits()`: Process individual PDF
- `handleMatch()`: Run matching pipeline
- `findExactMatches()`: Exact matching in worker
- `findFuzzyMatches()`: Fuzzy matching in worker

**Features**:
- PDF.js integration via CDN
- Progress reporting
- Duplicate utility functions
- Error handling

---

## 📚 Documentation Files

### `README.md`
Main project documentation with setup instructions

### `QUICKSTART.md`
30-second quick start guide

### `USAGE_GUIDE.md`
Detailed user guide with screenshots and examples

### `DEPLOYMENT.md`
Technical deployment guide and architecture details

### `PROJECT_SUMMARY.md`
Comprehensive project summary and achievements

### `FILE_INDEX.md`
This file - complete file structure documentation

---

## 🔗 File Dependencies

### Dependency Graph

```
app/page.tsx
├── components/FileUpload.tsx
│   └── lib/extract.ts
│       ├── lib/types.ts
│       └── lib/normalize.ts
├── components/ProgressBar.tsx
├── components/ResultsSummary.tsx
│   └── lib/export.ts
│       └── lib/types.ts
├── components/CompareView.tsx
│   └── lib/types.ts
├── lib/useWorker.ts
│   └── lib/types.ts
└── lib/match.ts
    ├── lib/types.ts
    └── lib/normalize.ts

public/worker.js
└── (self-contained, duplicates normalize logic)
```

---

## 🎯 Key Entry Points

1. **User Entry**: `app/page.tsx` - Main application
2. **Worker Entry**: `public/worker.js` - Processing worker
3. **Type Definitions**: `lib/types.ts` - All interfaces
4. **Core Logic**: `lib/match.ts` - Matching algorithms

---

## 📝 Notes

- All source files use TypeScript except worker.js
- Components use 'use client' directive for client-side rendering
- Worker duplicates utility functions (separate context)
- Configuration files are in root directory
- Documentation files are in root directory
- No test files included (add if needed)

---

## 🔄 Build Output (Not Tracked)

These directories are generated and not tracked:

```
.next/              # Next.js build output
node_modules/       # NPM dependencies
```

---

## ✅ File Checklist

All required files present:
- [x] Application code (12 files)
- [x] Configuration (6 files)
- [x] Documentation (6 files)
- [x] Worker (1 file)
- [x] Total: 23 files

---

**Last Updated**: January 2026

