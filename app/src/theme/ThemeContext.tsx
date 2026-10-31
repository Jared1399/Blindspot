import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeColors, light, dark } from './colors';

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: light,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const value = useMemo(() => ({
    colors: isDark ? dark : light,
    isDark,
  }), [isDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
