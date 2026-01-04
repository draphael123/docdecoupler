'use client';

import { ProcessingResult } from '@/lib/types';

interface ResultsSummaryProps {
  result: ProcessingResult;
  docAName: string;
  docBName: string;
  onExport: () => void;
  onReset: () => void;
}

export function ResultsSummary({ 
  result, 
  docAName, 
  docBName, 
  onExport, 
  onReset 
}: ResultsSummaryProps) {
  const exactMatches = result.matches.filter(m => m.matchType === 'exact').length;
  const fuzzyMatches = result.matches.filter(m => m.matchType === 'fuzzy').length;
  const overrides = result.matches.filter(m => m.userOverride).length;

  return (
    <div className="summary-container">
      <div className="summary-header">
        <h1>Comparison Results</h1>
        <div className="action-buttons">
          <button onClick={onExport} className="export-btn">
            Export JSON
          </button>
          <button onClick={onReset} className="reset-btn">
            New Comparison
          </button>
        </div>
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

      <style jsx>{`
        .summary-container {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .summary-header h1 {
          margin: 0;
          font-size: 1.75rem;
          color: #333;
        }

        .action-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .export-btn, .reset-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .export-btn {
          background: #0070f3;
          color: white;
        }

        .export-btn:hover {
          background: #0051cc;
        }

        .reset-btn {
          background: #f0f0f0;
          color: #333;
        }

        .reset-btn:hover {
          background: #e0e0e0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }

        .stat-card.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          opacity: 0.9;
        }

        .stat-card:not(.primary) .stat-label {
          color: #333;
        }

        .stat-breakdown, .stat-detail {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .stat-card:not(.primary) .stat-value {
          color: #0070f3;
        }

        .stat-card:not(.primary) .stat-detail {
          color: #666;
        }

        .overrides-notice {
          margin-top: 1.5rem;
          padding: 0.75rem 1rem;
          background: #e3f2fd;
          border-left: 3px solid #1976d2;
          border-radius: 4px;
          color: #1565c0;
          font-size: 0.9rem;
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

