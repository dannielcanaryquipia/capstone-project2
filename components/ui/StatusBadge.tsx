import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet } from 'react-native';
import Layout from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import { OrderStatus } from '../../types/order.types';
import { ResponsiveText } from './ResponsiveText';
import { ResponsiveView } from './ResponsiveView';

interface StatusBadgeProps {
  status: OrderStatus | string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outline' | 'filled';
  showIcon?: boolean;
  customColor?: string;
  customIcon?: string;
}

// Helper function to get status color
const getStatusColor = (status: OrderStatus | string, colors: any): string => {
  const colorMap: Record<string, string> = {
    'pending': colors.warning,
    'confirmed': colors.warning,
    'preparing': colors.warning,
    'ready_for_pickup': colors.warning,
    'out_for_delivery': colors.info,
    'delivered': colors.success,
    'cancelled': colors.error,
    'active': colors.success,
    'inactive': colors.textSecondary,
    'processing': colors.primary,
    'completed': colors.success,
    'failed': colors.error,
  };
  return colorMap[status] || colors.textSecondary;
};

// Helper function to get status icon
const getStatusIcon = (status: OrderStatus | string): keyof typeof MaterialIcons.glyphMap => {
  const iconMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
    'pending': 'schedule',
    'confirmed': 'check-circle-outline',
    'preparing': 'restaurant',
    'ready_for_pickup': 'local-shipping',
    'out_for_delivery': 'delivery-dining',
    'delivered': 'check-circle',
    'cancelled': 'cancel',
    'active': 'check-circle',
    'inactive': 'pause-circle',
    'processing': 'hourglass-empty',
    'completed': 'done',
    'failed': 'error',
  };
  return iconMap[status] || 'help-outline';
};

// Helper function to format status text
const formatStatusText = (status: OrderStatus | string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'preparing': 'Preparing',
    'ready_for_pickup': 'Ready for Pickup',
    'out_for_delivery': 'On the Way',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'active': 'Active',
    'inactive': 'Inactive',
    'processing': 'Processing',
    'completed': 'Completed',
    'failed': 'Failed',
  };
  return statusMap[status] || status.toString().replace('_', ' ').toUpperCase();
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'medium',
  variant = 'default',
  showIcon = true,
  customColor,
  customIcon,
}) => {
  const { colors } = useTheme();
  
  const statusColor = customColor || getStatusColor(status, colors);
  const statusIcon = customIcon || getStatusIcon(status);
  const statusText = formatStatusText(status);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: Layout.spacing.xs,
          paddingVertical: 2,
          borderRadius: Layout.borderRadius.sm,
          iconSize: 12,
          textSize: 'xs' as const,
        };
      case 'large':
        return {
          paddingHorizontal: Layout.spacing.md,
          paddingVertical: Layout.spacing.sm,
          borderRadius: Layout.borderRadius.md,
          iconSize: 18,
          textSize: 'md' as const,
        };
      default: // medium
        return {
          paddingHorizontal: Layout.spacing.sm,
          paddingVertical: Layout.spacing.xs,
          borderRadius: Layout.borderRadius.sm,
          iconSize: 14,
          textSize: 'sm' as const,
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: statusColor,
          textColor: statusColor,
        };
      case 'filled':
        return {
          backgroundColor: statusColor,
          borderWidth: 0,
          textColor: colors.background,
        };
      default: // default
        return {
          backgroundColor: `${statusColor}20`,
          borderWidth: 0,
          textColor: statusColor,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  return (
    <ResponsiveView
      style={[
        styles.badge,
        {
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          borderRadius: sizeStyles.borderRadius,
          backgroundColor: variantStyles.backgroundColor,
          borderWidth: variantStyles.borderWidth,
          borderColor: variantStyles.borderColor,
        },
      ]}
    >
      {showIcon && (
        <MaterialIcons
          name={statusIcon as any}
          size={sizeStyles.iconSize}
          color={variantStyles.textColor}
          style={styles.icon}
        />
      )}
      <ResponsiveText
        size={sizeStyles.textSize}
        color={variantStyles.textColor}
        weight="semiBold"
      >
        {statusText}
      </ResponsiveText>
    </ResponsiveView>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: Layout.spacing.xs,
  },
});
