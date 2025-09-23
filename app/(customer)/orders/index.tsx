import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Image, ListRenderItem, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import Layout from '../../../constants/Layout';
import { useTheme } from '../../../contexts/ThemeContext';
import { useOrders } from '../../../hooks/useOrders';
import { Order, OrderStatus } from '../../../types/order.types';

// Status mapping for display
const statusTabs = ['All', 'Pending', 'Preparing', 'On the Way', 'Delivered'];

// Helper function to format order status for display
const formatOrderStatus = (status: OrderStatus): string => {
  const statusMap: Record<OrderStatus, string> = {
    'pending': 'Pending',
    'confirmed': 'Preparing',
    'preparing': 'Preparing',
    'ready_for_pickup': 'Preparing',
    'out_for_delivery': 'On the Way',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };
  return statusMap[status] || status;
};

// Helper function to get status color
const getStatusColor = (status: OrderStatus, colors: any): string => {
  const colorMap: Record<OrderStatus, string> = {
    'pending': colors.warning,
    'confirmed': colors.warning,
    'preparing': colors.warning,
    'ready_for_pickup': colors.warning,
    'out_for_delivery': colors.info,
    'delivered': colors.success,
    'cancelled': colors.error
  };
  return colorMap[status] || colors.textSecondary;
};

// Helper function to get status icon
const getStatusIcon = (status: OrderStatus): keyof typeof MaterialCommunityIcons.glyphMap => {
  const iconMap: Record<OrderStatus, keyof typeof MaterialCommunityIcons.glyphMap> = {
    'pending': 'clock-time-four',
    'confirmed': 'chef-hat',
    'preparing': 'chef-hat',
    'ready_for_pickup': 'chef-hat',
    'out_for_delivery': 'motorbike',
    'delivered': 'check-circle',
    'cancelled': 'close-circle'
  };
  return iconMap[status] || 'clock-time-four';
};

// Helper function to format date
const formatOrderDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } else if (diffInHours < 48) {
    return `Yesterday, ${date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
};

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

  const renderOrderItem: ListRenderItem<Order> = ({ item }) => {
    const displayStatus = formatOrderStatus(item.status);
    const statusColor = getStatusColor(item.status, colors);
    const statusIcon = getStatusIcon(item.status);
    const orderTime = formatOrderDate(item.created_at);
    
    // Get the first item's image or use a default
    const firstItem = item.items?.[0];
    const orderImage = firstItem?.product_image || 'https://via.placeholder.com/200x150';
    
    // Get restaurant name from the first item or use a default
    const restaurantName = firstItem?.product_name?.split(' ')[0] + ' Restaurant' || 'Restaurant';

    return (
      <TouchableOpacity 
        style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push({
          pathname: '/orders/[id]',
          params: { id: item.id }
        } as any)}
      >
        <View style={styles.orderHeader}>
          <View style={styles.restaurantInfo}>
            <Image source={{ uri: orderImage }} style={styles.restaurantImage} />
            <View>
              <Text style={[styles.restaurantName, { color: colors.text }]}>{restaurantName}</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                <MaterialCommunityIcons 
                  name={statusIcon} 
                  size={14} 
                  color={statusColor} 
                  style={styles.statusIcon} 
                />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {displayStatus}
                </Text>
              </View>
            </View>
          </View>
          <MaterialIcons name="keyboard-arrow-right" size={24} color={colors.textSecondary} />
        </View>

        <View style={styles.orderItems}>
          {item.items?.map((orderItem, index: number) => (
            <View key={index} style={styles.orderItem}>
              <Text style={[styles.itemName, { color: colors.textSecondary }]}>
                {orderItem.quantity}x {orderItem.product_name}
              </Text>
              <Text style={[styles.itemPrice, { color: colors.text }]}>
                ₱{orderItem.unit_price.toFixed(2)}
              </Text>
            </View>
          )) || (
            <Text style={[styles.itemName, { color: colors.textSecondary }]}>
              No items found
            </Text>
          )}
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.timeInfo}>
            <MaterialIcons name="access-time" size={16} color={colors.textSecondary} />
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              Ordered: {orderTime}
            </Text>
          </View>
          <View style={styles.totalContainer}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total:</Text>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>
              ₱{item.total_amount.toFixed(2)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Orders</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {statusTabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { 
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              },
              activeTab !== tab && { borderColor: colors.border },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text 
              style={[
                styles.tabText, 
                { 
                  color: activeTab === tab ? colors.background : colors.textSecondary,
                }
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.loadingState}>
          <MaterialCommunityIcons 
            name="loading" 
            size={48} 
            color={colors.primary} 
          />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading your orders...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorState}>
          <MaterialCommunityIcons 
            name="alert-circle" 
            size={48} 
            color={colors.error} 
          />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Error Loading Orders</Text>
          <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>
            {error}
          </Text>
          <Button title="Try Again" onPress={refresh} fullWidth />
        </View>
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
        <View style={styles.emptyContainer}>
          <MaterialIcons name="receipt-long" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No {activeTab.toLowerCase() === 'all' ? 'orders' : activeTab.toLowerCase()} found
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: Layout.fontWeight.medium,
    fontFamily: Layout.fontFamily.medium,
  },
  ordersList: {
    padding: 16,
  },
  orderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  restaurantImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: Layout.fontWeight.semiBold,
    fontFamily: Layout.fontFamily.semiBold,
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: Layout.fontWeight.medium,
    fontFamily: Layout.fontFamily.medium,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 14,
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: Layout.fontWeight.medium,
    fontFamily: Layout.fontFamily.medium,
    marginLeft: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    marginLeft: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorSubtitle: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});