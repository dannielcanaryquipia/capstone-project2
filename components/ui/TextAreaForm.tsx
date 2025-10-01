import React, { useCallback, useMemo, useState } from 'react';
import { Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';
import Layout from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';

export interface TextAreaFormProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  subtitle?: string;
  error?: string;
  variant?: 'default' | 'outline' | 'filled' | 'underlined';
  size?: 'small' | 'medium' | 'large';
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  fullWidth?: boolean;
  required?: boolean;
  disabled?: boolean;
}

const TextAreaForm: React.FC<TextAreaFormProps> = ({
  label,
  subtitle,
  error,
  variant = 'outline',
  size = 'medium',
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  fullWidth = false,
  required = false,
  disabled = false,
  ...props
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

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
      borderRadius: Layout.borderRadius.md,
      borderWidth: 1,
      borderColor: error ? theme.colors.error : (isFocused ? theme.colors.primary : theme.colors.border),
      backgroundColor: theme.colors.background,
    };

    const variantStyles: Record<string, ViewStyle> = {
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

    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingVertical: Layout.spacing.xs,
        paddingHorizontal: Layout.spacing.sm,
        minHeight: 60,
      },
      medium: {
        paddingVertical: Layout.spacing.sm,
        paddingHorizontal: Layout.spacing.md,
        minHeight: 80,
      },
      large: {
        paddingVertical: Layout.spacing.md,
        paddingHorizontal: Layout.spacing.lg,
        minHeight: 100,
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
      textAlignVertical: 'top',
      padding: 0,
      margin: 0,
    };

    return {
      ...baseStyle,
      ...inputStyle,
    };
  }, [theme.colors.text, inputStyle]);

  const labelStyleMemo = useMemo((): TextStyle => ({
    fontSize: Layout.fontSize.sm,
    marginBottom: Layout.spacing.xs,
    color: theme.colors.text,
    fontWeight: 'normal',
    fontFamily: 'PoppinsRegular',
    ...labelStyle,
  }), [theme.colors.text, labelStyle]);

  const subtitleStyleMemo = useMemo((): TextStyle => ({
    fontSize: Layout.fontSize.xs,
    marginTop: 2,
    marginBottom: Layout.spacing.xs,
    color: theme.colors.textTertiary,
    fontFamily: 'PoppinsRegular',
  }), []);

  const errorStyleMemo = useMemo((): TextStyle => ({
    fontSize: Layout.fontSize.xs,
    color: theme.colors.error,
    fontFamily: 'PoppinsRegular',
    marginTop: Layout.spacing.xs,
    ...errorStyle,
  }), [theme.colors.error, errorStyle]);

  const characterCountStyleMemo = useMemo((): TextStyle => ({
    fontSize: Layout.fontSize.xs,
    color: theme.colors.textTertiary,
    fontFamily: 'PoppinsRegular',
    textAlign: 'right',
    marginTop: Layout.spacing.xs,
  }), []);

  // Memoize focus handlers
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return (
    <View style={containerStyleMemo}>
      {label && (
        <Text style={labelStyleMemo}>
          {label}
          {required && <Text style={{ color: theme.colors.error }}> *</Text>}
        </Text>
      )}
      {subtitle && <Text style={subtitleStyleMemo}>{subtitle}</Text>}
      <View style={inputContainerStyleMemo}>
        <TextInput
          style={inputStyleMemo}
          placeholderTextColor={theme.colors.textTertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          multiline
          {...props}
        />
      </View>
      {props.maxLength && (
        <Text style={characterCountStyleMemo}>
          {(props.value || '').length}/{props.maxLength}
        </Text>
      )}
      {error && <Text style={errorStyleMemo}>{error}</Text>}
    </View>
  );
};

export default TextAreaForm;
