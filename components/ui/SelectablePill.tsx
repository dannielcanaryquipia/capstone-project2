import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import Layout from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';

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
      <Text
        style={[
          size === 'sm' ? styles.textSm : styles.textMd,
          {
            color: selected ? colors.categoryButtonActiveText : colors.categoryButtonText,
            fontFamily: selected ? Layout.fontFamily.semiBold : Layout.fontFamily.regular,
          },
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginHorizontal: 5,
  },
  pillSm: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 64,
    minHeight: 32,
    borderRadius: 16,
  },
  pillMd: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 80,
    minHeight: 40,
    borderRadius: 20,
  },
  pillActive: {
    shadowColor: '#FFE44D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 0,
  },
  textSm: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: undefined as unknown as number,
    includeFontPadding: false as unknown as boolean,
    textAlignVertical: 'center' as unknown as 'auto',
    letterSpacing: 0.2,
  },
  textMd: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: undefined as unknown as number,
    includeFontPadding: false as unknown as boolean,
    textAlignVertical: 'center' as unknown as 'auto',
    letterSpacing: 0.2,
  },
});


