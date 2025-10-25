import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Layout from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import { ResponsiveText } from './ResponsiveText';
import { ResponsiveView } from './ResponsiveView';

interface CheckoutHeaderProps {
  title: string;
  onBack: () => void;
  rightAction?: {
    icon: string;
    onPress: () => void;
    accessibilityLabel?: string;
  };
}

export const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({
  title,
  onBack,
  rightAction,
}) => {
  const { colors } = useTheme();

  return (
    <ResponsiveView style={[styles.container, { backgroundColor: colors.background }]}>
      <ResponsiveView style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBack}
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <ResponsiveView style={styles.titleContainer}>
          <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
            {title}
          </ResponsiveText>
        </ResponsiveView>
        
        <View style={styles.rightContainer}>
          {rightAction ? (
            <TouchableOpacity 
              style={styles.rightButton} 
              onPress={rightAction.onPress}
              accessibilityLabel={rightAction.accessibilityLabel}
            >
              <MaterialIcons name={rightAction.icon as any} size={24} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
      </ResponsiveView>
    </ResponsiveView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    minHeight: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Layout.spacing.md,
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  rightButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
});
