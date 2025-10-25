import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { OrderCard } from '../../../components/ui/OrderCard';
import { TabBar, TabItem } from '../../../components/ui/TabBar';
import Layout from '../../../constants/Layout';
import { useTheme } from '../../../contexts/ThemeContext';
import { useOrders } from '../../../hooks/useOrders';
import { Order, OrderStatus } from '../../../types/order.types';

// Helper functions for dynamic empty state messages
const getEmptyStateTitle = (activeTab: string): string => {
  switch (activeTab) {
    case 'All':
      return 'No Orders Found';
    case 'Pending':
      return 'No Pending Orders';
    case 'Preparing':
      return 'No Orders Being Prepared';
    case 'On the Way':
      return 'No Orders On the Way';
    case 'Delivered':
      return 'No Delivered Orders';
    default:
      return 'No Orders Found';
  }
};

const getEmptyStateDescription = (activeTab: string): string => {
  switch (activeTab) {
    case 'All':
      return 'You haven\'t placed any orders yet. Start ordering your favorite dishes!';
    case 'Pending':
      return 'No orders are currently pending. Your new orders will appear here.';
    case 'Preparing':
      return 'No orders are being prepared right now. Check back when you place an order!';
    case 'On the Way':
      return 'No orders are currently on the way. Your prepared orders will appear here.';
    case 'Delivered':
      return 'You haven\'t received any orders yet. Your completed orders will appear here.';
    default:
      return 'Your orders will appear here once you place them.';
  }
};

// Status tabs configuration
const statusTabs: TabItem[] = [
  { key: 'All', label: 'All' },
  { key: 'Pending', label: 'Pending' },
  { key: 'Preparing', label: 'Preparing' },
  { key: 'On the Way', label: 'On the Way' },
  { key: 'Delivered', label: 'Delivered' },
];

export default function OrdersScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('All');

  // Map UI tab to backend status filter
  const statusFilter = useMemo((): OrderStatus[] | undefined => {
    switch (activeTab) {
      case 'Pending':
        return ['pending'];
      case 'Preparing':
        return ['confirmed', 'preparing', 'ready_for_pickup'];
      case 'On the Way':
        return ['out_for_delivery'];
      case 'Delivered':
        return ['delivered'];
      default:
        return undefined;
    }
  }, [activeTab]);

  // Fetch orders from the backend with status filter
  const { orders, isLoading, error, refresh } = useOrders(
    statusFilter ? { status: statusFilter } : undefined
  );

  // Orders are already filtered in the backend by status
  const filteredOrders = orders;

  const handleProductPress = (productId: string) => {
    router.push({
      pathname: '/(customer)/product/[id]',
      params: { id: productId }
    } as any);
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <OrderCard
      order={item}
      onPress={() => {
        console.log('Order pressed:', item.id, item.order_number);
        router.push({
          pathname: '/(customer)/orders/[id]',
          params: { id: item.id }
        } as any);
      }}
      onProductPress={handleProductPress}
      variant="default"
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      <TabBar
        tabs={statusTabs}
        activeTab={activeTab}
        onTabPress={setActiveTab}
        horizontal
        showScrollIndicator={false}
        variant="pills"
      />

      {isLoading ? (
        <LoadingState 
          message="Loading your orders..." 
          fullScreen 
        />
      ) : error ? (
        <ErrorState
          title="Error Loading Orders"
          message={error}
          actionTitle="Try Again"
          onActionPress={refresh}
          fullScreen
        />
      ) : filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      ) : (
        <EmptyState
          icon="receipt-long"
          title={getEmptyStateTitle(activeTab)}
          description={getEmptyStateDescription(activeTab)}
          showAction={false}
          fullScreen
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.lg,
    paddingBottom: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  backButton: {
    padding: Layout.spacing.sm,
    marginRight: Layout.spacing.sm,
  },
  ordersList: {
    padding: Layout.spacing.lg,
  },
});