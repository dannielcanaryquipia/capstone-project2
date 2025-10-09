import React from 'react';
import { StyleSheet } from 'react-native';
import Layout from '../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing } from '../../constants/Responsive';
import { useTheme } from '../../contexts/ThemeContext';
import { ResponsiveText } from '../ui/ResponsiveText';
import { ResponsiveView } from '../ui/ResponsiveView';

interface AdminSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  variant?: 'default' | 'card' | 'outlined';
  padding?: keyof typeof ResponsiveSpacing;
  margin?: keyof typeof ResponsiveSpacing;
}

export const AdminSection: React.FC<AdminSectionProps> = ({
  title,
  subtitle,
  children,
  headerAction,
  variant = 'default',
  padding = 'md',
  margin = 'md'
}) => {
  const { colors } = useTheme();

  const getSectionStyle = () => {
    const baseStyle = {
      marginBottom: ResponsiveSpacing[margin],
    };

    switch (variant) {
      case 'card':
        return {
          ...baseStyle,
          backgroundColor: colors.surface,
          borderRadius: ResponsiveBorderRadius.lg,
          padding: ResponsiveSpacing[padding],
          ...Layout.shadows.sm,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: colors.surface,
          borderRadius: ResponsiveBorderRadius.lg,
          padding: ResponsiveSpacing[padding],
          borderWidth: 1,
          borderColor: colors.border,
        };
      default:
        return {
          ...baseStyle,
          padding: ResponsiveSpacing[padding],
        };
    }
  };

  return (
    <ResponsiveView style={getSectionStyle()}>
      <ResponsiveView style={styles.header}>
        <ResponsiveView style={styles.headerText}>
          <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
            {title}
          </ResponsiveText>
          {subtitle && (
            <ResponsiveText size="sm" color={colors.textSecondary}>
              {subtitle}
            </ResponsiveText>
          )}
        </ResponsiveView>
        
        {headerAction && (
          <ResponsiveView style={styles.headerAction}>
            {headerAction}
          </ResponsiveView>
        )}
      </ResponsiveView>

      <ResponsiveView style={styles.content}>
        {children}
      </ResponsiveView>
    </ResponsiveView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ResponsiveSpacing.sm,
  },
  headerText: {
    flex: 1,
  },
  headerAction: {
    marginLeft: ResponsiveSpacing.sm,
  },
  content: {
    flex: 1,
  },
});
