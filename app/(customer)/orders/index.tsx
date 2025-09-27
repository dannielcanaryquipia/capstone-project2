import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { OrderCard } from '../../../components/ui/OrderCard';
import { TabBar, TabItem } from '../../../components/ui/TabBar';
import Layout from '../../../constants/Layout';
import { useTheme } from '../../../contexts/ThemeContext';
import { useOrders } from '../../../hooks/useOrders';
import { Order, OrderStatus } from '../../../types/order.types';

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Orders</Text>
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
          title={`No ${activeTab.toLowerCase() === 'all' ? 'orders' : activeTab.toLowerCase()} found`}
          description="Your orders will appear here once you place them"
          showAction={false}
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
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: Layout.spacing.sm,
  },
  ordersList: {
    padding: Layout.spacing.lg,
  },
});