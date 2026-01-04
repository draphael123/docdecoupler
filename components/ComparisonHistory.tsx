'use client';

import { useState, useEffect } from 'react';
import { getSavedComparisons, loadComparison, deleteComparison, type SavedComparison } from '@/lib/sessionStorage';
import { ProcessingResult } from '@/lib/types';

interface ComparisonHistoryProps {
  onLoad: (result: ProcessingResult, fileNames: { a: string; b: string }, overrides?: Map<string, 'shared' | 'unique'>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ComparisonHistory({ onLoad, isOpen, onClose }: ComparisonHistoryProps) {
  const [comparisons, setComparisons] = useState<SavedComparison[]>([]);

  useEffect(() => {
    if (isOpen) {
      setComparisons(getSavedComparisons());
    }
  }, [isOpen]);

  const handleLoad = (comparison: SavedComparison) => {
    const overrides = comparison.overrides 
      ? new Map(Object.entries(comparison.overrides as any)) as Map<string, 'shared' | 'unique'>
      : undefined;
    onLoad(comparison.result, comparison.fileNames, overrides);
    onClose();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this comparison?')) {
      deleteComparison(id);
      setComparisons(getSavedComparisons());
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="history-overlay" onClick={onClose}></div>
      <div className="history-sidebar">
        <div className="history-header">
          <h2>Comparison History</h2>
          <button className="history-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        
        <div className="history-content">
          {comparisons.length === 0 ? (
            <div className="history-empty">
              <p>No saved comparisons yet.</p>
              <p className="empty-hint">Your comparisons will appear here after you save them.</p>
            </div>
          ) : (
            <div className="history-list">
              {comparisons.map((comp) => (
                <div key={comp.id} className="history-item" onClick={() => handleLoad(comp)}>
                  <div className="history-item-header">
                    <div className="history-item-title">
                      {comp.fileNames.a} ↔ {comp.fileNames.b}
                    </div>
                    <button
                      className="history-item-delete"
                      onClick={(e) => handleDelete(comp.id, e)}
                      aria-label="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="history-item-meta">
                    <span>{formatDate(comp.timestamp)}</span>
                    <span>{comp.result.matches.length} matches</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .history-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 9998;
          animation: fadeIn 0.2s;
        }

        .history-sidebar {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 400px;
          max-width: 90vw;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.2);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          animation: slideInRight 0.3s ease-out;
        }

        :global([data-theme='dark']) .history-sidebar {
          background: rgba(30, 30, 30, 0.95);
          color: #e0e0e0;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .history-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        :global([data-theme='dark']) .history-header {
          border-bottom-color: rgba(255, 255, 255, 0.1);
        }

        .history-header h2 {
          margin: 0;
          font-size: 1.25rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .history-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .history-close:hover {
          background: rgba(0, 0, 0, 0.1);
          color: #333;
        }

        .history-content {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        .history-empty {
          text-align: center;
          padding: 3rem 1rem;
          color: #666;
        }

        .empty-hint {
          font-size: 0.9rem;
          margin-top: 0.5rem;
          opacity: 0.7;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .history-item {
          padding: 1rem;
          background: rgba(102, 126, 234, 0.05);
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .history-item:hover {
          background: rgba(102, 126, 234, 0.1);
          transform: translateX(-4px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .history-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .history-item-title {
          font-weight: 600;
          font-size: 0.95rem;
          color: #333;
          flex: 1;
        }

        :global([data-theme='dark']) .history-item-title {
          color: #e0e0e0;
        }

        .history-item-delete {
          background: none;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          padding: 0.25rem;
          opacity: 0.6;
          transition: all 0.2s;
        }

        .history-item-delete:hover {
          opacity: 1;
          transform: scale(1.1);
        }

        .history-item-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
          color: #666;
        }

        :global([data-theme='dark']) .history-item-meta {
          color: #999;
        }
      `}</style>
    </>
  );
}

