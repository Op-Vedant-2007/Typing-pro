import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export interface ThemeOption {
  id: string;
  name: string;
  bg: string;
  accent: string;
  card: string;
}

export const AVAILABLE_THEMES: ThemeOption[] = [
  { id: 'serika-dark', name: 'Serika Dark (Monkeytype)', bg: '#323437', accent: '#e2b714', card: '#2c2e31' },
  { id: 'carbon', name: 'Carbon', bg: '#1e1e1e', accent: '#f66e0d', card: '#252525' },
  { id: 'dracula', name: 'Dracula', bg: '#282a36', accent: '#bd93f9', card: '#343746' },
  { id: 'matrix', name: 'Matrix', bg: '#000000', accent: '#15ff00', card: '#121812' },
  { id: 'nord', name: 'Nord', bg: '#2e3440', accent: '#88c0d0', card: '#3b4252' },
  { id: 'minimal-light', name: 'Minimal Light', bg: '#f8fafc', accent: '#e2b714', card: '#ffffff' },
];

interface ThemeContextType {
  theme: string;
  setTheme: (t: string) => void;
  fontSize: string;
  setFontSize: (s: string) => void;
  fontFamily: string;
  setFontFamily: (f: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, updateSettings } = useAuth();

  const [theme, setThemeState] = useState<string>(() => {
    return localStorage.getItem('typeflow_theme') || 'serika-dark';
  });

  const [fontSize, setFontSizeState] = useState<string>(() => {
    return localStorage.getItem('typeflow_font_size') || 'large';
  });

  const [fontFamily, setFontFamilyState] = useState<string>(() => {
    return localStorage.getItem('typeflow_font_family') || 'Roboto Mono';
  });

  // Sync from userSettings if logged in
  useEffect(() => {
    if (settings) {
      if (settings.theme && settings.theme !== theme) setThemeState(settings.theme);
      if (settings.fontSize && settings.fontSize !== fontSize) setFontSizeState(settings.fontSize);
      if (settings.fontFamily && settings.fontFamily !== fontFamily) setFontFamilyState(settings.fontFamily);
    }
  }, [settings]);

  // Apply theme class to documentElement
  useEffect(() => {
    const root = document.documentElement;
    AVAILABLE_THEMES.forEach((t) => {
      root.classList.remove(t.id);
    });
    root.classList.remove('typeflow-dark');
    root.classList.add(theme);
    localStorage.setItem('typeflow_theme', theme);
  }, [theme]);

  // Apply font family CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--font-mono', `'${fontFamily}', monospace`);
    localStorage.setItem('typeflow_font_family', fontFamily);
  }, [fontFamily]);

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    if (settings) updateSettings({ theme: newTheme });
  };

  const setFontSize = (newSize: string) => {
    setFontSizeState(newSize);
    localStorage.setItem('typeflow_font_size', newSize);
    if (settings) updateSettings({ fontSize: newSize });
  };

  const setFontFamily = (newFont: string) => {
    setFontFamilyState(newFont);
    if (settings) updateSettings({ fontFamily: newFont });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
