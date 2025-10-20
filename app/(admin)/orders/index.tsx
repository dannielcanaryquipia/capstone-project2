import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { AdminLayout, AdminSection } from '../../../components/admin';
import Button from '../../../components/ui/Button';
import { LoadingState } from '../../../components/ui/LoadingState';
import { OrderCard } from '../../../components/ui/OrderCard';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import type { TabItem } from '../../../components/ui/TabBar';
import Layout from '../../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../../../constants/Responsive';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAdminOrders } from '../../../hooks';
import { OrderService } from '../../../services/order.service';
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
  // Search removed to avoid redundancy with dashboard summary

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

  // Order counts removed to declutter page (shown on dashboard)

  // Build tabs with counts to match design
  const statusTabs = [
    { key: 'all', label: 'All', color: colors.textSecondary },
    { key: 'pending', label: 'Pending', color: colors.warning },
    { key: 'confirmed', label: 'Confirmed', color: colors.info },
    { key: 'preparing', label: 'Preparing', color: colors.accent },
    { key: 'ready_for_pickup', label: 'Ready', color: colors.primary },
    { key: 'out_for_delivery', label: 'Out for Delivery', color: colors.secondary },
    { key: 'delivered', label: 'Delivered', color: colors.success },
    { key: 'cancelled', label: 'Cancelled', color: colors.error },
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
    // Enforce role-based action policy for Admin:
    // - COD: no actions in admin (verification and delivered handled by rider)
    // - GCash: require payment verification before allowing status transitions
    // - Admin never marks as delivered (that happens on rider app)
    const paymentMethod = (item.payment_method as any)?.toLowerCase?.() || '';
    const paymentStatus = (item.payment_status as any)?.toLowerCase?.() || '';
    const isCOD = paymentMethod === 'cod';
    const isGCash = paymentMethod === 'gcash';
    const isPaymentVerified = paymentStatus === 'verified';

    // Debug logging for GCash orders
    if (isGCash) {
      console.log('GCash order in admin list:', {
        id: item.id,
        payment_method: item.payment_method,
        payment_status: item.payment_status,
        proof_of_payment_url: (item as any).proof_of_payment_url,
        status: item.status
      });
    }

    let nextStatus = getNextStatus(item.status);

    // Block admin from transitioning to Delivered
    if (nextStatus === 'delivered') {
      nextStatus = null;
    }

    // Block all actions for COD in admin
    if (isCOD) {
      nextStatus = null;
    }

    // For GCash, require payment verification before any transitions
    if (isGCash && !isPaymentVerified) {
      nextStatus = null;
    }

    const showAction = !!nextStatus;

    return (
      <OrderCard
        order={item}
        onPress={() => router.push(`/(admin)/orders/${item.id}` as any)}
        showCustomerInfo={true}
        showDeliveryInfo={true}
        showActionButton={showAction}
        actionButtonTitle={nextStatus ? `Mark as ${nextStatus.replace('_', ' ')}` : undefined}
        onActionPress={nextStatus ? () => handleStatusUpdate(item.id, nextStatus as OrderStatus) : undefined}
        actionButtonLoading={updatingOrder === item.id}
        actionButtonDisabled={updatingOrder === item.id}
        variant="detailed"
      />
    );
  };

  if (loading) {
    return (
      <AdminLayout
        title="Order Management"
        subtitle="Loading..."
        showBackButton={true}
        onBackPress={() => router.replace('/(admin)/dashboard')}
        backgroundColor={colors.background}
      >
        <ResponsiveView style={styles.center}>
          <LoadingState 
            message={Strings.loading} 
            fullScreen 
          />
        </ResponsiveView>
      </AdminLayout>
    );
  }

  const renderStatusFilter = () => (
    <ResponsiveView marginBottom="sm">
      <FlatList
        data={statusTabs}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: ResponsiveSpacing.md }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryItem,
              {
                backgroundColor: activeTab === item.key ? colors.primary : 'transparent',
                borderColor: activeTab === item.key ? colors.primary : colors.border,
                borderWidth: 1,
              },
              activeTab === item.key && styles.categoryItemActive,
            ]}
            onPress={() => setActiveTab(item.key as OrderStatus | 'all')}
          >
            <ResponsiveText
              size="sm"
              color={activeTab === item.key ? 'white' : colors.text}
              weight={activeTab === item.key ? 'semiBold' : 'regular'}
              style={{ textAlign: 'center', lineHeight: undefined }}
            >
              {item.label}
            </ResponsiveText>
          </TouchableOpacity>
        )}
      />
    </ResponsiveView>
  );

  const renderEmptyState = () => (
    <AdminSection title="No Orders Found" variant="card">
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
    </AdminSection>
  );

  return (
    <AdminLayout
      title="Order Management"
      subtitle="View and manage customer orders"
      showBackButton={true}
      onBackPress={() => router.replace('/(admin)/dashboard')}
      headerActions={
        <Button
          title=""
          onPress={handleRefresh}
          variant="text"
          icon={<MaterialIcons name="refresh" size={24} color={colors.primary} />}
          style={styles.refreshButton}
        />
      }
      backgroundColor={colors.background}
    >
      {renderStatusFilter()}
      
      {orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
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
          {renderEmptyState()}
        </ScrollView>
      )}
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    padding: ResponsiveSpacing.sm,
  },
  tabsList: {
    paddingHorizontal: ResponsiveSpacing.md,
    gap: ResponsiveSpacing.sm,
  },
  statusPill: {
    marginRight: ResponsiveSpacing.sm,
  },
  ordersList: {
    paddingHorizontal: ResponsiveSpacing.lg,
    paddingTop: 0,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: ResponsiveSpacing.xxxl,
    paddingHorizontal: ResponsiveSpacing.lg,
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
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsiveValue(12, 14, 16, 18),
    paddingVertical: responsiveValue(6, 8, 10, 12),
    borderRadius: responsiveValue(16, 18, 20, 22),
    marginRight: responsiveValue(6, 8, 10, 12),
    minWidth: responsiveValue(72, 80, 88, 100),
    minHeight: responsiveValue(36, 40, 44, 48),
  },
  categoryItemActive: {
    shadowColor: '#FFE44D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 0,
  },
});
