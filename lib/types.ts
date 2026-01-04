// Core data structures for Doc Decoupler

export interface TextUnit {
  id: string;
  docId: 'A' | 'B';
  pageNumber: number;
  lineNumber: number;
  rawText: string;
  normalizedText: string;
  fingerprint: string;
}

export interface Match {
  id: string;
  unitA: TextUnit;
  unitB: TextUnit;
  confidence: number; // 0-1, where 1 is exact match
  matchType: 'exact' | 'fuzzy';
  userOverride?: 'shared' | 'unique'; // User can manually override classification
}

export interface ProcessingResult {
  unitsA: TextUnit[];
  unitsB: TextUnit[];
  matches: Match[];
  sharedUnits: TextUnit[]; // Units that have matches
  uniqueA: TextUnit[]; // Units only in Doc A
  uniqueB: TextUnit[]; // Units only in Doc B
}

export interface ExportData {
  metadata: {
    exportDate: string;
    docAName: string;
    docBName: string;
    totalMatches: number;
    exactMatches: number;
    fuzzyMatches: number;
  };
  canonicalShared: Array<{
    text: string;
    occurrences: Array<{
      docId: 'A' | 'B';
      pageNumber: number;
      lineNumber: number;
    }>;
  }>;
  uniqueByDoc: {
    A: Array<{
      pageNumber: number;
      lineNumber: number;
      text: string;
    }>;
    B: Array<{
      pageNumber: number;
      lineNumber: number;
      text: string;
    }>;
  };
  allMatches: Array<{
    matchId: string;
    confidence: number;
    matchType: 'exact' | 'fuzzy';
    userOverride?: 'shared' | 'unique';
    textA: string;
    textB: string;
    locationA: {
      pageNumber: number;
      lineNumber: number;
    };
    locationB: {
      pageNumber: number;
      lineNumber: number;
    };
  }>;
}

export interface WorkerMessage {
  type: 'extract' | 'match';
  payload: any;
}

export interface WorkerResponse {
  type: 'progress' | 'complete' | 'error';
  data?: any;
  error?: string;
  progress?: number;
}

export interface DocumentSelection {
  includeShared: boolean;
  includeUniqueA: boolean;
  includeUniqueB: boolean;
  includePageNumbers: boolean;
  includeSourceInfo: boolean;
  documentTitle?: string;
  // Hide/Remove options
  hideExactMatches?: boolean;        // Hide exact matches even if shared is included
  hideFuzzyMatches?: boolean;        // Hide fuzzy matches even if shared is included
  hideLowConfidence?: boolean;       // Hide matches below confidence threshold
  confidenceThreshold?: number;     // Minimum confidence (0-1)
  hideUserOverrides?: boolean;       // Hide matches with user overrides
  hideSectionHeaders?: boolean;      // Hide section headers (Shared, Unique A, etc.)
  hideFooters?: boolean;             // Hide page footers
  hideEmptySections?: boolean;         // Hide sections with no content
  onlyShowUnique?: boolean;          // Only show unique content (hide all shared)
  onlyShowShared?: boolean;          // Only show shared content (hide all unique)
  hideSourceInfo?: boolean;         // Hide source information section
}

export interface DocumentContent {
  text: string;
  pageNumber?: number;
  source: 'shared' | 'uniqueA' | 'uniqueB';
  originalPage?: number;
}

