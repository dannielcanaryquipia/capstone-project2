import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import ResponsiveText from '../../../components/ui/ResponsiveText';
import ResponsiveView from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  Address,
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress
} from '../../../hooks/useAddresses';
import global from '../../../styles/global';
import { useAlert } from '../../../components/ui/AlertProvider';

export default function AddressesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { addresses, isLoading, error, refresh } = useAddresses();
  const { deleteAddress, isLoading: isDeleting } = useDeleteAddress();
  const { setDefaultAddress, isLoading: isSettingDefault } = useSetDefaultAddress();
  const [refreshing, setRefreshing] = useState(false);
  const { show, success, error: showError } = useAlert();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };


  const handleEditAddress = (address: Address) => {
    router.push({
      pathname: '/(customer)/profile/address-form',
      params: { addressId: address.id }
    });
  };

  const handleDeleteAddress = (address: Address) => {
    show(
      'Delete Address',
      `Are you sure you want to delete "${address.label}"?`,
      [
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddress(address.id);
              success('Success', 'Address deleted successfully');
            } catch (error) {
              showError('Error', 'Failed to delete address. Please try again.');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSetDefault = async (address: Address) => {
    try {
      await setDefaultAddress(address.id);
      success('Success', 'Default address updated successfully');
    } catch (error) {
      showError('Error', 'Failed to set default address. Please try again.');
    }
  };

  const formatAddress = (address: Address) => {
    return address.full_address;
  };

  if (isLoading && !addresses.length) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <ResponsiveView style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="md" color={colors.textSecondary}>
              Loading addresses...
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <ResponsiveView style={styles.center} padding="lg">
          <MaterialIcons name="error-outline" size={64} color={colors.error} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.error} align="center">
              Failed to load addresses
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView marginTop="sm">
            <ResponsiveText size="md" color={colors.textSecondary} align="center">
              {error}
            </ResponsiveText>
          </ResponsiveView>
          <Button
            title="Try Again"
            onPress={refresh}
            variant="primary"
            size="medium"
            style={styles.retryButton}
          />
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <ResponsiveView padding="lg">
        {/* Header */}
        <ResponsiveView style={[styles.header, { backgroundColor: colors.surface }]}>
          <ResponsiveView style={styles.headerLeft}>
            <Button
              title=""
              onPress={() => router.back()}
              variant="text"
              icon={<MaterialIcons name="arrow-back" size={24} color={colors.text} />}
              style={styles.backButton}
            />
            <ResponsiveText size="xl" weight="bold" color={colors.text}>
              Manage Addresses
            </ResponsiveText>
          </ResponsiveView>
          <Button
            title="Add Address"
            onPress={() => router.push('/(customer)/profile/address-form')}
            variant="primary"
            size="medium"
          />
        </ResponsiveView>

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <ResponsiveView style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <ResponsiveView style={[styles.emptyIcon, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialIcons name="location-on" size={64} color={colors.primary} />
            </ResponsiveView>
            <ResponsiveView marginTop="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text} align="center">
                No addresses yet
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView marginTop="sm">
              <ResponsiveText size="md" color={colors.textSecondary} align="center">
                No addresses available
              </ResponsiveText>
            </ResponsiveView>
            {/* Removed inner Add Address button to avoid duplication with header action */}
          </ResponsiveView>
        ) : (
          <ResponsiveView style={styles.addressesList}>
            {addresses.map((address, index) => (
              <ResponsiveView 
                key={address.id} 
                style={[
                  styles.addressCard, 
                  { 
                    backgroundColor: colors.surface,
                    borderColor: address.is_default ? colors.primary : colors.border,
                    ...Layout.shadows.sm
                  }
                ]}
              >
                {/* Address Header */}
                <ResponsiveView style={styles.addressHeader}>
                  <ResponsiveView style={styles.addressTitleRow}>
                    <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                      {address.label}
                    </ResponsiveText>
                    {address.is_default && (
                      <ResponsiveView style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                        <ResponsiveText size="xs" weight="medium" color={colors.textInverse}>
                          DEFAULT
                        </ResponsiveText>
                      </ResponsiveView>
                    )}
                  </ResponsiveView>
                  <ResponsiveView style={styles.addressActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditAddress(address)}
                      disabled={isDeleting || isSettingDefault}
                    >
                      <MaterialIcons name="edit" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteAddress(address)}
                      disabled={isDeleting || isSettingDefault}
                    >
                      <MaterialIcons name="delete" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </ResponsiveView>
                </ResponsiveView>

                {/* Address Details */}
                <ResponsiveView style={styles.addressDetails}>
                  <ResponsiveView marginTop="xs">
                    <ResponsiveText size="md" color={colors.text}>
                      {formatAddress(address)}
                    </ResponsiveText>
                  </ResponsiveView>
                </ResponsiveView>

                {/* Set Default Button */}
                {!address.is_default && (
                  <ResponsiveView style={styles.setDefaultSection}>
                    <Button
                      title="Set as Default"
                      onPress={() => handleSetDefault(address)}
                      variant="outline"
                      size="small"
                      disabled={isSettingDefault}
                      style={styles.setDefaultButton}
                    />
                  </ResponsiveView>
                )}
              </ResponsiveView>
            ))}
          </ResponsiveView>
        )}
      </ResponsiveView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    ...Layout.shadows.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: Layout.spacing.sm,
    padding: Layout.spacing.sm,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.xxxl,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    ...Layout.shadows.sm,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  retryButton: {
    marginTop: Layout.spacing.md,
  },
  addressesList: {
    gap: Layout.spacing.md,
  },
  addressCard: {
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    borderWidth: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.sm,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  defaultBadge: {
    paddingHorizontal: Layout.spacing.xs,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.xs,
    marginLeft: Layout.spacing.sm,
  },
  addressActions: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  actionButton: {
    padding: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  addressDetails: {
    marginBottom: Layout.spacing.sm,
  },
  setDefaultSection: {
    marginTop: Layout.spacing.sm,
    paddingTop: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  setDefaultButton: {
    alignSelf: 'flex-start',
  },
});
