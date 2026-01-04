'use client';

interface ProgressBarProps {
  progress: number;
  message: string;
}

export function ProgressBar({ progress, message }: ProgressBarProps) {
  return (
    <div className="progress-container">
      <div className="progress-message">{message}</div>
      <div className="progress-bar-outer">
        <div 
          className="progress-bar-inner" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="progress-percentage">{Math.round(progress)}%</div>

      <style jsx>{`
        .progress-container {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .progress-message {
          font-size: 1.1rem;
          font-weight: 500;
          color: #333;
          margin-bottom: 1rem;
          text-align: center;
        }

        .progress-bar-outer {
          width: 100%;
          height: 24px;
          background: #f0f0f0;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-bar-inner {
          height: 100%;
          background: linear-gradient(90deg, #0070f3 0%, #00a8ff 100%);
          transition: width 0.3s ease;
          border-radius: 12px;
        }

        .progress-percentage {
          text-align: center;
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

