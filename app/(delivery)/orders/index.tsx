import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import { LoadingState } from '../../../components/ui/LoadingState';
import { OrderCard } from '../../../components/ui/OrderCard';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import type { TabItem } from '../../../components/ui/TabBar';
import Layout from '../../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../../../constants/Responsive';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAdminOrders } from '../../../hooks';
import global from '../../../styles/global';
import { Order, OrderStatus } from '../../../types/order.types';

export default function OrdersScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Filter tabs for delivery: out_for_delivery, delivered, cancelled
  const statusTabs: TabItem[] = [
    { key: 'all', label: 'All', color: colors.textSecondary },
    { key: 'out_for_delivery', label: 'Out for Delivery', color: colors.secondary },
    { key: 'delivered', label: 'Delivered', color: colors.success },
    { key: 'cancelled', label: 'Cancelled', color: colors.error },
  ];

  // Use admin orders hook with status filter
  const { 
    orders, 
    isLoading: loading, 
    error, 
    refresh 
  } = useAdminOrders(
    activeTab !== 'all' ? { status: [activeTab] } : { status: ['out_for_delivery', 'delivered', 'cancelled'] }
  );

  // Filter out pickup orders - riders should only see delivery orders
  const deliveryOrders = useMemo(() => {
    return orders.filter(order => order.fulfillment_type === 'delivery');
  }, [orders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    return (
      <OrderCard
        order={item}
        onPress={() => router.push(`/(delivery)/order/${item.id}` as any)}
        showCustomerInfo={true}
        showDeliveryInfo={true}
        variant="detailed"
      />
    );
  };

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
            ? 'No delivery orders available.'
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

  if (loading) {
    return (
      <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={{ flex: 1 }}>
          <ResponsiveView padding="lg">
            <ResponsiveView style={[styles.header, { backgroundColor: colors.surface }]}>
              <ResponsiveView style={styles.headerLeft}>
                <Button
                  title=""
                  onPress={() => router.back()}
                  variant="text"
                  icon={<MaterialIcons name="arrow-back" size={24} color={colors.primary} />}
                />
                <ResponsiveView marginLeft="md">
                  <ResponsiveText size="xl" weight="bold" color={colors.text}>
                    Delivery Orders
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            </ResponsiveView>
            <ResponsiveView style={styles.center}>
              <LoadingState 
                message="Loading orders..." 
                fullScreen={false} 
              />
            </ResponsiveView>
          </ResponsiveView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={{ flex: 1 }}>
        <ResponsiveView padding="lg">
          {/* Header */}
          <ResponsiveView style={[styles.header, { backgroundColor: colors.surface }]}>
            <ResponsiveView style={styles.headerLeft}>
              <Button
                title=""
                onPress={() => router.back()}
                variant="text"
                icon={<MaterialIcons name="arrow-back" size={24} color={colors.primary} />}
              />
              <ResponsiveView marginLeft="md">
                <ResponsiveText size="xl" weight="bold" color={colors.text}>
                  Delivery Orders
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          </ResponsiveView>

          {/* Status Filter */}
          {renderStatusFilter()}

          {/* Orders List */}
          {deliveryOrders.length > 0 ? (
            <FlatList
              data={deliveryOrders}
              renderItem={renderOrderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[
                styles.ordersList,
                { paddingBottom: insets.bottom + ResponsiveSpacing.md }
              ]}
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
              contentContainerStyle={{ paddingBottom: insets.bottom + ResponsiveSpacing.md }}
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
        </ResponsiveView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.lg,
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ordersList: {
    paddingHorizontal: ResponsiveSpacing.md,
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
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 0,
  },
});