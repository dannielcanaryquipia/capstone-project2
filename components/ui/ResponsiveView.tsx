import React from 'react';
import { View, ViewProps } from 'react-native';
import Responsive from '../../constants/Responsive';

interface ResponsiveViewProps extends ViewProps {
  children: React.ReactNode;
  // Spacing props
  padding?: keyof typeof Responsive.ResponsiveSpacing;
  margin?: keyof typeof Responsive.ResponsiveSpacing;
  paddingHorizontal?: keyof typeof Responsive.ResponsiveSpacing;
  paddingVertical?: keyof typeof Responsive.ResponsiveSpacing;
  marginHorizontal?: keyof typeof Responsive.ResponsiveSpacing;
  marginVertical?: keyof typeof Responsive.ResponsiveSpacing;
  paddingTop?: keyof typeof Responsive.ResponsiveSpacing;
  paddingBottom?: keyof typeof Responsive.ResponsiveSpacing;
  paddingLeft?: keyof typeof Responsive.ResponsiveSpacing;
  paddingRight?: keyof typeof Responsive.ResponsiveSpacing;
  marginTop?: keyof typeof Responsive.ResponsiveSpacing;
  marginBottom?: keyof typeof Responsive.ResponsiveSpacing;
  marginLeft?: keyof typeof Responsive.ResponsiveSpacing;
  marginRight?: keyof typeof Responsive.ResponsiveSpacing;
  
  // Layout props
  flex?: number;
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  
  // Size props
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  
  // Position props
  position?: 'absolute' | 'relative';
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  zIndex?: number;
  
  // Background and border
  backgroundColor?: string;
  borderRadius?: keyof typeof Responsive.ResponsiveBorderRadius;
  borderWidth?: number;
  borderColor?: string;
  
  // Shadow
  shadow?: boolean;
  shadowLevel?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
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

export const ResponsiveView: React.FC<ResponsiveViewProps> = ({
  children,
  padding,
  margin,
  paddingHorizontal,
  paddingVertical,
  marginHorizontal,
  marginVertical,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  flex,
  flexDirection,
  justifyContent,
  alignItems,
  alignSelf,
  width,
  height,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  position,
  top,
  bottom,
  left,
  right,
  zIndex,
  backgroundColor,
  borderRadius,
  borderWidth,
  borderColor,
  shadow,
  shadowLevel = 'sm',
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

  const containerStyle: any = {
    // Spacing
    ...(padding && { padding: Responsive.ResponsiveSpacing[padding] }),
    ...(margin && { margin: Responsive.ResponsiveSpacing[margin] }),
    ...(paddingHorizontal && { paddingHorizontal: Responsive.ResponsiveSpacing[paddingHorizontal] }),
    ...(paddingVertical && { paddingVertical: Responsive.ResponsiveSpacing[paddingVertical] }),
    ...(marginHorizontal && { marginHorizontal: Responsive.ResponsiveSpacing[marginHorizontal] }),
    ...(marginVertical && { marginVertical: Responsive.ResponsiveSpacing[marginVertical] }),
    ...(paddingTop && { paddingTop: Responsive.ResponsiveSpacing[paddingTop] }),
    ...(paddingBottom && { paddingBottom: Responsive.ResponsiveSpacing[paddingBottom] }),
    ...(paddingLeft && { paddingLeft: Responsive.ResponsiveSpacing[paddingLeft] }),
    ...(paddingRight && { paddingRight: Responsive.ResponsiveSpacing[paddingRight] }),
    ...(marginTop && { marginTop: Responsive.ResponsiveSpacing[marginTop] }),
    ...(marginBottom && { marginBottom: Responsive.ResponsiveSpacing[marginBottom] }),
    ...(marginLeft && { marginLeft: Responsive.ResponsiveSpacing[marginLeft] }),
    ...(marginRight && { marginRight: Responsive.ResponsiveSpacing[marginRight] }),
    
    // Layout
    ...(flex !== undefined && { flex }),
    ...(flexDirection && { flexDirection }),
    ...(justifyContent && { justifyContent }),
    ...(alignItems && { alignItems }),
    ...(alignSelf && { alignSelf }),
    
    // Size
    ...(width !== undefined && { width }),
    ...(height !== undefined && { height }),
    ...(minWidth !== undefined && { minWidth }),
    ...(minHeight !== undefined && { minHeight }),
    ...(maxWidth !== undefined && { maxWidth }),
    ...(maxHeight !== undefined && { maxHeight }),
    
    // Position
    ...(position && { position }),
    ...(top !== undefined && { top }),
    ...(bottom !== undefined && { bottom }),
    ...(left !== undefined && { left }),
    ...(right !== undefined && { right }),
    ...(zIndex !== undefined && { zIndex }),
    
    // Background and border
    ...(backgroundColor && { backgroundColor }),
    ...(borderRadius && { borderRadius: Responsive.ResponsiveBorderRadius[borderRadius] }),
    ...(borderWidth !== undefined && { borderWidth }),
    ...(borderColor && { borderColor }),
    
    // Shadow
    ...(shadow && Responsive.Shadows[shadowLevel]),
  };

  return (
    <View style={[containerStyle, style]} {...props}>
      {children}
    </View>
  );
};

export default ResponsiveView;
