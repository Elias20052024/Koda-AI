import { useEffect, useState } from 'react';

type Theme = 'dark';

export function useTheme() {
  // Force dark theme application-wide. Keep API shape for compatibility.
  const [theme, _setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('dark');
  }, []);

  const setTheme = (_: Theme) => {
    // noop - light mode removed
  };

  const toggleTheme = () => {
    // noop - light mode removed
  };

  return { theme, setTheme, toggleTheme };
}
