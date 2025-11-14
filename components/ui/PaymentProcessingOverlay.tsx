import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ResponsiveText } from './ResponsiveText';
import { ResponsiveView } from './ResponsiveView';
import Layout from '../../constants/Layout';

interface PaymentProcessingOverlayProps {
  visible: boolean;
  message?: string;
}

export const PaymentProcessingOverlay: React.FC<PaymentProcessingOverlayProps> = ({
  visible,
  message = 'Payment processing Please wait for a while',
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
        <ResponsiveView style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Icon */}
          <ResponsiveView style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <MaterialIcons 
              name="payment" 
              size={48} 
              color={colors.primary} 
            />
          </ResponsiveView>

          {/* Spinner */}
          <ResponsiveView marginTop="lg">
            <ActivityIndicator 
              size="large" 
              color={colors.primary} 
            />
          </ResponsiveView>

          {/* Message */}
          <ResponsiveView marginTop="lg" paddingHorizontal="lg">
            <ResponsiveText 
              size="md" 
              color={colors.text}
              weight="medium"
              style={styles.message}
            >
              {message}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 280,
    maxWidth: '90%',
    ...Layout.shadows.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
  },
});

