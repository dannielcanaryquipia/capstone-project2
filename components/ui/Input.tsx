import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { forwardRef, useState } from 'react';
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      width: fullWidth ? '100%' : undefined,
      marginBottom: Layout.spacing.sm,
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
  };

  const getInputStyle = (): TextStyle => {
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
  };

  const getLabelStyle = (): TextStyle => ({
    fontSize: Layout.fontSize.sm,
    marginBottom: Layout.spacing.xs,
    color: theme.colors.text,
    fontWeight: 'normal',
    fontFamily: 'PoppinsRegular',
    ...labelStyle,
  });

  const getErrorStyle = (): TextStyle => ({
    fontSize: Layout.fontSize.xs,
    color: theme.colors.error,
    fontFamily: 'PoppinsRegular',
    marginTop: Layout.spacing.xs,
    ...errorStyle,
  });

  const renderLeftIcon = () => {
    if (leftIcon) return leftIcon;
    
    if (iconType === 'email') {
      return (
        <MaterialCommunityIcons 
          name="email-outline" 
          size={20} 
          color={isFocused ? theme.colors.primary : theme.colors.textTertiary} 
        />
      );
    }
    
    if (iconType === 'password') {
      return (
        <MaterialCommunityIcons 
          name="lock-outline" 
          size={20} 
          color={isFocused ? theme.colors.primary : theme.colors.textTertiary} 
        />
      );
    }
    
    if (iconType === 'person') {
      return (
        <MaterialCommunityIcons 
          name="account-outline" 
          size={20} 
          color={isFocused ? theme.colors.primary : theme.colors.textTertiary} 
        />
      );
    }
    
    if (iconType === 'phone') {
      return (
        <MaterialCommunityIcons 
          name="phone-outline" 
          size={20} 
          color={isFocused ? theme.colors.primary : theme.colors.textTertiary} 
        />
      );
    }
    
    return null;
  };

  const renderRightIcon = () => {
    if (rightIcon) return rightIcon;
    
    if (showPasswordToggle) {
      return (
        <TouchableOpacity 
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.iconButton}
        >
          <MaterialCommunityIcons 
            name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
            size={20} 
            color={isFocused ? theme.colors.primary : theme.colors.textTertiary} 
          />
        </TouchableOpacity>
      );
    }
    
    return null;
  };

  return (
    <View style={getContainerStyle()}>
      {label && <Text style={getLabelStyle()}>{label}</Text>}
      <View style={getInputContainerStyle()}>
        {renderLeftIcon() && <View style={styles.iconContainer}>{renderLeftIcon()}</View>}
        <TextInput
          ref={ref}
          style={getInputStyle()}
          placeholderTextColor={theme.colors.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={showPasswordToggle ? !isPasswordVisible : props.secureTextEntry}
          {...props}
        />
        {renderRightIcon() && <View style={styles.iconContainer}>{renderRightIcon()}</View>}
      </View>
      {error && <Text style={getErrorStyle()}>{error}</Text>}
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
