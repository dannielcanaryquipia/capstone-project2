import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import Layout from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'body2' | 'caption' | 'button' | 'label';

type TextProps = RNTextProps & {
  variant?: TextVariant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  bold?: boolean;
  children: React.ReactNode;
};

const variantStyles = {
  h1: {
    fontSize: Layout.fontSize.xxxl,
    fontWeight: Layout.fontWeight.bold,
    lineHeight: Layout.fontSize.xxxl * 1.2,
    fontFamily: Layout.fontFamily.bold,
  },
  h2: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: Layout.fontWeight.bold,
    lineHeight: Layout.fontSize.xxl * 1.2,
    fontFamily: Layout.fontFamily.bold,
  },
  h3: {
    fontSize: Layout.fontSize.xl,
    fontWeight: Layout.fontWeight.semiBold,
    lineHeight: Layout.fontSize.xl * 1.2,
    fontFamily: Layout.fontFamily.semiBold,
  },
  h4: {
    fontSize: Layout.fontSize.lg,
    fontWeight: Layout.fontWeight.semiBold,
    lineHeight: Layout.fontSize.lg * 1.2,
    fontFamily: Layout.fontFamily.semiBold,
  },
  body: {
    fontSize: Layout.fontSize.md,
    lineHeight: Layout.fontSize.md * Layout.lineHeight.normal,
    fontFamily: Layout.fontFamily.regular,
  },
  body2: {
    fontSize: Layout.fontSize.sm,
    lineHeight: Layout.fontSize.sm * Layout.lineHeight.normal,
    fontFamily: Layout.fontFamily.regular,
  },
  caption: {
    fontSize: Layout.fontSize.xs,
    lineHeight: Layout.fontSize.xs * Layout.lineHeight.normal,
    fontFamily: Layout.fontFamily.regular,
  },
  button: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.semiBold,
    lineHeight: Layout.fontSize.md * Layout.lineHeight.normal,
    textTransform: 'uppercase',
    fontFamily: Layout.fontFamily.semiBold,
  },
  label: {
    fontSize: Layout.fontSize.sm,
    fontWeight: Layout.fontWeight.medium,
    lineHeight: Layout.fontSize.sm * Layout.lineHeight.normal,
    marginBottom: 4,
    fontFamily: Layout.fontFamily.medium,
  },
} as const;

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color,
  align = 'left',
  bold = false,
  style,
  children,
  ...props
}) => {
  const { colors } = useTheme();
  
  return (
    <RNText
      style={[
        styles.base,
        variantStyles[variant],
        { color: color || colors.text, textAlign: align },
        bold && styles.bold,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: Layout.fontFamily.regular, // Default font family
  },
  bold: {
    fontWeight: Layout.fontWeight.bold,
  },
});

export default Text;
