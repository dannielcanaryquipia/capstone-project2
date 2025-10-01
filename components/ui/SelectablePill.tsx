import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Responsive from '../../constants/Responsive';
import { useTheme } from '../../contexts/ThemeContext';
import { ResponsiveText } from './ResponsiveText';

type SelectablePillProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  size?: 'sm' | 'md';
};

export default function SelectablePill({
  label,
  selected = false,
  onPress,
  style,
  size = 'md',
}: SelectablePillProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.pill,
        size === 'sm' ? styles.pillSm : styles.pillMd,
        {
          backgroundColor: selected ? colors.categoryButtonActiveFill : 'transparent',
          borderColor: selected ? colors.categoryButtonActiveFill : colors.categoryButtonBorder,
          borderWidth: 1,
        },
        selected && styles.pillActive,
        style,
      ]}
    >
      <ResponsiveText
        size="sm"
        color={selected ? colors.categoryButtonActiveText : colors.categoryButtonText}
        weight={selected ? 'semiBold' : 'regular'}
        style={{ textAlign: 'center', lineHeight: undefined }}
      >
        {label}
      </ResponsiveText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Responsive.responsiveValue(16, 18, 20, 22),
    marginRight: Responsive.responsiveValue(6, 8, 10, 12),
    minWidth: Responsive.responsiveValue(72, 80, 88, 100),
    minHeight: Responsive.responsiveValue(36, 40, 44, 48),
  },
  pillSm: {
    paddingHorizontal: Responsive.responsiveValue(12, 14, 16, 18),
    paddingVertical: Responsive.responsiveValue(6, 8, 10, 12),
    minWidth: Responsive.responsiveValue(64, 72, 80, 88),
    minHeight: Responsive.responsiveValue(32, 36, 40, 44),
    borderRadius: Responsive.responsiveValue(14, 16, 18, 20),
  },
  pillMd: {
    paddingHorizontal: Responsive.responsiveValue(14, 16, 18, 20),
    paddingVertical: Responsive.responsiveValue(8, 10, 12, 14),
    minWidth: Responsive.responsiveValue(72, 80, 88, 100),
    minHeight: Responsive.responsiveValue(36, 40, 44, 48),
    borderRadius: Responsive.responsiveValue(16, 18, 20, 22),
  },
  pillActive: {
    shadowColor: '#FFE44D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 0,
  },
});


