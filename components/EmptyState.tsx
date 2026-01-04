'use client';

interface EmptyStateProps {
  type?: 'no-matches' | 'no-results' | 'no-files';
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ type = 'no-results', message, action }: EmptyStateProps) {
  const content = {
    'no-matches': {
      icon: '🔍',
      title: 'No Matches Found',
      defaultMessage: 'No matching content found between the documents. They may be completely different.',
      suggestions: [
        'Try adjusting the confidence threshold',
        'Check if the documents are in the correct format',
        'Verify that both documents contain text (not just images)',
      ],
    },
    'no-results': {
      icon: '📄',
      title: 'No Results Yet',
      defaultMessage: 'Upload two PDF files to start comparing documents.',
      suggestions: [
        'Drag and drop PDF files onto the upload boxes',
        'Or click to browse and select files',
        'Make sure both files are valid PDF documents',
      ],
    },
    'no-files': {
      icon: '📁',
      title: 'No Files Selected',
      defaultMessage: 'Please select two PDF files to compare.',
      suggestions: [
        'Select Document A and Document B',
        'Both files must be PDF format',
        'Files will be processed client-side for privacy',
      ],
    },
  };

  const current = content[type];

  return (
    <div className="empty-state">
      <div className="empty-icon">{current.icon}</div>
      <h3 className="empty-title">{current.title}</h3>
      <p className="empty-message">{message || current.defaultMessage}</p>
      <div className="empty-suggestions">
        <strong>💡 Suggestions:</strong>
        <ul>
          {current.suggestions.map((suggestion, idx) => (
            <li key={idx}>{suggestion}</li>
          ))}
        </ul>
      </div>
      {action && (
        <button className="empty-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
      <style jsx>{`
        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(102, 126, 234, 0.2);
          animation: fadeIn 0.6s ease-out;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: pulse 2s ease-in-out infinite;
        }

        .empty-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          margin: 0 0 1rem 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .empty-message {
          font-size: 1rem;
          color: #666;
          margin: 0 0 1.5rem 0;
          line-height: 1.6;
        }

        .empty-suggestions {
          background: rgba(102, 126, 234, 0.05);
          border-radius: 12px;
          padding: 1.5rem;
          margin: 1.5rem 0;
          text-align: left;
        }

        .empty-suggestions strong {
          display: block;
          color: #667eea;
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }

        .empty-suggestions ul {
          margin: 0;
          padding-left: 1.5rem;
          color: #666;
          line-height: 2;
        }

        .empty-suggestions li {
          margin-bottom: 0.5rem;
        }

        .empty-action {
          margin-top: 1.5rem;
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .empty-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
      `}</style>
    </div>
  );
}

