/**
 * Custom hook for managing the Web Worker
 */

import { useRef, useEffect } from 'react';
import { ProcessingResult } from './types';

export function useWorker() {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Create worker on mount
    workerRef.current = new Worker('/worker.js');

    // Cleanup on unmount
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const processFiles = (
    fileA: File,
    fileB: File,
    onProgress: (progress: number, message: string) => void,
    onComplete: (result: ProcessingResult) => void,
    onError: (error: string) => void
  ) => {
    if (!workerRef.current) {
      onError('Worker not initialized');
      return;
    }

    const worker = workerRef.current;

    // Set up message handler
    const handleMessage = async (event: MessageEvent) => {
      const { type, data, progress, message, error } = event.data;

      if (type === 'progress') {
        onProgress(progress, message);
      } else if (type === 'extract-complete') {
        // After extraction, run matching
        onProgress(50, 'Starting match analysis...');
        worker.postMessage({
          type: 'match',
          payload: {
            unitsA: data.unitsA,
            unitsB: data.unitsB,
          },
        });
      } else if (type === 'match-complete') {
        onProgress(100, 'Complete!');
        onComplete(data);
        worker.removeEventListener('message', handleMessage);
      } else if (type === 'error') {
        onError(error);
        worker.removeEventListener('message', handleMessage);
      }
    };

    worker.addEventListener('message', handleMessage);

    // Start extraction
    worker.postMessage({
      type: 'extract',
      payload: { fileA, fileB },
    });
  };

  return { processFiles };
}

