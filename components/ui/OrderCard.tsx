import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import Layout from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Order, OrderStatus } from '../../types/order.types';
import { ResponsiveText } from './ResponsiveText';
import { ResponsiveView } from './ResponsiveView';

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
  onProductPress?: (productId: string) => void;
  showCustomerInfo?: boolean;
  showDeliveryInfo?: boolean;
  showActionButton?: boolean;
  actionButtonTitle?: string;
  onActionPress?: () => void;
  actionButtonLoading?: boolean;
  actionButtonDisabled?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

// Helper function to format order status for display
const formatOrderStatus = (status: OrderStatus): string => {
  const statusMap: Record<OrderStatus, string> = {
    'pending': 'Pending',
    'confirmed': 'Preparing',
    'preparing': 'Preparing',
    'ready_for_pickup': 'Ready for Pickup',
    'out_for_delivery': 'On the Way',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };
  return statusMap[status] || status;
};

// Helper function to get status color
const getStatusColor = (status: OrderStatus, colors: any): string => {
  const colorMap: Record<OrderStatus, string> = {
    'pending': colors.warning,
    'confirmed': colors.warning,
    'preparing': colors.warning,
    'ready_for_pickup': colors.warning,
    'out_for_delivery': colors.info,
    'delivered': colors.success,
    'cancelled': colors.error
  };
  return colorMap[status] || colors.textSecondary;
};

// Helper function to get status icon
const getStatusIcon = (status: OrderStatus): keyof typeof MaterialIcons.glyphMap => {
  const iconMap: Record<OrderStatus, keyof typeof MaterialIcons.glyphMap> = {
    'pending': 'schedule',
    'confirmed': 'check-circle-outline',
    'preparing': 'restaurant',
    'ready_for_pickup': 'local-shipping',
    'out_for_delivery': 'delivery-dining',
    'delivered': 'check-circle',
    'cancelled': 'cancel'
  };
  return iconMap[status] || 'schedule';
};

