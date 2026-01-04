'use client';

import { useState, useRef } from 'react';
import { isPdfFile, formatFileSize } from '@/lib/extract';
import { TipsPanel } from './TipsPanel';

interface FileUploadProps {
  onFilesSelected: (fileA: File, fileB: File) => void;
  disabled?: boolean;
}

export function FileUpload({ onFilesSelected, disabled }: FileUploadProps) {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ a?: string; b?: string }>({});
  const [dragOver, setDragOver] = useState<'A' | 'B' | null>(null);
  
  const inputARef = useRef<HTMLInputElement>(null);
  const inputBRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (docId: 'A' | 'B', file: File | null) => {
    if (!file) {
      if (docId === 'A') setFileA(null);
      else setFileB(null);
      return;
    }

    // Validate PDF
    if (!isPdfFile(file)) {
      setErrors(prev => ({
        ...prev,
        [docId.toLowerCase()]: 'Please upload a PDF file',
      }));
      return;
    }

    // Clear error and set file
    setErrors(prev => ({ ...prev, [docId.toLowerCase()]: undefined }));
    if (docId === 'A') setFileA(file);
    else setFileB(file);
  };

  const handleSubmit = () => {
    if (fileA && fileB) {
      onFilesSelected(fileA, fileB);
    }
  };

  const handleDragOver = (e: React.DragEvent, docId: 'A' | 'B') => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragOver(docId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, docId: 'A' | 'B') => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(f => isPdfFile(f));
    
    if (pdfFile) {
      handleFileChange(docId, pdfFile);
    } else if (files.length > 0) {
      setErrors(prev => ({
        ...prev,
        [docId.toLowerCase()]: 'Please drop a PDF file',
      }));
    }
  };

  const canSubmit = fileA && fileB && !disabled;

  return (
    <div className="upload-container">
      <div className="upload-instructions">
        <h3 className="instructions-title">📖 Getting Started</h3>
        <ol className="instructions-list">
          <li>Upload two PDF documents you want to compare</li>
          <li>Drag & drop files or click to browse</li>
          <li>Click &quot;Compare Documents&quot; to start analysis</li>
          <li>Review matches, unique content, and statistics</li>
        </ol>
      </div>

      <div className="upload-grid">
        {/* Document A Upload */}
        <div 
          className={`upload-box ${dragOver === 'A' ? 'drag-over' : ''} ${fileA ? 'has-file' : ''}`}
          onDragOver={(e) => handleDragOver(e, 'A')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'A')}
        >
          <label className="upload-label">
            Document A
            <span className="drag-hint">📁 Drag & drop or click to upload</span>
          </label>
          <input
            ref={inputARef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => handleFileChange('A', e.target.files?.[0] || null)}
            disabled={disabled}
            className="file-input"
          />
          {fileA && (
            <div className="file-info">
              <div className="file-name">{fileA.name}</div>
              <div className="file-size">{formatFileSize(fileA.size)}</div>
            </div>
          )}
          {errors.a && <div className="error-message">{errors.a}</div>}
        </div>

        {/* Document B Upload */}
        <div 
          className={`upload-box ${dragOver === 'B' ? 'drag-over' : ''} ${fileB ? 'has-file' : ''}`}
          onDragOver={(e) => handleDragOver(e, 'B')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'B')}
        >
          <label className="upload-label">
            Document B
            <span className="drag-hint">📁 Drag & drop or click to upload</span>
          </label>
          <input
            ref={inputBRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => handleFileChange('B', e.target.files?.[0] || null)}
            disabled={disabled}
            className="file-input"
          />
          {fileB && (
            <div className="file-info">
              <div className="file-name">{fileB.name}</div>
              <div className="file-size">{formatFileSize(fileB.size)}</div>
            </div>
          )}
          {errors.b && <div className="error-message">{errors.b}</div>}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="submit-button"
      >
        Compare Documents
      </button>

      <TipsPanel context="upload" />

      <style jsx>{`
        .upload-container {
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

        .upload-instructions {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .instructions-title {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }

        .instructions-list {
          margin: 0;
          padding-left: 1.5rem;
          color: #333;
          line-height: 2;
        }

        .instructions-list li {
          margin-bottom: 0.5rem;
        }

        .upload-container::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
          animation: rotate 20s linear infinite;
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .upload-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 1.5rem;
          position: relative;
          z-index: 1;
        }

        .upload-box {
          border: 3px dashed rgba(102, 126, 234, 0.4);
          border-radius: 16px;
          padding: 2rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%);
          position: relative;
          overflow: hidden;
        }

        .upload-box::before {
          content: '📄';
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 2rem;
          opacity: 0.2;
          animation: pulse 3s ease-in-out infinite;
        }

        .upload-box:hover {
          border-color: #667eea;
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(102, 126, 234, 0.3);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%);
        }

        .upload-box.drag-over {
          border-color: #667eea;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
          transform: scale(1.02);
          box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
        }

        .upload-box.has-file {
          border-color: #10b981;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(255, 255, 255, 0.8) 100%);
        }

        .drag-hint {
          display: block;
          font-size: 0.85rem;
          font-weight: 400;
          color: #666;
          margin-top: 0.5rem;
          opacity: 0.8;
        }

        .upload-label {
          display: block;
          font-weight: 700;
          font-size: 1.2rem;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
          z-index: 1;
        }

        .file-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid rgba(102, 126, 234, 0.2);
          border-radius: 12px;
          font-size: 0.95rem;
          background: rgba(255, 255, 255, 0.9);
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .file-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          background: rgba(255, 255, 255, 1);
        }

        .file-input:disabled {
          background: rgba(245, 245, 245, 0.8);
          cursor: not-allowed;
          opacity: 0.6;
        }

        .file-info {
          margin-top: 1rem;
          padding: 1rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-radius: 12px;
          border: 1px solid rgba(102, 126, 234, 0.2);
          animation: slideIn 0.3s ease-out;
          position: relative;
          z-index: 1;
        }

        .file-name {
          font-weight: 500;
          color: #333;
          margin-bottom: 0.25rem;
          word-break: break-word;
        }

        .file-size {
          font-size: 0.85rem;
          color: #666;
        }

        .error-message {
          margin-top: 0.5rem;
          color: #e00;
          font-size: 0.9rem;
        }

        .submit-button {
          width: 100%;
          padding: 1.25rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
          position: relative;
          overflow: hidden;
          z-index: 1;
          letter-spacing: 0.5px;
        }

        .submit-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(102, 126, 234, 0.6);
        }

        .submit-button:hover:not(:disabled)::before {
          left: 100%;
        }

        .submit-button:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .submit-button:disabled {
          background: linear-gradient(135deg, #ccc 0%, #aaa 100%);
          cursor: not-allowed;
          box-shadow: none;
          opacity: 0.6;
        }

        @media (max-width: 768px) {
          .upload-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

