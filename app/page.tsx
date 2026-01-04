'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { ProgressBar } from '@/components/ProgressBar';
import { ResultsSummary } from '@/components/ResultsSummary';
import { CompareView } from '@/components/CompareView';
import { DocumentBuilder } from '@/components/DocumentBuilder';
import { QuickGuide } from '@/components/QuickGuide';
import { useWorker } from '@/lib/useWorker';
import { ProcessingResult } from '@/lib/types';
import { applyUserOverrides } from '@/lib/match';
import { generateExportData, downloadJson } from '@/lib/export';
import { useEffect } from 'react';
import { getErrorMessage } from '@/lib/errorMessages';

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + E: Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        if (result) {
          const exportData = generateExportData(result, fileNames.a, fileNames.b);
          const timestamp = new Date().toISOString().split('T')[0];
          downloadJson(exportData, `doc-comparison-${timestamp}.json`);
        }
      }
      // Ctrl/Cmd + R: Reset (only if not in input)
      if ((e.ctrlKey || e.metaKey) && e.key === 'r' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        if (state === 'complete') {
          setState('idle');
          setResult(null);
          setError(null);
          setProgress(0);
          setProgressMessage('');
          setOverrides(new Map());
          setFileNames({ a: '', b: '' });
        }
      }
      // Esc: Close modals
      if (e.key === 'Escape') {
        // Could close any open modals here
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [result, state, fileNames]);

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

        {state === 'error' && error && (() => {
          const errorInfo = getErrorMessage(error);
          return (
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <h2>{errorInfo.title}</h2>
              <p className="error-message">{errorInfo.message}</p>
              <div className="error-suggestion">
                <strong>💡 Suggestion:</strong> {errorInfo.suggestion}
              </div>
              <button onClick={handleReset} className="retry-button">
                Try Again
              </button>
            </div>
          );
        })()}

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

      <QuickGuide />

      <style jsx>{`
        .main-container {
          min-height: 100vh;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .main-container::before {
          content: '';
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: float 20s linear infinite;
          pointer-events: none;
          z-index: 0;
        }

        @keyframes float {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }

        .app-header {
          text-align: center;
          margin-bottom: 3rem;
          position: relative;
          z-index: 1;
          animation: fadeIn 0.8s ease-out;
        }

        .app-title {
          font-size: 4rem;
          font-weight: 900;
          background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #ffffff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.5rem 0;
          text-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
          animation: shimmer 3s linear infinite;
          letter-spacing: -0.02em;
          position: relative;
        }

        .app-title::after {
          content: '📄';
          display: inline-block;
          margin-left: 1rem;
          animation: pulse 2s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8));
        }

        .app-subtitle {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.95);
          margin: 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .content {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .error-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
                      0 0 0 1px rgba(255, 255, 255, 0.5);
          text-align: center;
          animation: fadeIn 0.5s ease-out;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          animation: pulse 2s ease-in-out infinite;
        }

        .error-container h2 {
          color: #e00;
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .error-message {
          color: #666;
          margin: 0 0 1rem 0;
          font-size: 1rem;
          line-height: 1.6;
        }

        .error-suggestion {
          background: rgba(102, 126, 234, 0.1);
          border-left: 4px solid #667eea;
          padding: 1rem;
          border-radius: 8px;
          margin: 0 0 1.5rem 0;
          color: #333;
          line-height: 1.6;
        }

        .error-suggestion strong {
          color: #667eea;
        }

        .retry-button {
          padding: 0.75rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          position: relative;
          overflow: hidden;
        }

        .retry-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .retry-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .retry-button:hover::before {
          left: 100%;
        }

        .retry-button:active {
          transform: translateY(0);
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