// Helper function to format date
const formatOrderDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } else if (diffInHours < 48) {
    return `Yesterday, ${date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
};

import { getCompactCustomizationDisplay } from '../../utils/customizationDisplay';

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPress,
  onProductPress,
  showCustomerInfo = false,
  showDeliveryInfo = true,
  showActionButton = false,
  actionButtonTitle,
  onActionPress,
  actionButtonLoading = false,
  actionButtonDisabled = false,
  variant = 'default'
}) => {
  const { colors } = useTheme();
  const { isTablet, isSmallDevice } = useResponsive();
  
  const displayStatus = formatOrderStatus(order.status);
  const statusColor = getStatusColor(order.status, colors);
  const statusIcon = getStatusIcon(order.status);
  const orderTime = formatOrderDate(order.created_at);
  const deliveredTime = (order as any).actual_delivery_time
    ? formatOrderDate((order as any).actual_delivery_time)
    : null;
  const displayOrderNumber = (order as any).order_number || (order.id ? order.id.slice(-8) : '');
  
  // Get the first item's image or use a default
  const firstItem = order.items?.[0];
  const orderImage = firstItem?.product?.image_url || firstItem?.product_image || 'https://via.placeholder.com/200x150';
  
  // Get product name from the first item or use a default
  const productName = firstItem?.product?.name || firstItem?.product_name || 'Product';

  const renderCompact = () => (
    <TouchableOpacity 
      style={[styles.orderCard, styles.compactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <ResponsiveView style={styles.compactHeader}>
        <ResponsiveText size="md" weight="semiBold" color={colors.text}>
          {displayOrderNumber}
        </ResponsiveText>
        <ResponsiveView style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <MaterialIcons 
            name={statusIcon} 
            size={12} 
            color={statusColor} 
          />
          <ResponsiveText size="xs" color={statusColor} weight="semiBold">
            {displayStatus}
          </ResponsiveText>
        </ResponsiveView>
      </ResponsiveView>
      
      <ResponsiveView style={styles.compactFooter}>
        <ResponsiveText size="sm" color={colors.textSecondary}>
          {order.items.length} item{order.items.length !== 1 ? 's' : ''} • {orderTime}
        </ResponsiveText>
        <ResponsiveText size="md" color={colors.primary} weight="semiBold">
          ₱{(order.total_amount || 0).toFixed(2)}
        </ResponsiveText>
      </ResponsiveView>
    </TouchableOpacity>
  );

  const renderDetailed = () => (
    <TouchableOpacity 
      style={[styles.orderCard, styles.detailedCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <ResponsiveView style={styles.detailedHeader}>
        <Image source={{ uri: orderImage }} style={styles.orderImage} />
        <ResponsiveView style={styles.detailedInfo}>
          <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
            {displayOrderNumber}
          </ResponsiveText>
          <ResponsiveView style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <MaterialIcons 
              name={statusIcon} 
              size={14} 
              color={statusColor} 
            />
            <ResponsiveText size="sm" color={statusColor} weight="semiBold">
              {displayStatus}
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveText size="sm" color={colors.textSecondary} numberOfLines={2}>
            {productName}
          </ResponsiveText>
        </ResponsiveView>
        <MaterialIcons name="keyboard-arrow-right" size={24} color={colors.textSecondary} />
      </ResponsiveView>

      {showCustomerInfo && (
        <ResponsiveView style={styles.customerInfo}>
          <MaterialIcons name="person" size={16} color={colors.textSecondary} />
          <ResponsiveText size="sm" color={colors.textSecondary}>
            {(order as any).customer?.full_name || order.user?.full_name || 'Unknown Customer'}
          </ResponsiveText>
        </ResponsiveView>
      )}

      {showDeliveryInfo && (
        <ResponsiveView style={styles.deliveryInfo}>
          <MaterialIcons name="location-on" size={16} color={colors.textSecondary} />
          <ResponsiveText size="sm" color={colors.textSecondary} numberOfLines={2}>
            {order.delivery_address?.full_address || 'No address provided'}
          </ResponsiveText>
        </ResponsiveView>
      )}

      <ResponsiveView style={styles.orderItems}>
        {order.items?.slice(0, 3).map((orderItem, index: number) => {
          const customizationDisplay = getCompactCustomizationDisplay(orderItem);
          return (
            <ResponsiveView key={index} style={styles.orderItem}>
              <ResponsiveView style={styles.orderItemLeft}>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  {orderItem.quantity}x {orderItem.product_name}
                  {customizationDisplay && ` • ${customizationDisplay}`}
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          );
        }) || (
          <ResponsiveText size="sm" color={colors.textSecondary}>
            No items found
          </ResponsiveText>
        )}
        
        {order.items && order.items.length > 3 && (
          <ResponsiveText size="sm" color={colors.textSecondary}>
            +{order.items.length - 3} more items
          </ResponsiveText>
        )}
      </ResponsiveView>

      <ResponsiveView style={styles.orderFooter}>
        <ResponsiveView style={styles.timeInfo}>
          <MaterialIcons name="access-time" size={16} color={colors.textSecondary} />
          {order.status === 'delivered' && deliveredTime ? (
            <ResponsiveText size="sm" color={colors.textSecondary}>
              Delivered at • {deliveredTime}
            </ResponsiveText>
          ) : (
            <ResponsiveText size="sm" color={colors.textSecondary}>
              Placed at • {orderTime}
            </ResponsiveText>
          )}
        </ResponsiveView>
        <ResponsiveView style={styles.totalContainer}>
          <ResponsiveText size="sm" color={colors.textSecondary}>Total:</ResponsiveText>
          <ResponsiveText size="lg" color={colors.primary} weight="semiBold">
            ₱{(order.total_amount || 0).toFixed(2)}
          </ResponsiveText>
        </ResponsiveView>
      </ResponsiveView>

      {showActionButton && actionButtonTitle && onActionPress && (
        <ResponsiveView style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { 
                backgroundColor: colors.primary,
                opacity: actionButtonDisabled ? 0.5 : 1
              }
            ]}
            onPress={onActionPress}
            disabled={actionButtonDisabled || actionButtonLoading}
          >
            {actionButtonLoading ? (
              <ResponsiveText size="sm" color={colors.background}>
                Loading...
              </ResponsiveText>
            ) : (
              <ResponsiveText size="sm" color={colors.background} weight="semiBold">
                {actionButtonTitle}
              </ResponsiveText>
            )}
          </TouchableOpacity>
        </ResponsiveView>
      )}
    </TouchableOpacity>
  );

  const renderDefault = () => (
    <TouchableOpacity 
      style={[styles.orderCard, styles.defaultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        console.log('OrderCard onPress called for order:', order.id);
        if (onPress) onPress();
      }}
    >
      <ResponsiveView style={styles.orderHeader}>
        <ResponsiveView style={styles.restaurantInfo}>
          <Image 
            source={{ uri: orderImage }} 
            style={[
              styles.restaurantImage,
              isTablet && styles.restaurantImageTablet,
              isSmallDevice && styles.restaurantImageMobile
            ]} 
          />
          <ResponsiveView style={styles.orderInfo}>
            <ResponsiveText 
              size={isTablet ? "md" : "sm"} 
              color={colors.textTertiary} 
              weight="medium"
            >
              Order #{order.order_number || order.id}
            </ResponsiveText>
            <ResponsiveText 
              size={isTablet ? "lg" : "md"} 
              weight="semiBold" 
              color={colors.text}
              numberOfLines={2}
            >
              {productName}
            </ResponsiveText>
            <ResponsiveView style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <MaterialIcons 
                name={statusIcon} 
                size={14} 
                color={statusColor} 
              />
              <ResponsiveText size="xs" color={statusColor} weight="semiBold">
                {displayStatus}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
        </ResponsiveView>
        <MaterialIcons name="keyboard-arrow-right" size={24} color={colors.textSecondary} />
      </ResponsiveView>

      <ResponsiveView style={styles.orderItems}>
        {order.items?.slice(0, 3).map((orderItem, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.orderItem}
            onPress={() => {
              if (onProductPress) {
                onProductPress(orderItem.product_id);
              }
            }}
            activeOpacity={0.7}
          >
            <ResponsiveView style={styles.orderItemLeft}>
              <ResponsiveText size="sm" color={colors.textSecondary} numberOfLines={1}>
                {orderItem.quantity}x {orderItem.product_name}
                {(() => {
                  const customizationDisplay = getCompactCustomizationDisplay(orderItem);
                  return customizationDisplay && ` • ${customizationDisplay}`;
                })()}
              </ResponsiveText>
              {orderItem.special_instructions && (
                <ResponsiveText size="xs" color={colors.textTertiary} numberOfLines={1}>
                  Note: {orderItem.special_instructions}
                </ResponsiveText>
              )}
            </ResponsiveView>
          </TouchableOpacity>
        )) || (
          <ResponsiveText size="sm" color={colors.textSecondary}>
            No items found
          </ResponsiveText>
        )}
        {order.items && order.items.length > 3 && (
          <ResponsiveText size="sm" color={colors.textSecondary} style={styles.moreItems}>
            +{order.items.length - 3} more items
          </ResponsiveText>
        )}
      </ResponsiveView>

      <ResponsiveView style={styles.orderFooter}>
        <ResponsiveView style={styles.timeInfo}>
          <MaterialIcons name="access-time" size={16} color={colors.textSecondary} />
          {order.status === 'delivered' && deliveredTime ? (
            <ResponsiveText size="sm" color={colors.textSecondary}>
              Delivered at • {deliveredTime}
            </ResponsiveText>
          ) : (
            <ResponsiveText size="sm" color={colors.textSecondary}>
              Placed at • {orderTime}
            </ResponsiveText>
          )}
        </ResponsiveView>
        <ResponsiveView style={styles.totalContainer}>
          <ResponsiveText size="sm" color={colors.textSecondary}>Total:</ResponsiveText>
          <ResponsiveText size="md" color={colors.primary} weight="semiBold">
            ₱{(order.total_amount || 0).toFixed(2)}
          </ResponsiveText>
        </ResponsiveView>
      </ResponsiveView>
    </TouchableOpacity>
  );

  switch (variant) {
    case 'compact':
      return renderCompact();
    case 'detailed':
      return renderDetailed();
    default:
      return renderDefault();
  }
};

const styles = StyleSheet.create({
  orderCard: {
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
    ...Layout.shadows.sm,
  },
  compactCard: {
    padding: Layout.spacing.sm,
  },
  detailedCard: {
    padding: Layout.spacing.lg,
  },
  defaultCard: {
    padding: Layout.spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  restaurantImage: {
    width: 40,
    height: 40,
    borderRadius: Layout.borderRadius.sm,
    marginRight: Layout.spacing.sm,
  },
  restaurantImageTablet: {
    width: 60,
    height: 60,
  },
  restaurantImageMobile: {
    width: 35,
    height: 35,
  },
  orderImage: {
    width: 50,
    height: 50,
    borderRadius: Layout.borderRadius.sm,
    marginRight: Layout.spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Layout.spacing.xs,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.sm,
    marginTop: Layout.spacing.xs,
  },
  orderItems: {
    marginBottom: Layout.spacing.sm,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
    paddingVertical: Layout.spacing.xs,
  },
  orderItemLeft: {
    flex: 1,
    marginRight: Layout.spacing.sm,
  },
  orderItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  moreItems: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: Layout.spacing.xs,
  },
  orderInfo: {
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  // Compact variant styles
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Detailed variant styles
  detailedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  detailedInfo: {
    flex: 1,
    marginLeft: Layout.spacing.sm,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.sm,
  },
  actionContainer: {
    marginTop: Layout.spacing.sm,
    paddingTop: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.sm,
    alignItems: 'center',
  },
});
