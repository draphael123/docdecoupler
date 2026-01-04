'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { ProgressBar } from '@/components/ProgressBar';
import { ResultsSummary } from '@/components/ResultsSummary';
import { CompareView } from '@/components/CompareView';
import { DocumentBuilder } from '@/components/DocumentBuilder';
import { useWorker } from '@/lib/useWorker';
import { ProcessingResult } from '@/lib/types';
import { applyUserOverrides } from '@/lib/match';
import { generateExportData, downloadJson } from '@/lib/export';

type AppState = 'idle' | 'processing' | 'complete' | 'error';

export default function Home() {
  const [state, setState] = useState<AppState>('idle');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileNames, setFileNames] = useState({ a: '', b: '' });
  const [overrides, setOverrides] = useState<Map<string, 'shared' | 'unique'>>(new Map());

  const { processFiles } = useWorker();

  const handleFilesSelected = (fileA: File, fileB: File) => {
    setFileNames({ a: fileA.name, b: fileB.name });
    setState('processing');
    setProgress(0);
    setError(null);

    processFiles(
      fileA,
      fileB,
      (progress, message) => {
        setProgress(progress);
        setProgressMessage(message);
      },
      (result) => {
        setResult(result);
        setState('complete');
      },
      (error) => {
        setError(error);
        setState('error');
      }
    );
  };

  const handleOverride = (matchId: string, override: 'shared' | 'unique') => {
    const newOverrides = new Map(overrides);
    
    // Toggle override
    if (newOverrides.get(matchId) === override) {
      newOverrides.delete(matchId);
    } else {
      newOverrides.set(matchId, override);
    }
    
    setOverrides(newOverrides);

    // Apply overrides to result
    if (result) {
      const updatedResult = applyUserOverrides(result, newOverrides);
      setResult(updatedResult);
    }
  };

  const handleExport = () => {
    if (!result) return;

    const exportData = generateExportData(result, fileNames.a, fileNames.b);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadJson(exportData, `doc-comparison-${timestamp}.json`);
  };

  const handleReset = () => {
    setState('idle');
    setResult(null);
    setError(null);
    setProgress(0);
    setProgressMessage('');
    setOverrides(new Map());
    setFileNames({ a: '', b: '' });
  };

  return (
    <main className="main-container">
      <header className="app-header">
        <h1 className="app-title">Doc Decoupler</h1>
        <p className="app-subtitle">
          Compare two PDF documents and identify shared vs. unique content
        </p>
      </header>

      <div className="content">
        {state === 'idle' && (
          <FileUpload onFilesSelected={handleFilesSelected} />
        )}

        {state === 'processing' && (
          <ProgressBar progress={progress} message={progressMessage} />
        )}

        {state === 'error' && (
          <div className="error-container">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={handleReset} className="retry-button">
              Try Again
            </button>
          </div>
        )}

        {state === 'complete' && result && (
          <>
            <ResultsSummary
              result={result}
              docAName={fileNames.a}
              docBName={fileNames.b}
              onExport={handleExport}
              onReset={handleReset}
            />
            <DocumentBuilder
              result={result}
              docAName={fileNames.a}
              docBName={fileNames.b}
            />
            <CompareView 
              matches={result.matches} 
              onOverride={handleOverride}
            />
          </>
        )}
      </div>

      <style jsx>{`
        .main-container {
          min-height: 100vh;
          background: linear-gradient(to bottom, #f5f7fa 0%, #c3cfe2 100%);
          padding: 2rem;
        }

        .app-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .app-title {
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.5rem 0;
        }

        .app-subtitle {
          font-size: 1.1rem;
          color: #666;
          margin: 0;
        }

        .content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .error-container {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .error-container h2 {
          color: #e00;
          margin: 0 0 1rem 0;
        }

        .error-container p {
          color: #666;
          margin: 0 0 1.5rem 0;
        }

        .retry-button {
          padding: 0.75rem 2rem;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .retry-button:hover {
          background: #0051cc;
        }

        @media (max-width: 768px) {
          .main-container {
            padding: 1rem;
          }

          .app-title {
            font-size: 2rem;
          }

          .app-subtitle {
            font-size: 1rem;
          }
        }
      `}</style>
    </main>
  );
}

