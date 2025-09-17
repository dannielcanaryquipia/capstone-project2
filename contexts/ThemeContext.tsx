import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ColorsType } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import * as Styles from '../constants/Styles';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextType = {
  mode: ThemeMode;
  colors: typeof lightColors | typeof darkColors;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
  initialTheme?: ThemeMode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = 'system',
}) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(initialTheme);
  
  // Determine the actual theme to use (accounting for system preference)
  const isDark = mode === 'system' 
    ? systemColorScheme === 'dark' 
    : mode === 'dark';
  
  // Get the appropriate colors based on the current theme
  const colors = isDark ? darkColors : lightColors;
  
  // Set the theme mode
  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    // Here you could save the preference to AsyncStorage or your state management
  };
  
  // Toggle between light and dark theme
  const toggleTheme = () => {
    setMode(prevMode => {
      if (prevMode === 'system') {
        return systemColorScheme === 'dark' ? 'light' : 'dark';
      }
      return prevMode === 'dark' ? 'light' : 'dark';
    });
  };
  
  // Apply theme-specific styles or preferences
  useEffect(() => {
    // Here you could apply any theme-specific logic, like status bar color
  }, [isDark]);
  
  const value = {
    mode,
    colors,
    isDark,
    setTheme,
    toggleTheme,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export all theme-related values and styles
export const useAppTheme = () => {
  const { colors, isDark } = useTheme();
  
  return {
    colors,
    isDark,
    Layout,
    ...Styles,
  };
};

export default ThemeContext;
