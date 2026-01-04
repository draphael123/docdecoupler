'use client';

import { useState } from 'react';

interface HelpfulHintsProps {
  hints: string[];
  title?: string;
}

export function HelpfulHints({ hints, title = '💡 Helpful Hints' }: HelpfulHintsProps) {
  const [currentHint, setCurrentHint] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || hints.length === 0) return null;

  const nextHint = () => {
    setCurrentHint((prev) => (prev + 1) % hints.length);
  };

  const prevHint = () => {
    setCurrentHint((prev) => (prev - 1 + hints.length) % hints.length);
  };

  return (
    <div className="hints-container">
      <div className="hints-header">
        <span className="hints-title">{title}</span>
        <button className="hints-close" onClick={() => setIsVisible(false)} aria-label="Close hints">
          ✕
        </button>
      </div>
      <div className="hints-content">
        <button className="hints-nav hints-nav-prev" onClick={prevHint} aria-label="Previous hint">
          ‹
        </button>
        <div className="hint-text">{hints[currentHint]}</div>
        <button className="hints-nav hints-nav-next" onClick={nextHint} aria-label="Next hint">
          ›
        </button>
      </div>
      {hints.length > 1 && (
        <div className="hints-indicator">
          {currentHint + 1} / {hints.length}
        </div>
      )}
      <style jsx>{`
        .hints-container {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          position: relative;
          animation: fadeIn 0.4s ease-out;
        }

        .hints-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .hints-title {
          font-weight: 700;
          font-size: 0.9rem;
          color: #667eea;
        }

        .hints-close {
          background: none;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          color: #999;
          padding: 0.25rem 0.5rem;
          line-height: 1;
          transition: all 0.2s;
          border-radius: 4px;
        }

        .hints-close:hover {
          color: #333;
          background: rgba(102, 126, 234, 0.1);
        }

        .hints-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .hints-nav {
          background: rgba(102, 126, 234, 0.2);
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.25rem;
          color: #667eea;
          font-weight: bold;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .hints-nav:hover {
          background: rgba(102, 126, 234, 0.3);
          transform: scale(1.1);
        }

        .hint-text {
          flex: 1;
          color: #333;
          font-size: 0.9rem;
          line-height: 1.5;
          padding: 0.5rem 0;
        }

        .hints-indicator {
          text-align: center;
          font-size: 0.75rem;
          color: #666;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}

