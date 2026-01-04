'use client';

import { useState } from 'react';
import { ProcessingResult } from '@/lib/types';
import { DocumentSelection } from '@/lib/types';
import { generateDocument, generateTextDocument, getContentStats } from '@/lib/documentGenerator';

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
          Select content to include in your new document
        </p>
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
          <label className="section-label">Options</label>
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
                checked={selection.includeSourceInfo}
                onChange={() => handleToggle('includeSourceInfo')}
              />
              <span>Include source information</span>
            </label>
          </div>
        </div>

        {/* Preview Stats */}
        <div className="preview-stats">
          <div className="stat-item">
            <span className="stat-label">Total Lines:</span>
            <span className="stat-value">{stats.totalLines}</span>
          </div>
          {selection.includeShared && (
            <div className="stat-item">
              <span className="stat-label">Shared:</span>
              <span className="stat-value">{stats.sharedLines}</span>
            </div>
          )}
          {selection.includeUniqueA && (
            <div className="stat-item">
              <span className="stat-label">Unique A:</span>
              <span className="stat-value">{stats.uniqueALines}</span>
            </div>
          )}
          {selection.includeUniqueB && (
            <div className="stat-item">
              <span className="stat-label">Unique B:</span>
              <span className="stat-value">{stats.uniqueBLines}</span>
            </div>
          )}
        </div>

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
      </div>

      <style jsx>{`
        .document-builder {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-top: 2rem;
        }

        .builder-header {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .builder-header h2 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.5rem;
        }

        .builder-subtitle {
          margin: 0;
          color: #666;
          font-size: 0.95rem;
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
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.95rem;
          font-family: inherit;
        }

        .title-input:focus {
          outline: none;
          border-color: #0070f3;
          box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.1);
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
          padding: 0.75rem;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .radio-option:hover,
        .checkbox-option:hover {
          background: #f8f9fa;
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
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          gap: 0.5rem;
        }

        .stat-label {
          font-weight: 500;
          color: #666;
        }

        .stat-value {
          font-weight: 600;
          color: #0070f3;
        }

        .generate-button {
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .generate-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .generate-button:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        .warning-text {
          margin: 0.5rem 0 0 0;
          color: #e67e22;
          font-size: 0.9rem;
          text-align: center;
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

