import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors } from '../constants/Colors';
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
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme_mode');
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setMode(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    
    loadThemePreference();
  }, []);
  
  // Determine the actual theme to use (accounting for system preference)
  const isDark = mode === 'system' 
    ? systemColorScheme === 'dark' 
    : mode === 'dark';
  
  // Get the appropriate colors based on the current theme
  const colors = isDark ? darkColors : lightColors;
  
  // Set the theme mode and save preference
  const setTheme = async (newMode: ThemeMode) => {
    setMode(newMode);
    try {
      await AsyncStorage.setItem('theme_mode', newMode);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };
  
  // Toggle between light and dark theme
  const toggleTheme = () => {
    const newMode = mode === 'system' 
      ? (systemColorScheme === 'dark' ? 'light' : 'dark')
      : (mode === 'dark' ? 'light' : 'dark');
    setTheme(newMode);
  };
  
  // Apply theme-specific styles or preferences
  useEffect(() => {
    // Here you could apply any theme-specific logic, like status bar color
  }, [isDark]);
  
  // Don't render until theme is initialized
  if (!isInitialized) {
    return null;
  }
  
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
