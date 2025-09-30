import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Layout from '../../constants/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import { ResponsiveText } from './ResponsiveText';
import { ResponsiveView } from './ResponsiveView';

export interface Address {
  id: string;
  label: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
}

interface AddressCardProps {
  address: Address;
  selected?: boolean;
  onSelect: (address: Address) => void;
  onEdit?: (address: Address) => void;
  showEditButton?: boolean;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  selected = false,
  onSelect,
  onEdit,
  showEditButton = false,
}) => {
  const { colors } = useTheme();

  const handlePress = () => {
    onSelect(address);
  };

  const handleEdit = (e: any) => {
    e.stopPropagation();
    onEdit?.(address);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: selected ? colors.primary : colors.border,
          borderWidth: selected ? 2 : 1,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <ResponsiveView style={styles.content}>
        <ResponsiveView style={styles.header}>
          <ResponsiveView style={styles.titleContainer}>
            <ResponsiveText size="md" weight="semiBold" color={colors.text}>
              {address.label}
            </ResponsiveText>
            {address.is_default && (
              <ResponsiveView style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                <ResponsiveText size="xs" color={colors.background} weight="semiBold">
                  DEFAULT
                </ResponsiveText>
              </ResponsiveView>
            )}
          </ResponsiveView>
          
          <ResponsiveView style={styles.actions}>
            {showEditButton && (
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: colors.surfaceVariant }]}
                onPress={handleEdit}
              >
                <MaterialIcons name="edit" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            <MaterialIcons
              name={selected ? "radio-button-checked" : "radio-button-unchecked"}
              size={24}
              color={selected ? colors.primary : colors.textSecondary}
            />
          </ResponsiveView>
        </ResponsiveView>

        <ResponsiveText size="sm" color={colors.textSecondary} style={styles.addressText}>
          {address.address_line_1}
          {address.address_line_2 && `, ${address.address_line_2}`}
        </ResponsiveText>
        {(!!address.city || !!address.state || !!address.postal_code) && (
          <ResponsiveText size="sm" color={colors.textSecondary} style={styles.addressText}>
            {address.city}{address.city && (address.state || address.postal_code) ? ', ' : ''}
            {address.state} {address.postal_code}
          </ResponsiveText>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.xs,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  defaultBadge: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    marginLeft: Layout.spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressText: {
    lineHeight: 20,
    marginBottom: Layout.spacing.xs,
  },
});
