import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

// Sample notification data
const notifications = [
  {
    id: '1',
    title: 'Order Confirmed',
    message: 'Your order #12345 has been confirmed and is being prepared.',
    time: '2 minutes ago',
    type: 'order',
    isRead: false,
  },
  {
    id: '2',
    title: 'Special Offer',
    message: 'Get 30% off on your next order! Use code WELCOME30',
    time: '1 hour ago',
    type: 'offer',
    isRead: false,
  },
  {
    id: '3',
    title: 'Order Delivered',
    message: 'Your order #12340 has been delivered successfully.',
    time: '3 hours ago',
    type: 'delivery',
    isRead: true,
  },
  {
    id: '4',
    title: 'New Menu Item',
    message: 'Check out our new Margherita Pizza! Available now.',
    time: '1 day ago',
    type: 'menu',
    isRead: true,
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'order':
      return 'shopping-cart';
    case 'offer':
      return 'local-offer';
    case 'delivery':
      return 'delivery-dining';
    case 'menu':
      return 'restaurant-menu';
    default:
      return 'notifications';
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'order':
      return Colors.primaryLight;
    case 'offer':
      return Colors.secondary;
    case 'delivery':
      return Colors.success;
    case 'menu':
      return Colors.accent;
    default:
      return Colors.textSecondary;
  }
};

export default function NotificationScreen() {

  return (
    <SafeAreaView style={styles.container}>

      {/* Notifications List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => (
          <TouchableOpacity 
            key={notification.id} 
            style={[
              styles.notificationItem,
              !notification.isRead && styles.unreadNotification
            ]}
          >
            <View style={styles.notificationIcon}>
              <MaterialIcons 
                name={getNotificationIcon(notification.type)} 
                size={24} 
                color={getNotificationColor(notification.type)} 
              />
            </View>
            <View style={styles.notificationContent}>
              <Text style={[
                styles.notificationTitle,
                !notification.isRead && styles.unreadTitle
              ]}>
                {notification.title}
              </Text>
              <Text style={styles.notificationMessage}>
                {notification.message}
              </Text>
              <Text style={styles.notificationTime}>
                {notification.time}
              </Text>
            </View>
            {!notification.isRead && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Empty State (if no notifications) */}
      {notifications.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialIcons name="notifications-none" size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyMessage}>
            You're all caught up! We'll notify you when something new happens.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  unreadNotification: {
    backgroundColor: Colors.primaryLight + '05', // Very light yellow background
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: Layout.fontFamily.semiBold,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  unreadTitle: {
    fontFamily: Layout.fontFamily.bold,
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: Layout.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: Layout.fontFamily.regular,
    color: Colors.textTertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryLight,
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: Layout.fontFamily.bold,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    fontFamily: Layout.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});