/**
 * Web Worker for PDF extraction and matching
 * Keeps the main thread responsive during heavy processing
 */

// Import PDF.js - Note: In worker context, we use importScripts
self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js');

// Set up PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Utility functions (duplicated from lib files since workers have separate context)

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function createFingerprint(normalizedText) {
  let hash = 0;
  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function isMeaningfulLine(text) {
  const normalized = normalizeText(text);
  return normalized.length >= 3;
}

function tokenize(text) {
  return text.split(/\s+/).filter(token => token.length > 0);
}

function calculateSimilarity(tokensA, tokensB) {
  if (tokensA.length === 0 && tokensB.length === 0) return 1;
  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  return intersection.size / union.size;
}

// Message handler
self.addEventListener('message', async (event) => {
  const { type, payload } = event.data;
  
  try {
    if (type === 'extract') {
      await handleExtract(payload);
    } else if (type === 'match') {
      await handleMatch(payload);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message,
    });
  }
});

async function handleExtract({ fileA, fileB }) {
  // Extract both files
  const unitsA = await extractTextUnits(fileA, 'A');
  const unitsB = await extractTextUnits(fileB, 'B');
  
  self.postMessage({
    type: 'extract-complete',
    data: { unitsA, unitsB },
  });
}

async function extractTextUnits(file, docId) {
  const units = [];
  
  self.postMessage({
    type: 'progress',
    progress: 0,
    message: `Loading ${docId}...`,
  });
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    const lines = extractLinesFromTextContent(textContent);
    
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
    
    const progress = (pageNum / numPages) * 50;
    self.postMessage({
      type: 'progress',
      progress,
      message: `Processing ${docId}: page ${pageNum}/${numPages}`,
    });
  }
  
  return units;
}

function extractLinesFromTextContent(textContent) {
  const lines = new Map();
  
  textContent.items.forEach((item) => {
    if (item.str && item.str.trim()) {
      const y = Math.round(item.transform[5] / 2) * 2;
      
      if (!lines.has(y)) {
        lines.set(y, []);
      }
      lines.get(y).push(item.str);
    }
  });
  
  const sortedYs = Array.from(lines.keys()).sort((a, b) => b - a);
  return sortedYs.map(y => lines.get(y).join(' ').trim());
}

async function handleMatch({ unitsA, unitsB, fuzzyThreshold = 0.65 }) {
  self.postMessage({
    type: 'progress',
    progress: 60,
    message: 'Finding exact matches...',
  });
  
  const { matches: exactMatches, unmatchedA, unmatchedB } = findExactMatches(unitsA, unitsB);
  
  self.postMessage({
    type: 'progress',
    progress: 70,
    message: 'Finding fuzzy matches...',
  });
  
  const fuzzyMatches = findFuzzyMatches(unmatchedA, unmatchedB, fuzzyThreshold);
  
  self.postMessage({
    type: 'progress',
    progress: 90,
    message: 'Organizing results...',
  });
  
  const allMatches = [...exactMatches, ...fuzzyMatches];
  
  const matchedAIds = new Set(allMatches.map(m => m.unitA.id));
  const matchedBIds = new Set(allMatches.map(m => m.unitB.id));
  
  const sharedUnits = [];
  const uniqueA = [];
  const uniqueB = [];
  
  unitsA.forEach(unit => {
    if (matchedAIds.has(unit.id)) {
      sharedUnits.push(unit);
    } else {
      uniqueA.push(unit);
    }
  });
  
  unitsB.forEach(unit => {
    if (matchedBIds.has(unit.id)) {
      sharedUnits.push(unit);
    } else {
      uniqueB.push(unit);
    }
  });
  
  self.postMessage({
    type: 'match-complete',
    data: {
      unitsA,
      unitsB,
      matches: allMatches,
      sharedUnits,
      uniqueA,
      uniqueB,
    },
  });
}

function findExactMatches(unitsA, unitsB) {
  const matches = [];
  const matchedAIds = new Set();
  const matchedBIds = new Set();
  
  const fingerprintMap = new Map();
  unitsB.forEach(unit => {
    if (!fingerprintMap.has(unit.fingerprint)) {
      fingerprintMap.set(unit.fingerprint, []);
    }
    fingerprintMap.get(unit.fingerprint).push(unit);
  });
  
  unitsA.forEach(unitA => {
    const matchingUnitsB = fingerprintMap.get(unitA.fingerprint);
    if (matchingUnitsB && matchingUnitsB.length > 0) {
      const unitB = matchingUnitsB.find(u => !matchedBIds.has(u.id));
      if (unitB) {
        matches.push({
          id: `match-${unitA.id}-${unitB.id}`,
          unitA,
          unitB,
          confidence: 1.0,
          matchType: 'exact',
        });
        matchedAIds.add(unitA.id);
        matchedBIds.add(unitB.id);
      }
    }
  });
  
  const unmatchedA = unitsA.filter(u => !matchedAIds.has(u.id));
  const unmatchedB = unitsB.filter(u => !matchedBIds.has(u.id));
  
  return { matches, unmatchedA, unmatchedB };
}

function findFuzzyMatches(unitsA, unitsB, threshold) {
  const matches = [];
  const matchedBIds = new Set();
  
  const tokensA = unitsA.map(unit => ({
    unit,
    tokens: tokenize(unit.normalizedText),
  }));
  
  const tokensB = unitsB.map(unit => ({
    unit,
    tokens: tokenize(unit.normalizedText),
  }));
  
  tokensA.forEach((itemA, index) => {
    let bestMatch = null;
    
    tokensB.forEach(itemB => {
      if (matchedBIds.has(itemB.unit.id)) return;
      
      const similarity = calculateSimilarity(itemA.tokens, itemB.tokens);
      
      if (similarity >= threshold) {
        if (!bestMatch || similarity > bestMatch.similarity) {
          bestMatch = { unit: itemB.unit, similarity };
        }
      }
    });
    
    if (bestMatch) {
      matches.push({
        id: `match-${itemA.unit.id}-${bestMatch.unit.id}`,
        unitA: itemA.unit,
        unitB: bestMatch.unit,
        confidence: bestMatch.similarity,
        matchType: 'fuzzy',
      });
      matchedBIds.add(bestMatch.unit.id);
    }
    
    if (index % 10 === 0) {
      const progress = 70 + ((index / tokensA.length) * 20);
      self.postMessage({
        type: 'progress',
        progress,
        message: 'Finding fuzzy matches...',
      });
    }
  });
  
  return matches;
}

