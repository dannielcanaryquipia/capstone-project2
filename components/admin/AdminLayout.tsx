import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Layout from '../../constants/Layout';
import { ResponsiveSpacing, responsiveValue } from '../../constants/Responsive';
import { useTheme } from '../../contexts/ThemeContext';
import { ResponsiveText } from '../ui/ResponsiveText';
import { ResponsiveView } from '../ui/ResponsiveView';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  headerActions?: React.ReactNode;
  padding?: keyof typeof ResponsiveSpacing;
  backgroundColor?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  headerActions,
  padding = 'lg',
  backgroundColor
}) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: backgroundColor || colors.background }
      ]} 
      edges={['top', 'bottom', 'left', 'right']}
    >
      {/* Header */}
      <ResponsiveView style={[styles.header, { backgroundColor: colors.surface }]}>
        <ResponsiveView style={styles.headerContent}>
          {showBackButton && (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <MaterialIcons 
                name="arrow-back" 
                size={responsiveValue(20, 22, 24, 26)} 
                color={colors.text}
              />
            </TouchableOpacity>
          )}
          
          <ResponsiveView style={styles.headerText}>
            <ResponsiveText size="xl" weight="bold" color={colors.text}>
              {title}
            </ResponsiveText>
            {subtitle && (
              <ResponsiveText size="sm" color={colors.textSecondary}>
                {subtitle}
              </ResponsiveText>
            )}
          </ResponsiveView>
          
          {headerActions && (
            <ResponsiveView style={styles.headerActions}>
              {headerActions}
            </ResponsiveView>
          )}
        </ResponsiveView>
      </ResponsiveView>

      {/* Content */}
      <ResponsiveView style={[styles.content, { padding: ResponsiveSpacing[padding] }]}>
        {children}
      </ResponsiveView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: ResponsiveSpacing.lg,
    paddingVertical: ResponsiveSpacing.md,
    ...Layout.shadows.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: ResponsiveSpacing.md,
    padding: ResponsiveSpacing.xs,
  },
  headerText: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ResponsiveSpacing.sm,
  },
  content: {
    flex: 1,
  },
});
