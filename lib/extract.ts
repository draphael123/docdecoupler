/**
 * PDF text extraction using pdfjs-dist
 */

import { TextUnit } from './types';
import { normalizeText, createFingerprint, isMeaningfulLine } from './normalize';

// Dynamic import for pdfjs-dist to avoid server-side issues
let pdfjsLib: any = null;

async function getPdfjsLib() {
  if (!pdfjsLib && typeof window !== 'undefined') {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
  return pdfjsLib;
}

export interface ExtractOptions {
  onProgress?: (progress: number, message: string) => void;
}

/**
 * Extract text units from a PDF file
 */
export async function extractTextUnits(
  file: File,
  docId: 'A' | 'B',
  options: ExtractOptions = {}
): Promise<TextUnit[]> {
  const { onProgress } = options;
  const units: TextUnit[] = [];

  try {
    // Get pdfjs-dist library
    const pdfjs = await getPdfjsLib();
    if (!pdfjs) {
      throw new Error('PDF.js library not available');
    }

    // Load the PDF
    onProgress?.(0, `Loading ${docId}...`);
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;

    onProgress?.(10, `Processing ${numPages} pages...`);

    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items into lines
      const lines = extractLinesFromTextContent(textContent);
      
      // Create text units for meaningful lines
      lines.forEach((line, lineIndex) => {
        if (isMeaningfulLine(line)) {
          const normalized = normalizeText(line);
          const fingerprint = createFingerprint(normalized);
          
          units.push({
            id: `${docId}-p${pageNum}-l${lineIndex}`,
            docId,
            pageNumber: pageNum,
            lineNumber: lineIndex,
            rawText: line,
            normalizedText: normalized,
            fingerprint,
          });
        }
      });

      // Report progress
      const progress = 10 + ((pageNum / numPages) * 80);
      onProgress?.(progress, `Processed page ${pageNum}/${numPages}`);
    }

    onProgress?.(100, `Completed extraction of ${units.length} lines`);
    return units;

  } catch (error: any) {
    if (error.name === 'PasswordException') {
      throw new Error('PDF is encrypted. Please provide an unencrypted version.');
    }
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

/**
 * Extract lines from PDF.js text content
 * Groups text items by their Y position to form lines
 */
function extractLinesFromTextContent(textContent: any): string[] {
  const lines: Map<number, string[]> = new Map();
  
  textContent.items.forEach((item: any) => {
    if (item.str && item.str.trim()) {
      // Use transform[5] as Y coordinate (rounded to group nearby items)
      const y = Math.round(item.transform[5] / 2) * 2;
      
      if (!lines.has(y)) {
        lines.set(y, []);
      }
      lines.get(y)!.push(item.str);
    }
  });

  // Sort by Y position (descending, as PDF coords are bottom-up)
  const sortedYs = Array.from(lines.keys()).sort((a, b) => b - a);
  
  // Join text items for each line
  return sortedYs.map(y => lines.get(y)!.join(' ').trim());
}

/**
 * Validate that a file is a PDF
 */
export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

