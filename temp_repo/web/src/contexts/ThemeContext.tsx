import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  companyName: string;
  setCompanyName: (name: string) => void;
  logoUrl: string;
  setLogoUrl: (url: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme_mode');
    return saved === 'dark';
  });

  const [companyName, setCompanyName] = useState(() => {
    return localStorage.getItem('company_name') || 'QuepasaManager';
  });

  const [logoUrl, setLogoUrl] = useState(() => {
    return localStorage.getItem('logo_url') || '/logoastra.png';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme_mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme_mode', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('company_name', companyName);
    document.title = companyName;
  }, [companyName]);

  useEffect(() => {
    localStorage.setItem('logo_url', logoUrl);
  }, [logoUrl]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        companyName,
        setCompanyName,
        logoUrl,
        setLogoUrl,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
