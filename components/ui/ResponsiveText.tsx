import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import Responsive from '../../constants/Responsive';

interface ResponsiveTextProps extends TextProps {
  children: React.ReactNode;
  
  // Text size variants
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'display';
  
  // Font weight
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold' | 'extraBold';
  
  // Color
  color?: string;
  
  // Text alignment
  align?: 'left' | 'center' | 'right' | 'justify';
  
  // Line height
  lineHeight?: 'tight' | 'normal' | 'relaxed' | number;
  
  // Text transform
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  
  // Text decoration
  decoration?: 'none' | 'underline' | 'line-through';
  
  // Number of lines
  numberOfLines?: number;
  
  // Responsive breakpoints
  hideOnSmall?: boolean;
  hideOnMedium?: boolean;
  hideOnLarge?: boolean;
  hideOnTablet?: boolean;
  showOnlyOnSmall?: boolean;
  showOnlyOnMedium?: boolean;
  showOnlyOnLarge?: boolean;
  showOnlyOnTablet?: boolean;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  size = 'md',
  weight = 'regular',
  color,
  align,
  lineHeight = 'normal',
  transform,
  decoration,
  numberOfLines,
  hideOnSmall,
  hideOnMedium,
  hideOnLarge,
  hideOnTablet,
  showOnlyOnSmall,
  showOnlyOnMedium,
  showOnlyOnLarge,
  showOnlyOnTablet,
  style,
  ...props
}) => {
  // Check if component should be hidden based on screen size
  const deviceSize = Responsive.getDeviceSize();
  const shouldHide = 
    (hideOnSmall && deviceSize === Responsive.DeviceSize.SMALL) ||
    (hideOnMedium && deviceSize === Responsive.DeviceSize.MEDIUM) ||
    (hideOnLarge && deviceSize === Responsive.DeviceSize.LARGE) ||
    (hideOnTablet && deviceSize === Responsive.DeviceSize.TABLET) ||
    (showOnlyOnSmall && deviceSize !== Responsive.DeviceSize.SMALL) ||
    (showOnlyOnMedium && deviceSize !== Responsive.DeviceSize.MEDIUM) ||
    (showOnlyOnLarge && deviceSize !== Responsive.DeviceSize.LARGE) ||
    (showOnlyOnTablet && deviceSize !== Responsive.DeviceSize.TABLET);

  if (shouldHide) {
    return null;
  }

  const getFontWeight = (weight: string) => {
    switch (weight) {
      case 'regular': return '400';
      case 'medium': return '500';
      case 'semiBold': return '600';
      case 'bold': return '700';
      case 'extraBold': return '800';
      default: return '400';
    }
  };

  const getLineHeight = (lineHeight: string | number) => {
    if (typeof lineHeight === 'number') return lineHeight;
    
    switch (lineHeight) {
      case 'tight': return 1.2;
      case 'normal': return 1.5;
      case 'relaxed': return 1.8;
      default: return 1.5;
    }
  };

  const responsiveStyle = StyleSheet.create({
    text: {
      fontSize: Responsive.TextSizes[size],
      fontWeight: getFontWeight(weight),
      ...(color && { color }),
      ...(align && { textAlign: align }),
      lineHeight: Responsive.TextSizes[size] * getLineHeight(lineHeight),
      ...(transform && { textTransform: transform }),
      ...(decoration && { textDecorationLine: decoration }),
    },
  });

  return (
    <Text 
      style={[responsiveStyle.text, style]} 
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </Text>
  );
};

export default ResponsiveText;
