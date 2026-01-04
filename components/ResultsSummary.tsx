'use client';

import { ProcessingResult } from '@/lib/types';
import { TipsPanel } from './TipsPanel';
import { exportToMarkdown, exportToCSV, downloadFile } from '@/lib/exportFormats';

interface ResultsSummaryProps {
  result: ProcessingResult;
  docAName: string;
  docBName: string;
  onExport: () => void;
  onReset: () => void;
  onHistory?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function ResultsSummary({ 
  result, 
  docAName, 
  docBName, 
  onExport, 
  onReset,
  onHistory,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}: ResultsSummaryProps) {
  const exactMatches = result.matches.filter(m => m.matchType === 'exact').length;
  const fuzzyMatches = result.matches.filter(m => m.matchType === 'fuzzy').length;
  const overrides = result.matches.filter(m => m.userOverride).length;

  return (
    <div className="summary-container">
      <div className="summary-header">
        <h1>Comparison Results</h1>
        <div className="action-buttons">
          {(onUndo || onRedo) && (
            <div className="undo-redo-buttons">
              <button 
                onClick={onUndo} 
                className="undo-btn"
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
              >
                ↶ Undo
              </button>
              <button 
                onClick={onRedo} 
                className="redo-btn"
                disabled={!canRedo}
                title="Redo (Ctrl+Shift+Z)"
              >
                ↷ Redo
              </button>
            </div>
          )}
          {onHistory && (
            <button onClick={onHistory} className="history-btn" title="View History (Ctrl+H)">
              📚 History
            </button>
          )}
          <div className="export-menu">
            <button onClick={onExport} className="export-btn">
              Export JSON
            </button>
            <div className="export-dropdown">
              <button 
                onClick={() => {
                  const markdown = exportToMarkdown(result, docAName, docBName);
                  const timestamp = new Date().toISOString().split('T')[0];
                  downloadFile(markdown, `comparison-${timestamp}.md`, 'text/markdown');
                }}
                className="export-option"
              >
                📝 Markdown
              </button>
              <button 
                onClick={() => {
                  const csv = exportToCSV(result, docAName, docBName);
                  const timestamp = new Date().toISOString().split('T')[0];
                  downloadFile(csv, `comparison-${timestamp}.csv`, 'text/csv');
                }}
                className="export-option"
              >
                📊 CSV
              </button>
            </div>
          </div>
          <button onClick={onReset} className="reset-btn">
            New Comparison
          </button>
        </div>
      </div>

      <div className="stats-explanation">
        <p className="explanation-text">
          <strong>Understanding the Results:</strong> Matches show content found in both documents. 
          Shared units appear in both, while unique units are only in one document. 
          Use the filters below to explore matches in detail.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-value">{result.matches.length}</div>
          <div className="stat-label">Total Matches</div>
          <div className="stat-breakdown">
            {exactMatches} exact, {fuzzyMatches} fuzzy
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{result.sharedUnits.length}</div>
          <div className="stat-label">Shared Units</div>
          <div className="stat-detail">
            Content found in both documents
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{result.uniqueA.length}</div>
          <div className="stat-label">Unique to Doc A</div>
          <div className="stat-detail">{docAName}</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{result.uniqueB.length}</div>
          <div className="stat-label">Unique to Doc B</div>
          <div className="stat-detail">{docBName}</div>
        </div>
      </div>

      {overrides > 0 && (
        <div className="overrides-notice">
          ℹ️ {overrides} manual override{overrides !== 1 ? 's' : ''} applied
        </div>
      )}

      <TipsPanel context="results" />

      <style jsx>{`
        .summary-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
                      0 0 0 1px rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.3);
          margin-bottom: 2rem;
          animation: fadeIn 0.6s ease-out;
          position: relative;
          overflow: hidden;
        }

        .summary-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }

        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
          position: relative;
          z-index: 1;
        }

        .summary-header h1 {
          margin: 0;
          font-size: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
        }

        .action-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .undo-redo-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .undo-btn, .redo-btn, .history-btn {
          padding: 0.75rem 1.25rem;
          border: none;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          border: 1px solid rgba(102, 126, 234, 0.3);
        }

        .undo-btn:hover:not(:disabled), .redo-btn:hover:not(:disabled), .history-btn:hover {
          background: rgba(102, 126, 234, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .undo-btn:disabled, .redo-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .export-menu {
          position: relative;
        }

        .export-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 0.5rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          padding: 0.5rem;
          display: none;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 150px;
          z-index: 100;
        }

        .export-menu:hover .export-dropdown {
          display: flex;
        }

        .export-option {
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          text-align: left;
          font-size: 0.9rem;
          transition: all 0.2s;
          color: #333;
        }

        .export-option:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .export-btn, .reset-btn {
          padding: 0.875rem 1.75rem;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .export-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .export-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .export-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .export-btn:hover::before {
          left: 100%;
        }

        .reset-btn {
          background: rgba(255, 255, 255, 0.9);
          color: #333;
          border: 2px solid rgba(102, 126, 234, 0.2);
        }

        .reset-btn:hover {
          background: rgba(255, 255, 255, 1);
          border-color: rgba(102, 126, 234, 0.4);
          transform: translateY(-2px);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          position: relative;
          z-index: 1;
        }

        .stat-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
          padding: 2rem;
          border-radius: 16px;
          border: 1px solid rgba(102, 126, 234, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          animation: slideIn 0.5s ease-out;
          animation-fill-mode: both;
        }

        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-card:nth-child(4) { animation-delay: 0.4s; }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(102, 126, 234, 0.2);
          border-color: rgba(102, 126, 234, 0.4);
        }

        .stat-card.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .stat-card.primary::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          animation: rotate 10s linear infinite;
        }

        .stat-value {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          position: relative;
          z-index: 1;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-card.primary .stat-value {
          color: white;
          -webkit-text-fill-color: white;
        }

        .stat-label {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          opacity: 0.95;
          position: relative;
          z-index: 1;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-card:not(.primary) .stat-label {
          color: #333;
        }

        .stat-breakdown, .stat-detail {
          font-size: 0.85rem;
          opacity: 0.85;
          position: relative;
          z-index: 1;
        }

        .stat-card:not(.primary) .stat-value {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-card:not(.primary) .stat-detail {
          color: #666;
        }

        .stats-explanation {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .explanation-text {
          margin: 0;
          color: #333;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .explanation-text strong {
          color: #667eea;
        }

        .overrides-notice {
          margin-top: 1.5rem;
          padding: 1rem 1.25rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-left: 4px solid #667eea;
          border-radius: 12px;
          color: #667eea;
          font-size: 0.9rem;
          font-weight: 500;
          position: relative;
          z-index: 1;
          animation: slideIn 0.5s ease-out;
        }

        @media (max-width: 768px) {
          .summary-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

