import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet } from 'react-native';
import Layout from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import Button from './Button';
import { ResponsiveText } from './ResponsiveText';
import { ResponsiveView } from './ResponsiveView';

interface ErrorStateProps {
  title?: string;
  message: string;
  actionTitle?: string;
  onActionPress?: () => void;
  actionVariant?: 'primary' | 'outline' | 'secondary';
  showAction?: boolean;
  icon?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  actionTitle = 'Try Again',
  onActionPress,
  actionVariant = 'primary',
  showAction = true,
  icon = 'error',
  size = 'medium',
  fullScreen = false,
}) => {
  const { colors } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          iconSize: 48,
          titleSize: 'lg' as const,
          messageSize: 'sm' as const,
          padding: Layout.spacing.lg,
        };
      case 'large':
        return {
          iconSize: 80,
          titleSize: 'xl' as const,
          messageSize: 'md' as const,
          padding: Layout.spacing.xxxl,
        };
      default: // medium
        return {
          iconSize: 64,
          titleSize: 'xl' as const,
          messageSize: 'md' as const,
          padding: Layout.spacing.xl,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const containerStyle = fullScreen 
    ? [styles.container, styles.fullScreenContainer, { padding: sizeStyles.padding }]
    : [styles.container, { padding: sizeStyles.padding }];

  return (
    <ResponsiveView style={containerStyle}>
      <MaterialIcons 
        name={icon as any} 
        size={sizeStyles.iconSize} 
        color={colors.error} 
      />
      
      <ResponsiveView marginTop="md">
        <ResponsiveText 
          size={sizeStyles.titleSize} 
          weight="semiBold" 
          color={colors.text}
          style={styles.title}
        >
          {title}
        </ResponsiveText>
      </ResponsiveView>
      
      <ResponsiveView marginTop="sm">
        <ResponsiveText 
          size={sizeStyles.messageSize} 
          color={colors.textSecondary}
          style={styles.message}
        >
          {message}
        </ResponsiveText>
      </ResponsiveView>
      
      {showAction && onActionPress && (
        <ResponsiveView marginTop="lg">
          <Button
            title={actionTitle}
            onPress={onActionPress}
            variant={actionVariant}
          />
        </ResponsiveView>
      )}
    </ResponsiveView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 24,
  },
});
