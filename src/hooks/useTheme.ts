import { useState, useEffect } from 'react';

export const THEMES = ['tomato', 'crimson', 'maple', 'rouge', 'bordeaux', 'matcha', 'navy', 'cocoa'] as const;
export type Theme = (typeof THEMES)[number];

const STORAGE_KEY = 'app.theme';
const DEFAULT_THEME: Theme = 'tomato';

export const THEME_ACCENTS: Record<Theme, string> = {
  tomato:   'rgb(232 79 42)',
  crimson:  'rgb(199 62 90)',
  maple:    'rgb(224 122 31)',
  rouge:    'rgb(209 77 110)',
  bordeaux: 'rgb(142 42 58)',
  matcha:   'rgb(63 142 92)',
  navy:     'rgb(31 58 95)',
  cocoa:    'rgb(61 36 24)',
};

function readStored(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && (THEMES as readonly string[]).includes(v)) return v as Theme;
  } catch { /* ignore */ }
  return DEFAULT_THEME;
}

export function initTheme() {
  document.documentElement.setAttribute('data-ch-theme', readStored());
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>(readStored);

  useEffect(() => {
    document.documentElement.setAttribute('data-ch-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  return [theme, setThemeState];
}
