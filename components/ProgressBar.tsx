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
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
                      0 0 0 1px rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.3);
          animation: fadeIn 0.5s ease-out;
          position: relative;
          overflow: hidden;
        }

        .progress-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .progress-message {
          font-size: 1.2rem;
          font-weight: 600;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1.5rem;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .progress-bar-outer {
          width: 100%;
          height: 32px;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 0.75rem;
          position: relative;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 2px solid rgba(102, 126, 234, 0.2);
        }

        .progress-bar-inner {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          background-size: 200% 100%;
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 14px;
          position: relative;
          animation: progressShine 2s linear infinite;
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.5),
                      inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        @keyframes progressShine {
          0% {
            background-position: 0% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .progress-bar-inner::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: sweep 1.5s infinite;
        }

        @keyframes sweep {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .progress-percentage {
          text-align: center;
          font-size: 1.1rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  );
}

