import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { useTheme } from '../../../contexts/ThemeContext';
import { OrderService } from '../../../services/order.service';
import { Order, OrderStatus } from '../../../types/order.types';

export default function OrderDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const orderData = await OrderService.getOrderById(id!);
      setOrder(orderData);
    } catch (err) {
      console.error('Error loading order:', err);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const formatOrderDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleProductPress = (productId: string) => {
    router.push({
      pathname: '/(customer)/product/[id]',
      params: { id: productId }
    } as any);
  };

  const handleReorder = () => {
    if (order?.items) {
      // Navigate to menu with pre-filled cart
      router.push('/(customer)/menu');
    }
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Need help with your order? Contact our support team.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Support', onPress: () => console.log('Call support') },
        { text: 'Email Support', onPress: () => console.log('Email support') }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ResponsiveView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ResponsiveText size="md" color={colors.textSecondary} style={styles.loadingText}>
            Loading order details...
          </ResponsiveText>
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ResponsiveView style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.error} />
          <ResponsiveText size="lg" weight="semiBold" color={colors.error} style={styles.errorTitle}>
            Order Not Found
          </ResponsiveText>
          <ResponsiveText size="md" color={colors.textSecondary} style={styles.errorSubtitle}>
            {error || 'This order could not be found or you may not have permission to view it.'}
          </ResponsiveText>
          <Button
            title="Try Again"
            onPress={loadOrder}
            variant="primary"
            style={styles.retryButton}
          />
          <Button
            title="Back to Orders"
            onPress={() => router.back()}
            variant="outline"
            style={styles.backButton}
          />
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(order.status);
  const statusIcon = getStatusIcon(order.status);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ResponsiveView 
          style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
          padding="lg"
        >
          <ResponsiveView flexDirection="row" alignItems="center" marginBottom="sm">
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <ResponsiveText size="xl" weight="bold" color={colors.text}>
              Order Details
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView flexDirection="row" justifyContent="space-between" alignItems="center">
            <ResponsiveView>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Order #{order.order_number}
              </ResponsiveText>
              <ResponsiveText size="sm" color={colors.textTertiary}>
                {formatOrderDate(order.created_at)}
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <MaterialIcons name={statusIcon} size={16} color={statusColor} />
              <ResponsiveText size="sm" color={statusColor} weight="semiBold">
                {order.status.replace('_', ' ').toUpperCase()}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
        </ResponsiveView>

         {/* Order Items */}
         <ResponsiveView padding="lg">
           <ResponsiveView marginBottom="md">
             <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
               Order Items ({order.items?.length || 0})
             </ResponsiveText>
           </ResponsiveView>
           
           <ResponsiveView style={[styles.itemsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
             {order.items?.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.orderItem,
                  index < (order.items?.length || 0) - 1 && { borderBottomColor: colors.border }
                ]}
                onPress={() => handleProductPress(item.product_id)}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: item.product_image || 'https://via.placeholder.com/200x150' }}
                  style={styles.itemImage}
                />
                <ResponsiveView style={styles.itemDetails} flex={1}>
                  <ResponsiveText size="md" weight="semiBold" color={colors.text} numberOfLines={2}>
                    {item.product_name}
                  </ResponsiveText>
                   {item.special_instructions && (
                     <ResponsiveView marginTop="xs">
                       <ResponsiveText size="sm" color={colors.textSecondary}>
                         Note: {item.special_instructions}
                       </ResponsiveText>
                     </ResponsiveView>
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
                <ResponsiveView style={styles.itemRight}>
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Qty: {item.quantity}
                  </ResponsiveText>
                  <ResponsiveText size="md" weight="semiBold" color={colors.primary}>
                    ₱{item.total_price.toFixed(2)}
                  </ResponsiveText>
                </ResponsiveView>
              </TouchableOpacity>
            ))}
          </ResponsiveView>
        </ResponsiveView>

         {/* Order Summary */}
         <ResponsiveView padding="lg">
           <ResponsiveView marginBottom="md">
             <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
               Order Summary
             </ResponsiveText>
           </ResponsiveView>
          
          <ResponsiveView style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
             <ResponsiveView style={styles.summaryRow}>
               <ResponsiveText size="md" color={colors.textSecondary}>Subtotal</ResponsiveText>
               <ResponsiveText size="md" color={colors.text}>₱{(order.subtotal || 0).toFixed(2)}</ResponsiveText>
             </ResponsiveView>
             <ResponsiveView style={styles.summaryRow}>
               <ResponsiveText size="md" color={colors.textSecondary}>Delivery Fee</ResponsiveText>
               <ResponsiveText size="md" color={colors.text}>₱{(order.delivery_fee || 0).toFixed(2)}</ResponsiveText>
             </ResponsiveView>
             <ResponsiveView style={styles.summaryRow}>
               <ResponsiveText size="md" color={colors.textSecondary}>Tax</ResponsiveText>
               <ResponsiveText size="md" color={colors.text}>₱{(order.tax_amount || 0).toFixed(2)}</ResponsiveText>
             </ResponsiveView>
             {(order.discount_amount || 0) > 0 && (
               <ResponsiveView style={styles.summaryRow}>
                 <ResponsiveText size="md" color={colors.success}>Discount</ResponsiveText>
                 <ResponsiveText size="md" color={colors.success}>-₱{(order.discount_amount || 0).toFixed(2)}</ResponsiveText>
               </ResponsiveView>
             )}
             <ResponsiveView style={[styles.summaryRow, styles.totalRow]}>
               <ResponsiveText size="lg" weight="bold" color={colors.text}>Total</ResponsiveText>
               <ResponsiveText size="lg" weight="bold" color={colors.primary}>₱{(order.total_amount || 0).toFixed(2)}</ResponsiveText>
             </ResponsiveView>
          </ResponsiveView>
        </ResponsiveView>

         {/* Delivery Information */}
         <ResponsiveView padding="lg">
           <ResponsiveView marginBottom="md">
             <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
               Delivery Information
             </ResponsiveText>
           </ResponsiveView>
          
          <ResponsiveView style={[styles.deliveryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ResponsiveView style={styles.deliveryRow}>
              <MaterialIcons name="location-on" size={20} color={colors.primary} />
              <ResponsiveView style={styles.deliveryDetails}>
                <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                  {order.delivery_address?.label || 'Delivery Address'}
                </ResponsiveText>
                 <ResponsiveView marginTop="xs">
                   <ResponsiveText size="sm" color={colors.textSecondary}>
                     {order.delivery_address?.full_address || 'No address provided'}
                   </ResponsiveText>
                 </ResponsiveView>
              </ResponsiveView>
            </ResponsiveView>
            
            <ResponsiveView style={styles.deliveryRow}>
              <MaterialIcons name="payment" size={20} color={colors.primary} />
              <ResponsiveView style={styles.deliveryDetails}>
                <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                  Payment Method
                </ResponsiveText>
                 <ResponsiveView marginTop="xs">
                   <ResponsiveText size="sm" color={colors.textSecondary}>
                     {order.payment_method.toUpperCase()}
                   </ResponsiveText>
                 </ResponsiveView>
              </ResponsiveView>
            </ResponsiveView>
            
            {order.delivery_instructions && (
              <ResponsiveView style={styles.deliveryRow}>
                <MaterialIcons name="note" size={20} color={colors.primary} />
                <ResponsiveView style={styles.deliveryDetails}>
                  <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                    Special Instructions
                  </ResponsiveText>
                   <ResponsiveView marginTop="xs">
                     <ResponsiveText size="sm" color={colors.textSecondary}>
                       {order.delivery_instructions}
                     </ResponsiveText>
                   </ResponsiveView>
                </ResponsiveView>
              </ResponsiveView>
            )}
          </ResponsiveView>
        </ResponsiveView>

         {/* Action Buttons */}
         <ResponsiveView padding="lg" paddingBottom="xl">
           <ResponsiveView flexDirection="row" style={{ gap: Layout.spacing.md }}>
            <Button
              title="Reorder"
              onPress={handleReorder}
              variant="outline"
              style={styles.actionButton}
              icon={<MaterialIcons name="refresh" size={20} color={colors.primary} />}
            />
            <Button
              title="Contact Support"
              onPress={handleContactSupport}
              variant="secondary"
              style={styles.actionButton}
              icon={<MaterialIcons name="support-agent" size={20} color={colors.textInverse} />}
            />
          </ResponsiveView>
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
    padding: Layout.spacing.xl,
  },
  loadingText: {
    marginTop: Layout.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  errorTitle: {
    marginTop: Layout.spacing.md,
    textAlign: 'center',
  },
  errorSubtitle: {
    marginTop: Layout.spacing.sm,
    textAlign: 'center',
    marginBottom: Layout.spacing.lg,
  },
  retryButton: {
    marginBottom: Layout.spacing.md,
  },
  backButton: {
    padding: Layout.spacing.sm,
    marginRight: Layout.spacing.sm,
  },
  header: {
    borderBottomWidth: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  itemsCard: {
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  orderItem: {
    flexDirection: 'row',
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: Layout.borderRadius.sm,
    marginRight: Layout.spacing.sm,
  },
  itemDetails: {
    marginRight: Layout.spacing.sm,
  },
  itemRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  summaryCard: {
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    padding: Layout.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.xs,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    marginTop: Layout.spacing.sm,
    paddingTop: Layout.spacing.sm,
  },
  deliveryCard: {
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    padding: Layout.spacing.md,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
  },
  deliveryDetails: {
    flex: 1,
    marginLeft: Layout.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
