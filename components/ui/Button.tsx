import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

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

const Button: React.FC<ButtonProps> = ({
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
  
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.md,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      opacity: disabled || loading ? 0.6 : 1,
      width: fullWidth ? '100%' : undefined,
    };

    const sizeStyles: Record<ButtonSize, ViewStyle> = {
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

    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: {
        backgroundColor: theme.colors.primary,
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
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semiBold,
      textAlign: 'center',
    };

    const variantTextStyles: Record<ButtonVariant, TextStyle> = {
      primary: {
        color: theme.colors.white,
      },
      secondary: {
        color: theme.colors.white,
      },
      outline: {
        color: theme.colors.primary,
      },
      text: {
        color: theme.colors.primary,
      },
      danger: {
        color: theme.colors.white,
      },
    };

    return {
      ...baseStyle,
      ...variantTextStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' || variant === 'secondary' || variant === 'danger' 
            ? theme.colors.white 
            : theme.colors.primary} 
          size="small" 
        />
      ) : (
        <>
          {icon && <>{icon} </>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

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
