import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import { LoadingState } from '../../../components/ui/LoadingState';
import { OrderCard } from '../../../components/ui/OrderCard';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import { TabBar, TabItem } from '../../../components/ui/TabBar';
import Layout from '../../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../../../constants/Responsive';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAdminOrders } from '../../../hooks';
import { OrderService } from '../../../services/order.service';
import global from '../../../styles/global';
import { Order, OrderStatus } from '../../../types/order.types';

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
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Use improved hook with real-time updates
  const { 
    orders, 
    isLoading: loading, 
    error, 
    refresh 
  } = useAdminOrders(
    activeTab !== 'all' ? { status: [activeTab] } : undefined
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Calculate order counts
  const orderCounts = {
    total: orders.length,
    pending: orders.filter((o: Order) => o.status === 'pending').length,
    preparing: orders.filter((o: Order) => o.status === 'preparing').length,
    ready: orders.filter((o: Order) => o.status === 'ready_for_pickup').length,
    outForDelivery: orders.filter((o: Order) => o.status === 'out_for_delivery').length,
    delivered: orders.filter((o: Order) => o.status === 'delivered').length,
    cancelled: orders.filter((o: Order) => o.status === 'cancelled').length
  };

  // Build tabs with counts to match design
  const statusTabs = [
    { key: 'all', label: `All (${orderCounts.total})`, color: colors.textSecondary },
    { key: 'pending', label: `Pending (${orderCounts.pending})`, color: colors.warning },
    { key: 'confirmed', label: `Confirmed (${orders.filter((o: Order) => o.status === 'confirmed').length})`, color: colors.info },
    { key: 'preparing', label: `Preparing (${orderCounts.preparing})`, color: colors.accent },
    { key: 'ready_for_pickup', label: `Ready (${orderCounts.ready})`, color: colors.primary },
    { key: 'out_for_delivery', label: `Out for Delivery (${orderCounts.outForDelivery})`, color: colors.secondary },
    { key: 'delivered', label: `Delivered (${orderCounts.delivered})`, color: colors.success },
    { key: 'cancelled', label: `Cancelled (${orderCounts.cancelled})`, color: colors.error },
  ] as TabItem[];

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
              await handleRefresh(); // Refresh the list using hook
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

  const renderHeader = () => (
    <ResponsiveView padding="lg">
      {/* Header with Title and Refresh */}
      <ResponsiveView style={[styles.header, { backgroundColor: colors.surface }]} marginBottom="md">
        <ResponsiveView style={styles.headerLeft}>
          <ResponsiveText size="xl" weight="bold" color={colors.text}>
            Order Management
          </ResponsiveText>
          <ResponsiveText size="md" color={colors.textSecondary}>
            Showing all orders ({orderCounts.total} total)
          </ResponsiveText>
          <ResponsiveText size="sm" color={colors.textSecondary}>
            Pending: {orderCounts.pending} | Preparing: {orderCounts.preparing}
          </ResponsiveText>
        </ResponsiveView>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <MaterialIcons name="refresh" size={responsiveValue(20, 24, 28, 32)} color={colors.primary} />
        </TouchableOpacity>
      </ResponsiveView>

      {/* Search Section */}
      <ResponsiveView style={[styles.searchSection, { backgroundColor: colors.surface }]} marginBottom="md">
        <ResponsiveView style={styles.searchContainer}>
          <MaterialIcons name="search" size={responsiveValue(16, 18, 20, 22)} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by order ID, customer name, or phone"
            placeholderTextColor={colors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <MaterialIcons name="clear" size={responsiveValue(16, 18, 20, 22)} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </ResponsiveView>
      </ResponsiveView>

      {/* Order Summary */}
      <ResponsiveView style={[styles.summaryContainer, { backgroundColor: colors.surface }]}>
        <ResponsiveView style={styles.summaryGrid}>
          <ResponsiveView style={styles.summaryItem}>
            <ResponsiveText size="sm" color={colors.textSecondary} weight="medium">
              Pending
            </ResponsiveText>
            <ResponsiveText size="lg" weight="bold" color={colors.warning}>
              {orderCounts.pending}
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView style={styles.summaryItem}>
            <ResponsiveText size="sm" color={colors.textSecondary} weight="medium">
              Preparing
            </ResponsiveText>
            <ResponsiveText size="lg" weight="bold" color={colors.info}>
              {orderCounts.preparing}
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView style={styles.summaryItem}>
            <ResponsiveText size="sm" color={colors.textSecondary} weight="medium">
              Delivered
            </ResponsiveText>
            <ResponsiveText size="lg" weight="bold" color={colors.success}>
              {orderCounts.delivered}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </ResponsiveView>

      {/* Status Tabs */}
      <ResponsiveView style={styles.tabsContainer}>
        <TabBar
          tabs={statusTabs}
          activeTab={activeTab}
          onTabPress={(tabKey) => setActiveTab(tabKey as OrderStatus | 'all')}
          horizontal
          showScrollIndicator={false}
          variant="pills"
        />
      </ResponsiveView>
    </ResponsiveView>
  );

  const renderEmptyState = () => (
    <ResponsiveView style={[styles.emptyState, { backgroundColor: colors.surface }]}>
      <ResponsiveView style={[styles.emptyIcon, { backgroundColor: colors.surfaceVariant }]}>
        <MaterialIcons name="receipt-long" size={responsiveValue(48, 56, 64, 72)} color={colors.primary} />
      </ResponsiveView>
      <ResponsiveView marginTop="md">
        <ResponsiveText size="lg" weight="semiBold" color={colors.text} align="center">
          No Orders Found
        </ResponsiveText>
      </ResponsiveView>
      <ResponsiveView marginTop="sm">
        <ResponsiveText size="md" color={colors.textSecondary} align="center">
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
          variant="primary"
          size="medium"
        />
      </ResponsiveView>
    </ResponsiveView>
  );

  return (
    <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]} edges={['top']}>
      {orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
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
        <ScrollView 
          style={{ flex: 1 }} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {renderHeader()}
          {renderEmptyState()}
        </ScrollView>
      )}
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
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  headerLeft: {
    flex: 1,
  },
  refreshButton: {
    padding: ResponsiveSpacing.sm,
  },
  searchSection: {
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: ResponsiveBorderRadius.md,
    paddingHorizontal: ResponsiveSpacing.md,
    paddingVertical: ResponsiveSpacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: ResponsiveSpacing.sm,
    fontSize: responsiveValue(14, 16, 18, 20),
  },
  clearButton: {
    padding: ResponsiveSpacing.xs,
  },
  summaryContainer: {
    marginBottom: ResponsiveSpacing.lg,
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    padding: ResponsiveSpacing.sm,
  },
  tabsContainer: {
    marginBottom: ResponsiveSpacing.lg,
  },
  ordersList: {
    paddingHorizontal: ResponsiveSpacing.lg,
    paddingTop: 0,
  },
  emptyState: {
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
