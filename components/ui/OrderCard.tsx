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
const formatOrderStatus = (status: OrderStatus, isSmallDevice: boolean = false): string => {
  const statusMap: Record<OrderStatus, string> = {
    'pending': 'Pending',
    'confirmed': 'Preparing',
    'preparing': 'Preparing',
    'ready_for_pickup': isSmallDevice ? 'Ready' : 'Ready for Pickup',
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
  const { isTablet, isSmallDevice, isLargeDevice } = useResponsive();
  
  const displayStatus = formatOrderStatus(order.status, isSmallDevice);
  const statusColor = getStatusColor(order.status, colors);
  const statusIcon = getStatusIcon(order.status);
  const orderTime = formatOrderDate(order.created_at);
  const deliveredTime = (order as any).actual_delivery_time
    ? formatOrderDate((order as any).actual_delivery_time)
    : null;
  const displayOrderNumber = (order as any).order_number || (order.id ? order.id.slice(-8) : '');
  
  // Get the first item's image or use a default
  // Priority: product.image_url > product_image (from customization) > placeholder
  const firstItem = order.items?.[0];
  const orderImage = firstItem?.product?.image_url 
    || firstItem?.product_image 
    || (firstItem as any)?.customization_details?.product_image
    || 'https://via.placeholder.com/200x150';
  
  // Get product name from the first item or use a default
  // Priority: product.name > product_name > customization_details.product_name > 'Product'
  const productName = firstItem?.product?.name 
    || firstItem?.product_name 
    || (firstItem as any)?.customization_details?.product_name
    || 'Product';

  const renderCompact = () => (
    <TouchableOpacity 
      style={[styles.orderCard, styles.compactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <ResponsiveView style={styles.compactHeader}>
        <ResponsiveView style={styles.compactHeaderLeft}>
          <ResponsiveText size="md" weight="semiBold" color={colors.text}>
            {displayOrderNumber} • {productName}
          </ResponsiveText>
        </ResponsiveView>
        <ResponsiveView style={[
          styles.statusBadge,
          isSmallDevice && styles.statusBadgeSmall,
          { backgroundColor: `${statusColor}20` }
        ]}>
          <MaterialIcons 
            name={statusIcon} 
            size={isSmallDevice ? 10 : 12} 
            color={statusColor} 
          />
          <ResponsiveText 
            size="xs" 
            color={statusColor} 
            weight="semiBold"
            numberOfLines={1}
            style={styles.statusText}
          >
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

  const shouldStackFooter = !isLargeDevice;

  const renderDetailed = () => (
    <TouchableOpacity 
      style={[styles.orderCard, styles.detailedCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <ResponsiveView style={[
        styles.detailedHeader,
        isSmallDevice && styles.detailedHeaderStacked
      ]}>
        <Image 
          source={{ uri: orderImage }} 
          style={styles.orderImage}
          resizeMode="cover"
        />
        <ResponsiveView style={styles.detailedInfo}>
          <ResponsiveText 
            size="lg" 
            weight="semiBold" 
            color={colors.text} 
            numberOfLines={2}
            ellipsizeMode="tail"
            style={styles.orderTitle}
          >
            {displayOrderNumber} • {productName}
          </ResponsiveText>
          <ResponsiveView style={[
            styles.statusBadge,
            isSmallDevice && styles.statusBadgeSmall,
            { backgroundColor: `${statusColor}20` }
          ]}>
            <MaterialIcons 
              name={statusIcon} 
              size={isSmallDevice ? 12 : 14} 
              color={statusColor} 
            />
            <ResponsiveText 
              size={isSmallDevice ? "xs" : "sm"} 
              color={statusColor} 
              weight="semiBold"
              numberOfLines={1}
              style={styles.statusText}
            >
              {displayStatus}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
        <MaterialIcons name="keyboard-arrow-right" size={24} color={colors.textSecondary} />
      </ResponsiveView>

      {showCustomerInfo && (
        <ResponsiveView style={styles.customerInfo}>
          <MaterialIcons name="person" size={16} color={colors.textSecondary} />
          <ResponsiveText 
            size="sm" 
            color={colors.textSecondary}
            numberOfLines={2}
            ellipsizeMode="tail"
            style={styles.customerText}
          >
            {(order as any).customer?.full_name || order.user?.full_name || 'Unknown Customer'}
          </ResponsiveText>
        </ResponsiveView>
      )}

      {/* Fulfillment Type Badge */}
      {(order as any).fulfillment_type && (
        <ResponsiveView style={[
          styles.fulfillmentBadge,
          {
            backgroundColor: (order as any).fulfillment_type === 'pickup' 
              ? colors.primary + '20' 
              : colors.secondary + '20',
            borderColor: (order as any).fulfillment_type === 'pickup'
              ? colors.primary
              : colors.secondary,
          }
        ]}>
          <MaterialIcons
            name={(order as any).fulfillment_type === 'pickup' ? 'store' : 'local-shipping'}
            size={14}
            color={(order as any).fulfillment_type === 'pickup' ? colors.primary : colors.secondary}
          />
          <ResponsiveText
            size="xs"
            weight="semiBold"
            color={(order as any).fulfillment_type === 'pickup' ? colors.primary : colors.secondary}
            style={styles.fulfillmentBadgeText}
          >
            {(order as any).fulfillment_type === 'pickup' ? 'To Be Picked Up' : 'For Delivery'}
          </ResponsiveText>
        </ResponsiveView>
      )}

      {showDeliveryInfo && (
        <ResponsiveView style={styles.deliveryInfo}>
          <MaterialIcons name="location-on" size={16} color={colors.textSecondary} />
          <ResponsiveText 
            size="sm" 
            color={colors.textSecondary} 
            numberOfLines={3}
            ellipsizeMode="tail"
            style={styles.deliveryText}
          >
            {(order as any).fulfillment_type === 'pickup' 
              ? ((order as any).pickup_location_snapshot || 'Kitchen One - Main Branch')
              : (order.delivery_address?.full_address || 'No address provided')
            }
          </ResponsiveText>
        </ResponsiveView>
      )}

      <ResponsiveView style={styles.orderItems}>
        {order.items?.slice(0, 3).map((orderItem, index: number) => {
          const customizationDisplay = getCompactCustomizationDisplay(orderItem);
          return (
            <ResponsiveView key={index} style={styles.orderItem}>
              <ResponsiveView style={styles.orderItemLeft}>
                <ResponsiveText 
                  size="sm" 
                  color={colors.textSecondary}
                  style={styles.orderItemText}
                >
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

      <ResponsiveView style={[
        styles.orderFooter,
        shouldStackFooter && styles.orderFooterStacked
      ]}>
        <ResponsiveView style={[
          styles.timeInfo,
          shouldStackFooter && styles.timeInfoStacked
        ]}>
          <MaterialIcons name="access-time" size={16} color={colors.textSecondary} />
          {order.status === 'delivered' && deliveredTime ? (
            <ResponsiveText 
              size="sm" 
              color={colors.textSecondary}
              style={styles.timeText}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              Delivered at • {deliveredTime}
            </ResponsiveText>
          ) : (
            <ResponsiveText 
              size="sm" 
              color={colors.textSecondary}
              style={styles.timeText}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              Placed at • {orderTime}
            </ResponsiveText>
          )}
        </ResponsiveView>
        <ResponsiveView style={[
          styles.totalContainer,
          shouldStackFooter && styles.totalContainerStacked
        ]}>
          <ResponsiveText size="sm" color={colors.textSecondary} style={styles.totalLabel}>Total:</ResponsiveText>
          <ResponsiveText 
            size="lg" 
            color={colors.primary} 
            weight="semiBold"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            style={styles.totalAmountText}
          >
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
              <ResponsiveText 
                size="sm" 
                color={colors.background} 
                weight="semiBold"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.actionButtonText}
              >
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
            resizeMode="cover"
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
                ellipsizeMode="tail"
                style={styles.orderTitle}
            >
              {productName}
            </ResponsiveText>
            <ResponsiveView style={[
              styles.statusBadge,
              isSmallDevice && styles.statusBadgeSmall,
              { backgroundColor: `${statusColor}20` }
            ]}>
              <MaterialIcons 
                name={statusIcon} 
                size={isSmallDevice ? 12 : 14} 
                color={statusColor} 
              />
              <ResponsiveText 
                size="xs" 
                color={statusColor} 
                weight="semiBold"
                numberOfLines={1}
                style={styles.statusText}
              >
                {displayStatus}
              </ResponsiveText>
            </ResponsiveView>
            {/* Fulfillment Type Badge */}
            {(order as any).fulfillment_type && (
              <ResponsiveView style={[
                styles.fulfillmentBadge,
                styles.fulfillmentBadgeInline,
                {
                  backgroundColor: (order as any).fulfillment_type === 'pickup' 
                    ? colors.primary + '20' 
                    : colors.secondary + '20',
                  borderColor: (order as any).fulfillment_type === 'pickup'
                    ? colors.primary
                    : colors.secondary,
                }
              ]}>
                <MaterialIcons
                  name={(order as any).fulfillment_type === 'pickup' ? 'store' : 'local-shipping'}
                  size={12}
                  color={(order as any).fulfillment_type === 'pickup' ? colors.primary : colors.secondary}
                />
                <ResponsiveText
                  size="xs"
                  weight="semiBold"
                  color={(order as any).fulfillment_type === 'pickup' ? colors.primary : colors.secondary}
                  style={styles.fulfillmentBadgeText}
                >
                  {(order as any).fulfillment_type === 'pickup' ? 'Pickup' : 'Delivery'}
                </ResponsiveText>
              </ResponsiveView>
            )}
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
              <ResponsiveText 
                size="sm" 
                color={colors.textSecondary} 
                numberOfLines={1}
                style={styles.orderItemText}
              >
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

      <ResponsiveView style={[
        styles.orderFooter,
        shouldStackFooter && styles.orderFooterStacked
      ]}>
        <ResponsiveView style={[
          styles.timeInfo,
          shouldStackFooter && styles.timeInfoStacked
        ]}>
          <MaterialIcons name="access-time" size={16} color={colors.textSecondary} />
          {order.status === 'delivered' && deliveredTime ? (
            <ResponsiveText 
              size="sm" 
              color={colors.textSecondary}
              style={styles.timeText}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              Delivered at • {deliveredTime}
            </ResponsiveText>
          ) : (
            <ResponsiveText 
              size="sm" 
              color={colors.textSecondary}
              style={styles.timeText}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              Placed at • {orderTime}
            </ResponsiveText>
          )}
        </ResponsiveView>
        <ResponsiveView style={[
          styles.totalContainer,
          shouldStackFooter && styles.totalContainerStacked
        ]}>
          <ResponsiveText size="sm" color={colors.textSecondary} style={styles.totalLabel}>Total:</ResponsiveText>
          <ResponsiveText 
            size="md" 
            color={colors.primary} 
            weight="semiBold"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            style={styles.totalAmountText}
          >
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
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 4,
    borderRadius: Layout.borderRadius.sm,
    marginTop: Layout.spacing.xs,
    maxWidth: '100%',
    flexShrink: 1,
    minWidth: 0,
  },
  statusBadgeSmall: {
    paddingHorizontal: Layout.spacing.xs,
    paddingVertical: 3,
  },
  statusText: {
    flexShrink: 1,
    marginLeft: 4,
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
    minWidth: 0,
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
    flexWrap: 'wrap',
  },
  orderFooterStacked: {
    alignItems: 'flex-start',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    minWidth: 0,
    marginRight: Layout.spacing.sm,
  },
  timeInfoStacked: {
    marginRight: 0,
    marginBottom: Layout.spacing.xs,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalContainerStacked: {
    alignSelf: 'flex-start',
  },
  // Compact variant styles
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  compactHeaderLeft: {
    flex: 1,
    marginRight: Layout.spacing.sm,
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
  detailedHeaderStacked: {
    alignItems: 'flex-start',
  },
  detailedInfo: {
    flex: 1,
    marginLeft: Layout.spacing.sm,
    minWidth: 0,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
    flexWrap: 'wrap',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.sm,
    flexWrap: 'wrap',
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
  fulfillmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 4,
    borderRadius: Layout.borderRadius.sm,
    marginTop: Layout.spacing.xs,
    borderWidth: 1,
  },
  fulfillmentBadgeInline: {
    marginTop: Layout.spacing.xs,
    marginLeft: Layout.spacing.xs,
  },
  fulfillmentBadgeText: {
    marginLeft: 4,
  },
  orderTitle: {
    flexShrink: 1,
    minWidth: 0,
  },
  customerText: {
    marginLeft: Layout.spacing.xs,
    flexShrink: 1,
    minWidth: 0,
  },
  deliveryText: {
    flex: 1,
    marginLeft: Layout.spacing.xs,
    minWidth: 0,
  },
  orderItemText: {
    flexShrink: 1,
    minWidth: 0,
  },
  timeText: {
    flexShrink: 1,
    minWidth: 0,
  },
  totalLabel: {
    marginRight: Layout.spacing.xs,
  },
  totalAmountText: {
    maxWidth: '100%',
  },
  actionButtonText: {
    maxWidth: '100%',
  },
});
