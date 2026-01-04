'use client';

import { useState, useRef } from 'react';
import { isPdfFile, formatFileSize } from '@/lib/extract';

interface FileUploadProps {
  onFilesSelected: (fileA: File, fileB: File) => void;
  disabled?: boolean;
}

export function FileUpload({ onFilesSelected, disabled }: FileUploadProps) {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ a?: string; b?: string }>({});
  
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

  const canSubmit = fileA && fileB && !disabled;

  return (
    <div className="upload-container">
      <div className="upload-grid">
        {/* Document A Upload */}
        <div className="upload-box">
          <label className="upload-label">Document A</label>
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
        <div className="upload-box">
          <label className="upload-label">Document B</label>
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

      <style jsx>{`
        .upload-container {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .upload-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 1.5rem;
        }

        .upload-box {
          border: 2px dashed #ddd;
          border-radius: 8px;
          padding: 1.5rem;
          transition: border-color 0.2s;
        }

        .upload-box:hover {
          border-color: #0070f3;
        }

        .upload-label {
          display: block;
          font-weight: 600;
          font-size: 1.1rem;
          margin-bottom: 1rem;
          color: #333;
        }

        .file-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.95rem;
        }

        .file-input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .file-info {
          margin-top: 1rem;
          padding: 0.75rem;
          background: #f8f8f8;
          border-radius: 4px;
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
          padding: 1rem 2rem;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .submit-button:hover:not(:disabled) {
          background: #0051cc;
        }

        .submit-button:disabled {
          background: #ccc;
          cursor: not-allowed;
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

