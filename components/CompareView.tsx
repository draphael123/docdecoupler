'use client';

import { useState } from 'react';
import { Match } from '@/lib/types';

interface CompareViewProps {
  matches: Match[];
  onOverride: (matchId: string, override: 'shared' | 'unique') => void;
}

export function CompareView({ matches, onOverride }: CompareViewProps) {
  const [filter, setFilter] = useState<'all' | 'exact' | 'fuzzy'>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'page'>('confidence');

  // Filter matches
  let filteredMatches = matches;
  if (filter === 'exact') {
    filteredMatches = matches.filter(m => m.matchType === 'exact');
  } else if (filter === 'fuzzy') {
    filteredMatches = matches.filter(m => m.matchType === 'fuzzy');
  }

  // Sort matches
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    if (sortBy === 'confidence') {
      return b.confidence - a.confidence;
    } else {
      return a.unitA.pageNumber - b.unitA.pageNumber;
    }
  });

  return (
    <div className="compare-container">
      <div className="compare-header">
        <h2>Matched Content</h2>
        <div className="controls">
          <div className="filter-group">
            <label>Filter:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as any)}
              className="select-input"
            >
              <option value="all">All Matches ({matches.length})</option>
              <option value="exact">
                Exact ({matches.filter(m => m.matchType === 'exact').length})
              </option>
              <option value="fuzzy">
                Fuzzy ({matches.filter(m => m.matchType === 'fuzzy').length})
              </option>
            </select>
          </div>
          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="select-input"
            >
              <option value="confidence">Confidence</option>
              <option value="page">Page Number</option>
            </select>
          </div>
        </div>
      </div>

      <div className="matches-list">
        {sortedMatches.map((match) => (
          <MatchCard 
            key={match.id} 
            match={match} 
            onOverride={onOverride}
          />
        ))}
      </div>

      <style jsx>{`
        .compare-container {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .compare-header {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .compare-header h2 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.5rem;
        }

        .controls {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-group label {
          font-weight: 500;
          color: #666;
          font-size: 0.9rem;
        }

        .select-input {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.9rem;
          background: white;
          cursor: pointer;
        }

        .select-input:focus {
          outline: none;
          border-color: #0070f3;
        }

        .matches-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 600px;
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .controls {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

interface MatchCardProps {
  match: Match;
  onOverride: (matchId: string, override: 'shared' | 'unique') => void;
}

function MatchCard({ match, onOverride }: MatchCardProps) {
  const confidencePercent = Math.round(match.confidence * 100);
  const isExact = match.matchType === 'exact';

  return (
    <div className="match-card">
      <div className="match-header">
        <div className="match-meta">
          <span className={`badge ${isExact ? 'exact' : 'fuzzy'}`}>
            {isExact ? 'Exact Match' : 'Fuzzy Match'}
          </span>
          <span className="confidence">
            {confidencePercent}% confidence
          </span>
        </div>
        {match.userOverride && (
          <span className="override-badge">
            User Override: {match.userOverride}
          </span>
        )}
      </div>

      <div className="match-content">
        <div className="doc-section doc-a">
          <div className="doc-header">
            <strong>Document A</strong>
            <span className="location">
              Page {match.unitA.pageNumber}, Line {match.unitA.lineNumber}
            </span>
          </div>
          <div className="text-content">{match.unitA.rawText}</div>
        </div>

        <div className="doc-section doc-b">
          <div className="doc-header">
            <strong>Document B</strong>
            <span className="location">
              Page {match.unitB.pageNumber}, Line {match.unitB.lineNumber}
            </span>
          </div>
          <div className="text-content">{match.unitB.rawText}</div>
        </div>
      </div>

      <div className="match-actions">
        <button
          onClick={() => onOverride(match.id, 'shared')}
          className={`action-btn ${match.userOverride === 'shared' ? 'active' : ''}`}
        >
          Mark as Shared
        </button>
        <button
          onClick={() => onOverride(match.id, 'unique')}
          className={`action-btn ${match.userOverride === 'unique' ? 'active' : ''}`}
        >
          Mark as Unique
        </button>
      </div>

      <style jsx>{`
        .match-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1rem;
          background: #fafafa;
        }

        .match-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .match-meta {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge.exact {
          background: #d4edda;
          color: #155724;
        }

        .badge.fuzzy {
          background: #fff3cd;
          color: #856404;
        }

        .confidence {
          font-size: 0.85rem;
          color: #666;
          font-weight: 500;
        }

        .override-badge {
          padding: 0.25rem 0.75rem;
          background: #e3f2fd;
          color: #1565c0;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .match-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .doc-section {
          background: white;
          border-radius: 6px;
          padding: 1rem;
          border-left: 3px solid #ccc;
        }

        .doc-section.doc-a {
          border-left-color: #0070f3;
        }

        .doc-section.doc-b {
          border-left-color: #ff6b6b;
        }

        .doc-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
        }

        .doc-header strong {
          color: #333;
        }

        .location {
          color: #666;
          font-size: 0.75rem;
        }

        .text-content {
          color: #444;
          line-height: 1.5;
          font-size: 0.95rem;
        }

        .match-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: #f5f5f5;
        }

        .action-btn.active {
          background: #0070f3;
          color: white;
          border-color: #0070f3;
        }

        @media (max-width: 768px) {
          .match-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

