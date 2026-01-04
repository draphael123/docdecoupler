/**
 * Text normalization utilities for matching
 */

/**
 * Normalize text for comparison by:
 * - Converting to lowercase
 * - Removing extra whitespace
 * - Removing punctuation
 * - Trimming
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
}

/**
 * Create a fingerprint hash for exact matching
 * Uses a simple but effective hash function
 */
export function createFingerprint(normalizedText: string): string {
  let hash = 0;
  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * Tokenize text into words for fuzzy matching
 */
export function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(token => token.length > 0);
}

/**
 * Calculate Jaccard similarity between two sets of tokens
 * Returns a value between 0 (no overlap) and 1 (identical)
 */
export function calculateSimilarity(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 && tokensB.length === 0) return 1;
  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  return intersection.size / union.size;
}

/**
 * Check if a line is meaningful (not just whitespace or very short)
 */
export function isMeaningfulLine(text: string): boolean {
  const normalized = normalizeText(text);
  return normalized.length >= 3; // At least 3 characters when normalized
}

