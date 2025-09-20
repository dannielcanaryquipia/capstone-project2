import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, ListRenderItem, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Layout from '../../../constants/Layout';
import { useTheme } from '../../../contexts/ThemeContext';

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  restaurant: string;
  status: 'Preparing' | 'On the Way' | 'Delivered' | 'Pending';
  items: OrderItem[];
  total: number;
  orderTime: string;
  deliveryTime: string;
  image: string;
};

// Mock data for orders
const orderData: Order[] = [
  {
    id: '1',
    restaurant: 'Pizza Palace',
    status: 'Preparing',
    items: [
      { name: 'Pepperoni Pizza', quantity: 1, price: 12.99 },
      { name: 'Garlic Bread', quantity: 2, price: 3.99 },
    ],
    total: 20.97,
    orderTime: '10:30 AM',
    deliveryTime: '11:30 AM',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: '2',
    restaurant: 'Burger House',
    status: 'On the Way',
    items: [
      { name: 'Classic Burger', quantity: 1, price: 8.99 },
      { name: 'French Fries', quantity: 1, price: 2.99 },
      { name: 'Soda', quantity: 1, price: 1.99 },
    ],
    total: 16.96,
    orderTime: '12:15 PM',
    deliveryTime: '1:15 PM',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: '3',
    restaurant: 'Sushi Express',
    status: 'Delivered',
    items: [
      { name: 'California Roll', quantity: 1, price: 10.99 },
      { name: 'Miso Soup', quantity: 1, price: 2.99 },
    ],
    total: 16.97,
    orderTime: 'Yesterday, 7:30 PM',
    deliveryTime: '8:30 PM',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=60',
  },
];

const statusTabs = ['All', 'Pending', 'Preparing', 'On the Way', 'Delivered'];

export default function OrdersScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');

  const filteredOrders = activeTab === 'All' 
    ? orderData 
    : orderData.filter(order => 
        order.status.toLowerCase() === activeTab.toLowerCase() ||
        (activeTab === 'On the Way' && order.status === 'On the Way') ||
        (activeTab === 'Pending' && order.status === 'Pending')
      );

  const renderOrderItem: ListRenderItem<Order> = ({ item }) => {
    const statusColors = {
      'Preparing': colors.warning,
      'On the Way': colors.info,
      'Delivered': colors.success,
      'Pending': colors.warning,
    };

    const statusIcons: Record<Order['status'], keyof typeof MaterialCommunityIcons.glyphMap> = {
      'Preparing': 'chef-hat',
      'On the Way': 'motorbike',
      'Delivered': 'check-circle',
      'Pending': 'clock-time-four',
    };

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
            <Image source={{ uri: item.image }} style={styles.restaurantImage} />
            <View>
              <Text style={[styles.restaurantName, { color: colors.text }]}>{item.restaurant}</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColors[item.status]}20` }]}>
                <MaterialCommunityIcons 
                  name={statusIcons[item.status] || 'clock'} 
                  size={14} 
                  color={statusColors[item.status]} 
                  style={styles.statusIcon} 
                />
                <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
                  {item.status}
                </Text>
              </View>
            </View>
          </View>
          <MaterialIcons name="keyboard-arrow-right" size={24} color={colors.textSecondary} />
        </View>

        <View style={styles.orderItems}>
          {item.items.map((orderItem: OrderItem, index: number) => (
            <View key={index} style={styles.orderItem}>
              <Text style={[styles.itemName, { color: colors.textSecondary }]}>
                {orderItem.quantity}x {orderItem.name}
              </Text>
              <Text style={[styles.itemPrice, { color: colors.text }]}>
                ${orderItem.price.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.timeInfo}>
            <MaterialIcons name="access-time" size={16} color={colors.textSecondary} />
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              Ordered: {item.orderTime}
            </Text>
          </View>
          <View style={styles.totalContainer}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total:</Text>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>
              ${item.total.toFixed(2)}
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

      {filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
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
});