import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  GestureResponderEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Address, AddressCard } from '../../components/ui/AddressCard';
import { useAlert } from '../../components/ui/AlertProvider';
import Button from '../../components/ui/Button';
import { CheckoutHeader } from '../../components/ui/CheckoutHeader';
import { CheckoutLoadingState } from '../../components/ui/CheckoutLoadingState';
import { CheckoutSection } from '../../components/ui/CheckoutSection';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { GCashPaymentModal } from '../../components/ui/GCashPaymentModal';
import { OrderSummary, OrderSummaryCard } from '../../components/ui/OrderSummaryCard';
import { PaymentMethod, PaymentMethodCard } from '../../components/ui/PaymentMethodCard';
import { PaymentProcessingOverlay } from '../../components/ui/PaymentProcessingOverlay';
import { ResponsiveText } from '../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../components/ui/ResponsiveView';
import TextAreaForm from '../../components/ui/TextAreaForm';
import Responsive from '../../constants/Responsive';
import { useTheme } from '../../contexts/ThemeContext';
import { useAddresses } from '../../hooks/useAddresses';
import { useCart, useCartValidation } from '../../hooks/useCart';
import { useCreateOrder } from '../../hooks/useOrders';
import { supabase } from '../../lib/supabase';

const paymentMethods: PaymentMethod[] = [
  {
    id: 'cod',
    name: 'Cash on Delivery',
    icon: 'money',
    description: 'Pay when your order arrives',
    isAvailable: true,
    color: '#4CAF50',
  },
  {
    id: 'gcash',
    name: 'GCash',
    icon: 'phone-android',
    description: 'Upload receipt; admin verifies before preparation',
    isAvailable: true,
    processingFee: 0,
    color: '#0070F3',
  },
  // {
  //   id: 'paymaya',
  //   name: 'PayMaya',
  //   icon: 'credit-card',
  //   description: 'Pay using your PayMaya account',
  //   isAvailable: false,
  //   processingFee: 5.00,
  //   color: '#00D4AA',
  // }
];

