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
  { id: 'typeflow-dark', name: 'TypeFlow Dark', bg: '#0e1117', accent: '#8b5cf6', card: '#1b2129' },
  { id: 'midnight-cyber', name: 'Midnight Cyber', bg: '#080c14', accent: '#06b6d4', card: '#131e30' },
  { id: 'retro-amber', name: 'Retro Amber', bg: '#120f0c', accent: '#f59e0b', card: '#241c16' },
  { id: 'forest-mint', name: 'Forest Mint', bg: '#0b1411', accent: '#10b981', card: '#182823' },
  { id: 'dracula-night', name: 'Dracula Night', bg: '#1e1f29', accent: '#ff79c6', card: '#343746' },
  { id: 'minimal-light', name: 'Minimal Light', bg: '#f8fafc', accent: '#6366f1', card: '#ffffff' },
];

interface ThemeContextType {
  theme: string;
  setTheme: (t: string) => void;
  fontSize: string;
  setFontSize: (s: string) => void;
  fontFamily: string;
  setFontFamily: (f: string) => void;
  caretStyle: string;
  setCaretStyle: (c: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, updateSettings } = useAuth();

  const [theme, setThemeState] = useState<string>(() => {
    return localStorage.getItem('typeflow_theme') || 'typeflow-dark';
  });

  const [fontSize, setFontSizeState] = useState<string>(() => {
    return localStorage.getItem('typeflow_font_size') || 'medium';
  });

  const [fontFamily, setFontFamilyState] = useState<string>(() => {
    return localStorage.getItem('typeflow_font_family') || 'JetBrains Mono';
  });

  const [caretStyle, setCaretStyleState] = useState<string>(() => {
    return localStorage.getItem('typeflow_caret_style') || 'line';
  });

  // Sync from userSettings if logged in
  useEffect(() => {
    if (settings) {
      if (settings.theme && settings.theme !== theme) setThemeState(settings.theme);
      if (settings.fontSize && settings.fontSize !== fontSize) setFontSizeState(settings.fontSize);
      if (settings.fontFamily && settings.fontFamily !== fontFamily) setFontFamilyState(settings.fontFamily);
      if (settings.caretStyle && settings.caretStyle !== caretStyle) setCaretStyleState(settings.caretStyle);
    }
  }, [settings]);

  // Apply theme class to documentElement
  useEffect(() => {
    const root = document.documentElement;
    AVAILABLE_THEMES.forEach((t) => root.classList.remove(t.id));
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

  const setCaretStyle = (newCaret: string) => {
    setCaretStyleState(newCaret);
    localStorage.setItem('typeflow_caret_style', newCaret);
    if (settings) updateSettings({ caretStyle: newCaret });
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
        caretStyle,
        setCaretStyle,
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
