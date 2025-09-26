import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import Layout from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import { ResponsiveText } from './ResponsiveText';
import { ResponsiveView } from './ResponsiveView';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
  color?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'large',
  fullScreen = false,
  color,
}) => {
  const { colors } = useTheme();
  const loadingColor = color || colors.primary;

  const containerStyle = fullScreen 
    ? [styles.fullScreenContainer, { backgroundColor: colors.background }]
    : styles.container;

  return (
    <ResponsiveView style={containerStyle}>
      <ActivityIndicator size={size} color={loadingColor} />
      {message && (
        <ResponsiveView marginTop="md">
          <ResponsiveText 
            size="md" 
            color={colors.textSecondary}
            style={styles.message}
          >
            {message}
          </ResponsiveText>
        </ResponsiveView>
      )}
    </ResponsiveView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
  },
});
