/**
 * Document generation utilities for creating new PDFs from decoupled content
 */

import { jsPDF } from 'jspdf';
import { ProcessingResult, DocumentSelection, DocumentContent, TextUnit } from './types';

/**
 * Generate a new PDF document from selected content
 */
export function generateDocument(
  result: ProcessingResult,
  selection: DocumentSelection
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPosition = margin;
  const lineHeight = 7;
  const pageBreakHeight = pageHeight - margin - 20;

  // Add title
  if (selection.documentTitle) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(selection.documentTitle, maxWidth);
    doc.text(titleLines, margin, yPosition);
    yPosition += titleLines.length * lineHeight + 10;
  } else {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Generated Document', margin, yPosition);
    yPosition += lineHeight + 10;
  }

  // Determine what to include based on hide options
  const shouldIncludeShared = selection.includeShared && !selection.onlyShowUnique;
  const shouldIncludeUniqueA = selection.includeUniqueA && !selection.onlyShowShared;
  const shouldIncludeUniqueB = selection.includeUniqueB && !selection.onlyShowShared;

  // Skip metadata section - generate standard document without source info

  // Collect all content to include
  const content: DocumentContent[] = [];

  // Add shared content with filtering
  if (shouldIncludeShared) {
    result.matches
      .filter(m => {
        // Filter out if user override says unique
        if (m.userOverride === 'unique') return false;
        
        // Filter out if hiding user overrides and this has one
        if (selection.hideUserOverrides && m.userOverride) return false;
        
        // Filter out exact matches if hideExactMatches is true
        if (selection.hideExactMatches && m.matchType === 'exact') return false;
        
        // Filter out fuzzy matches if hideFuzzyMatches is true
        if (selection.hideFuzzyMatches && m.matchType === 'fuzzy') return false;
        
        // Filter out low confidence matches
        if (selection.hideLowConfidence && selection.confidenceThreshold !== undefined) {
          if (m.confidence < selection.confidenceThreshold) return false;
        }
        
        return true;
      })
      .forEach(match => {
        content.push({
          text: match.unitA.rawText,
          pageNumber: selection.includePageNumbers ? match.unitA.pageNumber : undefined,
          source: 'shared',
          originalPage: match.unitA.pageNumber,
        });
      });
  }

  // Add unique to A
  if (shouldIncludeUniqueA) {
    result.uniqueA.forEach(unit => {
      content.push({
        text: unit.rawText,
        pageNumber: selection.includePageNumbers ? unit.pageNumber : undefined,
        source: 'uniqueA',
        originalPage: unit.pageNumber,
      });
    });
  }

  // Add unique to B
  if (shouldIncludeUniqueB) {
    result.uniqueB.forEach(unit => {
      content.push({
        text: unit.rawText,
        pageNumber: selection.includePageNumbers ? unit.pageNumber : undefined,
        source: 'uniqueB',
        originalPage: unit.pageNumber,
      });
    });
  }

  // For master documents: Sort content intelligently
  // 1. Sort by original page number to maintain document flow
  // 2. When unique content exists, place it near shared content from the same page range
  content.sort((a, b) => {
    if (a.originalPage && b.originalPage) {
      // Primary sort: by page number
      if (a.originalPage !== b.originalPage) {
        return a.originalPage - b.originalPage;
      }
      // Secondary sort: shared content first, then unique A, then unique B
      // This ensures shared content appears first, with unique content following
      const sourceOrder = { 'shared': 0, 'uniqueA': 1, 'uniqueB': 2 };
      return (sourceOrder[a.source] || 3) - (sourceOrder[b.source] || 3);
    }
    // If no page numbers, maintain source order: shared, uniqueA, uniqueB
    const sourceOrder = { 'shared': 0, 'uniqueA': 1, 'uniqueB': 2 };
    return (sourceOrder[a.source] || 3) - (sourceOrder[b.source] || 3);
  });

  // Add content as standard master document (no annotations, natural flow)
  content.forEach((item, index) => {
    // Check if we need a new page
    if (yPosition > pageBreakHeight) {
      doc.addPage();
      yPosition = margin;
    }

    // Add text content directly - clean, standard format
    // Master document flows naturally with all content merged
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const textLines = doc.splitTextToSize(item.text, maxWidth);
    doc.text(textLines, margin, yPosition);
    yPosition += textLines.length * lineHeight + 5; // Natural paragraph spacing
  });

  // Skip footer - generate standard document without generation info

  // Generate filename
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = selection.documentTitle
    ? `${selection.documentTitle.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.pdf`
    : `decoupled_document_${timestamp}.pdf`;

  // Save the PDF
  doc.save(filename);
}

