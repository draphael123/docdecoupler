'use client';

import { useState } from 'react';

interface TipsPanelProps {
  context?: 'upload' | 'results' | 'compare' | 'builder';
}

export function TipsPanel({ context }: TipsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const tips = {
    upload: [
      '💡 Tip: Drag and drop PDF files directly onto the upload boxes for faster workflow',
      '📄 Only PDF files are supported. Encrypted PDFs need to be unlocked first',
      '⚡ Large PDFs may take a minute to process. The UI stays responsive thanks to Web Workers',
      '🔍 For best results, use text-based PDFs (not scanned images)',
    ],
    results: [
      '📊 Review the statistics to understand the comparison results',
      '💾 Export JSON to save results for later analysis or sharing',
      '🔄 Use "New Comparison" to start over with different documents',
      '📋 Click the copy button (📋) next to any match to copy text to clipboard',
    ],
    compare: [
      '🔍 Use the search bar to quickly find specific content in matches',
      '🎯 Filter by match type (exact/fuzzy) to focus on specific content',
      '📊 Sort by confidence to see most reliable matches first',
      '✏️ Use overrides to correct any incorrect matches',
      '📋 Copy match text with one click using the copy button',
    ],
    builder: [
      '🎯 Use hide/remove options to create customized documents',
      '📄 Choose PDF for professional documents or TXT for easy editing',
      '🔍 Filter by confidence to include only high-quality matches',
      '🚫 Check the "Will be hidden" summary to see what will be excluded',
      '💡 Hide section headers and footers for clean, professional documents',
    ],
  };

  const currentTips = context ? tips[context] : [];

  if (currentTips.length === 0) return null;

  return (
    <div className="tips-panel">
      <button 
        className="tips-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label="Toggle tips"
      >
        <span className="tips-icon">💡</span>
        <span className="tips-label">Tips & Help</span>
        <span className="tips-arrow">{isExpanded ? '▼' : '▶'}</span>
      </button>
      
      {isExpanded && (
        <div className="tips-content">
          {currentTips.map((tip, index) => (
            <div key={index} className="tip-item">
              {tip}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .tips-panel {
          margin-top: 1rem;
          border-radius: 12px;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%);
          border: 1px solid rgba(255, 193, 7, 0.3);
        }

        .tips-toggle {
          width: 100%;
          padding: 0.875rem 1.25rem;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
          color: #333;
          transition: all 0.2s;
        }

        .tips-toggle:hover {
          background: rgba(255, 193, 7, 0.1);
        }

        .tips-icon {
          font-size: 1.2rem;
        }

        .tips-label {
          flex: 1;
          text-align: left;
          font-size: 0.95rem;
        }

        .tips-arrow {
          font-size: 0.75rem;
          color: #666;
          transition: transform 0.2s;
        }

        .tips-content {
          padding: 1rem 1.25rem;
          background: rgba(255, 255, 255, 0.6);
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

        .tip-item {
          padding: 0.75rem 0;
          color: #333;
          font-size: 0.9rem;
          line-height: 1.6;
          border-bottom: 1px solid rgba(255, 193, 7, 0.2);
        }

        .tip-item:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
}

