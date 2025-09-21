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
import { Strings } from '../../../constants/Strings';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { Order } from '../../../types/order.types';

const statusTabs = ['All', 'Out for Delivery', 'Delivered', 'Cancelled'];

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
    <TouchableOpacity
      style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/(delivery)/order-details/${item.id}` as any)}
    >
      <ResponsiveView style={styles.orderHeader}>
        <ResponsiveView style={styles.orderInfo}>
          <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
            {item.order_number}
          </ResponsiveText>
          <ResponsiveView style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
            <MaterialIcons 
              name={getStatusIcon(item.status)} 
              size={14} 
              color={getStatusColor(item.status)} 
            />
            <ResponsiveView marginLeft="xs">
              <ResponsiveText 
                size="xs" 
                color={getStatusColor(item.status)}
                weight="semiBold"
              >
                {item.status.replace('_', ' ').toUpperCase()}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
        </ResponsiveView>
        <MaterialIcons name="keyboard-arrow-right" size={24} color={colors.textSecondary} />
      </ResponsiveView>

      <ResponsiveView style={styles.customerInfo}>
        <MaterialIcons name="person" size={16} color={colors.textSecondary} />
        <ResponsiveView marginLeft="xs">
          <ResponsiveText size="sm" color={colors.textSecondary}>
            Customer: {item.delivery_address?.full_address?.split(',')[0] || 'Unknown'}
          </ResponsiveText>
        </ResponsiveView>
      </ResponsiveView>

      <ResponsiveView style={styles.deliveryInfo}>
        <MaterialIcons name="location-on" size={16} color={colors.textSecondary} />
        <ResponsiveView marginLeft="xs" style={styles.addressText}>
          <ResponsiveText 
            size="sm" 
            color={colors.textSecondary} 
            numberOfLines={2}
          >
            {item.delivery_address?.full_address || 'No address provided'}
          </ResponsiveText>
        </ResponsiveView>
      </ResponsiveView>

      <ResponsiveView style={styles.orderDetails}>
        <ResponsiveView style={styles.detailItem}>
          <MaterialIcons name="restaurant" size={16} color={colors.textSecondary} />
          <ResponsiveView marginLeft="xs">
            <ResponsiveText size="sm" color={colors.textSecondary}>
              {item.items.length} item{item.items.length !== 1 ? 's' : ''}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
        
        <ResponsiveView style={styles.detailItem}>
          <MaterialIcons name="schedule" size={16} color={colors.textSecondary} />
          <ResponsiveView marginLeft="xs">
            <ResponsiveText size="sm" color={colors.textSecondary}>
              {formatDate(item.created_at)}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
        
        <ResponsiveView style={styles.detailItem}>
          <MaterialIcons name="payment" size={16} color={colors.textSecondary} />
          <ResponsiveView marginLeft="xs">
            <ResponsiveText size="sm" color={colors.textSecondary}>
              {item.payment_method.toUpperCase()}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </ResponsiveView>

      <ResponsiveView style={styles.orderFooter}>
        <ResponsiveView style={styles.totalContainer}>
          <ResponsiveText size="sm" color={colors.textSecondary}>
            Total:
          </ResponsiveText>
          <ResponsiveText size="lg" weight="semiBold" color={colors.primary}>
            ₱{item.total_amount.toFixed(2)}
          </ResponsiveText>
        </ResponsiveView>
        
        {item.status === 'out_for_delivery' && (
          <Button
            title="Mark as Delivered"
            onPress={() => handleUpdateStatus(item.id, 'delivered')}
            variant="primary"
            size="small"
          />
        )}
      </ResponsiveView>

      {item.delivery_instructions && (
        <ResponsiveView style={styles.instructionsContainer}>
          <MaterialIcons name="info" size={16} color={colors.info} />
          <ResponsiveView marginLeft="xs">
            <ResponsiveText size="sm" color={colors.info}>
              {item.delivery_instructions}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      )}
    </TouchableOpacity>
  );

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
          My Deliveries
        </ResponsiveText>
        <ResponsiveText size="md" color={colors.textSecondary}>
          Track your assigned delivery orders
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
                activeTab === item && { 
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
                activeTab !== item && { borderColor: colors.border },
              ]}
              onPress={() => setActiveTab(item)}
            >
              <ResponsiveText 
                size="sm" 
                weight="medium"
                color={activeTab === item ? colors.background : colors.text}
              >
                {item}
              </ResponsiveText>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
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
          <MaterialIcons name="delivery-dining" size={64} color={colors.textSecondary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              No Deliveries Found
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView marginTop="sm">
            <ResponsiveText size="md" color={colors.textSecondary} style={{ textAlign: 'center' }}>
              {activeTab === 'All' 
                ? 'No delivery orders assigned to you yet.'
                : `No ${activeTab.toLowerCase()} deliveries found.`
              }
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView marginTop="lg">
            <Button
              title="Check Available Orders"
              onPress={() => router.push('/(delivery)/orders/available' as any)}
              variant="primary"
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
    padding: 20,
    paddingBottom: 16,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  tabsList: {
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  ordersList: {
    padding: 20,
    paddingTop: 0,
  },
  orderCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressText: {
    flex: 1,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
});
