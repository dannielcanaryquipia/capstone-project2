import React, { memo, useMemo } from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import Layout from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = memo(({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const theme = useTheme();
  
  const buttonStyle = useMemo((): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: Layout.borderRadius.md,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      opacity: disabled || loading ? 0.6 : 1,
      width: fullWidth ? '100%' : undefined,
    };

    const sizeStyles: Record<ButtonSize, ViewStyle> = {
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

    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: {
        backgroundColor: '#FEDC00', // Fixed yellow background for primary buttons
      },
      secondary: {
        backgroundColor: theme.colors.secondary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary,
      },
      text: {
        backgroundColor: 'transparent',
      },
      danger: {
        backgroundColor: theme.colors.error,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  }, [variant, size, disabled, loading, fullWidth, theme.colors]);

  const textStyleMemo = useMemo((): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: Layout.fontSize.md,
      fontWeight: 'normal',
      fontFamily: Layout.fontFamily.regular,
      textAlign: 'center',
    };

    const variantTextStyles: Record<ButtonVariant, TextStyle> = {
      primary: {
        color: '#000000', // Fixed black text for primary buttons (yellow background)
      },
      secondary: {
        color: theme.colors.textInverse,
      },
      outline: {
        color: theme.colors.primary,
      },
      text: {
        color: theme.colors.primary,
      },
      danger: {
        color: theme.colors.textInverse,
      },
    };

    return {
      ...baseStyle,
      ...variantTextStyles[variant],
    };
  }, [variant, theme.colors]);

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' 
            ? '#000000' // Fixed black for primary buttons (yellow background)
            : variant === 'secondary' || variant === 'danger' 
            ? theme.colors.textInverse 
            : theme.colors.primary} 
          size="small" 
        />
      ) : (
        <>
          {icon && icon}
          <Text style={[textStyleMemo, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
});

export default Button;
