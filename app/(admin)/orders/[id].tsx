import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { OrderService } from '../../../services/order.service';
import { Order, OrderStatus } from '../../../types/order.types';

export default function OrderDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const orderData = await OrderService.getOrderById(id!);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert('Error', 'Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return;

    Alert.alert(
      'Update Order Status',
      `Are you sure you want to change this order status to ${newStatus.replace('_', ' ')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: async () => {
            try {
              setUpdating(true);
              await OrderService.updateOrderStatus(id!, newStatus, 'admin');
              await loadOrder();
              Alert.alert('Success', 'Order status updated successfully!');
            } catch (error) {
              console.error('Error updating order status:', error);
              Alert.alert('Error', 'Failed to update order status. Please try again.');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'confirmed': return colors.info;
      case 'preparing': return colors.primary;
      case 'ready_for_pickup': return colors.warning;
      case 'out_for_delivery': return colors.info;
      case 'delivered': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'schedule';
      case 'confirmed': return 'check-circle-outline';
      case 'preparing': return 'restaurant';
      case 'ready_for_pickup': return 'local-shipping';
      case 'out_for_delivery': return 'delivery-dining';
      case 'delivered': return 'check-circle';
      case 'cancelled': return 'cancel';
      default: return 'help';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="md" color={colors.textSecondary}>
              {Strings.loading}
            </ResponsiveText>
          </ResponsiveView>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ResponsiveView style={styles.errorContainer}>
          <MaterialIcons name="error" size={64} color={colors.error} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Order Not Found
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView marginTop="sm">
            <ResponsiveText size="md" color={colors.textSecondary} style={{ textAlign: 'center' }}>
              The order you're looking for doesn't exist or has been removed.
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView marginTop="lg">
            <Button
              title="Go Back"
              onPress={() => router.back()}
              variant="primary"
            />
          </ResponsiveView>
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  const nextStatus = getNextStatus(order.status);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ResponsiveView style={styles.header}>
        <ResponsiveView style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ResponsiveText size="xl" weight="bold" color={colors.text}>
            Order Details
          </ResponsiveText>
          <View style={{ width: 24 }} />
        </ResponsiveView>
        <ResponsiveText size="md" color={colors.textSecondary}>
          {order.order_number}
        </ResponsiveText>
      </ResponsiveView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Status */}
        <ResponsiveView style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ResponsiveView style={styles.statusHeader}>
            <ResponsiveView style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
              <MaterialIcons 
                name={getStatusIcon(order.status)} 
                size={20} 
                color={getStatusColor(order.status)} 
              />
              <ResponsiveView marginLeft="sm">
                <ResponsiveText 
                  size="lg" 
                  color={getStatusColor(order.status)}
                  weight="semiBold"
                >
                  {order.status.replace('_', ' ').toUpperCase()}
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
            
            {nextStatus && (
              <Button
                title={`Mark as ${nextStatus.replace('_', ' ')}`}
                onPress={() => handleStatusUpdate(nextStatus)}
                loading={updating}
                disabled={updating}
                variant="primary"
                size="small"
              />
            )}
          </ResponsiveView>
        </ResponsiveView>

        {/* Customer Information */}
        <ResponsiveView style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Customer Information
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView style={styles.infoRow}>
            <MaterialIcons name="person" size={20} color={colors.textSecondary} />
            <ResponsiveView marginLeft="md">
              <ResponsiveText size="sm" color={colors.textSecondary}>
                Customer Name
              </ResponsiveText>
              <ResponsiveText size="md" color={colors.text} weight="medium">
                {order.delivery_address?.full_address?.split(',')[0] || 'Unknown'}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          <ResponsiveView style={styles.infoRow}>
            <MaterialIcons name="location-on" size={20} color={colors.textSecondary} />
            <ResponsiveView marginLeft="md">
              <ResponsiveText size="sm" color={colors.textSecondary}>
                Delivery Address
              </ResponsiveText>
              <ResponsiveText size="md" color={colors.text} weight="medium">
                {order.delivery_address?.full_address || 'No address provided'}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          {order.delivery_instructions && (
            <ResponsiveView style={styles.infoRow}>
              <MaterialIcons name="note" size={20} color={colors.textSecondary} />
              <ResponsiveView marginLeft="md">
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Delivery Instructions
                </ResponsiveText>
                <ResponsiveText size="md" color={colors.text} weight="medium">
                  {order.delivery_instructions}
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          )}
        </ResponsiveView>

        {/* Order Items */}
        <ResponsiveView style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Order Items ({order.items.length})
            </ResponsiveText>
          </ResponsiveView>
          
          {order.items.map((item, index) => (
            <ResponsiveView key={index} style={styles.orderItem}>
              <ResponsiveView style={styles.itemInfo}>
                <ResponsiveText size="md" color={colors.text} weight="medium">
                  {item.product_name}
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Quantity: {item.quantity}
                </ResponsiveText>
                {item.special_instructions && (
                  <ResponsiveText size="sm" color={colors.warning}>
                    Note: {item.special_instructions}
                  </ResponsiveText>
                )}
                {item.pizza_size && (
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Size: {item.pizza_size}
                  </ResponsiveText>
                )}
                {item.pizza_crust && (
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Crust: {item.pizza_crust}
                  </ResponsiveText>
                )}
                {item.toppings && item.toppings.length > 0 && (
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Toppings: {item.toppings.join(', ')}
                  </ResponsiveText>
                )}
              </ResponsiveView>
              <ResponsiveText size="md" color={colors.primary} weight="semiBold">
                ₱{(item.total_price || 0).toFixed(2)}
              </ResponsiveText>
            </ResponsiveView>
          ))}
        </ResponsiveView>

        {/* Order Summary */}
        <ResponsiveView style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Order Summary
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView style={styles.summaryRow}>
            <ResponsiveText size="md" color={colors.textSecondary}>
              Subtotal
            </ResponsiveText>
            <ResponsiveText size="md" color={colors.text} weight="medium">
              ₱{(order.subtotal || 0).toFixed(2)}
            </ResponsiveText>
          </ResponsiveView>

          <ResponsiveView style={styles.summaryRow}>
            <ResponsiveText size="md" color={colors.textSecondary}>
              Delivery Fee
            </ResponsiveText>
            <ResponsiveText size="md" color={colors.text} weight="medium">
              ₱{(order.delivery_fee || 0).toFixed(2)}
            </ResponsiveText>
          </ResponsiveView>

          <ResponsiveView style={styles.summaryRow}>
            <ResponsiveText size="md" color={colors.textSecondary}>
              Tax
            </ResponsiveText>
            <ResponsiveText size="md" color={colors.text} weight="medium">
              ₱{(order.tax_amount || 0).toFixed(2)}
            </ResponsiveText>
          </ResponsiveView>

          {order.discount_amount > 0 && (
            <ResponsiveView style={styles.summaryRow}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Discount
              </ResponsiveText>
              <ResponsiveText size="md" color={colors.success} weight="medium">
                -₱{(order.discount_amount || 0).toFixed(2)}
              </ResponsiveText>
            </ResponsiveView>
          )}

          <ResponsiveView style={[styles.summaryRow, styles.totalRow]}>
            <ResponsiveText size="lg" color={colors.text} weight="semiBold">
              Total
            </ResponsiveText>
            <ResponsiveText size="lg" color={colors.primary} weight="bold">
              ₱{(order.total_amount || 0).toFixed(2)}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>

        {/* Payment Information */}
        <ResponsiveView style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Payment Information
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView style={styles.infoRow}>
            <MaterialIcons name="payment" size={20} color={colors.textSecondary} />
            <ResponsiveView marginLeft="md">
              <ResponsiveText size="sm" color={colors.textSecondary}>
                Payment Method
              </ResponsiveText>
              <ResponsiveText size="md" color={colors.text} weight="medium">
                {order.payment_method.toUpperCase()}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          <ResponsiveView style={styles.infoRow}>
            <MaterialIcons name="check-circle" size={20} color={colors.textSecondary} />
            <ResponsiveView marginLeft="md">
              <ResponsiveText size="sm" color={colors.textSecondary}>
                Payment Status
              </ResponsiveText>
              <ResponsiveText size="md" color={colors.text} weight="medium">
                {order.payment_status.toUpperCase()}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
        </ResponsiveView>

        {/* Order Timeline */}
        <ResponsiveView style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Order Timeline
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView style={styles.timelineItem}>
            <ResponsiveView style={[styles.timelineDot, { backgroundColor: colors.primary }]}>
              <View />
            </ResponsiveView>
            <ResponsiveView marginLeft="md">
              <ResponsiveText size="md" color={colors.text} weight="medium">
                Order Placed
              </ResponsiveText>
              <ResponsiveText size="sm" color={colors.textSecondary}>
                {formatDate(order.created_at)}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          {order.confirmed_at && (
            <ResponsiveView style={styles.timelineItem}>
              <ResponsiveView style={[styles.timelineDot, { backgroundColor: colors.info }]}>
                <View />
              </ResponsiveView>
              <ResponsiveView marginLeft="md">
                <ResponsiveText size="md" color={colors.text} weight="medium">
                  Order Confirmed
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  {formatDate(order.confirmed_at)}
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          )}

          {order.prepared_at && (
            <ResponsiveView style={styles.timelineItem}>
              <ResponsiveView style={[styles.timelineDot, { backgroundColor: colors.primary }]}>
                <View />
              </ResponsiveView>
              <ResponsiveView marginLeft="md">
                <ResponsiveText size="md" color={colors.text} weight="medium">
                  Order Prepared
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  {formatDate(order.prepared_at)}
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          )}

          {order.picked_up_at && (
            <ResponsiveView style={styles.timelineItem}>
              <ResponsiveView style={[styles.timelineDot, { backgroundColor: colors.warning }]}>
                <View />
              </ResponsiveView>
              <ResponsiveView marginLeft="md">
                <ResponsiveText size="md" color={colors.text} weight="medium">
                  Ready for Pickup
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  {formatDate(order.picked_up_at)}
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          )}

          {order.delivered_at && (
            <ResponsiveView style={styles.timelineItem}>
              <ResponsiveView style={[styles.timelineDot, { backgroundColor: colors.success }]}>
                <View />
              </ResponsiveView>
              <ResponsiveView marginLeft="md">
                <ResponsiveText size="md" color={colors.text} weight="medium">
                  Order Delivered
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  {formatDate(order.delivered_at)}
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          )}

          {order.cancelled_at && (
            <ResponsiveView style={styles.timelineItem}>
              <ResponsiveView style={[styles.timelineDot, { backgroundColor: colors.error }]}>
                <View />
              </ResponsiveView>
              <ResponsiveView marginLeft="md">
                <ResponsiveText size="md" color={colors.text} weight="medium">
                  Order Cancelled
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  {formatDate(order.cancelled_at)}
                </ResponsiveText>
                {order.cancellation_reason && (
                  <ResponsiveText size="sm" color={colors.error}>
                    Reason: {order.cancellation_reason}
                  </ResponsiveText>
                )}
              </ResponsiveView>
            </ResponsiveView>
          )}
        </ResponsiveView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
});
