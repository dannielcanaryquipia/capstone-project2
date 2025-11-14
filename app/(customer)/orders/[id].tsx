import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '../../../components/ui/AlertProvider';
import Button from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { useTheme } from '../../../contexts/ThemeContext';
import { useResponsive } from '../../../hooks/useResponsive';
import { supabase } from '../../../lib/supabase';
import { OrderService } from '../../../services/order.service';
import { Order, OrderStatus } from '../../../types/order.types';
import { getDetailedCustomizationDisplay } from '../../../utils/customizationDisplay';


// Reusable components for better organization
const OrderStatusBadge: React.FC<{ status: OrderStatus; colors: any }> = ({ status, colors }) => {
  const { isSmallDevice } = useResponsive();
  
  const statusConfig = useMemo(() => {
    const configs = {
      'pending': { color: colors.warning, icon: 'schedule', label: 'PENDING' },
      'confirmed': { color: colors.info, icon: 'check-circle-outline', label: 'CONFIRMED' },
      'preparing': { color: colors.primary, icon: 'restaurant', label: 'PREPARING' },
      'ready_for_pickup': { 
        color: colors.warning, 
        icon: 'local-shipping', 
        label: isSmallDevice ? 'READY' : 'READY FOR PICKUP' 
      },
      'out_for_delivery': { color: colors.info, icon: 'delivery-dining', label: 'ON THE WAY' },
      'delivered': { color: colors.success, icon: 'check-circle', label: 'DELIVERED' },
      'cancelled': { color: colors.error, icon: 'cancel', label: 'CANCELLED' }
    };
    return configs[status] || configs['pending'];
  }, [status, colors, isSmallDevice]);

  return (
    <ResponsiveView style={[
      styles.statusBadge,
      isSmallDevice && styles.statusBadgeSmall,
      { backgroundColor: `${statusConfig.color}20` }
    ]}>
      <MaterialIcons 
        name={statusConfig.icon as any} 
        size={isSmallDevice ? 14 : 16} 
        color={statusConfig.color} 
      />
      <ResponsiveText 
        size={isSmallDevice ? "xs" : "sm"} 
        color={statusConfig.color} 
        weight="semiBold"
        numberOfLines={1}
        style={styles.statusText}
      >
        {statusConfig.label}
      </ResponsiveText>
    </ResponsiveView>
  );
};

const OrderItemCard: React.FC<{
  item: any;
  colors: any;
  onProductPress: (productId: string) => void;
  isLast?: boolean;
}> = ({ item, colors, onProductPress, isLast = false }) => {
  const { isTablet, isSmallDevice } = useResponsive();
  
  return (
    <TouchableOpacity
      style={[
        styles.orderItem,
        !isLast && { borderBottomColor: colors.border }
      ]}
      onPress={() => onProductPress(item.product_id)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.product?.image_url || item.product_image || 'https://via.placeholder.com/200x150' }}
        style={[
          styles.itemImage, 
          isTablet && styles.itemImageTablet,
          isSmallDevice && styles.itemImageMobile
        ]}
      />
      <ResponsiveView style={styles.itemDetails} flex={1}>
        <ResponsiveText 
          size={isTablet ? "lg" : "md"} 
          weight="semiBold" 
          color={colors.text} 
          numberOfLines={2}
        >
          {item.product?.name || item.product_name || 'Product'}
        </ResponsiveText>
        
        {/* Refined Customization Display */}
        {(() => {
          const customizationDisplay = getDetailedCustomizationDisplay(item);
          return customizationDisplay && customizationDisplay.map((detail: any, index: number) => (
            <ResponsiveView key={index} marginTop="xs">
              <ResponsiveText 
                size="sm" 
                color={colors.textSecondary}
                style={detail.type === 'instructions' ? { fontStyle: 'italic' } : {}}
              >
                {detail.label}: {detail.value}
              </ResponsiveText>
            </ResponsiveView>
          ));
        })()}
      </ResponsiveView>
      
      <ResponsiveView style={styles.itemRight}>
        <ResponsiveText size="sm" color={colors.textSecondary}>
          Qty: {item.quantity}
        </ResponsiveText>
        <ResponsiveText size="md" weight="semiBold" color={colors.primary}>
          ₱{((item.unit_price || 0) * (item.quantity || 1)).toFixed(2)}
        </ResponsiveText>
      </ResponsiveView>
    </TouchableOpacity>
  );
};

