import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import { LoadingState } from '../../../components/ui/LoadingState';
import { OrderCard } from '../../../components/ui/OrderCard';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing } from '../../../constants/Responsive';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { useDeliveryOrders } from '../../../hooks/useDeliveryOrders';
import { OrderService } from '../../../services/order.service';
import global from '../../../styles/global';
import { Order } from '../../../types/order.types';

export default function OrdersScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Use hooks for data fetching
  const { activeOrders, deliveredOrders, isLoading, error, refresh } = useDeliveryOrders();

  const handleRefresh = async () => {
    await refresh();
  };

  const handleVerifyCODPayment = async (orderId: string) => {
    if (!user?.id) return;

    try {
      setActionLoading(orderId);
      const result: any = await OrderService.verifyCODPayment(orderId, user.id);
      
      if (result?.success) {
        Alert.alert('Success! ✅', result.message);
        await refresh();
      } else {
        Alert.alert('Error', result?.message || 'Failed to verify payment');
      }
    } catch (error: any) {
      console.error('Error verifying COD payment:', error);
      Alert.alert('Error', error.message || 'Failed to verify payment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    if (!user?.id) return;

    Alert.alert(
      'Mark as Delivered',
      'Please take a photo as proof of delivery',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: async () => {
          try {
            const { launchCameraAsync } = await import('expo-image-picker');
            const res = await launchCameraAsync({
              mediaTypes: ['images'],
              quality: 0.7,
              allowsEditing: true,
              aspect: [4, 3]
            });
            if (!res.canceled) {
              setActionLoading(orderId);
              const uri = res.assets[0].uri;
              const result: any = await OrderService.markOrderDelivered(orderId, user.id, uri);
              if (result?.success) {
                Alert.alert(
                  result.proofUploaded ? 'Success! 📸' : 'Success! ✅', 
                  result.message
                );
                await refresh();
              } else {
                Alert.alert('Error', result?.message || 'Failed to mark as delivered');
              }
            }
          } catch (error: any) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', error.message || 'Failed to take photo');
          } finally {
            setActionLoading(null);
          }
        }},
        { text: 'Choose from Gallery', onPress: async () => {
          try {
            const { launchImageLibraryAsync } = await import('expo-image-picker');
            const res = await launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 0.7,
              allowsEditing: true,
              aspect: [4, 3]
            });
            if (!res.canceled) {
              setActionLoading(orderId);
              const uri = res.assets[0].uri;
              const result: any = await OrderService.markOrderDelivered(orderId, user.id, uri);
              if (result?.success) {
                Alert.alert(
                  result.proofUploaded ? 'Success! 📸' : 'Success! ✅', 
                  result.message
                );
                await refresh();
              } else {
                Alert.alert('Error', result?.message || 'Failed to mark as delivered');
              }
            }
          } catch (error: any) {
            console.error('Error selecting photo:', error);
            Alert.alert('Error', error.message || 'Failed to select photo');
          } finally {
            setActionLoading(null);
          }
        }}
      ]
    );
  };

  const getActionButton = (order: Order) => {
    const status = order.status?.toLowerCase();
    const paymentMethod = order.payment_method?.toLowerCase();
    const paymentStatus = order.payment_status?.toLowerCase();

    if (status === 'ready_for_pickup') {
      if (paymentMethod === 'cod' && paymentStatus === 'pending') {
        return (
          <Button
            title="Verify COD Payment"
            onPress={() => handleVerifyCODPayment(order.id)}
            variant="primary"
            size="small"
            loading={actionLoading === order.id}
            disabled={actionLoading === order.id}
          />
        );
      } else {
        return (
          <Button
            title="Mark as Delivered"
            onPress={() => handleMarkDelivered(order.id)}
            variant="primary"
            size="small"
            loading={actionLoading === order.id}
            disabled={actionLoading === order.id}
          />
        );
      }
    } else if (status === 'out_for_delivery') {
      return (
        <Button
          title="Mark as Delivered"
          onPress={() => handleMarkDelivered(order.id)}
          variant="primary"
          size="small"
          loading={actionLoading === order.id}
          disabled={actionLoading === order.id}
        />
      );
    }
    return null;
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const actionButton = getActionButton(item);
    
    return (
      <OrderCard
        order={item}
        onPress={() => router.push(`/(delivery)/order/${item.id}` as any)}
        showCustomerInfo={true}
        showDeliveryInfo={true}
        showActionButton={!!actionButton}
        actionButtonTitle={actionButton?.props.title}
        onActionPress={actionButton?.props.onPress}
        actionButtonLoading={actionButton?.props.loading}
        actionButtonDisabled={actionButton?.props.loading}
        variant="detailed"
      />
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <LoadingState 
          message="Loading orders..." 
          fullScreen 
        />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <MaterialIcons name="error-outline" size={48} color={colors.error} />
        <ResponsiveView marginTop="md">
          <ResponsiveText size="lg" color={colors.error} align="center">
            Error loading orders
          </ResponsiveText>
        </ResponsiveView>
        <ResponsiveView marginTop="sm">
          <ResponsiveText size="md" color={colors.textSecondary} align="center">
            {error}
          </ResponsiveText>
        </ResponsiveView>
        <ResponsiveView marginTop="lg">
          <Button
            title="Retry"
            onPress={handleRefresh}
            variant="primary"
            size="medium"
          />
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={{ flex: 1 }}>
        <ResponsiveView padding="lg">
          {/* Header */}
          <ResponsiveView style={[styles.header, { backgroundColor: colors.surface }]}>
            <ResponsiveView style={styles.headerLeft}>
              <Button
                title=""
                onPress={() => router.back()}
                variant="text"
                icon={<MaterialIcons name="arrow-back" size={24} color={colors.primary} />}
              />
              <ResponsiveView marginLeft="md">
                <ResponsiveText size="xl" weight="bold" color={colors.text}>
                  Delivery Orders
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
            <Button
              title="Refresh"
              onPress={handleRefresh}
              variant="text"
              size="small"
              icon={<MaterialIcons name="refresh" size={16} color={colors.primary} />}
            />
          </ResponsiveView>

          {/* Orders List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={isLoading} 
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
          >
            {/* Active Orders Section */}
            {activeOrders.length > 0 && (
              <ResponsiveView style={styles.section}>
                <ResponsiveView style={styles.sectionHeader}>
                  <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                    Active Orders
                  </ResponsiveText>
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    {activeOrders.length} orders
                  </ResponsiveText>
                </ResponsiveView>
                <ResponsiveView style={styles.ordersList}>
                  {activeOrders.map((order) => (
                    <View key={order.id}>
                      {renderOrderItem({ item: order })}
                    </View>
                  ))}
                </ResponsiveView>
              </ResponsiveView>
            )}

            {/* Delivered Orders Section */}
            {deliveredOrders.length > 0 && (
              <ResponsiveView style={styles.section}>
                <ResponsiveView style={styles.sectionHeader}>
                  <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                    Delivered Orders
                  </ResponsiveText>
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    {deliveredOrders.length} orders
                  </ResponsiveText>
                </ResponsiveView>
                <ResponsiveView style={styles.ordersList}>
                  {deliveredOrders.map((order) => (
                    <View key={order.id}>
                      {renderOrderItem({ item: order })}
                    </View>
                  ))}
                </ResponsiveView>
              </ResponsiveView>
            )}

            {/* Empty State */}
            {activeOrders.length === 0 && deliveredOrders.length === 0 && (
              <ResponsiveView style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                <MaterialIcons name="assignment" size={48} color={colors.textSecondary} />
                <ResponsiveView marginTop="md">
                  <ResponsiveText size="lg" color={colors.text} align="center">
                    No Orders Available
                  </ResponsiveText>
                </ResponsiveView>
                <ResponsiveView marginTop="sm">
                  <ResponsiveText size="md" color={colors.textSecondary} align="center">
                    There are no orders to manage at the moment.
                  </ResponsiveText>
                </ResponsiveView>
                <ResponsiveView marginTop="lg">
                  <Button
                    title="Refresh"
                    onPress={handleRefresh}
                    variant="primary"
                    size="medium"
                  />
                </ResponsiveView>
              </ResponsiveView>
            )}
          </ScrollView>
        </ResponsiveView>
      </View>
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
    marginBottom: ResponsiveSpacing.lg,
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  section: {
    marginBottom: ResponsiveSpacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.md,
    paddingHorizontal: ResponsiveSpacing.sm,
  },
  ordersList: {
    gap: ResponsiveSpacing.sm,
  },
  emptyState: {
    padding: ResponsiveSpacing.xl,
    borderRadius: ResponsiveBorderRadius.lg,
    alignItems: 'center',
    ...Layout.shadows.sm,
  },
});