'use client';

import { useState } from 'react';
import { Match } from '@/lib/types';
import { TipsPanel } from './TipsPanel';

interface CompareViewProps {
  matches: Match[];
  onOverride: (matchId: string, override: 'shared' | 'unique') => void;
}

export function CompareView({ matches, onOverride }: CompareViewProps) {
  const [filter, setFilter] = useState<'all' | 'exact' | 'fuzzy'>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'page'>('confidence');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [minPage, setMinPage] = useState<number>(0);
  const [maxPage, setMaxPage] = useState<number>(0);
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const [maxConfidence, setMaxConfidence] = useState<number>(100);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Calculate page range
  const pageRange = matches.length > 0 ? {
    min: Math.min(...matches.map(m => Math.min(m.unitA.pageNumber, m.unitB.pageNumber))),
    max: Math.max(...matches.map(m => Math.max(m.unitA.pageNumber, m.unitB.pageNumber))),
  } : { min: 0, max: 0 };

  // Initialize page range
  if (minPage === 0 && maxPage === 0 && pageRange.max > 0) {
    setMinPage(pageRange.min);
    setMaxPage(pageRange.max);
  }

  // Filter matches
  let filteredMatches = matches;
  
  // Match type filter
  if (filter === 'exact') {
    filteredMatches = filteredMatches.filter(m => m.matchType === 'exact');
  } else if (filter === 'fuzzy') {
    filteredMatches = filteredMatches.filter(m => m.matchType === 'fuzzy');
  }

  // Page range filter
  filteredMatches = filteredMatches.filter(m => {
    const pageA = m.unitA.pageNumber;
    const pageB = m.unitB.pageNumber;
    return (pageA >= minPage && pageA <= maxPage) || (pageB >= minPage && pageB <= maxPage);
  });

  // Confidence range filter
  filteredMatches = filteredMatches.filter(m => {
    const confidencePercent = m.confidence * 100;
    return confidencePercent >= minConfidence && confidencePercent <= maxConfidence;
  });

  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredMatches = filteredMatches.filter(m => 
      m.unitA.rawText.toLowerCase().includes(query) ||
      m.unitB.rawText.toLowerCase().includes(query)
    );
  }

  const copyToClipboard = async (text: string, copyId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(copyId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

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
        <div className="header-top">
          <h2>Matched Content</h2>
          <div className="header-help">
            <span className="help-text">
              💡 Each match shows content from both documents side-by-side. 
              Use filters and search to find specific content. Click 📋 to copy text.
            </span>
          </div>
        </div>
        <div className="controls">
          <div className="search-group">
            <input
              type="text"
              placeholder="🔍 Search matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                className="clear-search"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
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
          <button
            className="advanced-filters-btn"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            {showAdvancedFilters ? '▼' : '▶'} Advanced
          </button>
        </div>

        {showAdvancedFilters && pageRange.max > 0 && (
          <div className="advanced-filters">
            <div className="filter-section">
              <label className="filter-section-label">Page Range: {minPage} - {maxPage}</label>
              <div className="range-inputs">
                <div className="range-input">
                  <label>Min:</label>
                  <input
                    type="number"
                    min={pageRange.min}
                    max={pageRange.max}
                    value={minPage}
                    onChange={(e) => setMinPage(Math.max(pageRange.min, Math.min(pageRange.max, parseInt(e.target.value) || pageRange.min)))}
                    className="range-number"
                  />
                </div>
                <div className="range-input">
                  <label>Max:</label>
                  <input
                    type="number"
                    min={pageRange.min}
                    max={pageRange.max}
                    value={maxPage}
                    onChange={(e) => setMaxPage(Math.max(pageRange.min, Math.min(pageRange.max, parseInt(e.target.value) || pageRange.max)))}
                    className="range-number"
                  />
                </div>
              </div>
            </div>

            <div className="filter-section">
              <label className="filter-section-label">
                Confidence: {minConfidence}% - {maxConfidence}%
              </label>
              <div className="confidence-sliders">
                <div className="slider-group">
                  <label>Min: {minConfidence}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={minConfidence}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setMinConfidence(val);
                      if (val > maxConfidence) setMaxConfidence(val);
                    }}
                    className="confidence-slider"
                  />
                </div>
                <div className="slider-group">
                  <label>Max: {maxConfidence}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={maxConfidence}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setMaxConfidence(val);
                      if (val < minConfidence) setMinConfidence(val);
                    }}
                    className="confidence-slider"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {searchQuery && (
          <div className="search-results">
            Found {filteredMatches.length} match{filteredMatches.length !== 1 ? 'es' : ''}
          </div>
        )}
      </div>

      <TipsPanel context="compare" />

      <div className="matches-list">
        {sortedMatches.length === 0 ? (
          <div className="no-results">
            {searchQuery ? 'No matches found for your search.' : 'No matches to display.'}
          </div>
        ) : (
          sortedMatches.map((match) => (
            <MatchCard 
              key={match.id} 
              match={match} 
              onOverride={onOverride}
              onCopy={copyToClipboard}
              copiedId={copiedId}
            />
          ))
        )}
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

        .header-top {
          margin-bottom: 1.5rem;
        }

        .compare-header h2 {
          margin: 0 0 0.75rem 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1.75rem;
          font-weight: 800;
        }

        .header-help {
          margin-top: 0.5rem;
        }

        .help-text {
          font-size: 0.85rem;
          color: #666;
          line-height: 1.5;
          display: block;
        }

        .search-results {
          margin-top: 1rem;
          padding: 0.75rem 1rem;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 8px;
          color: #667eea;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .controls {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .search-group {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .search-input {
          width: 100%;
          padding: 0.625rem 2.5rem 0.625rem 1rem;
          border: 2px solid rgba(102, 126, 234, 0.2);
          border-radius: 12px;
          font-size: 0.9rem;
          background: rgba(255, 255, 255, 0.9);
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          background: rgba(255, 255, 255, 1);
        }

        .clear-search {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          color: #666;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .clear-search:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
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

        .advanced-filters-btn {
          padding: 0.625rem 1rem;
          background: rgba(102, 126, 234, 0.1);
          border: 2px solid rgba(102, 126, 234, 0.3);
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #667eea;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .advanced-filters-btn:hover {
          background: rgba(102, 126, 234, 0.2);
          transform: translateY(-2px);
        }

        .advanced-filters {
          margin-top: 1.5rem;
          padding: 1.5rem;
          background: rgba(102, 126, 234, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(102, 126, 234, 0.2);
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        .filter-section {
          margin-bottom: 1.5rem;
        }

        .filter-section:last-child {
          margin-bottom: 0;
        }

        .filter-section-label {
          display: block;
          font-weight: 700;
          color: #667eea;
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }

        .range-inputs {
          display: flex;
          gap: 1rem;
        }

        .range-input {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .range-input label {
          font-weight: 600;
          font-size: 0.9rem;
          color: #666;
        }

        .range-number {
          padding: 0.5rem;
          border: 2px solid rgba(102, 126, 234, 0.2);
          border-radius: 8px;
          font-size: 0.9rem;
          width: 80px;
          background: rgba(255, 255, 255, 0.9);
        }

        .confidence-sliders {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .slider-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .slider-group label {
          font-weight: 600;
          font-size: 0.9rem;
          color: #666;
        }

        .confidence-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: rgba(102, 126, 234, 0.2);
          outline: none;
          -webkit-appearance: none;
        }

        .confidence-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(102, 126, 234, 0.4);
        }

        .confidence-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(102, 126, 234, 0.4);
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
  onCopy: (text: string, copyId: string) => void;
  copiedId: string | null;
}

function MatchCard({ match, onOverride, onCopy, copiedId }: MatchCardProps) {
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
            <div className="doc-header-right">
              <span className="location">
                Page {match.unitA.pageNumber}, Line {match.unitA.lineNumber}
              </span>
              <button
                className="copy-btn"
                onClick={() => onCopy(match.unitA.rawText, `${match.id}-a`)}
                title="Copy text"
                aria-label="Copy text"
              >
                {copiedId === `${match.id}-a` ? '✓' : '📋'}
              </button>
            </div>
          </div>
          <div className="text-content">{match.unitA.rawText}</div>
        </div>

        <div className="doc-section doc-b">
          <div className="doc-header">
            <strong>Document B</strong>
            <div className="doc-header-right">
              <span className="location">
                Page {match.unitB.pageNumber}, Line {match.unitB.lineNumber}
              </span>
              <button
                className="copy-btn"
                onClick={() => onCopy(match.unitB.rawText, `${match.id}-b`)}
                title="Copy text"
                aria-label="Copy text"
              >
                {copiedId === `${match.id}-b` ? '✓' : '📋'}
              </button>
            </div>
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
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
        }

        .doc-header-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .doc-header strong {
          color: #333;
        }

        .location {
          color: #666;
          font-size: 0.75rem;
        }

        .copy-btn {
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 6px;
          padding: 0.25rem 0.5rem;
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.2s;
          line-height: 1;
        }

        .copy-btn:hover {
          background: rgba(102, 126, 234, 0.2);
          border-color: rgba(102, 126, 234, 0.4);
          transform: scale(1.1);
        }

        .no-results {
          text-align: center;
          padding: 3rem;
          color: #666;
          font-size: 1.1rem;
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

