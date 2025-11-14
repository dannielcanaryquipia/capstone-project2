 import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlert } from '../../../components/ui/AlertProvider';
import Button from '../../../components/ui/Button';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../../../constants/Responsive';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { supabase } from '../../../lib/supabase';
import { notificationService } from '../../../services/api';
import { OrderService } from '../../../services/order.service';
import global from '../../../styles/global';
import { OrderStatus } from '../../../types/order.types';
import { getDetailedCustomizationDisplay } from '../../../utils/customizationDisplay';

interface OrderDetail {
  id: string;
  user_id: string;
  delivery_address_id: string;
  total_amount: number;
  status: OrderStatus;
  fulfillment_type?: 'delivery' | 'pickup';
  payment_method?: string;
  payment_status?: string;
  order_notes?: string;
  created_at: string;
  updated_at: string;
  proof_of_payment_url?: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  customer_notes?: string;
  admin_notes?: string;
  payment_verified?: boolean;
  payment_verified_at?: string;
  payment_verified_by?: string;
  pickup_location_snapshot?: string;
  pickup_notes?: string;
  picked_up_at?: string;
  customer: {
    id: string;
    full_name: string;
    phone_number?: string;
    username: string;
  };
  delivery_address?: {
    id: string;
    full_address: string;
    label?: string;
  } | null;
  order_items: Array<{
    id: string;
    product: {
      id: string;
      name: string;
      image_url?: string;
    };
    quantity: number;
    unit_price: number;
    customization_details?: any;
    selected_size?: string;
  }>;
  payment_transaction?: {
    id: string;
    payment_method: string;
    amount: number;
    status: string;
    proof_of_payment_url?: string;
    verified_at?: string;
    verified_by?: string;
  };
  // Rider delivery information
  delivered_by_rider?: {
    id: string;
    full_name?: string;
    phone_number?: string;
    username: string;
  };
  delivered_at?: string;
}

