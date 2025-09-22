import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import Layout from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';
type InputVariant = 'default' | 'outline' | 'filled' | 'underlined';
type InputSize = 'small' | 'medium' | 'large';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  variant?: InputVariant;
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  fullWidth?: boolean;
  showPasswordToggle?: boolean;
  iconType?: 'email' | 'password' | 'person' | 'phone' | 'none';
}

const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  variant = 'outline',
  size = 'medium',
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  fullWidth = false,
  showPasswordToggle = false,
  iconType = 'none',
  ...props
}, ref) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(true);
  
  // Memoize style calculations to prevent unnecessary re-renders
  const containerStyleMemo = useMemo((): ViewStyle => {
    const baseStyle: ViewStyle = {
      width: fullWidth ? '100%' : undefined,
      marginBottom: Layout.spacing.sm,
    };

    return {
      ...baseStyle,
      ...containerStyle,
    };
  }, [fullWidth, containerStyle]);

  const inputContainerStyleMemo = useMemo((): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: Layout.borderRadius.md,
      borderWidth: 1,
      borderColor: error ? theme.colors.error : (isFocused ? theme.colors.primary : theme.colors.border),
      backgroundColor: theme.colors.background,
    };

    const variantStyles: Record<InputVariant, ViewStyle> = {
      default: {
        borderWidth: 0,
        borderBottomWidth: 1,
        borderRadius: 0,
      },
      outline: {
        borderWidth: 1,
      },
      filled: {
        backgroundColor: theme.colors.surfaceVariant,
        borderWidth: 0,
      },
      underlined: {
        borderWidth: 0,
        borderBottomWidth: 1,
        borderRadius: 0,
      },
    };

    const sizeStyles: Record<InputSize, ViewStyle> = {
      small: {
        paddingVertical: Layout.spacing.xs,
        paddingHorizontal: Layout.spacing.sm,
      },
      medium: {
        paddingVertical: Layout.spacing.sm,
        paddingHorizontal: Layout.spacing.md,
      },
      large: {
        paddingVertical: Layout.spacing.md,
        paddingHorizontal: Layout.spacing.lg,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...sizeStyles[size],
    };
  }, [variant, size, error, isFocused, theme.colors]);

  const inputStyleMemo = useMemo((): TextStyle => {
    const baseStyle: TextStyle = {
      flex: 1,
      color: theme.colors.text,
      fontSize: Layout.fontSize.md,
      fontFamily: Layout.fontFamily.regular,
      padding: 0,
      margin: 0,
    };

    const sizeStyles: Record<InputSize, { height: number }> = {
      small: { height: 40 },
      medium: { height: 45 },
      large: { height: 50 },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...inputStyle,
    };
  }, [size, theme.colors.text, inputStyle]);

  const labelStyleMemo = useMemo((): TextStyle => ({
    fontSize: Layout.fontSize.sm,
    marginBottom: Layout.spacing.xs,
    color: theme.colors.text,
    fontWeight: 'normal',
    fontFamily: 'PoppinsRegular',
    ...labelStyle,
  }), [theme.colors.text, labelStyle]);

  const errorStyleMemo = useMemo((): TextStyle => ({
    fontSize: Layout.fontSize.xs,
    color: theme.colors.error,
    fontFamily: 'PoppinsRegular',
    marginTop: Layout.spacing.xs,
    ...errorStyle,
  }), [theme.colors.error, errorStyle]);

  // Memoize icon rendering to prevent unnecessary re-renders
  const renderLeftIcon = useCallback(() => {
    if (leftIcon) return leftIcon;
    
    const iconColor = isFocused ? theme.colors.primary : theme.colors.textTertiary;
    
    switch (iconType) {
      case 'email':
        return (
          <MaterialCommunityIcons 
            name="email-outline" 
            size={20} 
            color={iconColor} 
          />
        );
      case 'password':
        return (
          <MaterialCommunityIcons 
            name="lock-outline" 
            size={20} 
            color={iconColor} 
          />
        );
      case 'person':
        return (
          <MaterialCommunityIcons 
            name="account-outline" 
            size={20} 
            color={iconColor} 
          />
        );
      case 'phone':
        return (
          <MaterialCommunityIcons 
            name="phone-outline" 
            size={20} 
            color={iconColor} 
          />
        );
      default:
        return null;
    }
  }, [leftIcon, iconType, isFocused, theme.colors.primary, theme.colors.textTertiary]);

  const renderRightIcon = useCallback(() => {
    if (rightIcon) return rightIcon;
    
    if (showPasswordToggle) {
      return (
        <TouchableOpacity 
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.iconButton}
        >
          <MaterialCommunityIcons 
            name={isPasswordVisible ? "eye-outline" : "eye-off-outline"} 
            size={20} 
            color={isFocused ? theme.colors.primary : theme.colors.textTertiary} 
          />
        </TouchableOpacity>
      );
    }
    
    return null;
  }, [rightIcon, showPasswordToggle, isPasswordVisible, isFocused, theme.colors.primary, theme.colors.textTertiary]);

  // Memoize focus handlers
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return (
    <View style={containerStyleMemo}>
      {label && <Text style={labelStyleMemo}>{label}</Text>}
      <View style={inputContainerStyleMemo}>
        {renderLeftIcon() && <View style={styles.iconContainer}>{renderLeftIcon()}</View>}
        <TextInput
          ref={ref}
          style={inputStyleMemo}
          placeholderTextColor={theme.colors.textTertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={showPasswordToggle ? !isPasswordVisible : props.secureTextEntry}
          {...props}
        />
        {renderRightIcon() && <View style={styles.iconContainer}>{renderRightIcon()}</View>}
      </View>
      {error && <Text style={errorStyleMemo}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  iconContainer: {
    marginHorizontal: 8,
  },
  iconButton: {
    padding: 4,
  },
});

export default Input;
