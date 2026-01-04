'use client';

import { useState } from 'react';

interface HelpTooltipProps {
  content: string;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function HelpTooltip({ content, title, position = 'top' }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="tooltip-container">
      <button
        className="tooltip-trigger"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        aria-label="Help"
      >
        ❓
      </button>
      {isVisible && (
        <div className={`tooltip tooltip-${position}`}>
          {title && <div className="tooltip-title">{title}</div>}
          <div className="tooltip-content">{content}</div>
        </div>
      )}
      <style jsx>{`
        .tooltip-container {
          position: relative;
          display: inline-block;
        }

        .tooltip-trigger {
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: help;
          font-size: 0.75rem;
          transition: all 0.2s ease;
          padding: 0;
        }

        .tooltip-trigger:hover {
          background: rgba(102, 126, 234, 0.2);
          border-color: rgba(102, 126, 234, 0.5);
          transform: scale(1.1);
        }

        .tooltip {
          position: absolute;
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          line-height: 1.5;
          white-space: nowrap;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          animation: fadeIn 0.2s ease-out;
          max-width: 250px;
          white-space: normal;
        }

        .tooltip-top {
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
        }

        .tooltip-bottom {
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
        }

        .tooltip-left {
          right: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%);
        }

        .tooltip-right {
          left: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%);
        }

        .tooltip-title {
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #fff;
        }

        .tooltip-content {
          color: rgba(255, 255, 255, 0.9);
        }

        .tooltip::after {
          content: '';
          position: absolute;
          width: 0;
          height: 0;
        }

        .tooltip-top::after {
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid rgba(0, 0, 0, 0.9);
        }
      `}</style>
    </div>
  );
}

