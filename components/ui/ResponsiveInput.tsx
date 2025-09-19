import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import Responsive from '../../constants/Responsive';
import ResponsiveText from './ResponsiveText';
import ResponsiveView from './ResponsiveView';

interface ResponsiveInputProps extends TextInputProps {
  // Input size
  size?: 'small' | 'medium' | 'large';
  
  // Label
  label?: string;
  labelColor?: string;
  
  // Error state
  error?: string;
  errorColor?: string;
  
  // Helper text
  helperText?: string;
  helperTextColor?: string;
  
  // Icon
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  
  // Container props
  containerStyle?: any;
  
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

export const ResponsiveInput: React.FC<ResponsiveInputProps> = ({
  size = 'medium',
  label,
  labelColor = '#666666',
  error,
  errorColor = '#F44336',
  helperText,
  helperTextColor = '#999999',
  leftIcon,
  rightIcon,
  containerStyle,
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
  const [isFocused, setIsFocused] = useState(false);

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

  const inputSize = Responsive.InputSizes[size];
  const hasError = !!error;

  const responsiveStyle = StyleSheet.create({
    container: {
      marginBottom: Responsive.ResponsiveSpacing.md,
    },
    label: {
      marginBottom: Responsive.ResponsiveSpacing.xs,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: inputSize.height,
      paddingHorizontal: inputSize.paddingHorizontal,
      backgroundColor: '#F5F5F5',
      borderRadius: Responsive.ResponsiveBorderRadius.sm,
      borderWidth: 1,
      borderColor: hasError ? errorColor : isFocused ? '#FFE44D' : '#E0E0E0',
    },
    input: {
      flex: 1,
      fontSize: inputSize.fontSize,
      color: '#333333',
      paddingVertical: 0,
    },
    leftIcon: {
      marginRight: Responsive.ResponsiveSpacing.sm,
    },
    rightIcon: {
      marginLeft: Responsive.ResponsiveSpacing.sm,
    },
    errorText: {
      marginTop: Responsive.ResponsiveSpacing.xs,
    },
    helperText: {
      marginTop: Responsive.ResponsiveSpacing.xs,
    },
  });

  return (
    <ResponsiveView style={[responsiveStyle.container, containerStyle]}>
      {label && (
        <ResponsiveText
          size="sm"
          weight="medium"
          color={labelColor}
          style={responsiveStyle.label}
        >
          {label}
        </ResponsiveText>
      )}
      
       <View style={responsiveStyle.inputContainer}>
         {leftIcon && (
           <View style={responsiveStyle.leftIcon}>
             {leftIcon}
           </View>
         )}
         
         <TextInput
           style={[responsiveStyle.input, style]}
           onFocus={() => setIsFocused(true)}
           onBlur={() => setIsFocused(false)}
           placeholderTextColor="#999999"
           {...props}
         />
         
         {rightIcon && (
           <View style={responsiveStyle.rightIcon}>
             {rightIcon}
           </View>
         )}
       </View>
      
      {error && (
        <ResponsiveText
          size="xs"
          color={errorColor}
          style={responsiveStyle.errorText}
        >
          {error}
        </ResponsiveText>
      )}
      
      {helperText && !error && (
        <ResponsiveText
          size="xs"
          color={helperTextColor}
          style={responsiveStyle.helperText}
        >
          {helperText}
        </ResponsiveText>
      )}
    </ResponsiveView>
  );
};

export default ResponsiveInput;
