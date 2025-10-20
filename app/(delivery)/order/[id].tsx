import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import { LoadingState } from '../../../components/ui/LoadingState';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing } from '../../../constants/Responsive';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { OrderService } from '../../../services/order.service';
import global from '../../../styles/global';
import { Order } from '../../../types/order.types';

export default function OrderDetailsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrderDetails();
    }
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const orderData = await OrderService.getOrderById(id!);
      console.log('Order data loaded:', JSON.stringify(orderData, null, 2));
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order details:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCODPayment = async () => {
    if (!order || !user?.id) return;

    console.log('Order status for COD verification:', order.status);
    console.log('Order payment method:', order.payment_method);
    console.log('Order payment status:', order.payment_status);

    Alert.alert(
      'Verify COD Payment',
      `Confirm that you have received ₱${order.total_amount.toFixed(2)} in cash from the customer for this order.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Verify Payment', 
          onPress: async () => {
            try {
              setActionLoading(true);
              await OrderService.verifyCODPayment(order.id, user.id);
              Alert.alert(
                'Payment Verified! 💰', 
                'COD payment verified successfully! Customer has been notified. You can now proceed to mark the order as delivered.',
                [{ text: 'OK', onPress: () => loadOrderDetails() }]
              );
            } catch (error: any) {
              console.error('Error verifying COD payment:', error);
              Alert.alert('Error', error.message || 'Failed to verify payment');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleMarkDelivered = async () => {
    if (!order || !user?.id) return;

    Alert.alert(
      'Mark as Delivered',
      'Proof of delivery is required. Please add a photo to confirm the delivery.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add Photo', onPress: async () => {
          try {
            const res = await ImagePicker.launchCameraAsync({ 
              mediaTypes: ImagePicker.MediaTypeOptions.Images, 
              quality: 0.7, // Reduced quality for better performance
              allowsEditing: true,
              aspect: [4, 3]
            });
            if (!res.canceled) {
              setActionLoading(true);
              const uri = res.assets[0].uri;
              const result = await OrderService.markOrderDelivered(order.id, user.id, uri);
              if (result.success) {
                Alert.alert(
                  result.proofUploaded ? 'Success! 📸' : 'Success! ✅', 
                  result.message,
                  [{ text: 'OK', onPress: () => router.back() }]
                );
              } else {
                Alert.alert('Error', result.message);
              }
            }
          } catch (error: any) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', error.message || 'Failed to take photo');
          } finally {
            setActionLoading(false);
          }
        }},
        { text: 'Choose from Gallery', onPress: async () => {
          try {
            const res = await ImagePicker.launchImageLibraryAsync({ 
              mediaTypes: ImagePicker.MediaTypeOptions.Images, 
              quality: 0.7, // Reduced quality for better performance
              allowsEditing: true,
              aspect: [4, 3]
            });
            if (!res.canceled) {
              setActionLoading(true);
              const uri = res.assets[0].uri;
              const result = await OrderService.markOrderDelivered(order.id, user.id, uri);
              if (result.success) {
                Alert.alert(
                  result.proofUploaded ? 'Success! 📸' : 'Success! ✅', 
                  result.message,
                  [{ text: 'OK', onPress: () => router.back() }]
                );
              } else {
                Alert.alert('Error', result.message);
              }
            }
          } catch (error: any) {
            console.error('Error selecting photo:', error);
            Alert.alert('Error', error.message || 'Failed to select photo');
          } finally {
            setActionLoading(false);
          }
        }}
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'preparing': return colors.info;
      case 'ready_for_pickup': return colors.warning;
      case 'out_for_delivery': return colors.primary;
      case 'delivered': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'schedule';
      case 'preparing': return 'restaurant';
      case 'ready_for_pickup': return 'restaurant';
      case 'out_for_delivery': return 'local-shipping';
      case 'delivered': return 'check-circle';
      case 'cancelled': return 'cancel';
      default: return 'help';
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'verified': return colors.success;
      case 'pending': return colors.warning;
      case 'failed': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionButton = () => {
    if (!order || !user?.id) return null;

    const isCOD = order.payment_method?.toLowerCase() === 'cod';
    const isGCash = order.payment_method?.toLowerCase() === 'gcash';
    const paymentVerified = order.payment_status === 'verified' || (order as any).payment_verified;
    const isOutForDelivery = order.status === 'out_for_delivery' || (order.status as any) === 'Out for Delivery';
    const isDelivered = order.status === 'delivered' || (order.status as any) === 'Delivered';

    // COD orders need payment verification first
    if (isCOD && !paymentVerified && isOutForDelivery) {
      return (
        <Button
          title="Verify COD Payment"
          onPress={handleVerifyCODPayment}
          loading={actionLoading}
          variant="primary"
          size="large"
          icon={<MaterialIcons name="payment" size={20} color="white" />}
        />
      );
    }

    // GCash orders need admin verification first, then delivery
    if (isGCash && !paymentVerified && isOutForDelivery) {
      return (
        <ResponsiveView style={[styles.infoCard, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
          <MaterialIcons name="info" size={20} color={colors.warning} />
          <ResponsiveView marginLeft="sm">
            <ResponsiveText size="sm" color={colors.warning} weight="medium">
              Waiting for admin to verify GCash payment before delivery
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      );
    }

    // Ready for delivery (payment verified or non-payment orders)
    if ((paymentVerified || !isCOD) && isOutForDelivery && !isDelivered) {
      return (
        <Button
          title="Mark as Delivered"
          onPress={handleMarkDelivered}
          loading={actionLoading}
          variant="primary"
          size="large"
          icon={<MaterialIcons name="check-circle" size={20} color="white" />}
        />
      );
    }

    // Order already delivered
    if (isDelivered) {
      return (
        <ResponsiveView style={[styles.infoCard, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
          <MaterialIcons name="check-circle" size={20} color={colors.success} />
          <ResponsiveView marginLeft="sm">
            <ResponsiveText size="sm" color={colors.success} weight="medium">
              Order has been delivered successfully
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <LoadingState 
          message="Loading order details..." 
          fullScreen 
        />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <ResponsiveView style={styles.center}>
          <MaterialIcons name="error" size={48} color={colors.error} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="lg" color={colors.text} align="center">
              Order not found
            </ResponsiveText>
          </ResponsiveView>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="outline"
            style={styles.backButton}
          />
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <ResponsiveView padding="lg">
          {/* Header */}
          <ResponsiveView style={[styles.header, { backgroundColor: colors.surface }]}>
            <ResponsiveView style={styles.headerLeft}>
              <ResponsiveText size="xl" weight="bold" color={colors.text}>
                Order #{order.order_number || order.id.slice(-6).toUpperCase()}
              </ResponsiveText>
              <ResponsiveView style={styles.statusRow} marginTop="sm">
                <ResponsiveView style={[styles.statusBadge, { 
                  backgroundColor: getStatusColor(order.status) + '20' 
                }]}>
                  <MaterialIcons 
                    name={getStatusIcon(order.status) as any} 
                    size={16} 
                    color={getStatusColor(order.status)} 
                  />
                <ResponsiveView marginLeft="xs">
                  <ResponsiveText 
                    size="sm" 
                    color={getStatusColor(order.status)}
                    weight="semiBold"
                  >
                    {order.status.replace('_', ' ').toUpperCase()}
                  </ResponsiveText>
                </ResponsiveView>
                </ResponsiveView>
              </ResponsiveView>
            </ResponsiveView>
            <Button
              title=""
              onPress={() => router.back()}
              variant="text"
              icon={<MaterialIcons name="arrow-back" size={24} color={colors.primary} />}
            />
          </ResponsiveView>

          {/* Order Info */}
          <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Order Information
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView style={styles.infoRow}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Order Date:
              </ResponsiveText>
              <ResponsiveText size="md" color={colors.text} weight="medium">
                {formatDate(order.created_at)}
              </ResponsiveText>
            </ResponsiveView>

            <ResponsiveView style={styles.infoRow}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Payment Method:
              </ResponsiveText>
              <ResponsiveView style={styles.paymentMethod}>
                <MaterialIcons 
                  name={order.payment_method?.toLowerCase() === 'gcash' ? 'account-balance-wallet' : 'money'} 
                  size={16} 
                  color={colors.primary} 
                />
                <ResponsiveView marginLeft="xs">
                  <ResponsiveText size="md" color={colors.text} weight="medium">
                    {order.payment_method?.toUpperCase()}
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            </ResponsiveView>

            <ResponsiveView style={styles.infoRow}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Payment Status:
              </ResponsiveText>
              <ResponsiveView style={[styles.paymentStatus, { 
                backgroundColor: getPaymentStatusColor(order.payment_status) + '20' 
              }]}>
                <MaterialIcons 
                  name={order.payment_status === 'verified' ? 'check-circle' : order.payment_status === 'pending' ? 'schedule' : 'error'} 
                  size={16} 
                  color={getPaymentStatusColor(order.payment_status)} 
                />
                <ResponsiveView marginLeft="xs">
                  <ResponsiveText 
                    size="sm" 
                    color={getPaymentStatusColor(order.payment_status)}
                    weight="semiBold"
                  >
                    {order.payment_status?.toUpperCase()}
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            </ResponsiveView>

            {(order as any).payment_verified_by && (
              <ResponsiveView style={styles.infoRow}>
                <ResponsiveText size="md" color={colors.textSecondary}>
                  Verified By:
                </ResponsiveText>
                <ResponsiveText size="md" color={colors.text} weight="medium">
                  Delivery Partner
                </ResponsiveText>
              </ResponsiveView>
            )}

            {(order as any).payment_verified_at && (
              <ResponsiveView style={styles.infoRow}>
                <ResponsiveText size="md" color={colors.textSecondary}>
                  Verified At:
                </ResponsiveText>
                <ResponsiveText size="md" color={colors.text} weight="medium">
                  {formatDate((order as any).payment_verified_at)}
                </ResponsiveText>
              </ResponsiveView>
            )}

            <ResponsiveView style={styles.infoRow}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Total Amount:
              </ResponsiveText>
              <ResponsiveText size="lg" color={colors.primary} weight="bold">
                ₱{order.total_amount.toFixed(2)}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          {/* Customer Info */}
          <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Customer Information
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView style={styles.infoRow}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Name:
              </ResponsiveText>
              <ResponsiveText size="md" color={colors.text} weight="medium">
                {(order as any).customer?.full_name || (order as any).user?.full_name || 'Unknown'}
              </ResponsiveText>
            </ResponsiveView>

            <ResponsiveView style={styles.infoRow}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Phone:
              </ResponsiveText>
              <ResponsiveText size="md" color={colors.text} weight="medium">
                {(order as any).customer?.phone_number || (order as any).user?.phone_number || 'Not provided'}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          {/* Delivery Address */}
          <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Delivery Address
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView style={styles.addressContainer}>
              <MaterialIcons name="location-on" size={20} color={colors.primary} />
              <ResponsiveView style={styles.addressText} marginLeft="sm">
                <ResponsiveText size="md" color={colors.text} weight="medium">
                  {(order as any).delivery_address?.full_address || (order as any).delivery_address?.address || 'Address not available'}
                </ResponsiveText>
                {(order as any).delivery_address?.label && (
                  <ResponsiveView marginTop="xs">
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      Label: {(order as any).delivery_address.label}
                    </ResponsiveText>
                  </ResponsiveView>
                )}
                {(order as any).delivery_address?.city && (
                  <ResponsiveView marginTop="xs">
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      City: {(order as any).delivery_address.city}
                    </ResponsiveText>
                  </ResponsiveView>
                )}
              </ResponsiveView>
            </ResponsiveView>

            {(order as any).order_notes && (
              <ResponsiveView style={styles.notesContainer} marginTop="md">
                <ResponsiveText size="sm" color={colors.textSecondary} weight="medium">
                  Special Instructions:
                </ResponsiveText>
                <ResponsiveView marginTop="xs">
                  <ResponsiveText size="sm" color={colors.text}>
                    {(order as any).order_notes}
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            )}
          </ResponsiveView>

          {/* Delivery Information */}
          <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Delivery Information
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView style={styles.infoRow}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Delivery Status:
              </ResponsiveText>
              <ResponsiveView style={[styles.deliveryStatus, { 
                backgroundColor: getStatusColor(order.status) + '20' 
              }]}>
                <MaterialIcons 
                  name={getStatusIcon(order.status) as any} 
                  size={16} 
                  color={getStatusColor(order.status)} 
                />
                <ResponsiveView marginLeft="xs">
                  <ResponsiveText 
                    size="sm" 
                    color={getStatusColor(order.status)}
                    weight="semiBold"
                  >
                    {order.status.replace('_', ' ').toUpperCase()}
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            </ResponsiveView>

            {order.actual_delivery_time && (
              <ResponsiveView style={styles.infoRow}>
                <ResponsiveText size="md" color={colors.textSecondary}>
                  Delivered At:
                </ResponsiveText>
                <ResponsiveText size="md" color={colors.text} weight="medium">
                  {formatDate(order.actual_delivery_time)}
                </ResponsiveText>
              </ResponsiveView>
            )}

            {order.estimated_delivery_time && (
              <ResponsiveView style={styles.infoRow}>
                <ResponsiveText size="md" color={colors.textSecondary}>
                  Estimated Delivery:
                </ResponsiveText>
                <ResponsiveText size="md" color={colors.text} weight="medium">
                  {formatDate(order.estimated_delivery_time)}
                </ResponsiveText>
              </ResponsiveView>
            )}
          </ResponsiveView>

          {/* Order Items */}
          <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Order Items ({order.items?.length || 0})
              </ResponsiveText>
            </ResponsiveView>
            
            {order.items?.map((item, index) => (
              <ResponsiveView key={item.id || index} style={styles.orderItem}>
                <ResponsiveView style={styles.itemInfo}>
                  <ResponsiveText size="md" color={colors.text} weight="medium">
                    {item.product_name}
                  </ResponsiveText>
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Qty: {item.quantity} × ₱{item.unit_price.toFixed(2)}
                  </ResponsiveText>
                  {item.special_instructions && (
                  <ResponsiveView marginTop="xs">
                    <ResponsiveText size="xs" color={colors.textSecondary}>
                      Note: {item.special_instructions}
                    </ResponsiveText>
                  </ResponsiveView>
                  )}
                </ResponsiveView>
                <ResponsiveText size="md" color={colors.primary} weight="semiBold">
                  ₱{item.total_price.toFixed(2)}
                </ResponsiveText>
              </ResponsiveView>
            ))}
          </ResponsiveView>

          {/* Action Button */}
          {getActionButton() && (
            <ResponsiveView style={styles.actionContainer} marginTop="lg">
              {getActionButton()}
            </ResponsiveView>
          )}
        </ResponsiveView>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ResponsiveSpacing.lg,
    padding: ResponsiveSpacing.lg,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  headerLeft: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ResponsiveSpacing.sm,
    paddingVertical: ResponsiveSpacing.xs,
    borderRadius: ResponsiveBorderRadius.sm,
  },
  section: {
    padding: ResponsiveSpacing.lg,
    borderRadius: ResponsiveBorderRadius.lg,
    marginBottom: ResponsiveSpacing.md,
    ...Layout.shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.sm,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ResponsiveSpacing.sm,
    paddingVertical: ResponsiveSpacing.xs,
    borderRadius: ResponsiveBorderRadius.sm,
  },
  deliveryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ResponsiveSpacing.sm,
    paddingVertical: ResponsiveSpacing.xs,
    borderRadius: ResponsiveBorderRadius.sm,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.md,
    borderWidth: 1,
    marginTop: ResponsiveSpacing.md,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressText: {
    flex: 1,
  },
  notesContainer: {
    padding: ResponsiveSpacing.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: ResponsiveBorderRadius.sm,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: ResponsiveSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  itemInfo: {
    flex: 1,
    marginRight: ResponsiveSpacing.sm,
  },
  actionContainer: {
    paddingBottom: ResponsiveSpacing.xl,
  },
  backButton: {
    marginTop: ResponsiveSpacing.md,
  },
});
