'use client';

export type Theme = 'light' | 'dark' | 'system';

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem('theme') as Theme | null;
  return stored || 'system';
}

export function getEffectiveTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const theme = getTheme();
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

export function setTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('theme', theme);
  applyTheme(theme);
}

export function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  const effective = theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(effective);
  document.documentElement.setAttribute('data-theme', effective);
}

