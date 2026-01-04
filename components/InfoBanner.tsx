'use client';

import { useState } from 'react';

interface InfoBannerProps {
  type?: 'info' | 'tip' | 'warning';
  dismissible?: boolean;
}

export function InfoBanner({ type = 'info', dismissible = true }: InfoBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const content = {
    info: {
      icon: 'ℹ️',
      title: 'How It Works',
      message: 'Upload two PDFs to compare. The app finds shared content (exact and similar matches) and unique content in each document.',
    },
    tip: {
      icon: '💡',
      title: 'Pro Tip',
      message: 'Use drag & drop for faster uploads. Search matches to find specific content. Copy text with one click.',
    },
    warning: {
      icon: '⚠️',
      title: 'Note',
      message: 'For best results, use text-based PDFs. Scanned PDFs (images) won\'t work unless they have OCR text.',
    },
  };

  const current = content[type];

  return (
    <div className={`info-banner info-banner-${type}`}>
      <div className="banner-content">
        <span className="banner-icon">{current.icon}</span>
        <div className="banner-text">
          <strong className="banner-title">{current.title}:</strong>
          <span className="banner-message">{current.message}</span>
        </div>
      </div>
      {dismissible && (
        <button 
          className="banner-close"
          onClick={() => setIsVisible(false)}
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
      <style jsx>{`
        .info-banner {
          padding: 1rem 1.25rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          animation: slideIn 0.4s ease-out;
          position: relative;
          z-index: 1;
        }

        .info-banner-info {
          background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(25, 118, 210, 0.1) 100%);
          border-left: 4px solid #2196f3;
        }

        .info-banner-tip {
          background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%);
          border-left: 4px solid #ffc107;
        }

        .info-banner-warning {
          background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 87, 34, 0.1) 100%);
          border-left: 4px solid #ff9800;
        }

        .banner-content {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          flex: 1;
        }

        .banner-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .banner-text {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
        }

        .banner-title {
          color: #333;
          font-size: 0.9rem;
        }

        .banner-message {
          color: #666;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .banner-close {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: #999;
          padding: 0.25rem;
          line-height: 1;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .banner-close:hover {
          color: #333;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}

