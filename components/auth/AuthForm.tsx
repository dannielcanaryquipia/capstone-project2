import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Text from '../ui/Text';

interface AuthFormProps {
  children: React.ReactNode;
  error?: string | null;
  style?: any;
}

const AuthForm: React.FC<AuthFormProps> = ({ children, error, style }) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      {error && (
        <View style={[styles.errorContainer, { borderLeftColor: theme.colors.error }]}>
          <Text color={theme.colors.error} style={styles.errorText}>
            {error}
          </Text>
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2', // Will be overridden by theme
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AuthForm;
