'use client';

import { useState } from 'react';
import { ProcessingResult } from '@/lib/types';
import { DocumentSelection } from '@/lib/types';
import { generateDocument, generateTextDocument, getContentStats } from '@/lib/documentGenerator';
import { TipsPanel } from './TipsPanel';

interface DocumentBuilderProps {
  result: ProcessingResult;
  docAName: string;
  docBName: string;
}

export function DocumentBuilder({ result, docAName, docBName }: DocumentBuilderProps) {
  const [selection, setSelection] = useState<DocumentSelection>({
    includeShared: true,
    includeUniqueA: false,
    includeUniqueB: false,
    includePageNumbers: true,
    includeSourceInfo: true,
    documentTitle: '',
    hideExactMatches: false,
    hideFuzzyMatches: false,
    hideLowConfidence: false,
    confidenceThreshold: 0.65,
    hideUserOverrides: false,
    hideSectionHeaders: false,
    hideFooters: false,
    hideEmptySections: true,
    onlyShowUnique: false,
    onlyShowShared: false,
    hideSourceInfo: false,
  });

  const [documentType, setDocumentType] = useState<'pdf' | 'text'>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  const stats = getContentStats(result, selection);

  const handleToggle = (field: keyof DocumentSelection) => {
    setSelection(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleTitleChange = (title: string) => {
    setSelection(prev => ({
      ...prev,
      documentTitle: title,
    }));
  };

  const handleGenerate = () => {
    if (stats.totalLines === 0) {
      alert('Please select at least one content type to include.');
      return;
    }

    setIsGenerating(true);

    try {
      if (documentType === 'pdf') {
        generateDocument(result, selection);
      } else {
        generateTextDocument(result, selection);
      }
    } catch (error: any) {
      console.error('Error generating document:', error);
      alert(`Error generating document: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="document-builder">
      <div className="builder-header">
        <h2>Create New Document</h2>
        <p className="builder-subtitle">
          Select content to include and choose what to hide/remove from your generated PDF or text file
        </p>
        <div className="builder-help">
          <strong>💡 How it works:</strong> First select which content types to include (Shared, Unique A, Unique B). 
          Then use the hide/remove options below to filter out specific match types, low-confidence matches, 
          or formatting elements. The preview stats update in real-time to show what will be included.
        </div>
      </div>

      <div className="builder-content">
        {/* Document Type Selection */}
        <div className="builder-section">
          <label className="section-label">Document Format</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                value="pdf"
                checked={documentType === 'pdf'}
                onChange={(e) => setDocumentType(e.target.value as 'pdf' | 'text')}
              />
              <span>PDF Document</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                value="text"
                checked={documentType === 'text'}
                onChange={(e) => setDocumentType(e.target.value as 'pdf' | 'text')}
              />
              <span>Text File (.txt)</span>
            </label>
          </div>
        </div>

        {/* Document Title */}
        <div className="builder-section">
          <label className="section-label" htmlFor="doc-title">
            Document Title (Optional)
          </label>
          <input
            id="doc-title"
            type="text"
            className="title-input"
            placeholder="e.g., Merged Document, Comparison Report"
            value={selection.documentTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
          />
        </div>

        {/* Content Selection */}
        <div className="builder-section">
          <label className="section-label">Content to Include</label>
          <div className="checkbox-group">
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={selection.includeShared}
                onChange={() => handleToggle('includeShared')}
              />
              <div className="option-content">
                <span className="option-title">Shared Content</span>
                <span className="option-count">
                  {result.matches.filter(m => m.userOverride !== 'unique').length} lines
                </span>
              </div>
            </label>

            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={selection.includeUniqueA}
                onChange={() => handleToggle('includeUniqueA')}
              />
              <div className="option-content">
                <span className="option-title">Unique to Document A</span>
                <span className="option-count">
                  {result.uniqueA.length} lines ({docAName})
                </span>
              </div>
            </label>

            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={selection.includeUniqueB}
                onChange={() => handleToggle('includeUniqueB')}
              />
              <div className="option-content">
                <span className="option-title">Unique to Document B</span>
                <span className="option-count">
                  {result.uniqueB.length} lines ({docBName})
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Options */}
        <div className="builder-section">
          <label className="section-label">Display Options</label>
          <div className="checkbox-group">
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={selection.includePageNumbers}
                onChange={() => handleToggle('includePageNumbers')}
              />
              <span>Include page numbers</span>
            </label>

            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={selection.includeSourceInfo && !selection.hideSourceInfo}
                onChange={() => {
                  setSelection(prev => ({
                    ...prev,
                    includeSourceInfo: !prev.includeSourceInfo,
                    hideSourceInfo: prev.includeSourceInfo ? true : prev.hideSourceInfo,
                  }));
                }}
              />
              <span>Include source information</span>
            </label>
          </div>
        </div>

        {/* Hide/Remove Options */}
        <div className="builder-section hide-options">
          <label className="section-label">
            🎯 Hide/Remove Options
            <span className="section-hint">Control what to exclude from the generated document</span>
          </label>
          
          <div className="hide-options-grid">
            {/* Quick Filters */}
            <div className="hide-subsection">
              <h4 className="subsection-title">Quick Filters</h4>
              <div className="checkbox-group">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={selection.onlyShowUnique || false}
                    onChange={() => {
                      setSelection(prev => ({
                        ...prev,
                        onlyShowUnique: !prev.onlyShowUnique,
                        onlyShowShared: false,
                        includeShared: prev.onlyShowUnique ? true : prev.includeShared,
                      }));
                    }}
                  />
                  <span>Only show unique content (hide all shared)</span>
                </label>

                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={selection.onlyShowShared || false}
                    onChange={() => {
                      setSelection(prev => ({
                        ...prev,
                        onlyShowShared: !prev.onlyShowShared,
                        onlyShowUnique: false,
                        includeUniqueA: prev.onlyShowShared ? false : prev.includeUniqueA,
                        includeUniqueB: prev.onlyShowShared ? false : prev.includeUniqueB,
                      }));
                    }}
                  />
                  <span>Only show shared content (hide all unique)</span>
                </label>
              </div>
            </div>

            {/* Match Type Filters */}
            {selection.includeShared && (
              <div className="hide-subsection">
                <h4 className="subsection-title">Filter Match Types</h4>
                <div className="checkbox-group">
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={selection.hideExactMatches || false}
                      onChange={() => handleToggle('hideExactMatches')}
                    />
                    <span>Hide exact matches</span>
                  </label>

                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={selection.hideFuzzyMatches || false}
                      onChange={() => handleToggle('hideFuzzyMatches')}
                    />
                    <span>Hide fuzzy matches</span>
                  </label>

                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={selection.hideUserOverrides || false}
                      onChange={() => handleToggle('hideUserOverrides')}
                    />
                    <span>Hide user overrides</span>
                  </label>
                </div>
              </div>
            )}

            {/* Confidence Filter */}
            {selection.includeShared && (
              <div className="hide-subsection">
                <h4 className="subsection-title">Confidence Filter</h4>
                <div className="checkbox-group">
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={selection.hideLowConfidence || false}
                      onChange={() => handleToggle('hideLowConfidence')}
                    />
                    <span>Hide low confidence matches</span>
                  </label>
                </div>
                {selection.hideLowConfidence && (
                  <div className="slider-group">
                    <label className="slider-label">
                      Minimum confidence: {Math.round((selection.confidenceThreshold || 0.65) * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(selection.confidenceThreshold || 0.65) * 100}
                      onChange={(e) => {
                        setSelection(prev => ({
                          ...prev,
                          confidenceThreshold: parseInt(e.target.value) / 100,
                        }));
                      }}
                      className="confidence-slider"
                    />
                    <div className="slider-values">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Formatting Options */}
            <div className="hide-subsection">
              <h4 className="subsection-title">Formatting Options</h4>
              <div className="checkbox-group">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={selection.hideSectionHeaders || false}
                    onChange={() => handleToggle('hideSectionHeaders')}
                  />
                  <span>Hide section headers</span>
                </label>

                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={selection.hideFooters || false}
                    onChange={() => handleToggle('hideFooters')}
                  />
                  <span>Hide page footers</span>
                </label>

                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={selection.hideSourceInfo || false}
                    onChange={() => {
                      setSelection(prev => ({
                        ...prev,
                        hideSourceInfo: !prev.hideSourceInfo,
                        includeSourceInfo: prev.hideSourceInfo ? true : prev.includeSourceInfo,
                      }));
                    }}
                  />
                  <span>Hide source information section</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Stats */}
        <div className="preview-stats">
          <div className="stat-item">
            <span className="stat-label">Total Lines:</span>
            <span className="stat-value">{stats.totalLines}</span>
          </div>
          {selection.includeShared && !selection.onlyShowUnique && (
            <div className="stat-item">
              <span className="stat-label">Shared:</span>
              <span className="stat-value">{stats.sharedLines}</span>
            </div>
          )}
          {selection.includeUniqueA && !selection.onlyShowShared && (
            <div className="stat-item">
              <span className="stat-label">Unique A:</span>
              <span className="stat-value">{stats.uniqueALines}</span>
            </div>
          )}
          {selection.includeUniqueB && !selection.onlyShowShared && (
            <div className="stat-item">
              <span className="stat-label">Unique B:</span>
              <span className="stat-value">{stats.uniqueBLines}</span>
            </div>
          )}
        </div>

        {/* What Will Be Hidden Summary */}
        {(() => {
          const hiddenItems: string[] = [];
          
          if (selection.onlyShowUnique) hiddenItems.push('All shared content');
          if (selection.onlyShowShared) hiddenItems.push('All unique content');
          if (selection.hideExactMatches && selection.includeShared) hiddenItems.push('Exact matches');
          if (selection.hideFuzzyMatches && selection.includeShared) hiddenItems.push('Fuzzy matches');
          if (selection.hideUserOverrides && selection.includeShared) hiddenItems.push('User overrides');
          if (selection.hideLowConfidence && selection.includeShared) {
            hiddenItems.push(`Low confidence matches (< ${Math.round((selection.confidenceThreshold || 0.65) * 100)}%)`);
          }
          if (selection.hideSectionHeaders) hiddenItems.push('Section headers');
          if (selection.hideFooters) hiddenItems.push('Page footers');
          if (selection.hideSourceInfo) hiddenItems.push('Source information');
          
          return hiddenItems.length > 0 ? (
            <div className="hidden-summary">
              <div className="hidden-summary-header">
                <strong>🚫 Will be hidden from PDF:</strong>
              </div>
              <ul className="hidden-list">
                {hiddenItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null;
        })()}

        {/* Generate Button */}
        <button
          className="generate-button"
          onClick={handleGenerate}
          disabled={isGenerating || stats.totalLines === 0}
        >
          {isGenerating ? 'Generating...' : `Generate ${documentType.toUpperCase()} Document`}
        </button>

        {stats.totalLines === 0 && (
          <p className="warning-text">
            ⚠️ Please select at least one content type to include.
          </p>
        )}

        <TipsPanel context="builder" />
      </div>

      <style jsx>{`
        .document-builder {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
                      0 0 0 1px rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.3);
          margin-top: 2rem;
          animation: fadeIn 0.6s ease-out;
          position: relative;
          overflow: hidden;
        }

        .document-builder::before {
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

        .builder-header {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid rgba(102, 126, 234, 0.2);
          position: relative;
          z-index: 1;
        }

        .builder-header h2 {
          margin: 0 0 0.5rem 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1.75rem;
          font-weight: 800;
        }

        .builder-subtitle {
          margin: 0 0 1rem 0;
          color: #666;
          font-size: 0.95rem;
        }

        .builder-help {
          margin-top: 1rem;
          padding: 1rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          border-radius: 8px;
          border: 1px solid rgba(102, 126, 234, 0.2);
          font-size: 0.9rem;
          line-height: 1.6;
          color: #333;
        }

        .builder-help strong {
          color: #667eea;
        }

        .builder-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .builder-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .section-label {
          font-weight: 600;
          color: #333;
          font-size: 0.95rem;
        }

        .title-input {
          padding: 0.875rem 1rem;
          border: 2px solid rgba(102, 126, 234, 0.2);
          border-radius: 12px;
          font-size: 0.95rem;
          font-family: inherit;
          background: rgba(255, 255, 255, 0.9);
          transition: all 0.3s ease;
        }

        .title-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          background: rgba(255, 255, 255, 1);
        }

        .radio-group,
        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .radio-option,
        .checkbox-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 1rem;
          border-radius: 12px;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.6);
          border: 2px solid rgba(102, 126, 234, 0.1);
        }

        .radio-option:hover,
        .checkbox-option:hover {
          background: rgba(102, 126, 234, 0.05);
          border-color: rgba(102, 126, 234, 0.3);
          transform: translateX(4px);
        }

        .radio-option input,
        .checkbox-option input {
          cursor: pointer;
          width: 18px;
          height: 18px;
        }

        .option-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .option-title {
          font-weight: 500;
          color: #333;
        }

        .option-count {
          font-size: 0.85rem;
          color: #666;
        }

        .preview-stats {
          display: flex;
          gap: 1.5rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-radius: 16px;
          flex-wrap: wrap;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .stat-item {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .stat-label {
          font-weight: 600;
          color: #333;
        }

        .stat-value {
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1.1rem;
        }

        .generate-button {
          padding: 1.25rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
          position: relative;
          overflow: hidden;
          letter-spacing: 0.5px;
        }

        .generate-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .generate-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(102, 126, 234, 0.6);
        }

        .generate-button:hover:not(:disabled)::before {
          left: 100%;
        }

        .generate-button:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .generate-button:disabled {
          background: linear-gradient(135deg, #ccc 0%, #aaa 100%);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
          opacity: 0.6;
        }

        .warning-text {
          margin: 0.5rem 0 0 0;
          color: #e67e22;
          font-size: 0.9rem;
          text-align: center;
        }

        .hide-options {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .section-hint {
          display: block;
          font-size: 0.85rem;
          font-weight: 400;
          color: #666;
          margin-top: 0.25rem;
        }

        .hide-options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .hide-subsection {
          background: rgba(255, 255, 255, 0.6);
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .subsection-title {
          margin: 0 0 0.75rem 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: #333;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .slider-group {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(102, 126, 234, 0.2);
        }

        .slider-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .confidence-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: rgba(102, 126, 234, 0.2);
          outline: none;
          -webkit-appearance: none;
          margin: 0.5rem 0;
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

        .slider-values {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #666;
          margin-top: 0.25rem;
        }

        .hidden-summary {
          margin-top: 1.5rem;
          padding: 1.25rem;
          background: linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(192, 57, 43, 0.1) 100%);
          border-left: 4px solid #e74c3c;
          border-radius: 12px;
          animation: slideIn 0.3s ease-out;
        }

        .hidden-summary-header {
          margin-bottom: 0.75rem;
          color: #e74c3c;
          font-size: 0.95rem;
        }

        .hidden-list {
          margin: 0;
          padding-left: 1.5rem;
          list-style: none;
        }

        .hidden-list li {
          margin-bottom: 0.5rem;
          color: #666;
          font-size: 0.9rem;
          position: relative;
          padding-left: 1.5rem;
        }

        .hidden-list li::before {
          content: '✕';
          position: absolute;
          left: 0;
          color: #e74c3c;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .document-builder {
            padding: 1.5rem;
          }

          .preview-stats {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}

