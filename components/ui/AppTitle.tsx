import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Layout } from '../../constants/Layout';
import { Strings } from '../../constants/Strings';
import { useTheme } from '../../contexts/ThemeContext';

interface AppTitleProps {
  variant?: 'large' | 'medium' | 'small';
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: any;
}

const AppTitle: React.FC<AppTitleProps> = ({
  variant = 'large',
  color,
  align = 'center',
  style,
}) => {
  const theme = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'large':
        return {
          fontSize: Layout.fontSize.display,
          lineHeight: Layout.fontSize.display * 1.2,
        };
      case 'medium':
        return {
          fontSize: Layout.fontSize.xxxl,
          lineHeight: Layout.fontSize.xxxl * 1.2,
        };
      case 'small':
        return {
          fontSize: Layout.fontSize.xxl,
          lineHeight: Layout.fontSize.xxl * 1.2,
        };
      default:
        return {
          fontSize: Layout.fontSize.display,
          lineHeight: Layout.fontSize.display * 1.2,
        };
    }
  };

  return (
    <Text
      style={[
        styles.appTitle,
        getVariantStyle(),
        {
          color: color || theme.colors.text,
          textAlign: align,
        },
        style,
      ]}
    >
      {Strings.appName.toUpperCase()}
    </Text>
  );
};

const styles = StyleSheet.create({
  appTitle: {
    fontFamily: Layout.fontFamily.display,
    fontWeight: 'normal',
    letterSpacing: 0.5,
  },
});

export default AppTitle;