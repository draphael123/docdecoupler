/**
 * Session storage utilities for saving/loading comparisons
 */

import { ProcessingResult } from './types';

export interface SavedComparison {
  id: string;
  timestamp: number;
  fileNames: { a: string; b: string };
  result: ProcessingResult;
  overrides?: Map<string, 'shared' | 'unique'>;
}

const STORAGE_KEY = 'docdecoupler_comparisons';
const MAX_SAVED = 20; // Maximum number of saved comparisons

export function saveComparison(
  result: ProcessingResult,
  fileNames: { a: string; b: string },
  overrides?: Map<string, 'shared' | 'unique'>
): string {
  const id = `comparison_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const saved: SavedComparison = {
    id,
    timestamp: Date.now(),
    fileNames,
    result,
    overrides: overrides ? Object.fromEntries(overrides) as any : undefined,
  };

  const existing = getSavedComparisons();
  existing.unshift(saved); // Add to beginning
  
  // Keep only the most recent MAX_SAVED
  const trimmed = existing.slice(0, MAX_SAVED);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    return id;
  } catch (error) {
    console.error('Failed to save comparison:', error);
    return id;
  }
}

export function getSavedComparisons(): SavedComparison[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Convert overrides back to Map if needed
    return parsed.map((comp: any) => ({
      ...comp,
      overrides: comp.overrides ? new Map(Object.entries(comp.overrides)) : undefined,
    }));
  } catch (error) {
    console.error('Failed to load comparisons:', error);
    return [];
  }
}

export function loadComparison(id: string): SavedComparison | null {
  const comparisons = getSavedComparisons();
  const found = comparisons.find(c => c.id === id);
  
  if (found && found.overrides) {
    // Convert overrides back to Map
    found.overrides = new Map(Object.entries(found.overrides as any)) as any;
  }
  
  return found || null;
}

export function deleteComparison(id: string): boolean {
  const comparisons = getSavedComparisons();
  const filtered = comparisons.filter(c => c.id !== id);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete comparison:', error);
    return false;
  }
}

export function clearAllComparisons(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear comparisons:', error);
  }
}

