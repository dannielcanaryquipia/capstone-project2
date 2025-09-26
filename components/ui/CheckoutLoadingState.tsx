import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ResponsiveText } from './ResponsiveText';
import { ResponsiveView } from './ResponsiveView';
import Layout from '../../constants/Layout';

interface CheckoutLoadingStateProps {
  message?: string;
  showIcon?: boolean;
  icon?: string;
  size?: 'small' | 'large';
}

export const CheckoutLoadingState: React.FC<CheckoutLoadingStateProps> = ({
  message = 'Loading...',
  showIcon = true,
  icon = 'hourglass-empty',
  size = 'small',
}) => {
  const { colors } = useTheme();

  return (
    <ResponsiveView style={styles.container}>
      {showIcon && (
        <ResponsiveView style={styles.iconContainer}>
          <MaterialIcons 
            name={icon as any} 
            size={32} 
            color={colors.primary} 
          />
        </ResponsiveView>
      )}
      
      <ActivityIndicator 
        size={size} 
        color={colors.primary} 
        style={styles.spinner}
      />
      
      <ResponsiveText 
        size="md" 
        color={colors.textSecondary} 
        style={styles.message}
      >
        {message}
      </ResponsiveText>
    </ResponsiveView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.xl,
    paddingHorizontal: Layout.spacing.lg,
  },
  iconContainer: {
    marginBottom: Layout.spacing.md,
  },
  spinner: {
    marginBottom: Layout.spacing.sm,
  },
  message: {
    textAlign: 'center',
  },
});
