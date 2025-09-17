import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
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
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    textTransform: 'uppercase',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 4,
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
    color: '#000', // Default color, will be overridden by theme
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default Text;
