import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, View, Text, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

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
  ...props
}, ref) => {
  const theme = useTheme();
  
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      width: fullWidth ? '100%' : undefined,
      marginBottom: theme.spacing.sm,
    };

    return {
      ...baseStyle,
      ...containerStyle,
    };
  };

  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: error ? theme.colors.error : theme.colors.border,
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
        backgroundColor: theme.colors.lightGray,
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
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.sm,
      },
      medium: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
      },
      large: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...sizeStyles[size],
    };
  };

  const getInputStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      flex: 1,
      color: theme.colors.text,
      fontSize: theme.fontSize.md,
      padding: 0,
      margin: 0,
    };

    const sizeStyles: Record<InputSize, { height: number }> = {
      small: { height: 32 },
      medium: { height: 40 },
      large: { height: 48 },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...inputStyle,
    };
  };

  const getLabelStyle = (): TextStyle => ({
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
    ...labelStyle,
  });

  const getErrorStyle = (): TextStyle => ({
    fontSize: theme.fontSize.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    ...errorStyle,
  });

  return (
    <View style={getContainerStyle()}>
      {label && <Text style={getLabelStyle()}>{label}</Text>}
      <View style={getInputContainerStyle()}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <TextInput
          ref={ref}
          style={getInputStyle()}
          placeholderTextColor={theme.colors.muted}
          {...props}
        />
        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </View>
      {error && <Text style={getErrorStyle()}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  iconContainer: {
    marginHorizontal: 8,
  },
});

export default Input;
