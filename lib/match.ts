/**
 * Matching pipeline for finding shared and unique content
 */

import { TextUnit, Match, ProcessingResult } from './types';
import { tokenize, calculateSimilarity } from './normalize';

export interface MatchOptions {
  fuzzyThreshold?: number; // Minimum similarity for fuzzy matches (0-1)
  onProgress?: (progress: number, message: string) => void;
}

const DEFAULT_FUZZY_THRESHOLD = 0.65;

/**
 * Run the complete matching pipeline
 */
export function findMatches(
  unitsA: TextUnit[],
  unitsB: TextUnit[],
  options: MatchOptions = {}
): ProcessingResult {
  const { fuzzyThreshold = DEFAULT_FUZZY_THRESHOLD, onProgress } = options;
  
  onProgress?.(0, 'Starting match pipeline...');
  
  // Step 1: Find exact matches by fingerprint
  onProgress?.(10, 'Finding exact matches...');
  const { matches: exactMatches, unmatchedA, unmatchedB } = findExactMatches(unitsA, unitsB);
  
  // Step 2: Find fuzzy matches among remaining units
  onProgress?.(40, 'Finding fuzzy matches...');
  const fuzzyMatches = findFuzzyMatches(unmatchedA, unmatchedB, fuzzyThreshold, (progress) => {
    onProgress?.(40 + (progress * 0.5), 'Finding fuzzy matches...');
  });
  
  // Combine all matches
  const allMatches = [...exactMatches, ...fuzzyMatches];
  
  onProgress?.(90, 'Organizing results...');
  
  // Create sets of matched unit IDs
  const matchedAIds = new Set(allMatches.map(m => m.unitA.id));
  const matchedBIds = new Set(allMatches.map(m => m.unitB.id));
  
  // Determine shared and unique units
  const sharedUnits: TextUnit[] = [];
  const uniqueA: TextUnit[] = [];
  const uniqueB: TextUnit[] = [];
  
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
  
  onProgress?.(100, `Found ${allMatches.length} matches`);
  
  return {
    unitsA,
    unitsB,
    matches: allMatches,
    sharedUnits,
    uniqueA,
    uniqueB,
  };
}

/**
 * Find exact matches using fingerprint hashing
 */
function findExactMatches(
  unitsA: TextUnit[],
  unitsB: TextUnit[]
): { matches: Match[]; unmatchedA: TextUnit[]; unmatchedB: TextUnit[] } {
  const matches: Match[] = [];
  const matchedAIds = new Set<string>();
  const matchedBIds = new Set<string>();
  
  // Build fingerprint index for B
  const fingerprintMap = new Map<string, TextUnit[]>();
  unitsB.forEach(unit => {
    if (!fingerprintMap.has(unit.fingerprint)) {
      fingerprintMap.set(unit.fingerprint, []);
    }
    fingerprintMap.get(unit.fingerprint)!.push(unit);
  });
  
  // Find matches for A
  unitsA.forEach(unitA => {
    const matchingUnitsB = fingerprintMap.get(unitA.fingerprint);
    if (matchingUnitsB && matchingUnitsB.length > 0) {
      // Match with the first unmatched unit from B with this fingerprint
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

/**
 * Find fuzzy matches using token-based similarity
 */
function findFuzzyMatches(
  unitsA: TextUnit[],
  unitsB: TextUnit[],
  threshold: number,
  onProgress?: (progress: number) => void
): Match[] {
  const matches: Match[] = [];
  const matchedBIds = new Set<string>();
  
  // Precompute tokens for all units
  interface TokenizedUnit {
    unit: TextUnit;
    tokens: string[];
  }
  
  const tokensA: TokenizedUnit[] = unitsA.map(unit => ({
    unit,
    tokens: tokenize(unit.normalizedText),
  }));
  
  const tokensB: TokenizedUnit[] = unitsB.map(unit => ({
    unit,
    tokens: tokenize(unit.normalizedText),
  }));
  
  // For each unit in A, find best match in B
  for (let index = 0; index < tokensA.length; index++) {
    const itemA = tokensA[index];
    let bestMatch: { unit: TextUnit; similarity: number } | null = null;
    
    for (const itemB of tokensB) {
      if (matchedBIds.has(itemB.unit.id)) continue;
      
      const similarity = calculateSimilarity(itemA.tokens, itemB.tokens);
      
      if (similarity >= threshold) {
        if (!bestMatch || similarity > bestMatch.similarity) {
          bestMatch = { unit: itemB.unit, similarity };
        }
      }
    }
    
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
    
    // Report progress
    if (onProgress && index % 10 === 0) {
      onProgress(index / tokensA.length);
    }
  }
  
  return matches;
}

/**
 * Apply user overrides to matches
 */
export function applyUserOverrides(
  result: ProcessingResult,
  overrides: Map<string, 'shared' | 'unique'>
): ProcessingResult {
  // Update matches with user overrides
  const updatedMatches = result.matches.map(match => ({
    ...match,
    userOverride: overrides.get(match.id),
  }));
  
  // Recalculate shared and unique based on overrides
  const matchedAIds = new Set<string>();
  const matchedBIds = new Set<string>();
  
  updatedMatches.forEach(match => {
    // If user marked as unique, don't count as matched
    if (match.userOverride === 'unique') {
      return;
    }
    matchedAIds.add(match.unitA.id);
    matchedBIds.add(match.unitB.id);
  });
  
  const sharedUnits: TextUnit[] = [];
  const uniqueA: TextUnit[] = [];
  const uniqueB: TextUnit[] = [];
  
  result.unitsA.forEach(unit => {
    if (matchedAIds.has(unit.id)) {
      sharedUnits.push(unit);
    } else {
      uniqueA.push(unit);
    }
  });
  
  result.unitsB.forEach(unit => {
    if (matchedBIds.has(unit.id)) {
      sharedUnits.push(unit);
    } else {
      uniqueB.push(unit);
    }
  });
  
  return {
    ...result,
    matches: updatedMatches,
    sharedUnits,
    uniqueA,
    uniqueB,
  };
}

