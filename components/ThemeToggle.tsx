'use client';

import { useState, useEffect } from 'react';
import { getTheme, setTheme, applyTheme, getEffectiveTheme, type Theme } from '@/lib/theme';

export function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const theme = getTheme();
    setCurrentTheme(theme);
    applyTheme(theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (currentTheme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [currentTheme]);

  const handleThemeChange = (theme: Theme) => {
    setTheme(theme);
    setCurrentTheme(theme);
  };

  if (!mounted) {
    return (
      <div className="theme-toggle">
        <div className="theme-toggle-skeleton"></div>
        <style jsx>{`
          .theme-toggle-skeleton {
            width: 120px;
            height: 36px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 8px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="theme-toggle">
      <button
        className={`theme-btn ${currentTheme === 'light' ? 'active' : ''}`}
        onClick={() => handleThemeChange('light')}
        title="Light mode"
        aria-label="Light mode"
      >
        ☀️
      </button>
      <button
        className={`theme-btn ${currentTheme === 'dark' ? 'active' : ''}`}
        onClick={() => handleThemeChange('dark')}
        title="Dark mode"
        aria-label="Dark mode"
      >
        🌙
      </button>
      <button
        className={`theme-btn ${currentTheme === 'system' ? 'active' : ''}`}
        onClick={() => handleThemeChange('system')}
        title="System preference"
        aria-label="System preference"
      >
        💻
      </button>
      <style jsx>{`
        .theme-toggle {
          display: flex;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 0.25rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .theme-btn {
          background: transparent;
          border: none;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.1rem;
          transition: all 0.2s;
          color: inherit;
        }

        .theme-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.1);
        }

        .theme-btn.active {
          background: rgba(102, 126, 234, 0.3);
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        :global([data-theme='dark']) .theme-toggle {
          background: rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}

