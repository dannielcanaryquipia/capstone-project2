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
      <TouchableOpacity
        style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push(`/(delivery)/order-details/${order.id}` as any)}
      >
        <ResponsiveView style={styles.orderHeader}>
          <ResponsiveView style={styles.orderInfo}>
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              {order.order_number}
            </ResponsiveText>
            <ResponsiveView style={styles.priorityBadge}>
              <ResponsiveText 
                size="xs" 
                color={getPriorityColor(item.priority)}
                weight="semiBold"
              >
                {item.priority.toUpperCase()}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
          <MaterialIcons name="keyboard-arrow-right" size={24} color={colors.textSecondary} />
        </ResponsiveView>

        <ResponsiveView style={styles.customerInfo}>
          <MaterialIcons name="person" size={16} color={colors.textSecondary} />
          <ResponsiveView marginLeft="xs">
            <ResponsiveText size="sm" color={colors.textSecondary}>
              {item.customer_name}
            </ResponsiveText>
          </ResponsiveView>
          <MaterialIcons name="phone" size={16} color={colors.textSecondary} marginLeft="md" />
          <ResponsiveView marginLeft="xs">
            <ResponsiveText size="sm" color={colors.textSecondary}>
              {item.customer_phone}
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
              {order.delivery_address?.full_address || 'No address provided'}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>

        <ResponsiveView style={styles.orderDetails}>
          <ResponsiveView style={styles.detailItem}>
            <MaterialIcons name="restaurant" size={16} color={colors.textSecondary} />
            <ResponsiveView marginLeft="xs">
              <ResponsiveText size="sm" color={colors.textSecondary}>
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
          
          <ResponsiveView style={styles.detailItem}>
            <MaterialIcons name="schedule" size={16} color={colors.textSecondary} />
            <ResponsiveView marginLeft="xs">
              <ResponsiveText size="sm" color={colors.textSecondary}>
                {item.estimated_time} min
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
          
          <ResponsiveView style={styles.detailItem}>
            <MaterialIcons name="directions" size={16} color={colors.textSecondary} />
            <ResponsiveView marginLeft="xs">
              <ResponsiveText size="sm" color={colors.textSecondary}>
                {item.distance.toFixed(1)} km
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
              ₱{order.total_amount.toFixed(2)}
            </ResponsiveText>
          </ResponsiveView>
          
          <Button
            title="Assign to Me"
            onPress={() => handleAssignOrder(order.id)}
            loading={assigningOrder === order.id}
            disabled={assigningOrder === order.id}
            size="small"
            variant="primary"
          />
        </ResponsiveView>

        {order.delivery_instructions && (
          <ResponsiveView style={styles.instructionsContainer}>
            <MaterialIcons name="info" size={16} color={colors.info} />
            <ResponsiveView marginLeft="xs">
              <ResponsiveText size="sm" color={colors.info}>
                {order.delivery_instructions}
              </ResponsiveText>
            </ResponsiveView>
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
        <ResponsiveView style={styles.emptyState}>
          <MaterialIcons name="delivery-dining" size={64} color={colors.textSecondary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              No Available Orders
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView marginTop="sm">
            <ResponsiveText size="md" color={colors.textSecondary} style={{ textAlign: 'center' }}>
              There are no orders ready for pickup at the moment.
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView marginTop="xs">
            <ResponsiveText size="sm" color={colors.textSecondary} style={{ textAlign: 'center' }}>
              Pull down to refresh or check back later.
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
    padding: 20,
    paddingBottom: 16,
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
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
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