export default function CheckoutScreen() {
  const { colors } = useTheme();
  const { success, confirm, info, error: showError } = useAlert();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getSelectedItems, selectedSubtotal, clearCart, resetDeliveryFee } = useCart();
  const items = getSelectedItems();
  const subtotal = selectedSubtotal;
  const deliveryFee = 0; // Temporary: zero, will come from admin config later
  const tax = 0; // No tax
  const { validationErrors, isValid } = useCartValidation();
  const { addresses, isLoading: addressesLoading, error: addressesError } = useAddresses();
  // Map backend address shape to UI AddressCard shape
  const uiAddresses: Address[] = (addresses || []).map((addr: any) => ({
    id: addr.id,
    label: addr.label,
    address_line_1: addr.full_address,
    address_line_2: undefined,
    city: '',
    state: '',
    postal_code: '',
    is_default: !!addr.is_default,
  }));
  const { createOrder, isLoading: isCreatingOrder } = useCreateOrder();
  
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cod');
  const [orderNotes, setOrderNotes] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentRetryCount, setPaymentRetryCount] = useState(0);
  const [lastPaymentError, setLastPaymentError] = useState<string | null>(null);
  const [gcashModalVisible, setGcashModalVisible] = useState(false);
  const [proofUri, setProofUri] = useState<string | null>(null);
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('delivery');
  const [gcashReadyForOrder, setGcashReadyForOrder] = useState(false); // Track when GCash proof is uploaded
  const [showPaymentProcessing, setShowPaymentProcessing] = useState(false); // Show loading overlay during GCash processing
  const gcashQrImage = require('../../assets/gcash_qr.jpg'); // use lowercase extension for Metro
  const pickupLocationSnapshot = 'Kitchen One - Main Branch\nSan Vicente, Bulan, Sorsogon';

  const fulfillmentOptions: Array<{
    id: 'delivery' | 'pickup';
    title: string;
    description: string;
    infoTitle: string;
    infoMessage: string;
  }> = [
    {
      id: 'delivery',
      title: 'For Delivery',
      description: 'Have a Kitchen One rider bring the order to your selected address.',
      infoTitle: 'For Delivery',
      infoMessage: 'The rider will deliver your product with ease. Please ensure someone is available to receive the order.',
    },
    {
      id: 'pickup',
      title: 'To Be Picked Up',
      description: 'Pick up your order directly at the Kitchen One branch once it is ready.',
      infoTitle: 'To Be Picked Up',
      infoMessage: 'The product will be picked up by the customer at the Kitchen One address. Bring your payment receipt or order number for faster verification.',
    },
  ];
  // Calculate processing fee based on selected payment method
  const selectedPaymentMethodData = paymentMethods.find(method => method.id === selectedPaymentMethod);
  const processingFee = selectedPaymentMethodData?.processingFee || 0;
  
  const total = subtotal + deliveryFee + tax + processingFee; // Include processing fee

  // Debug logging to identify the issue
  console.log('Checkout Debug:', {
    itemsCount: items.length,
    subtotal,
    deliveryFee,
    tax,
    processingFee,
    total,
    selectedPaymentMethod,
    items: items.map(item => ({ name: item.product_name, price: item.total_price }))
  });

  useEffect(() => {
    // Reset delivery fee to 0 to ensure no hidden fees
    resetDeliveryFee();
  }, []);

  useEffect(() => {
    if (uiAddresses.length > 0 && !selectedAddress) {
      const defaultAddress = uiAddresses.find(addr => addr.is_default) || uiAddresses[0];
      setSelectedAddress(defaultAddress);
    }
  }, [uiAddresses, selectedAddress]);

  const handleFulfillmentInfo = (optionId: 'delivery' | 'pickup') => {
    const option = fulfillmentOptions.find(opt => opt.id === optionId);
    if (!option) return;
    info(option.infoTitle, option.infoMessage);
  };

  const handleFulfillmentChange = (optionId: 'delivery' | 'pickup') => {
    setFulfillmentType(optionId);
  };

  const handleFulfillmentInfoPress = (optionId: 'delivery' | 'pickup') => (event: GestureResponderEvent) => {
    event.stopPropagation();
    handleFulfillmentInfo(optionId);
  };

  const handlePlaceOrder = () => {
    // Special handling for GCash payment
    if (selectedPaymentMethod === 'gcash') {
      // If GCash is ready for order (proof uploaded), proceed directly
      if (gcashReadyForOrder) {
        // Show confirmation alert and proceed to order
        confirm(
          'Place Order',
          `Proceed to place your order for ₱${total.toFixed(2)}?`,
          () => {
            setGcashReadyForOrder(false); // Reset flag
            processOrder();
          },
          undefined,
          'Place Order',
          'Cancel'
        );
        return;
      }
      
      // If no proof uploaded yet, show GCash modal
      if (!proofUri) {
        setGcashModalVisible(true);
        return;
      }
    }
    
    // For COD or other payment methods, show confirmation alert
    confirm(
      'Place Order',
      `Proceed to place your order for ₱${total.toFixed(2)}?`,
      processOrder,
      undefined,
      'Place Order',
      'Cancel'
    );
  };

  const processOrder = async () => {
    setCheckoutError(null);
    
    if (!isValid) {
      setCheckoutError(validationErrors.join('\n'));
      return;
    }

    if (fulfillmentType === 'delivery' && !selectedAddress) {
      setCheckoutError('Please select a delivery address.');
      return;
    }

    if (!selectedPaymentMethod) {
      setCheckoutError('Please select a payment method.');
      return;
    }

    // Validate payment method availability
    const paymentMethodData = paymentMethods.find(method => method.id === selectedPaymentMethod);
    if (!paymentMethodData?.isAvailable) {
      setCheckoutError('Selected payment method is not available. Please choose another option.');
      return;
    }

    // Show loading overlay for GCash payment processing
    const isGCashPayment = selectedPaymentMethod === 'gcash';
    if (isGCashPayment) {
      setShowPaymentProcessing(true);
    }

    try {
      // Process payment based on method
      let paymentResult = null;
      
      if (selectedPaymentMethod === 'cod') {
        // Cash on Delivery - no payment processing needed
        paymentResult = { success: true, method: 'cod' };
      } else if (selectedPaymentMethod === 'gcash') {
        // GCash offline flow: require proof upload and show QR modal first
        if (!proofUri) {
          setShowPaymentProcessing(false);
          setGcashModalVisible(true);
          return; // wait for user to upload then press Place Order again
        }
        paymentResult = { success: true, method: 'gcash' };
      }

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
          pizza_slice: item.pizza_slice,
          toppings: item.toppings,
          customization_details: item.customization_details,
        })),
        fulfillment_type: fulfillmentType,
        delivery_address_id: fulfillmentType === 'delivery' ? selectedAddress?.id : null,
        payment_method: selectedPaymentMethod,
        processing_fee: processingFee,
        notes: orderNotes,
        pickup_location_snapshot: fulfillmentType === 'pickup' ? pickupLocationSnapshot : null,
      };

      const order = await createOrder(orderData);

      // If gcash with proof, upload to storage and link via RPC insert
      if (selectedPaymentMethod === 'gcash' && proofUri) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          // Use the new image upload service
          const { ImageUploadService } = await import('../../services/image-upload.service');
          const uploadResult = await ImageUploadService.uploadPaymentProof(
            order.id, 
            proofUri, 
            user.id
          );

          await supabase.from('payment_transactions' as any).insert({
            order_id: order.id,
            amount: order.total_amount,
            payment_method: 'gcash',
            status: 'pending',
            proof_of_payment_url: uploadResult.url,
          } as any);

          await supabase.from('orders').update({ 
            proof_of_payment_url: uploadResult.url,
            payment_status: 'pending'
          }).eq('id', order.id);
        } catch (e: any) {
          console.error('❌ Proof upload failed:', e);
          console.error('❌ Error details:', {
            message: e?.message,
            stack: e?.stack,
            name: e?.name
          });
          
          // Hide loading overlay on error
          if (isGCashPayment) {
            setShowPaymentProcessing(false);
          }
          
          // Show error to user - don't proceed silently
          // Log detailed error for debugging
          const errorMessage = e?.message || 'Failed to upload payment proof. Please try uploading the image again or contact support.';
          
          console.error('❌ Payment proof upload error details:', {
            message: errorMessage,
            error: e,
            orderId: order.id
          });
          
          // Show alert with option to continue or retry
          showError(
            'Image Upload Failed',
            errorMessage + '\n\nWould you like to continue with the order anyway, or cancel to retry?'
          );
          
          // For now, allow order to proceed but log warning for admin
          // In production, you might want to show a modal with retry option
          console.warn('⚠️ Order proceeding without proof upload - Admin should be notified');
        }
      }
      
      // Hide loading overlay before showing success
      if (isGCashPayment) {
        setShowPaymentProcessing(false);
      }
      
      // Clear cart after successful order
      clearCart();
      
      // Show different confirmation messages based on payment method
      const paymentMethodName = selectedPaymentMethodData?.name || 'Unknown';
      const isOnlinePayment = selectedPaymentMethod === 'gcash';
      
      success(
        'Order Placed Successfully!',
        isOnlinePayment 
          ? `Your order ${order.order_number} has been placed with ${paymentMethodName}. Admin will verify your receipt shortly.`
          : fulfillmentType === 'pickup'
            ? `Your pickup order ${order.order_number} has been placed. We will notify you once it is ready for collection at Kitchen One.`
            : `Your order ${order.order_number} has been placed and will be processed shortly. Please prepare cash payment upon delivery.`,
        [
          {
            text: 'View Order',
            onPress: () => router.push(`/orders/${order.id}`)
          },
          {
            text: 'Continue Shopping',
            style: 'secondary' as const, // Make Continue Shopping button secondary type
            onPress: () => router.push('/(customer)/(tabs)')
          }
        ]
      );
    } catch (error: any) {
      console.error('Error placing order:', error);
      // Hide loading overlay on error
      if (isGCashPayment) {
        setShowPaymentProcessing(false);
      }
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

  const handleItemPress = (item: any) => {
    // Navigate to product detail page
    router.push(`/(customer)/product/${item.product_id}`);
  };

  const processOnlinePayment = async (method: string, amount: number) => {
    // Simulate payment processing
    // In a real app, this would integrate with payment gateways like GCash, PayMaya APIs
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate payment success/failure (90% success rate for demo)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        return {
          success: true,
          reference: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          method,
          amount,
        };
      } else {
        return {
          success: false,
          error: 'Payment was declined. Please try again or use a different payment method.',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Payment processing failed. Please try again.',
      };
    }
  };

  const orderSummary: OrderSummary = {
    items,
    subtotal,
    deliveryFee,
    tax,
    processingFee,
    total,
    currency: '₱',
  };

  const pickProof = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled) setProofUri(res.assets[0].uri);
  };

  if (items.length === 0) {
    return (
      <ResponsiveView style={[styles.container, { backgroundColor: colors.background }]}>
        <ResponsiveView style={{ paddingTop: insets.top }}>
          <CheckoutHeader
            title="Checkout"
            onBack={() => router.back()}
          />
        </ResponsiveView>
        <ResponsiveView flex={1} justifyContent="center" alignItems="center" paddingHorizontal="lg">
          <EmptyState
            icon="shopping-cart"
            title="Your cart is empty"
            description="Add some items to your cart to proceed with checkout"
            actionTitle="Continue Shopping"
            onActionPress={() => router.push('/(customer)/(tabs)')}
            showAction
            fullScreen
          />
        </ResponsiveView>
      </ResponsiveView>
    );
  }

  return (
    <ResponsiveView style={[styles.container, { backgroundColor: colors.background }]}>
      <ResponsiveView style={{ paddingTop: insets.top }}>
        <CheckoutHeader
          title="Checkout"
          onBack={() => router.back()}
        />
      </ResponsiveView>

      <ResponsiveView flex={1} flexDirection={Responsive.isTablet ? 'row' : 'column'}>
        {/* Main Content */}
        <ResponsiveView 
          flex={Responsive.isTablet ? 2 : 1} 
          paddingHorizontal={Responsive.isTablet ? "lg" : "md"}
        >
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, Responsive.responsiveValue(20, 24, 28, 32)) }
            ]}
          >
                 {/* Error Display */}
                 {(checkoutError || lastPaymentError) && (
                   <ResponsiveView marginBottom="md">
                     <ErrorState
                       title={lastPaymentError ? "Payment Error" : "Checkout Error"}
                       message={lastPaymentError || checkoutError || 'Unknown error'}
                       actionTitle={lastPaymentError ? "Try Different Method" : "Try Again"}
                       onActionPress={() => {
                         setCheckoutError(null);
                         setLastPaymentError(null);
                         setPaymentRetryCount(0);
                       }}
                     />
                     {paymentRetryCount > 0 && (
                       <ResponsiveView marginTop="sm" paddingHorizontal="md">
                         <ResponsiveText size="sm" color={colors.textSecondary}>
                           Retry attempt: {paymentRetryCount}/2
                         </ResponsiveText>
                       </ResponsiveView>
                     )}
                   </ResponsiveView>
                 )}

            {/* Fulfillment Method */}
            <ResponsiveView marginBottom="lg">
              <CheckoutSection
                title="Receive Options"
                subtitle="Choose how you want to receive your order"
                required
              >
                <ResponsiveView
                  style={[
                    styles.fulfillmentOptions,
                    Responsive.isTablet && styles.fulfillmentOptionsGrid
                  ]}
                >
                  {fulfillmentOptions.map(option => {
                    const isSelected = fulfillmentType === option.id;
                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.fulfillmentOptionCard,
                          {
                            borderColor: isSelected ? colors.primary : colors.border,
                            backgroundColor: isSelected ? colors.surface : colors.surfaceVariant,
                          }
                        ]}
                        activeOpacity={0.92}
                        onPress={() => handleFulfillmentChange(option.id)}
                      >
                        <ResponsiveView
                          flexDirection="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <ResponsiveText
                            size="md"
                            weight="semiBold"
                            color={isSelected ? colors.primary : colors.text}
                          >
                            {option.title}
                          </ResponsiveText>
                          <TouchableOpacity
                            style={styles.fulfillmentInfoButton}
                            onPress={handleFulfillmentInfoPress(option.id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <MaterialIcons
                              name="help-outline"
                              size={20}
                              color={isSelected ? colors.primary : colors.textSecondary}
                            />
                          </TouchableOpacity>
                        </ResponsiveView>
                        <ResponsiveText
                          size="sm"
                          color={colors.textSecondary}
                          style={styles.fulfillmentDescription}
                        >
                          {option.description}
                        </ResponsiveText>
                      </TouchableOpacity>
                    );
                  })}
                </ResponsiveView>
              </CheckoutSection>
            </ResponsiveView>

            {/* Delivery Address / Pickup Details */}
            {fulfillmentType === 'delivery' ? (
              <ResponsiveView marginBottom="lg">
                <CheckoutSection
                  title="Delivery Address"
                  subtitle="Select where you want your order delivered"
                  required
                  loading={addressesLoading}
                  error={addressesError ? 'Failed to load addresses' : undefined}
                >
                  {addressesLoading ? (
                    <CheckoutLoadingState message="Loading addresses..." />
                  ) : uiAddresses.length > 0 ? (
                    <ResponsiveView 
                      style={[
                        styles.addressesList,
                        Responsive.isTablet && styles.addressesGrid
                      ]}
                    >
                      {uiAddresses.map((address) => (
                        <ResponsiveView 
                          key={address.id}
                          style={Responsive.isTablet ? styles.gridItem : undefined}
                        >
                          <AddressCard
                            address={address}
                            selected={selectedAddress?.id === address.id}
                            onSelect={handleAddressSelect}
                            onEdit={handleAddressEdit}
                            showEditButton
                          />
                        </ResponsiveView>
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
              </ResponsiveView>
            ) : (
              <ResponsiveView marginBottom="lg">
                <CheckoutSection
                  title="Pickup Details"
                  subtitle="Collect your order at Kitchen One once it is ready"
                  required
                >
                  <ResponsiveView
                    style={[
                      styles.pickupInfoCard,
                      { borderColor: colors.border, backgroundColor: colors.surfaceVariant }
                    ]}
                  >
                    <ResponsiveText weight="semiBold" size="md">
                      Kitchen One Main Branch
                    </ResponsiveText>
                    <ResponsiveText
                      size="sm"
                      color={colors.textSecondary}
                      style={styles.pickupInfoText}
                    >
                      {pickupLocationSnapshot}
                    </ResponsiveText>
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      Show your order number and any payment confirmation to our staff when you arrive.
                    </ResponsiveText>
                  </ResponsiveView>
                </CheckoutSection>
              </ResponsiveView>
            )}

            {/* Payment Method */}
            <ResponsiveView marginBottom="lg">
              <CheckoutSection
                title="Payment Method"
                subtitle="Currently only Cash on Delivery is available"
                required
              >
                <ResponsiveView 
                  style={[
                    styles.paymentMethodsList,
                    Responsive.isTablet && styles.paymentMethodsGrid
                  ]}
                >
                  {paymentMethods.map((method) => (
                    <ResponsiveView 
                      key={method.id}
                      style={Responsive.isTablet ? styles.gridItem : undefined}
                    >
                      <PaymentMethodCard
                        method={method}
                        selected={selectedPaymentMethod === method.id}
                        onSelect={handlePaymentMethodSelect}
                        disabled={paymentProcessing}
                      />
                    </ResponsiveView>
                  ))}
                </ResponsiveView>
              </CheckoutSection>
            </ResponsiveView>

            {/* Order Notes */}
            <ResponsiveView marginBottom="lg">
              <TextAreaForm
                label="Order Notes"
                subtitle="Any special requests or notes? (Optional)"
                placeholder="Any special requests or notes..."
                value={orderNotes}
                onChangeText={setOrderNotes}
                numberOfLines={3}
                maxLength={500}
                fullWidth
                variant="outline"
                size="medium"
              />
            </ResponsiveView>

            {/* Order Summary - Mobile: Inside ScrollView, Tablet: Outside */}
            {!Responsive.isTablet && (
              <ResponsiveView marginBottom="lg">
                <OrderSummaryCard
                  summary={orderSummary}
                  showImages={true}
                  compact={false}
                  onItemPress={handleItemPress}
                />
              </ResponsiveView>
            )}
          </ScrollView>
        </ResponsiveView>

        {/* Order Summary Sidebar (Tablet Only) */}
        {Responsive.isTablet && (
          <ResponsiveView 
            flex={1}
            backgroundColor={colors.surface}
            paddingHorizontal="lg"
            paddingVertical="lg"
            style={styles.sidebar}
          >
            <OrderSummaryCard
              summary={orderSummary}
              showImages={false}
              compact={true}
              onItemPress={handleItemPress}
            />
            {/* GCash Payment Modal for Tablet */}
            <GCashPaymentModal
              visible={gcashModalVisible}
              onClose={() => setGcashModalVisible(false)}
              onConfirm={(receiptUri: string) => {
                setProofUri(receiptUri);
                setGcashModalVisible(false);
                setGcashReadyForOrder(true); // Mark as ready for order
              }}
              totalAmount={total}
              qrImageSource={gcashQrImage}
            />
          </ResponsiveView>
        )}

        {/* Place Order Button - Mobile: Sticky Footer, Tablet: In Sidebar */}
        {!Responsive.isTablet && (
          <ResponsiveView 
            paddingHorizontal="md"
            paddingVertical="md"
            backgroundColor={colors.surface}
            style={[styles.stickyFooter, { borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) }]}
          >
            <Button
              title={
                paymentProcessing 
                  ? `Processing ${selectedPaymentMethodData?.name}...` 
                  : isCreatingOrder 
                    ? "Placing Order..." 
                    : paymentRetryCount > 0
                      ? `Retry Payment - ₱${total.toFixed(2)} (${paymentRetryCount}/2)`
                      : `Place Order - ₱${total.toFixed(2)}`
              }
              onPress={handlePlaceOrder}
              variant="primary"
              fullWidth
              size="large"
              loading={isCreatingOrder}
              disabled={
                !isValid ||
                (fulfillmentType === 'delivery' && !selectedAddress) ||
                isCreatingOrder ||
                paymentProcessing
              }
            />
            <GCashPaymentModal
              visible={gcashModalVisible}
              onClose={() => setGcashModalVisible(false)}
              onConfirm={(receiptUri: string) => {
                setProofUri(receiptUri);
                setGcashModalVisible(false);
                setGcashReadyForOrder(true); // Mark as ready for order
              }}
              totalAmount={total}
              qrImageSource={gcashQrImage}
            />
          </ResponsiveView>
        )}

        {Responsive.isTablet && (
          <ResponsiveView 
            paddingHorizontal="lg"
            paddingVertical="md"
            backgroundColor={colors.surface}
            style={[styles.sidebar, { borderLeftColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) }]}
          >
            <Button
              title={
                paymentProcessing 
                  ? `Processing ${selectedPaymentMethodData?.name}...` 
                  : isCreatingOrder 
                    ? "Placing Order..." 
                    : paymentRetryCount > 0
                      ? `Retry Payment - ₱${total.toFixed(2)} (${paymentRetryCount}/2)`
                      : `Place Order - ₱${total.toFixed(2)}`
              }
              onPress={handlePlaceOrder}
              variant="primary"
              fullWidth
              size="large"
              loading={isCreatingOrder}
              disabled={
                !isValid ||
                (fulfillmentType === 'delivery' && !selectedAddress) ||
                isCreatingOrder ||
                paymentProcessing
              }
            />
          </ResponsiveView>
        )}
      </ResponsiveView>
      
      {/* Payment Processing Overlay - Shows during GCash payment processing */}
      <PaymentProcessingOverlay 
        visible={showPaymentProcessing}
        message="Payment processing Please wait for a while"
      />
    </ResponsiveView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Responsive.responsiveValue(20, 24, 28, 32),
  },
  fulfillmentOptions: {
    gap: Responsive.ResponsiveSpacing.sm,
  },
  fulfillmentOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  fulfillmentOptionCard: {
    borderWidth: 1,
    borderRadius: Responsive.ResponsiveSpacing.sm,
    padding: Responsive.ResponsiveSpacing.md,
    width: Responsive.isTablet ? '48%' : '100%',
  },
  fulfillmentDescription: {
    marginTop: Responsive.ResponsiveSpacing.xs,
  },
  fulfillmentInfoButton: {
    marginLeft: Responsive.ResponsiveSpacing.xs,
  },
  addressesList: {
    gap: Responsive.ResponsiveSpacing.sm,
  },
  addressesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  paymentMethodsList: {
    gap: Responsive.ResponsiveSpacing.sm,
  },
  paymentMethodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: Responsive.isTablet ? '48%' : '100%',
    marginBottom: Responsive.ResponsiveSpacing.sm,
  },
  sidebar: {
    borderLeftWidth: 1,
    maxHeight: '100%',
  },
  stickyFooter: {
    borderTopWidth: 1,
    // backgroundColor and borderTopColor are now set dynamically via props
  },
  pickupInfoCard: {
    borderWidth: 1,
    borderRadius: Responsive.ResponsiveSpacing.sm,
    padding: Responsive.ResponsiveSpacing.md,
    gap: Responsive.ResponsiveSpacing.xs,
  },
  pickupInfoText: {
    marginVertical: Responsive.ResponsiveSpacing.xs,
  },
});