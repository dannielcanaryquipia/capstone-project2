import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Layout from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import { getDetailedCustomizationDisplay } from '../../utils/customizationDisplay';
import { ResponsiveText } from './ResponsiveText';
import { ResponsiveView } from './ResponsiveView';

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
  processingFee?: number;
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
        <TouchableOpacity
          onPress={() => onItemPress?.(item)}
          style={styles.imageContainer}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: item.product_image || 'https://via.placeholder.com/60x60' }}
            style={styles.itemImage}
            defaultSource={{ uri: 'https://via.placeholder.com/60x60' }}
          />
        </TouchableOpacity>
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
        
        {/* Refined Customization Display */}
        {(() => {
          const customizationDisplay = getDetailedCustomizationDisplay(item);
          return customizationDisplay && customizationDisplay.map((detail: any, index: number) => (
            <ResponsiveText 
              key={index}
              size="xs" 
              color={colors.textSecondary} 
              style={detail.type === 'instructions' ? styles.itemNote : {}}
              numberOfLines={detail.type === 'toppings' ? 1 : undefined}
            >
              {detail.label}: {detail.value}
            </ResponsiveText>
          ));
        })()}
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
        {summary.deliveryFee > 0 ? renderSummaryRow('Delivery Fee', summary.deliveryFee) : null}
        {summary.tax > 0 ? renderSummaryRow('Tax', summary.tax) : null}
        {summary.processingFee && summary.processingFee > 0 ? renderSummaryRow('Processing Fee', summary.processingFee) : null}
        {renderSummaryRow('Total', summary.total, true)}
      </ResponsiveView>
    </ResponsiveView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
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
    paddingBottom: Layout.spacing.sm,
  },
  title: {
    marginLeft: Layout.spacing.sm,
  },
  itemsContainer: {
    // Remove horizontal padding since container now has padding
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
  imageContainer: {
    marginRight: Layout.spacing.sm,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: Layout.borderRadius.sm,
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
    paddingTop: Layout.spacing.sm,
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
