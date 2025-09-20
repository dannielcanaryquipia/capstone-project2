import React from 'react';
import { StyleSheet, View } from 'react-native';
import Layout from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import Text from '../ui/Text';

interface AuthFooterProps {
  primaryText: string;
  linkText: string;
  onLinkPress: () => void;
  disabled?: boolean;
}

const AuthFooter: React.FC<AuthFooterProps> = ({
  primaryText,
  linkText,
  onLinkPress,
  disabled = false,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.primaryText, { color: theme.colors.textSecondary }]}>
        {primaryText}{' '}
        <Text 
          style={[styles.linkText, { color: theme.colors.primary }]}
          onPress={onLinkPress}
        >
          {linkText}
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 24,
  },
  primaryText: {
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: Layout.fontFamily.regular,
    fontWeight: 'normal',
  },
  linkText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Layout.fontFamily.regular,
    fontWeight: 'normal',
  },
});

export default AuthFooter;
