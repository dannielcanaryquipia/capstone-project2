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
import { TabBar, TabItem } from '../../../components/ui/TabBar';
import Layout from '../../../constants/Layout';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { OrderService } from '../../../services/order.service';
import { Order, OrderFilters, OrderStatus } from '../../../types/order.types';

const getStatusTabs = (colors: any): TabItem[] => [
  { key: 'all', label: 'All', color: colors.textSecondary },
  { key: 'pending', label: 'Pending', color: colors.warning },
  { key: 'confirmed', label: 'Confirmed', color: colors.info },
  { key: 'preparing', label: 'Preparing', color: colors.accent },
  { key: 'ready_for_pickup', label: 'Ready', color: colors.primary },
  { key: 'out_for_delivery', label: 'Out for Delivery', color: colors.secondary },
  { key: 'delivered', label: 'Delivered', color: colors.success },
  { key: 'cancelled', label: 'Cancelled', color: colors.error },
];

export default function AdminOrdersScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [orderCounts, setOrderCounts] = useState({
    total: 0,
    pending: 0,
    preparing: 0,
    ready: 0,
    outForDelivery: 0,
    delivered: 0,
    cancelled: 0
  });

  const statusTabs = getStatusTabs(colors);

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const filters: OrderFilters = {};
      
      if (activeTab !== 'all') {
        filters.status = [activeTab];
      }
      
      const ordersData = await OrderService.getAdminOrders(filters);
      setOrders(ordersData);
      
      // Calculate order counts
      const counts = {
        total: ordersData.length,
        pending: ordersData.filter(o => o.status === 'pending').length,
        preparing: ordersData.filter(o => o.status === 'preparing').length,
        ready: ordersData.filter(o => o.status === 'ready_for_pickup').length,
        outForDelivery: ordersData.filter(o => o.status === 'out_for_delivery').length,
        delivered: ordersData.filter(o => o.status === 'delivered').length,
        cancelled: ordersData.filter(o => o.status === 'cancelled').length
      };
      setOrderCounts(counts);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    Alert.alert(
      'Update Order Status',
      `Are you sure you want to change this order status to ${newStatus.replace('_', ' ')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: async () => {
            try {
              setUpdatingOrder(orderId);
              await OrderService.updateOrderStatus(orderId, newStatus, 'admin');
              await loadOrders(); // Refresh the list
              Alert.alert('Success', 'Order status updated successfully!');
            } catch (error) {
              console.error('Error updating order status:', error);
              Alert.alert('Error', 'Failed to update order status. Please try again.');
            } finally {
              setUpdatingOrder(null);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: OrderStatus) => {
    const statusConfig = statusTabs.find(tab => tab.key === status);
    return statusConfig?.color || colors.textSecondary;
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'schedule';
      case 'confirmed': return 'check-circle-outline';
      case 'preparing': return 'restaurant';
      case 'ready_for_pickup': return 'local-shipping';
      case 'out_for_delivery': return 'delivery-dining';
      case 'delivered': return 'check-circle';
      case 'cancelled': return 'cancel';
      default: return 'help';
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'preparing';
      case 'preparing': return 'ready_for_pickup';
      case 'ready_for_pickup': return 'out_for_delivery';
      case 'out_for_delivery': return 'delivered';
      default: return null;
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const nextStatus = getNextStatus(item.status);
    
    return (
      <OrderCard
        order={item}
        onPress={() => router.push(`/(admin)/orders/${item.id}` as any)}
        showCustomerInfo={true}
        showDeliveryInfo={true}
        showActionButton={!!nextStatus}
        actionButtonTitle={nextStatus ? `Mark as ${nextStatus.replace('_', ' ')}` : undefined}
        onActionPress={nextStatus ? () => handleStatusUpdate(item.id, nextStatus) : undefined}
        actionButtonLoading={updatingOrder === item.id}
        actionButtonDisabled={updatingOrder === item.id}
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
          Order Management
        </ResponsiveText>
        <ResponsiveText size="md" color={colors.textSecondary}>
          Showing all orders ({orderCounts.total} total)
        </ResponsiveText>
      </ResponsiveView>

      {/* Order Summary */}
      <ResponsiveView style={styles.summaryContainer}>
        <ResponsiveText size="sm" color={colors.textSecondary}>
          Pending: {orderCounts.pending} | Preparing: {orderCounts.preparing}
        </ResponsiveText>
      </ResponsiveView>

      {/* Status Tabs */}
      <TabBar
        tabs={statusTabs}
        activeTab={activeTab}
        onTabPress={(tabKey) => setActiveTab(tabKey as OrderStatus | 'all')}
        horizontal
        showScrollIndicator={false}
        variant="pills"
      />

      {orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      ) : (
        <EmptyState
          icon="receipt-long"
          title="No Orders Found"
          description={activeTab === 'all' 
            ? 'No orders have been placed yet.'
            : `No ${activeTab.replace('_', ' ')} orders found.`
          }
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
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  summaryContainer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.sm,
  },
  ordersList: {
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: 0,
  },
});
