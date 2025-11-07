import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAlert } from '../../components/ui/AlertProvider';
import Layout from '../../constants/Layout';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Notification } from '../../lib/database.types';
import { useAuth } from '../../hooks/useAuth';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'order_update':
      return 'shopping-cart';
    case 'payment':
      return 'payment';
    case 'delivery':
      return 'delivery-dining';
    case 'system':
      return 'notifications';
    default:
      return 'notifications';
  }
};

const getNotificationColor = (type: string, isDark: boolean) => {
  // In light mode: black icons, in dark mode: yellow icons
  if (isDark) {
    return '#FFD700'; // Yellow for dark mode
  } else {
    return '#000000'; // Black for light mode
  }
};

const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const notificationDate = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

export default function NotificationScreen() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
  } = useNotificationContext();
  const { colors, isDark } = useTheme();
  const { confirm } = useAlert();
  const router = useRouter();
  const { isAdmin, isDelivery } = useAuth();
  const lastRefreshTime = useRef<number>(0);

  // Helper function to determine the route based on notification type and user role
  const getNotificationRoute = useCallback((notification: Notification): string | null => {
    // If notification has a related order ID, route to order details
    if (notification.related_order_id) {
      if (isAdmin) {
        return `/(admin)/orders/${notification.related_order_id}`;
      } else if (isDelivery) {
        return `/(delivery)/order/${notification.related_order_id}`;
      } else {
        // Customer route
        return `/(customer)/orders/${notification.related_order_id}`;
      }
    }

    // For other notification types, you can add more routing logic here
    // For example:
    // - Payment notifications might route to payment history
    // - System notifications might not route anywhere
    
    return null;
  }, [isAdmin, isDelivery]);

  const handleNotificationPress = useCallback(async (notification: Notification) => {
    // Mark as read first
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate to the appropriate page based on notification type
    const route = getNotificationRoute(notification);
    if (route) {
      router.push(route as any);
    }
  }, [markAsRead, getNotificationRoute, router]);

  const handleMarkAllAsRead = useCallback(async () => {
    if (unreadCount > 0) {
      confirm(
        'Mark All as Read',
        'Are you sure you want to mark all notifications as read?',
        markAllAsRead,
        undefined,
        'Mark All',
        'Cancel'
      );
    }
  }, [unreadCount, markAllAsRead, confirm]);

  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  // Refresh notifications when screen comes into focus
  // This ensures the notification list is up-to-date when user opens the notification page
  // Use a ref to prevent rapid successive refreshes (minimum 2 seconds between refreshes)
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefreshTime.current;
      const MIN_REFRESH_INTERVAL = 2000; // 2 seconds

      if (!isLoading && timeSinceLastRefresh >= MIN_REFRESH_INTERVAL) {
        console.log('📱 Notification screen focused, refreshing notifications...');
        lastRefreshTime.current = now;
        refresh();
      } else {
        console.log('📱 Notification screen focused, skipping refresh (too soon or already loading)');
      }
    }, [refresh, isLoading])
  );


  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Error Loading Notifications</Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={handleRefresh}>
            <Text style={[styles.retryButtonText, { color: colors.textInverse }]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Back Button and Mark All button */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.backButton, { backgroundColor: colors.surfaceVariant }]}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        </View>
        <View style={styles.headerRight}>
          {notifications.length > 0 && unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead} style={[styles.markAllButton, { backgroundColor: colors.primary }]}>
              <Text style={[styles.markAllButtonText, { color: colors.textInverse }]}>Mark All Read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Unread Count Info */}
      {notifications.length > 0 && unreadCount > 0 && (
        <View style={[styles.unreadInfo, { backgroundColor: colors.primaryLight + '20' }]}>
          <Text style={[styles.unreadInfoText, { color: colors.primary }]}>
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Notifications List or Empty State */}
      {notifications.length > 0 ? (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {notifications.map((notification) => (
            <TouchableOpacity 
              key={notification.id} 
              style={[
                styles.notificationItem,
                { backgroundColor: colors.surface, borderBottomColor: colors.border },
                !notification.is_read && { backgroundColor: colors.primaryLight + '10' }
              ]}
              onPress={() => handleNotificationPress(notification)}
              activeOpacity={0.7}
            >
              <View style={[styles.notificationIcon, { backgroundColor: colors.background }]}>
                <MaterialIcons 
                  name={getNotificationIcon(notification.type)} 
                  size={24} 
                  color={getNotificationColor(notification.type, isDark)} 
                />
              </View>
              <View style={styles.notificationContent}>
                <Text style={[
                  styles.notificationTitle,
                  { color: colors.text },
                  !notification.is_read && styles.unreadTitle
                ]}>
                  {notification.title}
                </Text>
                <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
                  {notification.message}
                </Text>
                <Text style={[styles.notificationTime, { color: colors.textTertiary }]}>
                  {formatTimeAgo(notification.created_at)}
                </Text>
              </View>
              {!notification.is_read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <EmptyState
          fullScreen
          size="medium"
          icon="notifications-none"
          title="No Notifications"
          description="You're all caught up! We'll notify you when something new happens."
          showAction
          actionTitle="Refresh"
          onActionPress={handleRefresh}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Layout.fontFamily.bold,
    fontWeight: 'bold',
  },
  unreadInfo: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  unreadInfoText: {
    fontSize: 14,
    fontFamily: Layout.fontFamily.medium,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  markAllButtonText: {
    fontSize: 12,
    fontFamily: Layout.fontFamily.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: Layout.fontFamily.regular,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: Layout.fontFamily.bold,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: Layout.fontFamily.regular,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: Layout.fontFamily.semiBold,
  },
  content: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    marginBottom: 4,
  },
  unreadTitle: {
    fontFamily: Layout.fontFamily.bold,
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: Layout.fontFamily.regular,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: Layout.fontFamily.regular,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    fontFamily: Layout.fontFamily.regular,
    textAlign: 'center',
    lineHeight: 24,
  },
});