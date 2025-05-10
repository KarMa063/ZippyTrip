import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of the context
interface GlobalThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Create the context
const GlobalThemeContext = createContext<GlobalThemeContextType | undefined>(undefined);

// Global theme provider component
export const GlobalThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from local storage or default to light mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('globalTheme');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  // Persist theme to local storage and apply theme classes
  useEffect(() => {
    localStorage.setItem('globalTheme', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#1a1a1a';
      document.body.style.color = '#ffffff';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }
  }, [isDarkMode]);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <GlobalThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </GlobalThemeContext.Provider>
  );
};

// Custom hook to use the global theme context
export const useGlobalTheme = (): GlobalThemeContextType => {
  const context = useContext(GlobalThemeContext);
  if (!context) {
    throw new Error('useGlobalTheme must be used within a GlobalThemeProvider');
  }
  return context;
};