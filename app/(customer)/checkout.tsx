import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Address, AddressCard } from '../../components/ui/AddressCard';
import Button from '../../components/ui/Button';
import { CheckoutHeader } from '../../components/ui/CheckoutHeader';
import { CheckoutLoadingState } from '../../components/ui/CheckoutLoadingState';
import { CheckoutSection } from '../../components/ui/CheckoutSection';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { OrderSummary, OrderSummaryCard } from '../../components/ui/OrderSummaryCard';
import { PaymentMethod, PaymentMethodCard } from '../../components/ui/PaymentMethodCard';
import { ResponsiveInput } from '../../components/ui/ResponsiveInput';
import { ResponsiveView } from '../../components/ui/ResponsiveView';
import Layout from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import { useAddresses } from '../../hooks/useAddresses';
import { useCart, useCartValidation } from '../../hooks/useCart';
import { useCreateOrder } from '../../hooks/useOrders';

const paymentMethods: PaymentMethod[] = [
  {
    id: 'cod',
    name: 'Cash on Delivery',
    icon: 'money',
    description: 'Pay when your order arrives',
    isAvailable: true,
  },
  {
    id: 'gcash',
    name: 'GCash',
    icon: 'phone-android',
    description: 'Pay using your GCash account',
    isAvailable: true,
    processingFee: 5.00,
  },
  {
    id: 'paymaya',
    name: 'PayMaya',
    icon: 'credit-card',
    description: 'Pay using your PayMaya account',
    isAvailable: true,
    processingFee: 5.00,
  }
];

export default function CheckoutScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { items, subtotal, deliveryFee, tax, total, clearCart } = useCart();
  const { validationErrors, isValid } = useCartValidation();
  const { addresses, isLoading: addressesLoading, error: addressesError } = useAddresses();
  const { createOrder, isLoading: isCreatingOrder } = useCreateOrder();
  
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cod');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];
      setSelectedAddress(defaultAddress);
    }
  }, [addresses, selectedAddress]);

  const handlePlaceOrder = async () => {
    setCheckoutError(null);
    
    if (!isValid) {
      setCheckoutError(validationErrors.join('\n'));
      return;
    }

    if (!selectedAddress) {
      setCheckoutError('Please select a delivery address.');
      return;
    }

    if (!selectedPaymentMethod) {
      setCheckoutError('Please select a payment method.');
      return;
    }

    try {
      const orderData = {
        items: items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          special_instructions: item.special_instructions,
          pizza_size: item.pizza_size,
          pizza_crust: item.pizza_crust,
          toppings: item.toppings,
        })),
        delivery_address_id: selectedAddress.id,
        payment_method: selectedPaymentMethod,
        delivery_instructions: deliveryInstructions,
        notes: orderNotes,
      };

      const order = await createOrder(orderData);
      
      // Clear cart after successful order
      clearCart();
      
      Alert.alert(
        'Order Placed Successfully!',
        `Your order ${order.order_number} has been placed and will be processed shortly.`,
        [
          {
            text: 'View Order',
            onPress: () => router.push(`/orders/${order.id}`)
          },
          {
            text: 'Continue Shopping',
            onPress: () => router.push('/(customer)/(tabs)')
          }
        ]
      );
    } catch (error: any) {
      console.error('Error placing order:', error);
      setCheckoutError(error.message || 'Failed to place order. Please try again.');
    }
  };

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
  };

  const handleAddressEdit = (address: Address) => {
    router.push('/profile/addresses');
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method.id);
  };

  const orderSummary: OrderSummary = {
    items,
    subtotal,
    deliveryFee,
    tax,
    total,
    currency: '₱',
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <CheckoutHeader
          title="Checkout"
          onBack={() => router.back()}
        />
        <EmptyState
          icon="shopping-cart"
          title="Your cart is empty"
          description="Add some items to your cart to proceed with checkout"
          actionTitle="Continue Shopping"
          onActionPress={() => router.push('/(customer)/(tabs)')}
          showAction
          fullScreen
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <CheckoutHeader
        title="Checkout"
        onBack={() => router.back()}
        showProgress
        currentStep={1}
        totalSteps={3}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Error Display */}
        {checkoutError && (
          <ErrorState
            title="Checkout Error"
            message={checkoutError}
            actionTitle="Try Again"
            onActionPress={() => setCheckoutError(null)}
          />
        )}

        {/* Delivery Address */}
        <CheckoutSection
          title="Delivery Address"
          subtitle="Select where you want your order delivered"
          required
          loading={addressesLoading}
          error={addressesError ? 'Failed to load addresses' : undefined}
        >
          {addressesLoading ? (
            <CheckoutLoadingState message="Loading addresses..." />
          ) : addresses.length > 0 ? (
            <ResponsiveView style={styles.addressesList}>
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  selected={selectedAddress?.id === address.id}
                  onSelect={handleAddressSelect}
                  onEdit={handleAddressEdit}
                  showEditButton
                />
              ))}
            </ResponsiveView>
          ) : (
            <EmptyState
              icon="location-off"
              title="No addresses found"
              description="Please add an address to continue with checkout"
              actionTitle="Add Address"
              onActionPress={() => router.push('/profile/addresses')}
              showAction
            />
          )}
        </CheckoutSection>

        {/* Payment Method */}
        <CheckoutSection
          title="Payment Method"
          subtitle="Choose how you want to pay"
          required
        >
          <ResponsiveView style={styles.paymentMethodsList}>
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                selected={selectedPaymentMethod === method.id}
                onSelect={handlePaymentMethodSelect}
              />
            ))}
          </ResponsiveView>
        </CheckoutSection>

        {/* Delivery Instructions */}
        <CheckoutSection
          title="Delivery Instructions"
          subtitle="Any special delivery requests? (Optional)"
        >
          <ResponsiveInput
            placeholder="Special delivery instructions..."
            value={deliveryInstructions}
            onChangeText={setDeliveryInstructions}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />
        </CheckoutSection>

        {/* Order Notes */}
        <CheckoutSection
          title="Order Notes"
          subtitle="Any special requests or notes? (Optional)"
        >
          <ResponsiveInput
            placeholder="Any special requests or notes..."
            value={orderNotes}
            onChangeText={setOrderNotes}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />
        </CheckoutSection>

        {/* Order Summary */}
        <OrderSummaryCard
          summary={orderSummary}
          showImages={true}
        />
      </ScrollView>

      <ResponsiveView style={styles.footer}>
        <Button
          title={isCreatingOrder ? "Placing Order..." : `Place Order - ₱${total.toFixed(2)}`}
          onPress={handlePlaceOrder}
          variant="primary"
          fullWidth
          loading={isCreatingOrder}
          disabled={!isValid || !selectedAddress || isCreatingOrder}
        />
      </ResponsiveView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  addressesList: {
    gap: Layout.spacing.sm,
  },
  paymentMethodsList: {
    gap: Layout.spacing.sm,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});