import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
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
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../../../constants/Responsive';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { OrderService } from '../../../services/order.service';
import global from '../../../styles/global';
import { DeliveryOrder } from '../../../types/order.types';

export default function AvailableOrdersScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assigningOrder, setAssigningOrder] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableOrders();
  }, []);

  const loadAvailableOrders = async () => {
    try {
      setLoading(true);
      const availableOrders = await OrderService.getAvailableOrders();
      setOrders(availableOrders);
    } catch (error) {
      console.error('Error loading available orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAvailableOrders();
    setRefreshing(false);
  };

  const handleAssignOrder = async (orderId: string) => {
    if (!user?.id) return;

    Alert.alert(
      'Assign Order',
      'Are you sure you want to assign this order to yourself?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Assign', 
          onPress: async () => {
            try {
              setAssigningOrder(orderId);
              await OrderService.assignOrderToDelivery(orderId, user.id);
              await loadAvailableOrders(); // Refresh the list
              Alert.alert('Success', 'Order assigned successfully!');
            } catch (error) {
              console.error('Error assigning order:', error);
              Alert.alert('Error', 'Failed to assign order. Please try again.');
            } finally {
              setAssigningOrder(null);
            }
          }
        }
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const renderOrderItem = ({ item }: { item: DeliveryOrder }) => {
    const { order } = item;
    
    return (
      <OrderCard
        order={order}
        onPress={() => router.push(`/(delivery)/order-details/${order.id}` as any)}
        showCustomerInfo={true}
        showDeliveryInfo={true}
        showActionButton={true}
        actionButtonTitle="Assign to Me"
        onActionPress={() => handleAssignOrder(order.id)}
        actionButtonLoading={assigningOrder === order.id}
        actionButtonDisabled={assigningOrder === order.id}
        variant="detailed"
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <ResponsiveView style={styles.center}>
          <LoadingState 
            message={Strings.loading} 
            fullScreen 
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
              <ResponsiveText size="xl" weight="bold" color={colors.text}>
                Available Orders
              </ResponsiveText>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Pick up orders ready for delivery ({orders.length})
              </ResponsiveText>
            </ResponsiveView>
            <Button
              title="Refresh"
              onPress={handleRefresh}
              variant="outline"
              size="small"
              icon={<MaterialIcons name="refresh" size={16} color={colors.primary} />}
            />
          </ResponsiveView>
        </ResponsiveView>

        {/* Orders List */}
        {orders.length > 0 ? (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.order.id}
            contentContainerStyle={styles.ordersList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
          />
        ) : (
          <ResponsiveView style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <ResponsiveView style={[styles.emptyIcon, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialIcons name="delivery-dining" size={responsiveValue(48, 56, 64, 72)} color={colors.primary} />
            </ResponsiveView>
            <ResponsiveView marginTop="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text} align="center">
                No Available Orders
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView marginTop="sm">
              <ResponsiveText size="md" color={colors.textSecondary} align="center">
                There are no orders ready for pickup at the moment. Pull down to refresh or check back later.
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
    flex: 1,
  },
  ordersList: {
    paddingHorizontal: ResponsiveSpacing.lg,
    paddingTop: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: ResponsiveSpacing.xxxl,
    paddingHorizontal: ResponsiveSpacing.lg,
    marginHorizontal: ResponsiveSpacing.lg,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  emptyIcon: {
    width: responsiveValue(80, 90, 100, 120),
    height: responsiveValue(80, 90, 100, 120),
    borderRadius: responsiveValue(40, 45, 50, 60),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.md,
  },
});