const SummaryRow: React.FC<{
  label: string;
  value: number;
  colors: any;
  isTotal?: boolean;
  isDiscount?: boolean;
}> = ({ label, value, colors, isTotal = false, isDiscount = false }) => (
  <ResponsiveView style={[styles.summaryRow, isTotal && styles.totalRow]}>
    <ResponsiveText 
      size={isTotal ? "lg" : "md"} 
      weight={isTotal ? "bold" : "medium"} 
      color={isDiscount ? colors.success : colors.textSecondary}
    >
      {label}
    </ResponsiveText>
    <ResponsiveText 
      size={isTotal ? "lg" : "md"} 
      weight={isTotal ? "bold" : "medium"} 
      color={isDiscount ? colors.success : (isTotal ? colors.primary : colors.text)}
    >
      {isDiscount ? '-' : ''}₱{value.toFixed(2)}
    </ResponsiveText>
  </ResponsiveView>
);

const InfoRow: React.FC<{
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  value: string;
  colors: any;
  onPress?: () => void;
}> = ({ icon, title, value, colors, onPress }) => (
  <TouchableOpacity
    style={styles.infoRow}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <MaterialIcons name={icon} size={20} color={colors.primary} />
    <ResponsiveView style={styles.infoDetails} flex={1}>
      <ResponsiveText size="md" weight="semiBold" color={colors.text}>
        {title}
      </ResponsiveText>
      <ResponsiveView marginTop="xs">
        <ResponsiveText size="sm" color={colors.textSecondary} numberOfLines={2}>
          {value}
        </ResponsiveText>
      </ResponsiveView>
    </ResponsiveView>
    {onPress && (
      <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
    )}
  </TouchableOpacity>
);

