/**
 * Export to multiple formats: Word, Excel, CSV, Markdown
 */

import { ProcessingResult } from './types';

export function exportToMarkdown(
  result: ProcessingResult,
  docAName: string,
  docBName: string
): string {
  let content = `# Document Comparison Report\n\n`;
  content += `**Generated:** ${new Date().toLocaleString()}\n\n`;
  content += `**Documents:**\n`;
  content += `- Document A: ${docAName}\n`;
  content += `- Document B: ${docBName}\n\n`;
  content += `## Summary\n\n`;
  content += `- **Total Matches:** ${result.matches.length}\n`;
  content += `- **Shared Units:** ${result.sharedUnits.length}\n`;
  content += `- **Unique to A:** ${result.uniqueA.length}\n`;
  content += `- **Unique to B:** ${result.uniqueB.length}\n\n`;

  content += `## Shared Content\n\n`;
  result.matches.forEach((match, idx) => {
    content += `### Match ${idx + 1} (${(match.confidence * 100).toFixed(1)}% confidence)\n\n`;
    content += `**Page A:** ${match.unitA.pageNumber} | **Page B:** ${match.unitB.pageNumber}\n\n`;
    content += `**Document A:**\n\`\`\`\n${match.unitA.rawText}\n\`\`\`\n\n`;
    content += `**Document B:**\n\`\`\`\n${match.unitB.rawText}\n\`\`\`\n\n`;
    content += `---\n\n`;
  });

  content += `## Unique to Document A\n\n`;
  result.uniqueA.forEach((unit, idx) => {
    content += `${idx + 1}. [Page ${unit.pageNumber}] ${unit.rawText}\n\n`;
  });

  content += `## Unique to Document B\n\n`;
  result.uniqueB.forEach((unit, idx) => {
    content += `${idx + 1}. [Page ${unit.pageNumber}] ${unit.rawText}\n\n`;
  });

  return content;
}

export function exportToCSV(
  result: ProcessingResult,
  docAName: string,
  docBName: string
): string {
  let csv = 'Match ID,Type,Confidence,Page A,Text A,Page B,Text B\n';
  
  result.matches.forEach((match) => {
    const textA = `"${match.unitA.rawText.replace(/"/g, '""')}"`;
    const textB = `"${match.unitB.rawText.replace(/"/g, '""')}"`;
    csv += `${match.id},${match.matchType},${match.confidence},${match.unitA.pageNumber},${textA},${match.unitB.pageNumber},${textB}\n`;
  });

  csv += '\n\nUnique to Document A\n';
  csv += 'Page,Text\n';
  result.uniqueA.forEach((unit) => {
    csv += `${unit.pageNumber},"${unit.rawText.replace(/"/g, '""')}"\n`;
  });

  csv += '\n\nUnique to Document B\n';
  csv += 'Page,Text\n';
  result.uniqueB.forEach((unit) => {
    csv += `${unit.pageNumber},"${unit.rawText.replace(/"/g, '""')}"\n`;
  });

  return csv;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

