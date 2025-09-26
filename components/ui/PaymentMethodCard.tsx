import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Layout from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import { ResponsiveText } from './ResponsiveText';
import { ResponsiveView } from './ResponsiveView';

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  isAvailable?: boolean;
  processingFee?: number;
}

interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected?: boolean;
  onSelect: (method: PaymentMethod) => void;
  disabled?: boolean;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  selected = false,
  onSelect,
  disabled = false,
}) => {
  const { colors } = useTheme();

  const handlePress = () => {
    if (!disabled && method.isAvailable !== false) {
      onSelect(method);
    }
  };

  const isDisabled = disabled || method.isAvailable === false;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: selected ? colors.primary : colors.border,
          borderWidth: selected ? 2 : 1,
          opacity: isDisabled ? 0.6 : 1,
        },
      ]}
      onPress={handlePress}
      activeOpacity={isDisabled ? 1 : 0.7}
      disabled={isDisabled}
    >
      <ResponsiveView style={styles.content}>
        <ResponsiveView style={styles.header}>
          <ResponsiveView style={styles.iconContainer}>
            <MaterialIcons 
              name={method.icon as any} 
              size={24} 
              color={isDisabled ? colors.textSecondary : colors.primary} 
            />
          </ResponsiveView>
          
          <ResponsiveView style={styles.textContainer}>
            <ResponsiveText 
              size="md" 
              weight="semiBold" 
              color={isDisabled ? colors.textSecondary : colors.text}
            >
              {method.name}
              {isDisabled && ' (Unavailable)'}
            </ResponsiveText>
            <ResponsiveText 
              size="sm" 
              color={isDisabled ? colors.textSecondary : colors.textSecondary}
            >
              {method.description}
            </ResponsiveText>
            {method.processingFee && method.processingFee > 0 && (
              <ResponsiveText size="xs" color={colors.textSecondary} style={styles.feeText}>
                Processing fee: ₱{method.processingFee.toFixed(2)}
              </ResponsiveText>
            )}
          </ResponsiveView>

          <MaterialIcons
            name={selected ? "radio-button-checked" : "radio-button-unchecked"}
            size={24}
            color={selected ? colors.primary : colors.textSecondary}
          />
        </ResponsiveView>

        {method.isAvailable === false && (
          <ResponsiveView style={[styles.unavailableBanner, { backgroundColor: colors.error + '10' }]}>
            <MaterialIcons name="info" size={16} color={colors.error} />
            <ResponsiveText size="xs" color={colors.error} style={styles.unavailableText}>
              This payment method is currently unavailable
            </ResponsiveText>
          </ResponsiveView>
        )}
      </ResponsiveView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  content: {
    padding: Layout.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: Layout.spacing.md,
  },
  textContainer: {
    flex: 1,
    marginRight: Layout.spacing.sm,
  },
  feeText: {
    marginTop: Layout.spacing.xs,
    fontStyle: 'italic',
  },
  unavailableBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  unavailableText: {
    marginLeft: Layout.spacing.xs,
    flex: 1,
  },
});
