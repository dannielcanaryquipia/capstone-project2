import React from 'react';
import { Text, TextProps } from 'react-native';
import global from '../../styles/global';

interface AppTitleProps extends TextProps {
  children: React.ReactNode;
  variant?: 'large' | 'medium' | 'small';
}

const AppTitle: React.FC<AppTitleProps> = ({ 
  children, 
  variant = 'large', 
  style, 
  ...props 
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'small':
        return {
          fontSize: 24,
          fontFamily: 'PlayfairDisplay',
          fontWeight: 'bold' as const,
        };
      case 'medium':
        return {
          fontSize: 32,
          fontFamily: 'PlayfairDisplay',
          fontWeight: 'bold' as const,
        };
      case 'large':
      default:
        return global.appTitle;
    }
  };

  return (
    <Text style={[getVariantStyle(), style]} {...props}>
      {children}
    </Text>
  );
};

export default AppTitle;
