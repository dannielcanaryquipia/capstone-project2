import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

interface SafeAreaContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  statusBarStyle?: 'light' | 'dark' | 'auto';
  statusBarBackgroundColor?: string;
  style?: any;
  enableKeyboardAvoidingView?: boolean;
}

export const SafeAreaContainer: React.FC<SafeAreaContainerProps> = ({
  children,
  backgroundColor,
  edges = ['top', 'bottom'],
  statusBarStyle = 'auto',
  statusBarBackgroundColor,
  style,
  enableKeyboardAvoidingView = false,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Determine status bar style based on theme and background
  const finalStatusBarStyle = statusBarStyle === 'auto' 
    ? (isDark ? 'light' : 'dark')
    : statusBarStyle;
  
  // Use provided background or theme background
  const finalBackgroundColor = backgroundColor || colors.background;
  
  // Set status bar background color
  const finalStatusBarBackgroundColor = statusBarBackgroundColor || finalBackgroundColor;

  return (
    <>
      <StatusBar 
        barStyle={finalStatusBarStyle}
        backgroundColor={finalStatusBarBackgroundColor}
        translucent={false}
      />
      <SafeAreaView 
        style={[
          {
            flex: 1,
            backgroundColor: finalBackgroundColor,
          },
          style
        ]}
        edges={edges}
      >
        {children}
      </SafeAreaView>
    </>
  );
};

export default SafeAreaContainer;
