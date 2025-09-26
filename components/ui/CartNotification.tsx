import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ResponsiveText } from './ResponsiveText';
import { ResponsiveView } from './ResponsiveView';

interface CartNotificationProps {
  visible: boolean;
  productName: string;
  quantity: number;
  totalPrice: number;
  onGoToCart: () => void;
  onContinueShopping: () => void;
  onClose: () => void;
}

export const CartNotification: React.FC<CartNotificationProps> = ({
  visible,
  productName,
  quantity,
  totalPrice,
  onGoToCart,
  onContinueShopping,
  onClose,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ResponsiveView style={[styles.container, { backgroundColor: colors.card }]}>
          {/* Success Icon */}
          <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
            <MaterialIcons 
              name="check-circle" 
              size={48} 
              color={colors.success} 
            />
          </View>

          {/* Success Message */}
          <ResponsiveText 
            style={[styles.title, { color: colors.text }]}
            size="lg"
            weight="semiBold"
          >
            Added to Cart!
          </ResponsiveText>

          <ResponsiveText 
            style={[styles.message, { color: colors.textSecondary }]}
            size="md"
          >
            {quantity} x {productName}
          </ResponsiveText>

          <ResponsiveText 
            style={[styles.price, { color: colors.primary }]}
            size="lg"
            weight="bold"
          >
            ₱{totalPrice.toFixed(2)}
          </ResponsiveText>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.continueButton, { borderColor: colors.border }]}
              onPress={onContinueShopping}
            >
              <ResponsiveText 
                style={[styles.continueButtonText, { color: colors.text }]}
                size="md"
                weight="medium"
              >
                Continue Shopping
              </ResponsiveText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cartButton, { backgroundColor: colors.primary }]}
              onPress={onGoToCart}
            >
              <MaterialIcons name="shopping-cart" size={20} color={colors.white} />
              <ResponsiveText 
                style={[styles.cartButtonText, { color: colors.white }]}
                size="md"
                weight="semiBold"
              >
                Go to Cart
              </ResponsiveText>
            </TouchableOpacity>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <MaterialIcons 
              name="close" 
              size={24} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        </ResponsiveView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    marginBottom: 4,
  },
  price: {
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    minHeight: 48,
  },
  continueButton: {
    borderWidth: 1,
  },
  continueButtonText: {
    textAlign: 'center',
  },
  cartButton: {
    gap: 8,
  },
  cartButtonText: {
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
