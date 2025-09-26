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
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { Order } from '../../../types/order.types';

const statusTabs: TabItem[] = [
  { key: 'All', label: 'All' },
  { key: 'Out for Delivery', label: 'Out for Delivery' },
  { key: 'Delivered', label: 'Delivered' },
  { key: 'Cancelled', label: 'Cancelled' },
];

export default function MyOrdersScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    loadMyOrders();
  }, [activeTab]);

  const loadMyOrders = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockOrders: Order[] = [
        {
          id: '1',
          user_id: 'user1',
          order_number: 'KO-240115-001',
          status: 'out_for_delivery',
          payment_status: 'verified',
          payment_method: 'cod',
          items: [
            {
              id: '1',
              product_id: 'prod1',
              product_name: 'Margherita Pizza',
              quantity: 1,
              unit_price: 12.99,
              total_price: 12.99,
            }
          ],
          subtotal: 12.99,
          delivery_fee: 50,
          tax_amount: 1.56,
          discount_amount: 0,
          total_amount: 64.55,
          delivery_address: {
            id: 'addr1',
            user_id: 'user1',
            label: 'Home',
            full_address: '123 Main St, City, State 12345',
            street: '123 Main St',
            city: 'City',
            state: 'State',
            postal_code: '12345',
            country: 'US',
            is_default: true,
          },
          assigned_delivery_id: user?.id || 'delivery1',
          delivery_person_name: 'Mike Johnson',
          delivery_person_phone: '+1234567890',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T11:00:00Z',
        },
        {
          id: '2',
          user_id: 'user2',
          order_number: 'KO-240115-002',
          status: 'delivered',
          payment_status: 'verified',
          payment_method: 'gcash',
          items: [
            {
              id: '2',
              product_id: 'prod2',
              product_name: 'Pepperoni Pizza',
              quantity: 2,
              unit_price: 14.99,
              total_price: 29.98,
            }
          ],
          subtotal: 29.98,
          delivery_fee: 50,
          tax_amount: 3.60,
          discount_amount: 0,
          total_amount: 83.58,
          delivery_address: {
            id: 'addr2',
            user_id: 'user2',
            label: 'Office',
            full_address: '456 Business Ave, City, State 12345',
            street: '456 Business Ave',
            city: 'City',
            state: 'State',
            postal_code: '12345',
            country: 'US',
            is_default: false,
          },
          assigned_delivery_id: user?.id || 'delivery1',
          delivery_person_name: 'Mike Johnson',
          delivery_person_phone: '+1234567890',
          created_at: '2024-01-15T09:15:00Z',
          updated_at: '2024-01-15T10:45:00Z',
          delivered_at: '2024-01-15T10:45:00Z',
        },
      ];

      const filteredOrders = activeTab === 'All' 
        ? mockOrders 
        : mockOrders.filter(order => {
            switch (activeTab) {
              case 'Out for Delivery': return order.status === 'out_for_delivery';
              case 'Delivered': return order.status === 'delivered';
              case 'Cancelled': return order.status === 'cancelled';
              default: return true;
            }
          });
      
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error loading my orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMyOrders();
    setRefreshing(false);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    Alert.alert(
      'Update Delivery Status',
      `Mark this order as ${newStatus.replace('_', ' ')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: async () => {
            try {
              // Update order status
              setOrders(prev => prev.map(order => 
                order.id === orderId 
                  ? { ...order, status: newStatus as any, updated_at: new Date().toISOString() }
                  : order
              ));
              Alert.alert('Success', 'Order status updated successfully!');
            } catch (error) {
              console.error('Error updating order status:', error);
              Alert.alert('Error', 'Failed to update order status. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'out_for_delivery': return colors.primary;
      case 'delivered': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'out_for_delivery': return 'delivery-dining';
      case 'delivered': return 'check-circle';
      case 'cancelled': return 'cancel';
      default: return 'help';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <OrderCard
      order={item}
      onPress={() => router.push(`/(delivery)/order-details/${item.id}` as any)}
      showCustomerInfo={true}
      showDeliveryInfo={true}
      showActionButton={item.status === 'out_for_delivery'}
      actionButtonTitle={item.status === 'out_for_delivery' ? 'Mark as Delivered' : undefined}
      onActionPress={item.status === 'out_for_delivery' ? () => handleUpdateStatus(item.id, 'delivered') : undefined}
      variant="detailed"
    />
  );

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
          My Deliveries
        </ResponsiveText>
        <ResponsiveText size="md" color={colors.textSecondary}>
          Track your assigned delivery orders
        </ResponsiveText>
      </ResponsiveView>

      {/* Status Tabs */}
      <TabBar
        tabs={statusTabs}
        activeTab={activeTab}
        onTabPress={setActiveTab}
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
          icon="delivery-dining"
          title="No Deliveries Found"
          description={activeTab === 'All' 
            ? 'No delivery orders assigned to you yet.'
            : `No ${activeTab.toLowerCase()} deliveries found.`
          }
          actionTitle="Check Available Orders"
          onActionPress={() => router.push('/(delivery)/orders/available' as any)}
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
