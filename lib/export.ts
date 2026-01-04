/**
 * Export functionality for results
 */

import { ProcessingResult, ExportData } from './types';

export function generateExportData(
  result: ProcessingResult,
  docAName: string,
  docBName: string
): ExportData {
  // Calculate statistics
  const exactMatches = result.matches.filter(m => m.matchType === 'exact').length;
  const fuzzyMatches = result.matches.filter(m => m.matchType === 'fuzzy').length;

  // Build canonical shared units
  const canonicalShared = result.matches
    .filter(m => m.userOverride !== 'unique')
    .map(match => ({
      text: match.unitA.rawText,
      occurrences: [
        {
          docId: 'A' as const,
          pageNumber: match.unitA.pageNumber,
          lineNumber: match.unitA.lineNumber,
        },
        {
          docId: 'B' as const,
          pageNumber: match.unitB.pageNumber,
          lineNumber: match.unitB.lineNumber,
        },
      ],
    }));

  // Build unique units by doc
  const uniqueByDoc = {
    A: result.uniqueA.map(unit => ({
      pageNumber: unit.pageNumber,
      lineNumber: unit.lineNumber,
      text: unit.rawText,
    })),
    B: result.uniqueB.map(unit => ({
      pageNumber: unit.pageNumber,
      lineNumber: unit.lineNumber,
      text: unit.rawText,
    })),
  };

  // Build all matches with metadata
  const allMatches = result.matches.map(match => ({
    matchId: match.id,
    confidence: match.confidence,
    matchType: match.matchType,
    userOverride: match.userOverride,
    textA: match.unitA.rawText,
    textB: match.unitB.rawText,
    locationA: {
      pageNumber: match.unitA.pageNumber,
      lineNumber: match.unitA.lineNumber,
    },
    locationB: {
      pageNumber: match.unitB.pageNumber,
      lineNumber: match.unitB.lineNumber,
    },
  }));

  return {
    metadata: {
      exportDate: new Date().toISOString(),
      docAName,
      docBName,
      totalMatches: result.matches.length,
      exactMatches,
      fuzzyMatches,
    },
    canonicalShared,
    uniqueByDoc,
    allMatches,
  };
}

export function downloadJson(data: ExportData, filename: string = 'doc-comparison.json') {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

