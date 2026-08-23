'use client';

// Lightweight theme (light/dark) for the storefront. Mirrors the vendor app's
// mechanism: toggles a `dark` class on <html> and persists to localStorage
// ('qlozet_theme'). Colours swap via CSS tokens in globals.css (the shop uses
// inline styles, so Tailwind `dark:` variants aren't an option here). A no-flash
// inline script in the root layout applies the stored theme before paint.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const STORAGE_KEY = 'qlozet_theme';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Seed from the class the no-flash script already applied (avoids a flip on
  // hydration). Falls back to light during SSR.
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const isDark =
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark');
    setThemeState(isDark ? 'dark' : 'light');
  }, []);

  const apply = useCallback((t: Theme) => {
    const html = document.documentElement;
    html.classList.toggle('dark', t === 'dark');
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* storage may be unavailable (private mode) — theme still applies for the session */
    }
    setThemeState(t);
  }, []);

  const toggle = useCallback(
    () => apply(theme === 'dark' ? 'light' : 'dark'),
    [apply, theme],
  );

  return (
    <ThemeContext.Provider
      value={{ theme, isDark: theme === 'dark', toggle, setTheme: apply }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}

// Inline script (stringified) for the root layout <head>: applies the stored
// theme before first paint so there's no light-flash on a dark reload. Default
// follows the OS setting on first visit.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;