export default function OrderDetailScreen() {
  const { colors } = useTheme();
  const { confirm, confirmDestructive, success, error: showError } = useAlert();
  const { isTablet } = useResponsive();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized calculations for better performance
  const orderSummary = useMemo(() => {
    if (!order) return null;
    
    return {
      subtotal: order.subtotal || 0,
      delivery_fee: order.delivery_fee || 0,
      tax_amount: order.tax_amount || 0,
      discount_amount: order.discount_amount || 0,
      total: order.total_amount || 0,
      item_count: order.items?.length || 0
    };
  }, [order]);

  const productName = useMemo(() => {
    if (!order?.items?.[0]?.product?.name) return 'Product Order';
    return order.items[0].product.name;
  }, [order?.items]);

  const formatOrderDate = useCallback((dateString: string) => {
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
  }, []);

  const loadOrder = useCallback(async (isRefresh = false) => {
    if (!id) return;
    
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const orderData = await OrderService.getOrderById(id);
      setOrder(orderData);
    } catch (err) {
      console.error('Error loading order:', err);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  const handleRefresh = useCallback(() => {
    loadOrder(true);
  }, [loadOrder]);

  const handleProductPress = useCallback((productId: string) => {
    router.push({
      pathname: '/(customer)/product/[id]',
      params: { id: productId }
    } as any);
  }, [router]);

  const handleReorder = useCallback(() => {
    if (order?.items) {
      router.push('/(customer)/menu');
    }
  }, [order?.items, router]);

  const handleCancelOrder = useCallback(() => {
    confirmDestructive(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      async () => {
        try {
          if (!order?.id) {
            showError('Error', 'Order ID not found.');
            return;
          }

          // Get current user for cancelledBy parameter
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            showError('Error', 'User not authenticated.');
            return;
          }

          console.log('Starting order cancellation process...');
          
          // Call the actual cancel order service
          await OrderService.cancelOrder(
            order.id,
            'Cancelled by customer',
            user.id
          );

          console.log('Order cancellation completed, refreshing order data...');

          // Refresh the order data to reflect the cancellation
          await loadOrder();

          console.log('Order data refreshed, showing success message');
          success('Order Cancelled', 'Your order has been cancelled successfully.');
        } catch (error) {
          console.error('Error cancelling order:', error);
          showError('Error', 'Failed to cancel order. Please try again.');
        }
      },
      undefined,
      'Cancel Order',
      'Keep Order'
    );
  }, [order?.id, loadOrder, confirmDestructive, showError, success]);

  // Check if order can be cancelled
  const canCancelOrder = useMemo(() => {
    if (!order) return false;
    return order.status === 'pending' || order.status === 'preparing';
  }, [order?.status]);


  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id, loadOrder]);

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={{ paddingTop: insets.top }}>
          <LoadingState 
            message="Loading order details..." 
            fullScreen 
          />
        </View>
      </View>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={{ paddingTop: insets.top }}>
          <ErrorState
            title="Order Not Found"
            message={error || 'This order could not be found or you may not have permission to view it.'}
            actionTitle="Try Again"
            onActionPress={() => loadOrder()}
            fullScreen
          />
        </View>
      </View>
    );
  }

  // Empty state for no items
  if (!order.items || order.items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={{ paddingTop: insets.top }}>
          <EmptyState
            icon="shopping-cart"
            title="No Items Found"
            description="This order doesn't have any items."
            actionTitle="Back to Orders"
            onActionPress={() => router.back()}
            fullScreen
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, 20)
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <ResponsiveView 
          style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
          padding="lg"
        >
          <ResponsiveView flexDirection="row" alignItems="center" marginBottom="sm">
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          </ResponsiveView>
          
          {/* Product Name */}
          <ResponsiveView marginBottom="sm">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              {productName}
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView>
            <ResponsiveText size="md" color={colors.textSecondary}>
              Order #{order.order_number || order.id}
            </ResponsiveText>
            <ResponsiveView marginTop="xs">
              <ResponsiveText size="sm" color={colors.textTertiary}>
                {formatOrderDate(order.created_at)}
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView marginTop="sm">
              <OrderStatusBadge status={order.status} colors={colors} />
            </ResponsiveView>
          {order.status === 'delivered' && (order as any).actual_delivery_time && (
            <ResponsiveView marginTop="xs">
              <ResponsiveText size="sm" color={colors.textSecondary}>
                Delivered at: {formatOrderDate((order as any).actual_delivery_time as any)}
              </ResponsiveText>
            </ResponsiveView>
          )}
          {order.status === 'delivered' && (order as any).delivered_by_rider && (
            <ResponsiveView marginTop="xs">
              <ResponsiveText size="sm" color={colors.textSecondary}>
                Delivered by: {(order as any).delivered_by_rider.full_name || (order as any).delivered_by_rider.username}
              </ResponsiveText>
            </ResponsiveView>
          )}
          </ResponsiveView>
        </ResponsiveView>

        {/* Order Items */}
        <ResponsiveView padding="lg">
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Order Items ({orderSummary?.item_count || 0})
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView style={[styles.itemsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {order.items.map((item, index) => (
              <OrderItemCard
                key={`${item.id || index}`}
                item={item}
                colors={colors}
                onProductPress={handleProductPress}
                isLast={index === order.items.length - 1}
              />
            ))}
          </ResponsiveView>
          
          {/* Order Notes */}
          {order.notes && (
            <ResponsiveView marginTop="md">
              <ResponsiveView style={[styles.notesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <ResponsiveView flexDirection="row" alignItems="center" marginBottom="sm">
                  <MaterialIcons name="note" size={20} color={colors.primary} />
                  <ResponsiveView marginLeft="sm">
                    <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                      Order Notes
                    </ResponsiveText>
                  </ResponsiveView>
                </ResponsiveView>
                <ResponsiveText size="sm" color={colors.textSecondary} style={{ lineHeight: 20 }}>
                  {order.notes}
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          )}
        </ResponsiveView>

        {/* Order Summary */}
        <ResponsiveView padding="lg">
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Order Summary
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <SummaryRow
              label="Subtotal"
              value={orderSummary?.subtotal || 0}
              colors={colors}
            />
            <SummaryRow
              label="Delivery Fee"
              value={orderSummary?.delivery_fee || 0}
              colors={colors}
            />
            <SummaryRow
              label="Tax"
              value={orderSummary?.tax_amount || 0}
              colors={colors}
            />
            {(orderSummary?.discount_amount || 0) > 0 && (
              <SummaryRow
                label="Discount"
                value={orderSummary?.discount_amount || 0}
                colors={colors}
                isDiscount
              />
            )}
            <SummaryRow
              label="Total"
              value={orderSummary?.total || 0}
              colors={colors}
              isTotal
            />
          </ResponsiveView>
        </ResponsiveView>

        {/* Receive Options / Fulfillment Type */}
        <ResponsiveView padding="lg">
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Receive Options
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView style={[styles.deliveryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
                size={20}
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
            {(order as any).fulfillment_type === 'delivery' && (
              <InfoRow
                icon="location-on"
                title={order.delivery_address?.label || 'Delivery Address'}
                value={order.delivery_address?.full_address || 'No address provided'}
                colors={colors}
              />
            )}

            {/* Pickup Location (only for pickup orders) */}
            {(order as any).fulfillment_type === 'pickup' && (
              <InfoRow
                icon="store"
                title="Pickup Location"
                value={(order as any).pickup_location_snapshot || 'Kitchen One - Main Branch\nSan Vicente, Bulan, Sorsogon'}
                colors={colors}
              />
            )}
            
            <InfoRow
              icon="payment"
              title="Payment Method"
              value={(order.payment_method || 'Unknown').toUpperCase()}
              colors={colors}
            />
            
            {order.delivery_instructions && (
              <InfoRow
                icon="note"
                title="Special Instructions"
                value={order.delivery_instructions}
                colors={colors}
              />
            )}

            {/* Rider Delivery Information (only for delivery orders) */}
            {(order as any).fulfillment_type === 'delivery' && order.status === 'delivered' && (order as any).delivered_by_rider && (order as any).delivered_at && (
              <>
                <InfoRow
                  icon="delivery-dining"
                  title="Delivered by"
                  value={(order as any).delivered_by_rider.full_name || (order as any).delivered_by_rider.username}
                  colors={colors}
                />
                
                <InfoRow
                  icon="schedule"
                  title="Delivered at"
                  value={formatOrderDate((order as any).delivered_at)}
                  colors={colors}
                />
              </>
            )}

            {/* Pickup Information (only for pickup orders) */}
            {(order as any).fulfillment_type === 'pickup' && (order as any).picked_up_at && (
              <InfoRow
                icon="schedule"
                title="Picked up at"
                value={formatOrderDate((order as any).picked_up_at)}
                colors={colors}
              />
            )}
          </ResponsiveView>
        </ResponsiveView>

        {/* Action Buttons */}
        <ResponsiveView padding="lg" paddingBottom="xl">
          {/* Cancel restriction message */}
          {!canCancelOrder && order?.status !== 'cancelled' && order?.status !== 'delivered' && (
            <ResponsiveView 
              style={[styles.infoBox, { backgroundColor: colors.warning + '10', borderColor: colors.warning + '30' }]}
              marginBottom="md"
            >
              <MaterialIcons name="info" size={20} color={colors.warning} />
              <ResponsiveView marginLeft="sm" flex={1}>
                <ResponsiveText size="sm" color={colors.warning} weight="semiBold">
                  Order Cannot Be Cancelled
                </ResponsiveText>
                <ResponsiveText size="xs" color={colors.warning} style={{ marginTop: 2 }}>
                  {order?.status === 'out_for_delivery' 
                    ? 'Your order is already on the way and cannot be cancelled.'
                    : 'This order cannot be cancelled at this time.'
                  }
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          )}

          <ResponsiveView 
            flexDirection={isTablet ? "row" : "column"} 
            style={{ 
              gap: Layout.spacing.md,
              paddingBottom: Math.max(insets.bottom, 16)
            }}
          >
            <Button
              title="Reorder"
              onPress={handleReorder}
              variant="outline"
              style={[styles.actionButton, isTablet && styles.actionButtonTablet]}
              icon={<MaterialIcons name="refresh" size={20} color={colors.primary} />}
            />
            <Button
              title={
                order?.status === 'cancelled' 
                  ? "Order Cancelled" 
                  : !canCancelOrder 
                    ? "Cannot Cancel" 
                    : "Cancel Order"
              }
              onPress={order?.status === 'cancelled' || !canCancelOrder ? () => {} : handleCancelOrder}
              variant="danger"
              disabled={order?.status === 'cancelled' || !canCancelOrder}
              style={[
                styles.actionButton, 
                isTablet && styles.actionButtonTablet,
                (order?.status === 'cancelled' || !canCancelOrder) && { opacity: 0.6 }
              ]}
              icon={
                <MaterialIcons 
                  name="cancel" 
                  size={20} 
                  color={(order?.status === 'cancelled' || !canCancelOrder) ? colors.textTertiary : colors.textInverse} 
                />
              }
            />
          </ResponsiveView>
        </ResponsiveView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: Layout.spacing.sm,
    marginRight: Layout.spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    maxWidth: '100%',
    flexShrink: 1,
  },
  statusBadgeSmall: {
    paddingHorizontal: Layout.spacing.xs,
    paddingVertical: 3,
  },
  statusText: {
    flexShrink: 1,
    marginLeft: 4,
  },
  itemsCard: {
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  notesCard: {
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    padding: Layout.spacing.md,
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
  itemImageTablet: {
    width: 80,
    height: 80,
  },
  itemImageMobile: {
    width: 50,
    height: 50,
  },
  itemDetails: {
    marginRight: Layout.spacing.sm,
  },
  pizzaDetail: {
    paddingHorizontal: Layout.spacing.xs,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.xs,
    marginRight: Layout.spacing.xs,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
  },
  infoDetails: {
    marginLeft: Layout.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonTablet: {
    flex: 0,
    minWidth: 200,
  },
  header: {
    borderBottomWidth: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.sm,
    borderLeftWidth: 3,
  },
  fulfillmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 2,
  },
  fulfillmentBadgeText: {
    marginLeft: Layout.spacing.sm,
  },
});