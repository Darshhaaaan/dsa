import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

export type Theme = 'cherry' | 'orchid';

const KEY = 'dsa-guru-theme';

function initialTheme(): Theme {
  try {
    return localStorage.getItem(KEY) === 'orchid' ? 'orchid' : 'cherry';
  } catch {
    return 'cherry';
  }
}

const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const timer = useRef<number>();

  const apply = useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next;
    document.documentElement.classList.add('theme-shifting');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'orchid' ? '#EFEFEF' : '#f2f7f9');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => document.documentElement.classList.remove('theme-shifting'), 340);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Storage can be disabled; the theme still applies for this session.
    }
    setTheme(next);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const value = useMemo(() => ({
    theme,
    toggle: () => apply(theme === 'cherry' ? 'orchid' : 'cherry'),
  }), [theme, apply]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
