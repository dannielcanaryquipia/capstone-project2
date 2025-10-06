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
import Layout from '../../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../../../constants/Responsive';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { OrderService } from '../../../services/order.service';
import global from '../../../styles/global';
import { OrderStatus } from '../../../types/order.types';

interface OrderDetail {
  id: string;
  user_id: string;
  delivery_address_id: string;
  total_amount: number;
  status: OrderStatus;
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
  customer: {
    id: string;
    full_name: string;
    phone_number?: string;
    username: string;
  };
  delivery_address: {
    id: string;
    full_address: string;
    label?: string;
  };
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
}

export default function OrderDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const orderData = await OrderService.getOrderById(id) as unknown as OrderDetail;
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert('Error', 'Failed to load order details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order || !id) return;

    Alert.alert(
      'Update Order Status',
      `Are you sure you want to mark this order as ${newStatus.replace('_', ' ')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: async () => {
            setUpdating(true);
            try {
              await OrderService.updateOrderStatus(id, newStatus, 'Admin status update');
              await loadOrder(); // Reload order data
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
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
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
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
    <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <ResponsiveView style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={responsiveValue(20, 24, 28, 32)} color={colors.text} />
        </TouchableOpacity>
        <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
          Order #{order.id.slice(-8)}
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

        {/* Delivery Address */}
        <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Delivery Address
            </ResponsiveText>
          </ResponsiveView>
          
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
        </ResponsiveView>

        {/* Order Items */}
        <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Order Items
            </ResponsiveText>
          </ResponsiveView>
          
          {order.order_items.map((item) => (
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
              
              {item.customization_details && (
                <ResponsiveView marginTop="xs">
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Customization: {JSON.stringify(item.customization_details)}
                  </ResponsiveText>
                </ResponsiveView>
              )}
              
              {item.selected_size && (
                <ResponsiveView marginTop="xs">
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Size: {item.selected_size}
                  </ResponsiveText>
                </ResponsiveView>
              )}
            </ResponsiveView>
          ))}
        </ResponsiveView>

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
                Payment Method: {order.payment_method || 'COD'}
              </ResponsiveText>
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
        </ResponsiveView>
      </ScrollView>

      {/* Action Buttons */}
      {nextStatus && (
        <ResponsiveView style={[styles.actionContainer, { backgroundColor: colors.surface }]}>
          <Button
            title={`Mark as ${nextStatus.replace('_', ' ')}`}
            onPress={() => handleStatusUpdate(nextStatus)}
            variant="primary"
            loading={updating}
            disabled={updating}
          />
        </ResponsiveView>
      )}
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
});