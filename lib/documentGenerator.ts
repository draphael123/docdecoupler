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

  // Add metadata section (unless hidden)
  if (selection.includeSourceInfo && !selection.hideSourceInfo) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Source Information', margin, yPosition);
    yPosition += lineHeight + 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const sections: string[] = [];
    if (shouldIncludeShared) sections.push('Shared Content');
    if (shouldIncludeUniqueA) sections.push('Unique to Document A');
    if (shouldIncludeUniqueB) sections.push('Unique to Document B');
    
    if (sections.length > 0) {
      doc.text(`Sections included: ${sections.join(', ')}`, margin, yPosition);
      yPosition += lineHeight + 10;
    }
  }

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

  // Sort content by original page number if available
  content.sort((a, b) => {
    if (a.originalPage && b.originalPage) {
      return a.originalPage - b.originalPage;
    }
    return 0;
  });

  // Add section headers and content
  let currentSource: 'shared' | 'uniqueA' | 'uniqueB' | null = null;

  content.forEach((item, index) => {
    // Check if we need a new page
    if (yPosition > pageBreakHeight) {
      doc.addPage();
      yPosition = margin;
    }

    // Add section header if source changed (unless hidden)
    if (item.source !== currentSource && !selection.hideSectionHeaders) {
      if (currentSource !== null) {
        yPosition += lineHeight; // Add spacing before new section
      }
      
      currentSource = item.source;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      
      let sectionTitle = '';
      switch (item.source) {
        case 'shared':
          sectionTitle = 'Shared Content';
          break;
        case 'uniqueA':
          sectionTitle = 'Unique to Document A';
          break;
        case 'uniqueB':
          sectionTitle = 'Unique to Document B';
          break;
      }
      
      doc.text(sectionTitle, margin, yPosition);
      yPosition += lineHeight + 5;
    } else if (item.source !== currentSource) {
      // Still track source change even if headers are hidden
      currentSource = item.source;
    }

    // Add page number if requested
    if (item.pageNumber && selection.includePageNumbers) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text(`[Page ${item.pageNumber}]`, margin, yPosition);
      yPosition += lineHeight;
    }

    // Add text content
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const textLines = doc.splitTextToSize(item.text, maxWidth);
    doc.text(textLines, margin, yPosition);
    yPosition += textLines.length * lineHeight + 3;
  });

  // Add footer with generation info (unless hidden)
  if (!selection.hideFooters) {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Generated by Doc Decoupler - Page ${i} of ${totalPages}`,
        margin,
        pageHeight - 10
      );
    }
  }

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

  // Add metadata (unless hidden)
  if (selection.includeSourceInfo && !selection.hideSourceInfo) {
    content += 'Source Information\n';
    content += '------------------\n';
    const sections: string[] = [];
    if (shouldIncludeShared) sections.push('Shared Content');
    if (shouldIncludeUniqueA) sections.push('Unique to Document A');
    if (shouldIncludeUniqueB) sections.push('Unique to Document B');
    if (sections.length > 0) {
      content += `Sections included: ${sections.join(', ')}\n`;
      content += `Generated: ${new Date().toISOString()}\n\n`;
    }
  }

  // Add shared content with filtering
  if (shouldIncludeShared) {
    if (!selection.hideSectionHeaders) {
      content += '\n=== Shared Content ===\n\n';
    }
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
        if (selection.includePageNumbers) {
          content += `[Page ${match.unitA.pageNumber}] `;
        }
        content += match.unitA.rawText + '\n\n';
      });
  }

  // Add unique to A
  if (shouldIncludeUniqueA) {
    if (!selection.hideSectionHeaders) {
      content += '\n=== Unique to Document A ===\n\n';
    }
    result.uniqueA.forEach(unit => {
      if (selection.includePageNumbers) {
        content += `[Page ${unit.pageNumber}] `;
      }
      content += unit.rawText + '\n\n';
    });
  }

  // Add unique to B
  if (shouldIncludeUniqueB) {
    if (!selection.hideSectionHeaders) {
      content += '\n=== Unique to Document B ===\n\n';
    }
    result.uniqueB.forEach(unit => {
      if (selection.includePageNumbers) {
        content += `[Page ${unit.pageNumber}] `;
      }
      content += unit.rawText + '\n\n';
    });
  }

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

