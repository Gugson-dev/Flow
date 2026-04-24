import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { Theme } from '../types';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme');
    return (saved as Theme) || 'black';
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    const saved = localStorage.getItem('app-user-email');
    return saved || '';
  });

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('app-user-email', userEmail);
  }, [userEmail]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, userEmail, setUserEmail }}>
      {children}
    </ThemeContext.Provider>
  );
}

