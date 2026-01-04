/**
 * History management for undo/redo functionality
 */

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function createHistory<T>(initialState: T): HistoryState<T> {
  return {
    past: [],
    present: initialState,
    future: [],
  };
}

export function undo<T>(history: HistoryState<T>): HistoryState<T> | null {
  if (history.past.length === 0) return null;
  
  const previous = history.past[history.past.length - 1];
  const newPast = history.past.slice(0, -1);
  
  return {
    past: newPast,
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redo<T>(history: HistoryState<T>): HistoryState<T> | null {
  if (history.future.length === 0) return null;
  
  const next = history.future[0];
  const newFuture = history.future.slice(1);
  
  return {
    past: [...history.past, history.present],
    present: next,
    future: newFuture,
  };
}

export function addToHistory<T>(history: HistoryState<T>, newState: T, maxHistory: number = 50): HistoryState<T> {
  const newPast = [...history.past, history.present].slice(-maxHistory);
  
  return {
    past: newPast,
    present: newState,
    future: [], // Clear future when new action is performed
  };
}

export function canUndo<T>(history: HistoryState<T>): boolean {
  return history.past.length > 0;
}

export function canRedo<T>(history: HistoryState<T>): boolean {
  return history.future.length > 0;
}

