import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import Responsive from '../../constants/Responsive';
import ResponsiveText from './ResponsiveText';

interface ResponsiveButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  
  // Button variants
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'text';
  
  // Button sizes
  size?: 'small' | 'medium' | 'large';
  
  // Button state
  loading?: boolean;
  disabled?: boolean;
  
  // Text props
  textColor?: string;
  textWeight?: 'regular' | 'medium' | 'semiBold' | 'bold' | 'extraBold';
  
  // Icon
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  
  // Full width
  fullWidth?: boolean;
  
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

export const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  textColor,
  textWeight = 'semiBold',
  icon,
  iconPosition = 'left',
  fullWidth = false,
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

  const getButtonStyle = () => {
    const baseStyle = Responsive.ButtonSizes[size];
    
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#FFE44D',
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: '#4CAF50',
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: '#FFE44D',
        };
      case 'ghost':
        return {
          backgroundColor: 'rgba(255, 228, 77, 0.1)',
          borderWidth: 0,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          paddingHorizontal: 0,
        };
      default:
        return {
          backgroundColor: '#FFE44D',
          borderWidth: 0,
        };
    }
  };

  const getTextColor = () => {
    if (textColor) return textColor;
    
    switch (variant) {
      case 'primary':
      case 'secondary':
        return '#000000';
      case 'outline':
      case 'ghost':
      case 'text':
        return '#FFE44D';
      default:
        return '#000000';
    }
  };

  const buttonStyle = getButtonStyle();
  const buttonSize = Responsive.ButtonSizes[size];

  const responsiveStyle = StyleSheet.create({
    button: {
      height: buttonSize.height,
      paddingHorizontal: buttonSize.paddingHorizontal,
      borderRadius: Responsive.ResponsiveBorderRadius.md,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      ...(fullWidth && { width: '100%' }),
      ...buttonStyle,
      ...(disabled && { opacity: 0.6 }),
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      ...(iconPosition === 'left' && { marginRight: Responsive.ResponsiveSpacing.sm }),
      ...(iconPosition === 'right' && { marginLeft: Responsive.ResponsiveSpacing.sm }),
    },
    loading: {
      marginRight: Responsive.ResponsiveSpacing.sm,
    },
  });

  return (
    <TouchableOpacity
      style={[responsiveStyle.button, style]}
      disabled={disabled || loading}
      {...props}
    >
       <View style={responsiveStyle.content}>
         {loading && (
           <ActivityIndicator 
             size="small" 
             color={getTextColor()} 
             style={responsiveStyle.loading}
           />
         )}
         {icon && iconPosition === 'left' && !loading && (
           <View style={responsiveStyle.icon}>
             {icon}
           </View>
         )}
         <ResponsiveText
           size={size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'md'}
           weight={textWeight}
           color={getTextColor()}
         >
           {children}
         </ResponsiveText>
         {icon && iconPosition === 'right' && !loading && (
           <View style={responsiveStyle.icon}>
             {icon}
           </View>
         )}
       </View>
    </TouchableOpacity>
  );
};

export default ResponsiveButton;
