import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { OrderCard } from '../../../components/ui/OrderCard';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { OrderService } from '../../../services/order.service';
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingState 
          message={Strings.loading} 
          fullScreen 
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ResponsiveView style={styles.header}>
        <ResponsiveText size="xl" weight="bold" color={colors.text}>
          Available Orders
        </ResponsiveText>
        <ResponsiveText size="md" color={colors.textSecondary}>
          Pick up orders ready for delivery
        </ResponsiveText>
      </ResponsiveView>

      {orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.order.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      ) : (
        <EmptyState
          icon="delivery-dining"
          title="No Available Orders"
          description="There are no orders ready for pickup at the moment. Pull down to refresh or check back later."
          actionTitle="Refresh"
          onActionPress={handleRefresh}
          showAction={true}
          fullScreen
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  ordersList: {
    padding: 20,
    paddingTop: 0,
  },
});
