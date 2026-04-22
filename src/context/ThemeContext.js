import React, { createContext, useState, useEffect, useCallback } from 'react';

export const ThemeContext = createContext({
  isDarkMode: true,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // initialize from localStorage or system preference (runs only on client)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('isDarkMode');
      if (saved !== null) {
        setIsDarkMode(saved === 'true');
        return;
      }
    } catch (e) {
      // ignore (e.g. SSR or blocked storage)
    }

    // fallback to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, []);

  // persist when it changes
  useEffect(() => {
    try {
      localStorage.setItem('isDarkMode', isDarkMode ? 'true' : 'false');
    } catch (e) {
      // ignore
    }
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};