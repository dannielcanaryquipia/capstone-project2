import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ResponsiveText } from './ResponsiveText';
import { ResponsiveView } from './ResponsiveView';
import Layout from '../../constants/Layout';

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  pizza_size?: string;
  pizza_crust?: string;
  toppings?: string[];
}

export interface OrderSummary {
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  currency?: string;
}

interface OrderSummaryCardProps {
  summary: OrderSummary;
  showImages?: boolean;
  compact?: boolean;
  onItemPress?: (item: OrderItem) => void;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  summary,
  showImages = true,
  compact = false,
  onItemPress,
}) => {
  const { colors } = useTheme();
  const currency = summary.currency || '₱';

  const renderOrderItem = (item: OrderItem, index: number) => (
    <ResponsiveView key={item.id} style={[styles.orderItem, compact && styles.compactItem]}>
      {showImages && (
        <Image
          source={{ uri: item.product_image || 'https://via.placeholder.com/60x60' }}
          style={styles.itemImage}
          defaultSource={{ uri: 'https://via.placeholder.com/60x60' }}
        />
      )}
      
      <ResponsiveView style={styles.itemInfo}>
        <ResponsiveText 
          size={compact ? "sm" : "md"} 
          color={colors.text} 
          weight="medium"
          numberOfLines={2}
        >
          {item.quantity}x {item.product_name}
        </ResponsiveText>
        
        {item.special_instructions && (
          <ResponsiveText size="xs" color={colors.textSecondary} style={styles.itemNote}>
            Note: {item.special_instructions}
          </ResponsiveText>
        )}
        
        {item.pizza_size && (
          <ResponsiveText size="xs" color={colors.textSecondary}>
            Size: {item.pizza_size}
          </ResponsiveText>
        )}
        
        {item.pizza_crust && (
          <ResponsiveText size="xs" color={colors.textSecondary}>
            Crust: {item.pizza_crust}
          </ResponsiveText>
        )}
        
        {item.toppings && item.toppings.length > 0 && (
          <ResponsiveText size="xs" color={colors.textSecondary} numberOfLines={1}>
            Toppings: {item.toppings.join(', ')}
          </ResponsiveText>
        )}
      </ResponsiveView>
      
      <ResponsiveText 
        size={compact ? "sm" : "md"} 
        color={colors.primary} 
        weight="semiBold"
        style={styles.itemPrice}
      >
        {currency}{item.total_price.toFixed(2)}
      </ResponsiveText>
    </ResponsiveView>
  );

  const renderSummaryRow = (label: string, amount: number, isTotal = false) => (
    <ResponsiveView style={[styles.summaryRow, isTotal && styles.totalRow]}>
      <ResponsiveText 
        size={isTotal ? "lg" : "md"} 
        color={isTotal ? colors.text : colors.textSecondary}
        weight={isTotal ? "semiBold" : "regular"}
      >
        {label}
      </ResponsiveText>
      <ResponsiveText 
        size={isTotal ? "lg" : "md"} 
        color={isTotal ? colors.primary : colors.text}
        weight={isTotal ? "bold" : "medium"}
      >
        {currency}{amount.toFixed(2)}
      </ResponsiveText>
    </ResponsiveView>
  );

  return (
    <ResponsiveView style={[styles.container, { backgroundColor: colors.card }]}>
      <ResponsiveView style={styles.header}>
        <MaterialIcons name="receipt" size={20} color={colors.primary} />
        <ResponsiveText size="lg" weight="semiBold" color={colors.text} style={styles.title}>
          Order Summary
        </ResponsiveText>
      </ResponsiveView>

      <ResponsiveView style={styles.itemsContainer}>
        {summary.items.map(renderOrderItem)}
      </ResponsiveView>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <ResponsiveView style={styles.summaryContainer}>
        {renderSummaryRow('Subtotal', summary.subtotal)}
        {renderSummaryRow('Delivery Fee', summary.deliveryFee)}
        {renderSummaryRow('Tax (12%)', summary.tax)}
        {renderSummaryRow('Total', summary.total, true)}
      </ResponsiveView>
    </ResponsiveView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Layout.borderRadius.md,
    marginHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingTop: Layout.spacing.md,
    paddingBottom: Layout.spacing.sm,
  },
  title: {
    marginLeft: Layout.spacing.sm,
  },
  itemsContainer: {
    paddingHorizontal: Layout.spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  compactItem: {
    paddingVertical: Layout.spacing.xs,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: Layout.borderRadius.sm,
    marginRight: Layout.spacing.sm,
  },
  itemInfo: {
    flex: 1,
    marginRight: Layout.spacing.sm,
  },
  itemNote: {
    marginTop: Layout.spacing.xs,
    fontStyle: 'italic',
  },
  itemPrice: {
    textAlign: 'right',
    minWidth: 80,
  },
  divider: {
    height: 1,
    marginVertical: Layout.spacing.md,
  },
  summaryContainer: {
    paddingHorizontal: Layout.spacing.md,
    paddingBottom: Layout.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  totalRow: {
    marginTop: Layout.spacing.sm,
    paddingTop: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});
