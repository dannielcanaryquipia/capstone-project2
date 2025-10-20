import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ResponsiveText } from './ResponsiveText';
import Responsive from '../../constants/Responsive';

type BuyNowButtonProps = {
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
};

export default function BuyNowButton({
  onPress,
  disabled = false,
  style,
  size = 'md',
  loading = false,
}: BuyNowButtonProps) {
  const { colors, isDark } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return styles.buttonSm;
      case 'lg':
        return styles.buttonLg;
      default:
        return styles.buttonMd;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'sm' as const;
      case 'lg':
        return 'lg' as const;
      default:
        return 'md' as const;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getSizeStyles(),
        {
          backgroundColor: isDark ? colors.primary : colors.black,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <ResponsiveText
        size={getTextSize()}
        weight="semiBold"
        color={isDark ? colors.black : colors.white}
        style={{ textAlign: 'center' }}
      >
        {loading ? 'Processing...' : 'Buy Now'}
      </ResponsiveText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Responsive.responsiveValue(12, 14, 16, 18),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonSm: {
    paddingHorizontal: Responsive.responsiveValue(16, 20, 24, 28),
    paddingVertical: Responsive.responsiveValue(8, 10, 12, 14),
    minHeight: Responsive.responsiveValue(36, 40, 44, 48),
  },
  buttonMd: {
    paddingHorizontal: Responsive.responsiveValue(20, 24, 28, 32),
    paddingVertical: Responsive.responsiveValue(12, 14, 16, 18),
    minHeight: Responsive.responsiveValue(44, 48, 52, 56),
  },
  buttonLg: {
    paddingHorizontal: Responsive.responsiveValue(24, 28, 32, 36),
    paddingVertical: Responsive.responsiveValue(16, 18, 20, 22),
    minHeight: Responsive.responsiveValue(52, 56, 60, 64),
  },
});
