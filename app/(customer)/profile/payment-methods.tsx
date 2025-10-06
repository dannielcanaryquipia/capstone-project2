import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import ResponsiveText from '../../../components/ui/ResponsiveText';
import ResponsiveView from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { useTheme } from '../../../contexts/ThemeContext';
import global from '../../../styles/global';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isExpired: boolean;
}

export default function PaymentMethodsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock payment methods data - in a real app, this would come from an API
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
      isExpired: false,
    },
    {
      id: '2',
      type: 'card',
      last4: '5555',
      brand: 'Mastercard',
      expiryMonth: 8,
      expiryYear: 2024,
      isDefault: false,
      isExpired: true,
    },
    {
      id: '3',
      type: 'paypal',
      isDefault: false,
      isExpired: false,
    },
  ]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleAddPaymentMethod = () => {
    Alert.alert(
      'Add Payment Method',
      'Choose how you want to add a payment method',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Credit/Debit Card', onPress: () => addCard() },
        { text: 'PayPal', onPress: () => addPayPal() },
        { text: 'Apple Pay', onPress: () => addApplePay() },
        { text: 'Google Pay', onPress: () => addGooglePay() },
      ]
    );
  };

  const addCard = () => {
    Alert.alert('Add Card', 'Card payment integration will be implemented soon.');
  };

  const addPayPal = () => {
    Alert.alert('Add PayPal', 'PayPal integration will be implemented soon.');
  };

  const addApplePay = () => {
    Alert.alert('Add Apple Pay', 'Apple Pay integration will be implemented soon.');
  };

  const addGooglePay = () => {
    Alert.alert('Add Google Pay', 'Google Pay integration will be implemented soon.');
  };

  const handleSetDefault = (methodId: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
    Alert.alert('Success', 'Default payment method updated');
  };

  const handleDeletePaymentMethod = (method: PaymentMethod) => {
    Alert.alert(
      'Delete Payment Method',
      `Are you sure you want to delete this ${method.brand || method.type} payment method?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(prev => prev.filter(m => m.id !== method.id));
            Alert.alert('Success', 'Payment method deleted successfully');
          },
        },
      ]
    );
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card': return 'credit-card';
      case 'paypal': return 'paypal';
      case 'apple_pay': return 'apple';
      case 'google_pay': return 'google';
      default: return 'payment';
    }
  };

  const getPaymentMethodTitle = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        return `${method.brand} •••• ${method.last4}`;
      case 'paypal':
        return 'PayPal Account';
      case 'apple_pay':
        return 'Apple Pay';
      case 'google_pay':
        return 'Google Pay';
      default:
        return 'Payment Method';
    }
  };

  const getPaymentMethodSubtitle = (method: PaymentMethod) => {
    if (method.type === 'card') {
      const expiryText = method.isExpired ? 'Expired' : `Expires ${method.expiryMonth}/${method.expiryYear}`;
      return method.isExpired ? `Expired • ${expiryText}` : expiryText;
    }
    return 'Ready to use';
  };

  const formatExpiryDate = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  return (
    <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <ResponsiveView padding="lg">
        {/* Header */}
        <ResponsiveView style={[styles.header, { backgroundColor: colors.surface }]}>
          <ResponsiveView style={styles.headerLeft}>
            <Button
              title=""
              onPress={() => router.back()}
              variant="text"
              icon={<MaterialIcons name="arrow-back" size={24} color={colors.text} />}
              style={styles.backButton}
            />
            <ResponsiveText size="xl" weight="bold" color={colors.text}>
              Payment Methods
            </ResponsiveText>
          </ResponsiveView>
          <Button
            title="Add"
            onPress={handleAddPaymentMethod}
            variant="primary"
            size="small"
            icon={<MaterialIcons name="add" size={16} color={colors.textInverse} />}
          />
        </ResponsiveView>

        {/* Payment Methods List */}
        {paymentMethods.length === 0 ? (
          <ResponsiveView style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <ResponsiveView style={[styles.emptyIcon, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialIcons name="payment" size={64} color={colors.primary} />
            </ResponsiveView>
            <ResponsiveView marginTop="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text} align="center">
                No payment methods
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView marginTop="sm">
              <ResponsiveText size="md" color={colors.textSecondary} align="center">
                Add a payment method to make ordering easier
              </ResponsiveText>
            </ResponsiveView>
            <Button
              title="Add Payment Method"
              onPress={handleAddPaymentMethod}
              variant="primary"
              size="large"
              style={styles.addButton}
            />
          </ResponsiveView>
        ) : (
          <ResponsiveView style={styles.paymentMethodsList}>
            {paymentMethods.map((method, index) => (
              <ResponsiveView 
                key={method.id} 
                style={[
                  styles.paymentMethodCard, 
                  { 
                    backgroundColor: colors.surface,
                    borderColor: method.isDefault ? colors.primary : colors.border,
                    ...Layout.shadows.sm
                  }
                ]}
              >
                {/* Payment Method Header */}
                <ResponsiveView style={styles.paymentMethodHeader}>
                  <ResponsiveView style={styles.paymentMethodTitleRow}>
                    <ResponsiveView style={styles.paymentMethodLeft}>
                      <ResponsiveView style={[styles.paymentMethodIcon, { backgroundColor: colors.surfaceVariant }]}>
                        <MaterialIcons 
                          name={getPaymentMethodIcon(method.type) as any} 
                          size={24} 
                          color={colors.primary} 
                        />
                      </ResponsiveView>
                      <ResponsiveView style={styles.paymentMethodInfo}>
                        <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                          {getPaymentMethodTitle(method)}
                        </ResponsiveText>
                        <ResponsiveView marginTop="xs">
                          <ResponsiveText 
                            size="sm" 
                            color={method.isExpired ? colors.error : colors.textSecondary}
                          >
                            {getPaymentMethodSubtitle(method)}
                          </ResponsiveText>
                        </ResponsiveView>
                      </ResponsiveView>
                    </ResponsiveView>
                    {method.isDefault && (
                      <ResponsiveView style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                        <ResponsiveText size="xs" weight="medium" color={colors.textInverse}>
                          DEFAULT
                        </ResponsiveText>
                      </ResponsiveView>
                    )}
                  </ResponsiveView>
                  <ResponsiveView style={styles.paymentMethodActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleSetDefault(method.id)}
                      disabled={method.isDefault || method.isExpired}
                    >
                      <MaterialIcons 
                        name="star" 
                        size={20} 
                        color={method.isDefault ? colors.primary : colors.textTertiary} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeletePaymentMethod(method)}
                    >
                      <MaterialIcons name="delete" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </ResponsiveView>
                </ResponsiveView>

                {/* Payment Method Details */}
                {method.type === 'card' && (
                  <ResponsiveView style={styles.cardDetails}>
                    <ResponsiveView style={styles.cardNumber}>
                      <ResponsiveText size="lg" weight="medium" color={colors.text}>
                        •••• •••• •••• {method.last4}
                      </ResponsiveText>
                    </ResponsiveView>
                    <ResponsiveView style={styles.cardExpiry}>
                      <ResponsiveText size="sm" color={colors.textSecondary}>
                        {formatExpiryDate(method.expiryMonth!, method.expiryYear!)}
                      </ResponsiveText>
                    </ResponsiveView>
                  </ResponsiveView>
                )}

                {/* Set Default Button */}
                {!method.isDefault && !method.isExpired && (
                  <ResponsiveView style={styles.setDefaultSection}>
                    <Button
                      title="Set as Default"
                      onPress={() => handleSetDefault(method.id)}
                      variant="outline"
                      size="small"
                      style={styles.setDefaultButton}
                    />
                  </ResponsiveView>
                )}

                {/* Expired Warning */}
                {method.isExpired && (
                  <ResponsiveView style={[styles.expiredWarning, { backgroundColor: colors.error + '20' }]}>
                    <MaterialIcons name="warning" size={16} color={colors.error} />
                    <ResponsiveView marginLeft="xs">
                      <ResponsiveText size="sm" color={colors.error}>
                        This payment method has expired
                      </ResponsiveText>
                    </ResponsiveView>
                  </ResponsiveView>
                )}
              </ResponsiveView>
            ))}
          </ResponsiveView>
        )}

        {/* Security Notice */}
        <ResponsiveView style={[styles.securityNotice, { backgroundColor: colors.surfaceVariant }]}>
          <MaterialIcons name="security" size={20} color={colors.primary} />
          <ResponsiveView marginLeft="sm" style={styles.securityText}>
            <ResponsiveText size="sm" color={colors.textSecondary}>
              Your payment information is encrypted and secure. We never store your full card details.
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </ResponsiveView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    ...Layout.shadows.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: Layout.spacing.sm,
    padding: Layout.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.xxxl,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    ...Layout.shadows.sm,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  addButton: {
    marginTop: Layout.spacing.lg,
  },
  paymentMethodsList: {
    gap: Layout.spacing.md,
  },
  paymentMethodCard: {
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    borderWidth: 2,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.sm,
  },
  paymentMethodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  defaultBadge: {
    paddingHorizontal: Layout.spacing.xs,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.xs,
    marginLeft: Layout.spacing.sm,
  },
  paymentMethodActions: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  actionButton: {
    padding: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Layout.spacing.sm,
    paddingTop: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  cardNumber: {
    flex: 1,
  },
  cardExpiry: {
    marginLeft: Layout.spacing.sm,
  },
  setDefaultSection: {
    marginTop: Layout.spacing.sm,
    paddingTop: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  setDefaultButton: {
    alignSelf: 'flex-start',
  },
  expiredWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Layout.spacing.sm,
    padding: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.sm,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
  },
  securityText: {
    flex: 1,
  },
});