export default function OrderDetailScreen() {
  const { colors } = useTheme();
  const { confirmDestructive, success, error: showError } = useAlert();
  const router = useRouter();
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [viewedProof, setViewedProof] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [proofImageUrl, setProofImageUrl] = useState<string | null>(null);
  const [proofImageError, setProofImageError] = useState(false);
  const [proofAspectRatio, setProofAspectRatio] = useState<number | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [paymentProofs, setPaymentProofs] = useState<Array<any>>([]);
  const [deliveryProofs, setDeliveryProofs] = useState<Array<any>>([]);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const raw = await OrderService.getOrderById(id) as any;

      // Normalize customer from joined user
      if (raw && !raw.customer && raw.user) {
        raw.customer = {
          id: raw.user_id,
          full_name: raw.user.full_name || 'Unknown Customer',
          phone_number: raw.user.phone_number,
          username: raw.user.username || '',
        };
      }

      // Normalize items -> order_items expected by UI
      if (raw && !raw.order_items && Array.isArray(raw.items)) {
        raw.order_items = raw.items.map((it: any) => ({
          id: it.id,
          product: {
            id: it.product_id,
            name: it.product?.name || it.product_name,
            image_url: it.product?.image_url || it.product_image,
          },
          quantity: it.quantity,
          unit_price: it.unit_price,
          customization_details: it.customization_details,
          selected_size: it.pizza_size || it.selected_size,
        }));
      }

      console.log('Order data loaded:', {
        id: raw?.id,
        payment_method: raw?.payment_method,
        payment_status: raw?.payment_status,
        proof_of_payment_url: raw?.proof_of_payment_url,
        payment_transactions: raw?.payment_transactions
      });
      
      setOrder(raw as OrderDetail);

      // Load proofs (payment and delivery)
      try {
        const proofs = await OrderService.getOrderProofImages(id);
        setPaymentProofs(proofs.paymentProofs || []);
        setDeliveryProofs(proofs.deliveryProofs || []);
      } catch (e) {
        console.warn('Failed to load proofs', e);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      showError('Error', 'Failed to load order details');
      router.replace('/(admin)/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order || !id) return;

    confirmDestructive(
      'Update Order Status',
      `Are you sure you want to mark this order as ${newStatus.replace('_', ' ')}?`,
      async () => {
        setUpdating(true);
        try {
          await OrderService.updateOrderStatus(id, newStatus, 'Admin status update');
          await loadOrder(); // Reload order data
          success('Success', 'Order status updated successfully!');
        } catch (error) {
          console.error('Error updating order status:', error);
          showError('Error', 'Failed to update order status. Please try again.');
        } finally {
          setUpdating(false);
        }
      },
      undefined,
      'Update',
      'Cancel'
    );
  };

  const handleVerifyPayment = async () => {
    if (!id) return;
    confirmDestructive(
      'Verify Payment',
      'Mark payment as verified and move order to Preparing?',
      async () => {
        try {
          setVerifying(true);
          // Get current admin user ID
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Admin not authenticated');
          
          await OrderService.verifyPayment(id as string, user.id);
          await loadOrder();
          success('Success', 'Payment verified. Order moved to Preparing.');
        } catch (e) {
          showError('Error', 'Failed to verify payment.');
        } finally {
          setVerifying(false);
        }
      },
      undefined,
      'Verify',
      'Cancel'
    );
  };

  const handleCancelOrder = async () => {
    if (!id) return;
    confirmDestructive(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone and the customer will be notified.',
      async () => {
        try {
          setCanceling(true);
          await OrderService.updateOrderStatus(id as string, 'cancelled', 'Admin cancelled - payment not verified');
          
          // Send notification to customer
          try {
            await notificationService.sendNotification({
              userId: order?.user_id || '',
              title: 'Order Cancelled',
              message: `Your order #${order?.id?.slice(-8) || 'N/A'} has been cancelled due to payment verification issues. Please contact support if you have any questions.`,
              type: 'order_update',
              relatedId: id as string,
            });
          } catch (notificationError) {
            console.warn('Failed to send cancellation notification:', notificationError);
            // Don't fail the cancellation if notification fails
          }
          
          await loadOrder();
          success('Order Cancelled', 'The order has been cancelled and the customer has been notified.');
        } catch (e) {
          console.error('Error cancelling order:', e);
          showError('Error', 'Failed to cancel order. Please try again.');
        } finally {
          setCanceling(false);
        }
      },
      undefined,
      'Cancel Order',
      'Keep Order'
    );
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'confirmed': return colors.info;
      case 'preparing': return colors.accent;
      case 'ready_for_pickup': return colors.primary;
      case 'out_for_delivery': return colors.secondary;
      case 'delivered': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'preparing';
      case 'preparing': return 'ready_for_pickup';
      case 'ready_for_pickup': return 'out_for_delivery';
      case 'out_for_delivery': return 'delivered';
      default: return null;
    }
  };

  // Check if order can be cancelled by admin
  const canCancelOrder = (currentStatus: OrderStatus): boolean => {
    return currentStatus === 'pending' || currentStatus === 'preparing';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <SafeAreaView 
        style={[global.screen, styles.center, { backgroundColor: colors.background }]}
        edges={['top', 'bottom', 'left', 'right']}
      >
        <ResponsiveView style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="md" color={colors.textSecondary}>
              {Strings.loading}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView 
        style={[global.screen, styles.center, { backgroundColor: colors.background }]}
        edges={['top', 'bottom', 'left', 'right']}
      >
        <ResponsiveView style={styles.center}>
          <MaterialIcons name="error" size={responsiveValue(48, 56, 64, 72)} color={colors.error} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Order Not Found
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView marginTop="sm">
            <ResponsiveText size="md" color={colors.textSecondary} style={{ textAlign: 'center' }}>
              The order you're looking for doesn't exist.
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView marginTop="lg">
            <Button
              title="Go Back"
              onPress={() => router.replace('/(admin)/orders')}
              variant="primary"
            />
          </ResponsiveView>
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  let nextStatus = getNextStatus(order.status);
  const paymentMethod = (order.payment_method || '').toLowerCase();
  const paymentStatus = (order.payment_status || '').toLowerCase();
  const isPaymentVerified = paymentStatus === 'verified' || order.payment_status === 'Verified';

  // Admin cannot mark Delivered from details screen
  if (nextStatus === 'delivered') {
    nextStatus = null;
  }

  // For GCash, require payment verification before any transitions
  if (paymentMethod === 'gcash' && !isPaymentVerified) {
    nextStatus = null;
  }

  return (
    <SafeAreaView 
      style={[global.screen, { backgroundColor: colors.background }]}
      edges={['top', 'bottom', 'left', 'right']}
    >
      {/* Header */}
      <ResponsiveView style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          onPress={() => {
            // If we came from notifications, navigate back to notifications
            // Otherwise, navigate to orders page (since router.back() doesn't work correctly with Tabs layout)
            if (from === 'notifications') {
              router.push('/(admin)/notifications' as any);
            } else {
              router.replace('/(admin)/orders');
            }
          }} 
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={responsiveValue(20, 24, 28, 32)} color={colors.text} />
        </TouchableOpacity>
        <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
          Order #{(order as any).order_number || order.id.slice(-8)}
        </ResponsiveText>
        <View style={{ width: responsiveValue(20, 24, 28, 32) }} />
      </ResponsiveView>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Customer Information */}
        <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Customer Information
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView style={styles.infoRow} marginBottom="sm">
            <MaterialIcons name="person" size={responsiveValue(16, 18, 20, 22)} color={colors.primary} />
            <ResponsiveView marginLeft="sm" flex={1}>
              <ResponsiveText size="md" color={colors.text}>
                {order.customer.full_name}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          <ResponsiveView style={styles.infoRow} marginBottom="sm">
            <MaterialIcons name="phone" size={responsiveValue(16, 18, 20, 22)} color={colors.primary} />
            <ResponsiveView marginLeft="sm" flex={1}>
              <ResponsiveText size="md" color={colors.text}>
                {order.customer.phone_number || 'No phone number'}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          <ResponsiveView style={styles.infoRow}>
            <MaterialIcons name="email" size={responsiveValue(16, 18, 20, 22)} color={colors.primary} />
            <ResponsiveView marginLeft="sm" flex={1}>
              <ResponsiveText size="md" color={colors.text}>
                {order.customer.username}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
        </ResponsiveView>

        {/* Receive Options / Fulfillment Type */}
        <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Receive Options
            </ResponsiveText>
          </ResponsiveView>
          
          {/* Fulfillment Type Badge */}
          <ResponsiveView
            style={[
              styles.fulfillmentBadge,
              {
                backgroundColor: (order as any).fulfillment_type === 'pickup' 
                  ? colors.primary + '20' 
                  : colors.secondary + '20',
                borderColor: (order as any).fulfillment_type === 'pickup'
                  ? colors.primary
                  : colors.secondary,
              }
            ]}
            marginBottom="md"
          >
            <MaterialIcons
              name={(order as any).fulfillment_type === 'pickup' ? 'store' : 'local-shipping'}
              size={responsiveValue(18, 20, 22, 24)}
              color={(order as any).fulfillment_type === 'pickup' ? colors.primary : colors.secondary}
            />
            <ResponsiveText
              size="md"
              weight="semiBold"
              color={(order as any).fulfillment_type === 'pickup' ? colors.primary : colors.secondary}
              style={styles.fulfillmentBadgeText}
            >
              {(order as any).fulfillment_type === 'pickup' ? 'To Be Picked Up' : 'For Delivery'}
            </ResponsiveText>
          </ResponsiveView>

          {/* Delivery Address (only for delivery orders) */}
          {(order as any).fulfillment_type === 'delivery' && order.delivery_address && (
            <ResponsiveView style={styles.infoRow}>
              <MaterialIcons name="location-on" size={responsiveValue(16, 18, 20, 22)} color={colors.error} />
              <ResponsiveView marginLeft="sm" flex={1}>
                <ResponsiveText size="md" color={colors.text}>
                  {order.delivery_address.full_address}
                </ResponsiveText>
                {order.delivery_address.label && (
                  <ResponsiveView marginTop="xs">
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      {order.delivery_address.label}
                    </ResponsiveText>
                  </ResponsiveView>
                )}
              </ResponsiveView>
            </ResponsiveView>
          )}

          {/* Pickup Location (only for pickup orders) */}
          {(order as any).fulfillment_type === 'pickup' && (
            <ResponsiveView style={styles.infoRow}>
              <MaterialIcons name="store" size={responsiveValue(16, 18, 20, 22)} color={colors.primary} />
              <ResponsiveView marginLeft="sm" flex={1}>
                <ResponsiveText size="md" color={colors.text} weight="semiBold">
                  Kitchen One Main Branch
                </ResponsiveText>
                <ResponsiveView marginTop="xs">
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    {(order as any).pickup_location_snapshot || 'San Vicente, Bulan, Sorsogon'}
                  </ResponsiveText>
                </ResponsiveView>
                {(order as any).pickup_notes && (
                  <ResponsiveView marginTop="xs">
                    <ResponsiveText size="sm" color={colors.textSecondary} style={{ fontStyle: 'italic' }}>
                      Note: {(order as any).pickup_notes}
                    </ResponsiveText>
                  </ResponsiveView>
                )}
              </ResponsiveView>
            </ResponsiveView>
          )}
        </ResponsiveView>

        {/* Order Items */}
        <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Order Items
            </ResponsiveText>
          </ResponsiveView>
          
          {order.order_items.map((item) => {
            const customizationDisplay = getDetailedCustomizationDisplay(item);
            return (
              <ResponsiveView key={item.id} style={styles.orderItem} marginBottom="md">
                <ResponsiveView style={styles.orderItemHeader}>
                  <ResponsiveView flex={1}>
                    <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                      {item.quantity}x {item.product.name}
                    </ResponsiveText>
                  </ResponsiveView>
                  <ResponsiveText size="md" weight="semiBold" color={colors.primary}>
                    ₱{(item.quantity * item.unit_price).toFixed(2)}
                  </ResponsiveText>
                </ResponsiveView>
                
                {customizationDisplay && customizationDisplay.map((detail: any, index: number) => (
                  <ResponsiveView key={index} marginTop="xs">
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      {detail.label}: {detail.value}
                    </ResponsiveText>
                  </ResponsiveView>
                ))}
              </ResponsiveView>
            );
          })}
        </ResponsiveView>

        {/* Order Notes */}
        {order.order_notes && (
          <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
            <ResponsiveView flexDirection="row" alignItems="center" marginBottom="sm">
              <MaterialIcons name="note" size={20} color={colors.primary} />
              <ResponsiveView marginLeft="sm">
                <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                  Order Notes
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
            <ResponsiveText size="sm" color={colors.textSecondary} style={{ lineHeight: 20 }}>
              {order.order_notes}
            </ResponsiveText>
          </ResponsiveView>
        )}

        {/* Total Amount */}
        <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
          <ResponsiveView style={styles.totalRow}>
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Total Amount:
            </ResponsiveText>
            <ResponsiveText size="lg" weight="semiBold" color={colors.primary}>
              ₱{order.total_amount.toFixed(2)}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>

        {/* Payment Information */}
        <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
          <ResponsiveView style={styles.sectionHeader}>
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Payment Information
            </ResponsiveText>
            {order.payment_verified && (
              <ResponsiveText size="sm" color={colors.success} weight="semiBold">
                Verified
              </ResponsiveText>
            )}
          </ResponsiveView>
          
          <ResponsiveView style={styles.infoRow} marginBottom="sm">
            <MaterialIcons name="payment" size={responsiveValue(16, 18, 20, 22)} color={colors.primary} />
            <ResponsiveView marginLeft="sm" flex={1}>
              <ResponsiveText size="md" color={colors.text}>
                Payment Method: {order.payment_method || 'cod'}
              </ResponsiveText>
              {order.payment_method === 'gcash' && (
                <ResponsiveView marginTop="xs">
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Status: {isPaymentVerified ? 'Verified' : 'Pending Verification'}
                  </ResponsiveText>
                </ResponsiveView>
              )}
            </ResponsiveView>
          </ResponsiveView>

          <ResponsiveView style={styles.infoRow}>
            <MaterialIcons name="attach-money" size={responsiveValue(16, 18, 20, 22)} color={colors.primary} />
            <ResponsiveView marginLeft="sm" flex={1}>
              <ResponsiveText size="md" color={colors.text}>
                Amount: ₱{order.total_amount.toFixed(2)}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
          {/* Proof of Payment - single image with zoom */}
          {(paymentProofs.length > 0 || order.proof_of_payment_url) && (
            <ResponsiveView marginTop="md">
              <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                Proof of Payment
              </ResponsiveText>
              <ResponsiveView marginTop="sm">
                <TouchableOpacity
                  onPress={() => {
                    const url = (paymentProofs[0]?.url as string) || (order.proof_of_payment_url as string);
                    if (!url) return;
                    setProofImageUrl(url);
                    setShowImageModal(true);
                    setViewedProof(true);
                    setProofImageError(false);
                  }}
                  style={styles.proofSingleWrap}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: (paymentProofs[0]?.thumbnail_url as string) || (paymentProofs[0]?.url as string) || (order.proof_of_payment_url as string) }}
                    style={styles.proofSingle}
                    // @ts-ignore
                    contentFit="cover"
                    // @ts-ignore
                    cachePolicy="memory-disk"
                    // @ts-ignore
                    placeholder={{ blurhash: '' }}
                    // @ts-ignore
                    transition={200}
                  />
                  <ResponsiveView style={styles.proofOverlay}>
                    <MaterialIcons name="zoom-in" size={20} color="white" />
                  </ResponsiveView>
                </TouchableOpacity>
              </ResponsiveView>
            </ResponsiveView>
          )}
          {order.payment_status === 'pending' && order.payment_method === 'gcash' && (
            <ResponsiveView marginTop="md" style={[styles.verificationSection, { backgroundColor: colors.warning + '10', borderColor: colors.warning + '30' }]}>
              <ResponsiveView style={styles.verificationHeader}>
                <MaterialIcons name="payment" size={24} color={colors.warning} />
                <ResponsiveView marginLeft="sm">
                  <ResponsiveText size="md" weight="semiBold" color={colors.warning}>
                    GCash Payment Verification Required
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
              
              <ResponsiveView marginTop="sm">
                <Button 
                  title={verifying ? 'Verifying Payment...' : '✅ Verify Payment & Start Preparing'} 
                  onPress={handleVerifyPayment} 
                  variant="primary" 
                  disabled={verifying || !order.proof_of_payment_url || !viewedProof}
                  style={styles.verifyButton}
                />
              </ResponsiveView>
              
              <ResponsiveView marginTop="sm">
                <Button 
                  title={
                    canceling 
                      ? 'Cancelling Order...' 
                      : order.status === 'cancelled' 
                        ? '❌ Order Cancelled' 
                        : !canCancelOrder(order.status)
                          ? '❌ Cannot Cancel'
                          : '❌ Cancel Order'
                  } 
                  onPress={order.status === 'cancelled' || !canCancelOrder(order.status) ? () => {} : handleCancelOrder} 
                  variant="secondary" 
                  disabled={canceling || verifying || order.status === 'cancelled' || !canCancelOrder(order.status)}
                  style={[
                    styles.cancelButton,
                    (order.status === 'cancelled' || !canCancelOrder(order.status)) && { opacity: 0.6 }
                  ]}
                />
              </ResponsiveView>
              
              {!canCancelOrder(order.status) && order.status !== 'cancelled' && (
                <ResponsiveView marginTop="sm" style={styles.warningBox}>
                  <MaterialIcons name="info" size={20} color={colors.warning} />
                  <ResponsiveView marginLeft="xs" flex={1}>
                    <ResponsiveText size="sm" color={colors.warning}>
                      {order.status === 'out_for_delivery' 
                        ? 'Order is already out for delivery and cannot be cancelled.'
                        : order.status === 'delivered'
                          ? 'Order has been delivered and cannot be cancelled.'
                          : 'This order cannot be cancelled at this time.'
                      }
                    </ResponsiveText>
                  </ResponsiveView>
                </ResponsiveView>
              )}
              
              {!order.proof_of_payment_url && (
                <ResponsiveView marginTop="sm" style={styles.warningBox}>
                  <MaterialIcons name="warning" size={20} color={colors.warning} />
                  <ResponsiveView marginLeft="xs" flex={1}>
                    <ResponsiveText size="sm" color={colors.warning}>
                      No proof of payment uploaded by customer
                    </ResponsiveText>
                  </ResponsiveView>
                </ResponsiveView>
              )}
              {order.proof_of_payment_url && !viewedProof && (
                <ResponsiveView marginTop="sm" style={styles.infoBox}>
                  <MaterialIcons name="info" size={20} color={colors.info} />
                  <ResponsiveView marginLeft="xs" flex={1}>
                    <ResponsiveText size="sm" color={colors.info}>
                      Please view the proof of payment image above before verifying
                    </ResponsiveText>
                  </ResponsiveView>
                </ResponsiveView>
              )}
              {order.proof_of_payment_url && viewedProof && (
                <ResponsiveView marginTop="sm" style={styles.successBox}>
                  <MaterialIcons name="check-circle" size={20} color={colors.success} />
                  <ResponsiveView marginLeft="xs" flex={1}>
                    <ResponsiveText size="sm" color={colors.success}>
                      Proof of payment viewed - you can now verify the payment
                    </ResponsiveText>
                  </ResponsiveView>
                </ResponsiveView>
              )}
              <ResponsiveView marginTop="sm">
                <ResponsiveText size="xs" color={colors.textSecondary} style={{ textAlign: 'center', fontStyle: 'italic' }}>
                  After verification, the order will automatically move to "Preparing" status and the customer will be notified.
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          )}
          {order.payment_status === 'Verified' && order.payment_method === 'gcash' && (
            <ResponsiveView marginTop="md" style={[styles.verificationSection, { backgroundColor: colors.success + '10', borderColor: colors.success + '30' }]}>
              <ResponsiveView style={styles.verificationHeader}>
                <MaterialIcons name="check-circle" size={24} color={colors.success} />
                <ResponsiveView marginLeft="sm">
                  <ResponsiveText size="md" weight="semiBold" color={colors.success}>
                    Payment Verified Successfully
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
              <ResponsiveView marginTop="sm">
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  ✅ Payment verified by admin • Order is now in "Preparing" status
                </ResponsiveText>
                {order.payment_verified_at && (
                  <ResponsiveView marginTop="xs">
                    <ResponsiveText size="xs" color={colors.textSecondary}>
                      Verified on: {new Date(order.payment_verified_at).toLocaleString()}
                    </ResponsiveText>
                  </ResponsiveView>
                )}
              </ResponsiveView>
            </ResponsiveView>
          )}
          {order.payment_status === 'pending' && order.payment_method === 'cod' && (
            <ResponsiveView marginTop="md">
              <ResponsiveText size="sm" color={colors.textSecondary} style={{ textAlign: 'center', fontStyle: 'italic' }}>
                COD payment verification will be handled by delivery staff upon delivery.
              </ResponsiveText>
            </ResponsiveView>
          )}
        </ResponsiveView>

        {/* Order Timeline */}
        <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Order Timeline
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView style={styles.timelineItem} marginBottom="sm">
            <View style={[styles.timelineDot, { backgroundColor: colors.primary }]} />
            <ResponsiveView marginLeft="md" flex={1}>
              <ResponsiveText size="md" color={colors.text}>
                Order Placed
              </ResponsiveText>
              <ResponsiveText size="sm" color={colors.textSecondary}>
                {formatDate(order.created_at)}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          <ResponsiveView style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: colors.primary }]} />
            <ResponsiveView marginLeft="md" flex={1}>
              <ResponsiveText size="md" color={colors.text}>
                Last Updated
              </ResponsiveText>
              <ResponsiveText size="sm" color={colors.textSecondary}>
                {formatDate(order.updated_at)}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          {/* Proof of Delivery - show under timeline */}
          {deliveryProofs.length > 0 && (
            <ResponsiveView marginTop="md">
              <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                Proof of Delivery
              </ResponsiveText>
              <ResponsiveView marginTop="sm" style={styles.proofGrid}>
                {deliveryProofs.map((img) => (
                  <TouchableOpacity
                    key={img.id}
                    onPress={() => {
                      setProofImageUrl(img.url);
                      setShowImageModal(true);
                      setProofImageError(false);
                    }}
                    style={styles.proofThumbWrap}
                  >
                    <Image
                      source={{ uri: img.thumbnail_url || img.url }}
                      style={styles.proofThumb}
                      resizeMode="cover"
                    />
                    <ResponsiveView style={styles.proofOverlay}>
                      <MaterialIcons name="zoom-in" size={20} color="white" />
                    </ResponsiveView>
                  </TouchableOpacity>
                ))}
              </ResponsiveView>
            </ResponsiveView>
          )}
        </ResponsiveView>

        {/* Rider Delivery Information */}
        {order.delivered_by_rider && order.delivered_at && (
          <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Delivery Information
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView style={styles.infoRow} marginBottom="sm">
              <MaterialIcons name="delivery-dining" size={responsiveValue(16, 18, 20, 22)} color={colors.primary} />
              <ResponsiveView marginLeft="sm" flex={1}>
                <ResponsiveText size="md" color={colors.text}>
                  Delivered by: {order.delivered_by_rider.full_name || order.delivered_by_rider.username}
                </ResponsiveText>
                {order.delivered_by_rider.phone_number && (
                  <ResponsiveView marginTop="xs">
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      Phone: {order.delivered_by_rider.phone_number}
                    </ResponsiveText>
                  </ResponsiveView>
                )}
              </ResponsiveView>
            </ResponsiveView>

            <ResponsiveView style={styles.infoRow}>
              <MaterialIcons name="schedule" size={responsiveValue(16, 18, 20, 22)} color={colors.primary} />
              <ResponsiveView marginLeft="sm" flex={1}>
                <ResponsiveText size="md" color={colors.text}>
                  Delivered at: {formatDate(order.delivered_at)}
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          </ResponsiveView>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {nextStatus && (
        <ResponsiveView style={[styles.actionContainer, { backgroundColor: colors.surface }]}>
          <Button
            title={`Mark as ${nextStatus.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`}
            onPress={() => handleStatusUpdate(nextStatus)}
            variant="primary"
            loading={updating}
            disabled={updating}
          />
        </ResponsiveView>
      )}

      {/* Image Preview Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <ResponsiveView style={styles.modalHeader}>
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>Proof</ResponsiveText>
              <TouchableOpacity
                onPress={() => setShowImageModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={responsiveValue(24, 28, 32, 36)} color={colors.text} />
              </TouchableOpacity>
            </ResponsiveView>
            
            <ResponsiveView style={styles.imageContainer}>
              <ScrollView
                style={styles.zoomScroll}
                contentContainerStyle={styles.zoomScrollContent}
                maximumZoomScale={3.0}
                minimumZoomScale={0.5}
                bouncesZoom={true}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              >
                <Image
                  source={{ uri: proofImageUrl || order?.proof_of_payment_url || '' }}
                  style={[
                    styles.zoomImage,
                    proofAspectRatio ? { aspectRatio: proofAspectRatio } : null,
                  ]}
                  // @ts-ignore
                  contentFit="contain"
                  // @ts-ignore
                  cachePolicy="memory-disk"
                  // @ts-ignore
                  transition={200}
                  onError={() => setProofImageError(true)}
                  onLoad={(e) => {
                    try {
                      const w = (e as any)?.nativeEvent?.source?.width;
                      const h = (e as any)?.nativeEvent?.source?.height;
                      if (w && h) setProofAspectRatio(w / h);
                    } catch {}
                  }}
                />
              </ScrollView>
            </ResponsiveView>
            {proofImageError && (
              <ResponsiveView marginTop="sm">
                <ResponsiveText size="sm" color={colors.error}>
                  Unable to display this image. It may be an unsupported format.
                </ResponsiveText>
                {!!(proofImageUrl || order?.proof_of_payment_url) && (
                  <ResponsiveView marginTop="xs">
                    <Button
                      title="Open in Browser"
                      onPress={() => {
                        const url = proofImageUrl || (order?.proof_of_payment_url as string);
                        if (url) Linking.openURL(url);
                      }}
                      variant="secondary"
                    />
                  </ResponsiveView>
                )}
              </ResponsiveView>
            )}
            
            <ResponsiveView marginTop="md">
              <Button
                title="Close"
                onPress={() => setShowImageModal(false)}
                variant="secondary"
              />
            </ResponsiveView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ResponsiveSpacing.lg,
    paddingVertical: ResponsiveSpacing.md,
    ...Layout.shadows.sm,
  },
  backButton: {
    padding: ResponsiveSpacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: ResponsiveSpacing.lg,
  },
  section: {
    padding: ResponsiveSpacing.lg,
    borderRadius: ResponsiveBorderRadius.lg,
    marginBottom: ResponsiveSpacing.md,
    ...Layout.shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderItem: {
    paddingVertical: ResponsiveSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  orderItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: responsiveValue(8, 10, 12, 14),
    height: responsiveValue(8, 10, 12, 14),
    borderRadius: responsiveValue(4, 5, 6, 7),
    marginTop: ResponsiveSpacing.xs,
  },
  actionContainer: {
    padding: ResponsiveSpacing.lg,
    ...Layout.shadows.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: ResponsiveSpacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: responsiveValue(400, 450, 500, 550),
    maxHeight: '90%',
    borderRadius: ResponsiveBorderRadius.lg,
    padding: ResponsiveSpacing.lg,
    ...Layout.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.md,
  },
  closeButton: {
    padding: ResponsiveSpacing.sm,
  },
  imageContainer: {
    width: '100%',
    height: responsiveValue(420, 520, 620, 720),
    borderRadius: ResponsiveBorderRadius.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  zoomScroll: { flex: 1, width: '100%' },
  zoomScrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: ResponsiveSpacing.sm },
  zoomImage: { width: '100%', height: undefined },
  proofImageContainer: {
    position: 'relative',
    marginBottom: ResponsiveSpacing.sm,
  },
  proofThumbnail: {
    width: '100%',
    height: 120,
    borderRadius: ResponsiveBorderRadius.md,
  },
  proofOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: ResponsiveBorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewProofButton: {
    marginTop: ResponsiveSpacing.sm,
  },
  verificationSection: {
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.md,
    borderWidth: 1,
    marginVertical: ResponsiveSpacing.sm,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.sm,
  },
  verifyButton: {
    backgroundColor: '#10B981',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ResponsiveSpacing.sm,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: ResponsiveBorderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ResponsiveSpacing.sm,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: ResponsiveBorderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ResponsiveSpacing.sm,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: ResponsiveBorderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  // Proof galleries
  proofGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -ResponsiveSpacing.xs,
  },
  proofThumbWrap: {
    width: '31%',
    marginHorizontal: ResponsiveSpacing.xs,
    marginBottom: ResponsiveSpacing.sm,
    borderRadius: ResponsiveBorderRadius.md,
    overflow: 'hidden',
  },
  proofThumb: {
    width: '100%',
    height: 100,
    borderRadius: ResponsiveBorderRadius.md,
  },
  // Single proof presentation
  proofSingleWrap: {
    width: '100%',
    borderRadius: ResponsiveBorderRadius.md,
    overflow: 'hidden',
  },
  proofSingle: {
    width: '100%',
    height: 160,
    borderRadius: ResponsiveBorderRadius.md,
  },
  fulfillmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.md,
    borderWidth: 2,
  },
  fulfillmentBadgeText: {
    marginLeft: ResponsiveSpacing.sm,
  },
});