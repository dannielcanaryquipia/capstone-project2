import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { OrderService } from '../../../services/order.service';
import { Order, OrderFilters, OrderStatus } from '../../../types/order.types';

const getStatusTabs = (colors: any) => [
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
      <TouchableOpacity
        style={[styles.orderCard, { backgroundColor: colors.card }]}
        onPress={() => router.push(`/(admin)/orders/${item.id}` as any)}
      >
        <ResponsiveView style={styles.orderHeader}>
          <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
            {item.order_number}
          </ResponsiveText>
          <ResponsiveView style={styles.orderStatusContainer}>
            <ResponsiveText 
              size="sm" 
              color={getStatusColor(item.status)}
              weight="semiBold"
            >
              {item.status.replace('_', ' ').toUpperCase()}
            </ResponsiveText>
            <ResponsiveText 
              size="xs" 
              color={item.payment_status === 'verified' ? colors.success : colors.warning}
              weight="semiBold"
            >
              {item.payment_status === 'verified' ? 'Verified' : 'Pending'}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>

        <ResponsiveView style={styles.customerInfo}>
          <ResponsiveText size="md" weight="semiBold" color={colors.text}>
            {item.delivery_address?.full_address?.split(',')[0] || 'Unknown Customer'}
          </ResponsiveText>
        </ResponsiveView>

        <ResponsiveView style={styles.orderDetails}>
          <ResponsiveView style={styles.detailRow}>
            <MaterialIcons name="schedule" size={16} color={colors.textSecondary} />
            <ResponsiveText size="sm" color={colors.textSecondary}>
              {new Date(item.created_at).toLocaleDateString()}
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView style={styles.detailRow}>
            <MaterialIcons name="location-on" size={16} color={colors.textSecondary} />
            <ResponsiveText size="sm" color={colors.textSecondary} numberOfLines={1}>
              {item.delivery_address?.full_address || 'No address provided'}
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView style={styles.detailRow}>
            <MaterialIcons name="payment" size={16} color={colors.textSecondary} />
            <ResponsiveText size="sm" color={colors.textSecondary}>
              {item.payment_method?.toUpperCase() || 'N/A'} • ₱{(item.total_amount || 0).toFixed(2)}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>

        {nextStatus && (
          <ResponsiveView style={styles.actionContainer}>
            <Button
              title={`Mark as ${nextStatus.replace('_', ' ')}`}
              onPress={() => handleStatusUpdate(item.id, nextStatus)}
              loading={updatingOrder === item.id}
              disabled={updatingOrder === item.id}
              size="small"
              variant="primary"
            />
          </ResponsiveView>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="md" color={colors.textSecondary}>
              {Strings.loading}
            </ResponsiveText>
          </ResponsiveView>
        </View>
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
      <ResponsiveView style={styles.tabsContainer}>
        <FlatList
          data={statusTabs}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === item.key && { 
                  backgroundColor: item.color,
                  borderColor: item.color,
                },
                activeTab !== item.key && { borderColor: colors.border },
              ]}
              onPress={() => setActiveTab(item.key as OrderStatus | 'all')}
            >
              <ResponsiveText 
                size="sm" 
                weight="medium"
                color={activeTab === item.key ? colors.background : item.color}
              >
                {item.label}
              </ResponsiveText>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.tabsList}
        />
      </ResponsiveView>

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
        <ResponsiveView style={styles.emptyState}>
          <MaterialIcons name="receipt-long" size={64} color={colors.textSecondary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              No Orders Found
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView marginTop="sm">
            <ResponsiveText size="md" color={colors.textSecondary} style={{ textAlign: 'center' }}>
              {activeTab === 'all' 
                ? 'No orders have been placed yet.'
                : `No ${activeTab.replace('_', ' ')} orders found.`
              }
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView marginTop="lg">
            <Button
              title="Refresh"
              onPress={handleRefresh}
              variant="outline"
            />
          </ResponsiveView>
        </ResponsiveView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  summaryContainer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.sm,
  },
  tabsContainer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
  },
  tabsList: {
    gap: Layout.spacing.sm,
  },
  tab: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.pill,
    borderWidth: 1,
  },
  ordersList: {
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: 0,
  },
  orderCard: {
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.md,
    ...Layout.shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  orderStatusContainer: {
    alignItems: 'flex-end',
  },
  customerInfo: {
    marginBottom: Layout.spacing.sm,
  },
  orderDetails: {
    gap: Layout.spacing.xs,
    marginBottom: Layout.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  actionContainer: {
    marginTop: Layout.spacing.sm,
    paddingTop: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
});
