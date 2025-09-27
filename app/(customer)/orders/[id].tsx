import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { useTheme } from '../../../contexts/ThemeContext';
import { useResponsive } from '../../../hooks/useResponsive';
import { OrderService } from '../../../services/order.service';
import { Order, OrderStatus } from '../../../types/order.types';

// Reusable components for better organization
const OrderStatusBadge: React.FC<{ status: OrderStatus; colors: any }> = ({ status, colors }) => {
  const statusConfig = useMemo(() => {
    const configs = {
      'pending': { color: colors.warning, icon: 'schedule', label: 'PENDING' },
      'confirmed': { color: colors.info, icon: 'check-circle-outline', label: 'CONFIRMED' },
      'preparing': { color: colors.primary, icon: 'restaurant', label: 'PREPARING' },
      'ready_for_pickup': { color: colors.warning, icon: 'local-shipping', label: 'READY FOR PICKUP' },
      'out_for_delivery': { color: colors.info, icon: 'delivery-dining', label: 'ON THE WAY' },
      'delivered': { color: colors.success, icon: 'check-circle', label: 'DELIVERED' },
      'cancelled': { color: colors.error, icon: 'cancel', label: 'CANCELLED' }
    };
    return configs[status] || configs['pending'];
  }, [status, colors]);

  return (
    <ResponsiveView style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}20` }]}>
      <MaterialIcons name={statusConfig.icon as any} size={16} color={statusConfig.color} />
      <ResponsiveText size="sm" color={statusConfig.color} weight="semiBold">
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
        
        {/* Special Instructions */}
        {item.special_instructions && (
          <ResponsiveView marginTop="xs">
            <ResponsiveText size="sm" color={colors.textSecondary}>
              Note: {item.special_instructions}
            </ResponsiveText>
          </ResponsiveView>
        )}
        
        {/* Pizza Details */}
        <ResponsiveView marginTop="xs" flexDirection="row" style={{ flexWrap: 'wrap' }}>
          {item.pizza_size && (
            <ResponsiveView style={[styles.pizzaDetail, { backgroundColor: colors.surface }]} marginRight="xs" marginBottom="xs">
              <ResponsiveText size="xs" color={colors.textSecondary}>
                Size: {item.pizza_size}
              </ResponsiveText>
            </ResponsiveView>
          )}
          {item.pizza_crust && (
            <ResponsiveView style={[styles.pizzaDetail, { backgroundColor: colors.surface }]} marginRight="xs" marginBottom="xs">
              <ResponsiveText size="xs" color={colors.textSecondary}>
                Crust: {item.pizza_crust}
              </ResponsiveText>
            </ResponsiveView>
          )}
          {item.toppings && item.toppings.length > 0 && (
            <ResponsiveView style={[styles.pizzaDetail, { backgroundColor: colors.surface }]} marginRight="xs" marginBottom="xs">
              <ResponsiveText size="xs" color={colors.textSecondary} numberOfLines={1}>
                Toppings: {item.toppings.join(', ')}
              </ResponsiveText>
            </ResponsiveView>
          )}
        </ResponsiveView>
        
        {/* Product Size and Crust Info */}
        {(item.pizza_size || item.pizza_crust) && (
          <ResponsiveView marginTop="xs" flexDirection="row" alignItems="center">
            <MaterialIcons name="restaurant" size={14} color={colors.textTertiary} />
            <ResponsiveView marginLeft="xs" flexDirection="row" style={{ flexWrap: 'wrap' }}>
              {item.pizza_size && (
                <ResponsiveView marginRight="sm">
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    {item.pizza_size}
                  </ResponsiveText>
                </ResponsiveView>
              )}
              {item.pizza_crust && (
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  {item.pizza_crust}
                </ResponsiveText>
              )}
            </ResponsiveView>
          </ResponsiveView>
        )}
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
  const { isTablet } = useResponsive();
  const router = useRouter();
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

  const handleContactSupport = useCallback(() => {
    Alert.alert(
      'Contact Support',
      'Need help with your order? Contact our support team.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Support', onPress: () => console.log('Call support') },
        { text: 'Email Support', onPress: () => console.log('Email support') }
      ]
    );
  }, []);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id, loadOrder]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <LoadingState 
          message="Loading order details..." 
          fullScreen 
        />
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <ErrorState
          title="Order Not Found"
          message={error || 'This order could not be found or you may not have permission to view it.'}
          actionTitle="Try Again"
          onActionPress={() => loadOrder()}
          fullScreen
        />
      </SafeAreaView>
    );
  }

  // Empty state for no items
  if (!order.items || order.items.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <EmptyState
          icon="shopping-cart"
          title="No Items Found"
          description="This order doesn't have any items."
          actionTitle="Back to Orders"
          onActionPress={() => router.back()}
          fullScreen
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
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

        {/* Delivery Information */}
        <ResponsiveView padding="lg">
          <ResponsiveView marginBottom="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              Delivery Information
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView style={[styles.deliveryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <InfoRow
              icon="location-on"
              title={order.delivery_address?.label || 'Delivery Address'}
              value={order.delivery_address?.full_address || 'No address provided'}
              colors={colors}
            />
            
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
          </ResponsiveView>
        </ResponsiveView>

        {/* Action Buttons */}
        <ResponsiveView padding="lg" paddingBottom="xl">
          <ResponsiveView 
            flexDirection={isTablet ? "row" : "column"} 
            style={{ gap: Layout.spacing.md }}
          >
            <Button
              title="Reorder"
              onPress={handleReorder}
              variant="outline"
              style={[styles.actionButton, isTablet && styles.actionButtonTablet]}
              icon={<MaterialIcons name="refresh" size={20} color={colors.primary} />}
            />
            <Button
              title="Contact Support"
              onPress={handleContactSupport}
              variant="secondary"
              style={[styles.actionButton, isTablet && styles.actionButtonTablet]}
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
});