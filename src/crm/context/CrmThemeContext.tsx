import React, { createContext, useContext, useState, useEffect } from 'react';

type CrmTheme = 'dark' | 'light';

interface CrmThemeContextType {
  theme: CrmTheme;
  setTheme: (theme: CrmTheme) => void;
  toggleTheme: () => void;
}

const CrmThemeContext = createContext<CrmThemeContextType | undefined>(undefined);

export const CrmThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<CrmTheme>(() => {
    const saved = localStorage.getItem('pakinvest_crm_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('pakinvest_crm_theme', theme);
  }, [theme]);

  const setTheme = (newTheme: CrmTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <CrmThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </CrmThemeContext.Provider>
  );
};

export const useCrmTheme = (): CrmThemeContextType => {
  const context = useContext(CrmThemeContext);
  if (!context) {
    throw new Error('useCrmTheme must be used within a CrmThemeProvider');
  }
  return context;
};