/**
 * Generate a text document instead of PDF
 */
export function generateTextDocument(
  result: ProcessingResult,
  selection: DocumentSelection
): void {
  let content = '';

  // Add title
  if (selection.documentTitle) {
    content += `${selection.documentTitle}\n`;
    content += '='.repeat(selection.documentTitle.length) + '\n\n';
  } else {
    content += 'Generated Document\n';
    content += '==================\n\n';
  }

  // Determine what to include based on hide options
  const shouldIncludeShared = selection.includeShared && !selection.onlyShowUnique;
  const shouldIncludeUniqueA = selection.includeUniqueA && !selection.onlyShowShared;
  const shouldIncludeUniqueB = selection.includeUniqueB && !selection.onlyShowShared;

  // Build master document content array for intelligent sorting
  const textContent: Array<{ text: string; originalPage?: number; source: 'shared' | 'uniqueA' | 'uniqueB' }> = [];
  
  // Add shared content with filtering
  if (shouldIncludeShared) {
    result.matches
      .filter(m => {
        if (m.userOverride === 'unique') return false;
        if (selection.hideUserOverrides && m.userOverride) return false;
        if (selection.hideExactMatches && m.matchType === 'exact') return false;
        if (selection.hideFuzzyMatches && m.matchType === 'fuzzy') return false;
        if (selection.hideLowConfidence && selection.confidenceThreshold !== undefined) {
          if (m.confidence < selection.confidenceThreshold) return false;
        }
        return true;
      })
      .forEach(match => {
        textContent.push({
          text: match.unitA.rawText,
          originalPage: match.unitA.pageNumber,
          source: 'shared',
        });
      });
  }

  // Add unique to A
  if (shouldIncludeUniqueA) {
    result.uniqueA.forEach(unit => {
      textContent.push({
        text: unit.rawText,
        originalPage: unit.pageNumber,
        source: 'uniqueA',
      });
    });
  }

  // Add unique to B
  if (shouldIncludeUniqueB) {
    result.uniqueB.forEach(unit => {
      textContent.push({
        text: unit.rawText,
        originalPage: unit.pageNumber,
        source: 'uniqueB',
      });
    });
  }

  // Sort for master document: by page number, then shared first
  textContent.sort((a, b) => {
    if (a.originalPage && b.originalPage) {
      if (a.originalPage !== b.originalPage) {
        return a.originalPage - b.originalPage;
      }
      const sourceOrder = { 'shared': 0, 'uniqueA': 1, 'uniqueB': 2 };
      return (sourceOrder[a.source] || 3) - (sourceOrder[b.source] || 3);
    }
    const sourceOrder = { 'shared': 0, 'uniqueA': 1, 'uniqueB': 2 };
    return (sourceOrder[a.source] || 3) - (sourceOrder[b.source] || 3);
  });

  // Build final content string
  textContent.forEach(item => {
    content += item.text + '\n\n';
  });

  // Download as text file
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = selection.documentTitle
    ? `${selection.documentTitle.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.txt`
    : `decoupled_document_${timestamp}.txt`;
  
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Get content statistics for preview (accounting for hide options)
 */
export function getContentStats(
  result: ProcessingResult,
  selection: DocumentSelection
): {
  totalLines: number;
  sharedLines: number;
  uniqueALines: number;
  uniqueBLines: number;
} {
  let sharedLines = 0;
  let uniqueALines = 0;
  let uniqueBLines = 0;

  const shouldIncludeShared = selection.includeShared && !selection.onlyShowUnique;
  const shouldIncludeUniqueA = selection.includeUniqueA && !selection.onlyShowShared;
  const shouldIncludeUniqueB = selection.includeUniqueB && !selection.onlyShowShared;

  if (shouldIncludeShared) {
    sharedLines = result.matches.filter(m => {
      if (m.userOverride === 'unique') return false;
      if (selection.hideUserOverrides && m.userOverride) return false;
      if (selection.hideExactMatches && m.matchType === 'exact') return false;
      if (selection.hideFuzzyMatches && m.matchType === 'fuzzy') return false;
      if (selection.hideLowConfidence && selection.confidenceThreshold !== undefined) {
        if (m.confidence < selection.confidenceThreshold) return false;
      }
      return true;
    }).length;
  }

  if (shouldIncludeUniqueA) {
    uniqueALines = result.uniqueA.length;
  }

  if (shouldIncludeUniqueB) {
    uniqueBLines = result.uniqueB.length;
  }

  return {
    totalLines: sharedLines + uniqueALines + uniqueBLines,
    sharedLines,
    uniqueALines,
    uniqueBLines,
  };
}

