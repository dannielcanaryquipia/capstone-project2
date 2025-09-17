import { useColorScheme } from 'react-native';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

type Theme = typeof DefaultTheme & {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    success: string;
    error: string;
    warning: string;
    muted: string;
    lightGray: string;
    mediumGray: string;
    darkGray: string;
    white: string;
    black: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  fontWeight: {
    regular: string;
    medium: string;
    semiBold: string;
    bold: string;
  };
};

const lightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF6B6B',
    secondary: '#4A90E2',
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#333333',
    border: '#E0E0E0',
    notification: '#FF3B30',
    success: '#4CAF50',
    error: '#FF3B30',
    warning: '#FFA000',
    muted: '#9E9E9E',
    lightGray: '#F5F5F5',
    mediumGray: '#E0E0E0',
    darkGray: '#757575',
    white: '#FFFFFF',
    black: '#000000',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

const darkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#FF8A80',
    secondary: '#82B1FF',
    background: '#121212',
    card: '#1E1E1E',
    text: '#E0E0E0',
    border: '#333333',
    notification: '#FF6E6E',
    success: '#66BB6A',
    error: '#FF6E6E',
    warning: '#FFCA28',
    muted: '#9E9E9E',
    lightGray: '#2D2D2D',
    mediumGray: '#424242',
    darkGray: '#BDBDBD',
    white: '#FFFFFF',
    black: '#000000',
  },
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  fontSize: lightTheme.fontSize,
  fontWeight: lightTheme.fontWeight,
};

export const useTheme = () => {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};

export type { Theme };
