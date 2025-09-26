import React from 'react';
import { StyleSheet } from 'react-native';
import Layout from '../../constants/Layout';
import { ResponsiveText } from './ResponsiveText';
import { ResponsiveView } from './ResponsiveView';

interface CheckoutSectionProps {
  title: string;
  children: React.ReactNode;
  subtitle?: string;
  required?: boolean;
  error?: string;
  loading?: boolean;
  style?: any;
}

export const CheckoutSection: React.FC<CheckoutSectionProps> = ({
  title,
  children,
  subtitle,
  required = false,
  error,
  loading = false,
  style,
}) => {
  return (
    <ResponsiveView style={[styles.container, style]}>
      <ResponsiveView style={styles.header}>
        <ResponsiveView style={styles.titleContainer}>
          <ResponsiveText size="lg" weight="semiBold" style={styles.title}>
            {title}
            {required && <ResponsiveText style={styles.required}> *</ResponsiveText>}
          </ResponsiveText>
          {subtitle && (
            <ResponsiveText size="sm" style={styles.subtitle}>
              {subtitle}
            </ResponsiveText>
          )}
        </ResponsiveView>
        {loading && (
          <ResponsiveView style={styles.loadingIndicator}>
            <ResponsiveText size="xs" style={styles.loadingText}>
              Loading...
            </ResponsiveText>
          </ResponsiveView>
        )}
      </ResponsiveView>
      
      {error && (
        <ResponsiveView style={styles.errorContainer}>
          <ResponsiveText size="sm" style={styles.errorText}>
            {error}
          </ResponsiveText>
        </ResponsiveView>
      )}
      
      <ResponsiveView style={styles.content}>
        {children}
      </ResponsiveView>
    </ResponsiveView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    marginBottom: Layout.spacing.xs,
  },
  required: {
    color: '#FF6B6B',
  },
  subtitle: {
    opacity: 0.7,
  },
  loadingIndicator: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: Layout.borderRadius.sm,
  },
  loadingText: {
    opacity: 0.7,
  },
  errorContainer: {
    marginBottom: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    backgroundColor: 'rgba(255,107,107,0.1)',
    borderRadius: Layout.borderRadius.sm,
  },
  errorText: {
    color: '#FF6B6B',
  },
  content: {
    // Content styles will be handled by children
  },
});
