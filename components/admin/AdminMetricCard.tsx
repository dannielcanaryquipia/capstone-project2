import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Layout from '../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../../constants/Responsive';
import { useTheme } from '../../contexts/ThemeContext';
import { ResponsiveText } from '../ui/ResponsiveText';
import { ResponsiveView } from '../ui/ResponsiveView';

interface AdminMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  backgroundColor?: string;
  variant?: 'default' | 'outlined' | 'elevated';
  size?: 'small' | 'medium' | 'large';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onPress?: () => void;
  disabled?: boolean;
  fixedWidth?: boolean;
}

export const AdminMetricCard: React.FC<AdminMetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  backgroundColor,
  variant = 'outlined',
  size = 'medium',
  trend,
  onPress,
  disabled = false,
  fixedWidth = false
}) => {
  const { colors } = useTheme();

  const cardBackgroundColor = backgroundColor || colors.surface;
  const iconColorValue = iconColor || colors.primary;

  const getCardStyle = () => {
    const baseStyle = {
      backgroundColor: cardBackgroundColor,
      borderRadius: ResponsiveBorderRadius.lg,
      padding: ResponsiveSpacing[size === 'small' ? 'md' : size === 'large' ? 'xl' : 'lg'],
      marginBottom: ResponsiveSpacing.md,
      minHeight: responsiveValue(
        size === 'small' ? 100 : size === 'large' ? 160 : 130,
        size === 'small' ? 110 : size === 'large' ? 170 : 140,
        size === 'small' ? 120 : size === 'large' ? 180 : 150,
        size === 'small' ? 130 : size === 'large' ? 190 : 160
      ),
      justifyContent: 'space-between' as const,
      ...(fixedWidth ? {
        width: responsiveValue(200, 220, 240, 260),
      } : {
        flex: 1,
        minWidth: responsiveValue(140, 160, 180, 200),
        maxWidth: responsiveValue(200, 220, 240, 260),
      }),
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'elevated':
        return {
          ...baseStyle,
          ...Layout.shadows.md,
        };
      default:
        return {
          ...baseStyle,
          ...Layout.shadows.sm,
        };
    }
  };

  const getIconSize = () => {
    return responsiveValue(
      size === 'small' ? 20 : size === 'large' ? 32 : 24,
      size === 'small' ? 22 : size === 'large' ? 34 : 26,
      size === 'small' ? 24 : size === 'large' ? 36 : 28,
      size === 'small' ? 26 : size === 'large' ? 38 : 30
    );
  };

  const getValueSize = () => {
    return size === 'small' ? 'xxl' : size === 'large' ? 'display' : 'xxxl';
  };

  const getTitleSize = () => {
    return size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'md';
  };

  const getSubtitleSize = () => {
    return size === 'small' ? 'xs' : size === 'large' ? 'md' : 'sm';
  };

  const CardComponent = onPress ? TouchableOpacity : ResponsiveView;

  return (
    <CardComponent 
      style={[getCardStyle()]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <ResponsiveView style={styles.header}>
        <ResponsiveView style={[styles.iconContainer, { backgroundColor: iconColorValue + '20' }]}>
          {icon && (
            <MaterialIcons 
              name={icon as any} 
              size={getIconSize()} 
              color={iconColorValue} 
            />
          )}
        </ResponsiveView>
        
        <ResponsiveView style={styles.textContainer}>
          <ResponsiveText size={getTitleSize()} color={colors.text} weight="semiBold">
            {title}
          </ResponsiveText>
          {subtitle && (
            <ResponsiveText size={getSubtitleSize()} color={colors.textSecondary} weight="medium">
              {subtitle}
            </ResponsiveText>
          )}
        </ResponsiveView>
      </ResponsiveView>

      <ResponsiveView style={styles.valueContainer}>
        <ResponsiveText size={getValueSize()} weight="bold" color={colors.text}>
          {value}
        </ResponsiveText>
        
        {trend && (
          <ResponsiveView style={styles.trendContainer}>
            <MaterialIcons 
              name={trend.isPositive ? 'trending-up' : 'trending-down'} 
              size={responsiveValue(16, 18, 20, 22)} 
              color={trend.isPositive ? colors.success : colors.error} 
            />
            <ResponsiveText 
              size="sm" 
              color={trend.isPositive ? colors.success : colors.error}
              weight="bold"
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </ResponsiveText>
          </ResponsiveView>
        )}
      </ResponsiveView>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.lg,
  },
  iconContainer: {
    width: responsiveValue(40, 44, 48, 52),
    height: responsiveValue(40, 44, 48, 52),
    borderRadius: ResponsiveBorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ResponsiveSpacing.md,
  },
  textContainer: {
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    marginTop: ResponsiveSpacing.sm,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ResponsiveSpacing.xs,
    marginTop: ResponsiveSpacing.sm,
  },
});
