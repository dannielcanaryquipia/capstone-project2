import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import Layout from '../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../../constants/Responsive';
import { useTheme } from '../../contexts/ThemeContext';
import DropdownMenu, { DropdownMenuItem } from '../ui/DropdownMenu';
import { ResponsiveText } from '../ui/ResponsiveText';
import { ResponsiveView } from '../ui/ResponsiveView';

interface AdminCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: keyof typeof ResponsiveSpacing;
  margin?: keyof typeof ResponsiveSpacing;
  onPress?: () => void;
  disabled?: boolean;
  actionMenuItems?: DropdownMenuItem[];
  showActionMenu?: boolean;
}

export const AdminCard: React.FC<AdminCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  variant = 'default',
  padding = 'md',
  margin = 'sm',
  onPress,
  disabled = false,
  actionMenuItems = [],
  showActionMenu = false,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const getCardStyle = () => {
    const baseStyle = {
      backgroundColor: colors.surface,
      borderRadius: ResponsiveBorderRadius.lg,
      padding: ResponsiveSpacing[padding],
      marginBottom: ResponsiveSpacing[margin],
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

  const CardComponent = onPress ? TouchableOpacity : ResponsiveView;

  return (
    <CardComponent
      style={[getCardStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={onPress ? 0.7 : 1}
      {...props}
    >
      {(title || subtitle || icon) && (
        <ResponsiveView style={styles.header}>
          {icon && (
            <ResponsiveView style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              {icon}
            </ResponsiveView>
          )}
          
          <ResponsiveView style={styles.headerText}>
            {title && (
              <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                {title}
              </ResponsiveText>
            )}
            {subtitle && (
              <ResponsiveText size="sm" color={colors.textSecondary}>
                {subtitle}
              </ResponsiveText>
            )}
          </ResponsiveView>

          {showActionMenu && actionMenuItems.length > 0 && (
            <ResponsiveView style={styles.actionMenuContainer}>
              <DropdownMenu
                items={actionMenuItems}
                triggerIcon="more-vert"
                position="top-right"
                disabled={disabled}
                testID="admin-card-action-menu"
              />
            </ResponsiveView>
          )}
        </ResponsiveView>
      )}
      
      <ResponsiveView style={styles.content}>
        {children}
      </ResponsiveView>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.sm,
  },
  iconContainer: {
    width: responsiveValue(32, 36, 40, 44),
    height: responsiveValue(32, 36, 40, 44),
    borderRadius: ResponsiveBorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ResponsiveSpacing.sm,
  },
  headerText: {
    flex: 1,
  },
  actionMenuContainer: {
    marginLeft: ResponsiveSpacing.sm,
  },
  content: {
    flex: 1,
  },
});
