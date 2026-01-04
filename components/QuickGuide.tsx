'use client';

import { useState } from 'react';

export function QuickGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="guide-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle quick guide"
      >
        {isOpen ? '✕' : '❓'} Quick Guide
      </button>
      
      {isOpen && (
        <div className="guide-overlay" onClick={() => setIsOpen(false)}>
          <div className="guide-content" onClick={(e) => e.stopPropagation()}>
            <div className="guide-header">
              <h2>📚 Quick Guide</h2>
              <button className="guide-close" onClick={() => setIsOpen(false)}>✕</button>
            </div>
            
            <div className="guide-sections">
              <section>
                <h3>🚀 Getting Started</h3>
                <ul>
                  <li><strong>Upload PDFs:</strong> Drag & drop or click to select two PDF files</li>
                  <li><strong>Compare:</strong> Click &quot;Compare Documents&quot; to start analysis</li>
                  <li><strong>Review:</strong> Check matches, unique content, and statistics</li>
                </ul>
              </section>

              <section>
                <h3>⌨️ Keyboard Shortcuts</h3>
                <ul>
                  <li><kbd>Ctrl/Cmd + K</kbd> - Focus search</li>
                  <li><kbd>Esc</kbd> - Close modals/guides</li>
                  <li><kbd>Ctrl/Cmd + E</kbd> - Export results</li>
                  <li><kbd>Ctrl/Cmd + R</kbd> - Reset and start new</li>
                </ul>
              </section>

              <section>
                <h3>💡 Tips</h3>
                <ul>
                  <li>Use <strong>filters</strong> to find exact or fuzzy matches</li>
                  <li><strong>Override</strong> incorrect matches manually</li>
                  <li><strong>Export</strong> results as JSON for further analysis</li>
                  <li>Create new documents from selected content</li>
                </ul>
              </section>

              <section>
                <h3>🔍 Understanding Results</h3>
                <ul>
                  <li><strong>Exact Match:</strong> 100% identical content (green badge)</li>
                  <li><strong>Fuzzy Match:</strong> Similar content 65%+ (yellow badge)</li>
                  <li><strong>Shared:</strong> Content in both documents</li>
                  <li><strong>Unique:</strong> Content only in one document</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .guide-toggle {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 50px;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          z-index: 100;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .guide-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .guide-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          animation: fadeIn 0.2s ease-out;
        }

        .guide-content {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideIn 0.3s ease-out;
          position: relative;
        }

        .guide-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 2rem 1rem;
          border-bottom: 2px solid rgba(102, 126, 234, 0.2);
        }

        .guide-header h2 {
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1.5rem;
        }

        .guide-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          padding: 0.5rem;
          line-height: 1;
          transition: all 0.2s;
        }

        .guide-close:hover {
          color: #333;
          transform: rotate(90deg);
        }

        .guide-sections {
          padding: 1.5rem 2rem 2rem;
        }

        .guide-sections section {
          margin-bottom: 2rem;
        }

        .guide-sections section:last-child {
          margin-bottom: 0;
        }

        .guide-sections h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.1rem;
        }

        .guide-sections ul {
          margin: 0;
          padding-left: 1.5rem;
          list-style: none;
        }

        .guide-sections li {
          margin-bottom: 0.75rem;
          color: #666;
          line-height: 1.6;
        }

        .guide-sections li strong {
          color: #333;
        }

        .guide-sections kbd {
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          font-family: monospace;
          font-size: 0.85rem;
          color: #667eea;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .guide-toggle {
            bottom: 1rem;
            right: 1rem;
            padding: 0.625rem 1.25rem;
            font-size: 0.85rem;
          }

          .guide-content {
            margin: 1rem;
            max-height: 90vh;
          }

          .guide-header,
          .guide-sections {
            padding: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}

