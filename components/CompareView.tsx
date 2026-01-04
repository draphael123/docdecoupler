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
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
                      0 0 0 1px rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.3);
          animation: fadeIn 0.6s ease-out;
          position: relative;
          overflow: hidden;
        }

        .compare-container::before {
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

        .compare-header {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid rgba(102, 126, 234, 0.2);
          position: relative;
          z-index: 1;
        }

        .compare-header h2 {
          margin: 0 0 1.5rem 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1.75rem;
          font-weight: 800;
        }

        .controls {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .filter-group label {
          font-weight: 600;
          color: #333;
          font-size: 0.95rem;
        }

        .select-input {
          padding: 0.625rem 1rem;
          border: 2px solid rgba(102, 126, 234, 0.2);
          border-radius: 12px;
          font-size: 0.9rem;
          background: rgba(255, 255, 255, 0.9);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .select-input:hover {
          border-color: rgba(102, 126, 234, 0.4);
          background: rgba(255, 255, 255, 1);
        }

        .select-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          background: rgba(255, 255, 255, 1);
        }

        .matches-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-height: 600px;
          overflow-y: auto;
          padding-right: 0.5rem;
          position: relative;
          z-index: 1;
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
          border: 2px solid rgba(102, 126, 234, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: slideIn 0.4s ease-out;
          position: relative;
          overflow: hidden;
        }

        .match-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }

        .match-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(102, 126, 234, 0.2);
          border-color: rgba(102, 126, 234, 0.4);
        }

        .match-card:hover::before {
          transform: scaleX(1);
        }

        .match-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .match-meta {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .badge {
          padding: 0.375rem 0.875rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .badge.exact {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .badge.fuzzy {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .confidence {
          font-size: 0.9rem;
          color: #333;
          font-weight: 600;
          padding: 0.375rem 0.875rem;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 20px;
        }

        .override-badge {
          padding: 0.375rem 0.875rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .match-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .doc-section {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 12px;
          padding: 1.25rem;
          border-left: 4px solid #ccc;
          transition: all 0.3s ease;
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }

        .doc-section:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .doc-section.doc-a {
          border-left-color: #667eea;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(255, 255, 255, 0.8) 100%);
        }

        .doc-section.doc-b {
          border-left-color: #f093fb;
          background: linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(255, 255, 255, 0.8) 100%);
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
          padding: 0.625rem 1.25rem;
          border: 2px solid rgba(102, 126, 234, 0.3);
          background: rgba(255, 255, 255, 0.9);
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: #333;
          position: relative;
          overflow: hidden;
        }

        .action-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
          transition: left 0.5s;
        }

        .action-btn:hover {
          background: rgba(102, 126, 234, 0.1);
          border-color: rgba(102, 126, 234, 0.5);
          transform: translateY(-2px);
        }

        .action-btn:hover::before {
          left: 100%;
        }

        .action-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .action-btn.active:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
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

