import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Strings } from '../../constants/Strings';
import { useTheme } from '../../contexts/ThemeContext';
import AppTitle from '../ui/AppTitle';
import Text from '../ui/Text';

interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  showLogo = true,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {showLogo && (
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <AppTitle variant="large" align="center" style={styles.appName} />
          <Text align="center" color={theme.colors.textSecondary} style={styles.tagline}>
            {Strings.appTagline}
          </Text>
        </View>
      )}
      
      {title && (
        <View style={styles.titleContainer}>
          <Text variant="h3" align="center" style={styles.title}>
            {title}
          </Text>
          {subtitle && (
            <Text align="center" color={theme.colors.textSecondary} style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  appName: {
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default AuthHeader;
