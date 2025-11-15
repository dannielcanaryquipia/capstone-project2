import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Layout from '../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing } from '../../constants/Responsive';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useRiderOrders, useRiderProfile } from '../../hooks/useRiderProfile';
import global from '../../styles/global';
import Button from '../ui/Button';
import { ResponsiveText } from '../ui/ResponsiveText';
import { ResponsiveView } from '../ui/ResponsiveView';

interface RiderDashboardProps {
  onNavigateToOrders?: () => void;
  onNavigateToProfile?: () => void;
}

export default function RiderDashboard({ 
  onNavigateToOrders, 
  onNavigateToProfile 
}: RiderDashboardProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { unreadCount, refresh: refreshNotifications } = useNotificationContext();
  const hasUnreadNotifications = unreadCount > 0;
  
  // Use enhanced hooks
  const { 
    profile, 
    stats, 
    isLoading: profileLoading, 
    error: profileError, 
    toggleAvailability,
    refresh: refreshProfile 
  } = useRiderProfile();
  
  const { 
    assignedOrders, 
    availableOrders, 
    recentOrders, 
    deliveredOrders,
    isLoading: ordersLoading, 
    error: ordersError, 
    acceptOrder,
    refresh: refreshOrders 
  } = useRiderOrders();
  
  const loading = profileLoading || ordersLoading;
  const error = profileError || ordersError;

  // Track current date to ensure recalculation when day changes
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  });

  // Update date periodically to catch day changes
  useEffect(() => {
    const updateDate = () => {
      const today = new Date();
      const newDateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      setCurrentDate(newDateString);
    };

    // Update immediately
    updateDate();

    // Update every minute to catch day changes
    const interval = setInterval(updateDate, 60000);

    return () => clearInterval(interval);
  }, []);

  // Filter delivered orders to only show today's deliveries
  // Uses the same logic as getRiderStats for todayEarnings calculation
  const todayDeliveredOrders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return deliveredOrders.filter((assignment: any) => {
      if (!assignment.delivered_at) return false;
      
      const deliveredAt = new Date(assignment.delivered_at);
      // Match the same logic as RiderService.getRiderStats: deliveredAt >= today
      return deliveredAt >= today;
    });
  }, [deliveredOrders, currentDate]);

  // Ensure stats are loaded when component mounts
  useEffect(() => {
    if (profile?.id && !loading) {
      console.log('Dashboard: Profile loaded, stats should be available:', {
        totalDeliveries: stats.totalDeliveries,
        completedDeliveries: stats.completedDeliveries,
        totalEarnings: stats.totalEarnings,
        todayEarnings: stats.todayEarnings
      });
    }
  }, [profile?.id, loading, stats]);

  const handleNotificationPress = () => {
    refreshNotifications();
    router.push('/(delivery)/notifications' as any);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshProfile(), refreshOrders(), refreshNotifications()]);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await acceptOrder(orderId);
      Alert.alert('Success!', 'Order accepted successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to accept order');
    }
  };

  const handleToggleAvailability = async () => {
    try {
      await toggleAvailability();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update availability');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ResponsiveView marginTop="md">
          <ResponsiveText size="md" color={colors.textSecondary}>
            Loading dashboard...
          </ResponsiveText>
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <MaterialIcons name="error-outline" size={48} color={colors.error} />
        <ResponsiveView marginTop="md">
          <ResponsiveText size="lg" color={colors.error} align="center">
            Error loading dashboard
          </ResponsiveText>
        </ResponsiveView>
        <ResponsiveView marginTop="sm">
          <ResponsiveText size="md" color={colors.textSecondary} align="center">
            {error}
          </ResponsiveText>
        </ResponsiveView>
        <ResponsiveView marginTop="lg">
          <Button
            title="Retry"
            onPress={handleRefresh}
            variant="primary"
            size="medium"
          />
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <ResponsiveView padding="lg">
          {/* Header */}
          <ResponsiveView style={styles.header}>
            <ResponsiveView>
              <ResponsiveText size="lg" color={colors.textSecondary}>
                Welcome back,
              </ResponsiveText>
              <ResponsiveText size="xl" weight="bold" color={colors.text}>
                {profile?.profile?.full_name || 'Rider'}
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.notificationButton, { backgroundColor: colors.surface }]}
                onPress={handleNotificationPress}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name={hasUnreadNotifications ? 'notifications-active' : 'notifications-none'}
                  size={24}
                  color={hasUnreadNotifications ? colors.primary : colors.textSecondary}
                />
                {hasUnreadNotifications && (
                  <View style={[styles.notificationBadge, { backgroundColor: colors.error }]}>
                    <ResponsiveText size="xs" weight="bold" color={colors.textInverse}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </ResponsiveText>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.profileButton, { backgroundColor: colors.surface }]}
                onPress={onNavigateToProfile || (() => router.push('/(delivery)/profile' as any))}
              >
                <MaterialIcons name="person" size={24} color={colors.primary} />
              </TouchableOpacity>
            </ResponsiveView>
          </ResponsiveView>

          {/* Availability Toggle */}
          <ResponsiveView style={[styles.availabilityCard, { backgroundColor: colors.surface }]}>
            <ResponsiveView style={styles.availabilityHeader}>
              <MaterialIcons 
                name={profile?.is_available ? "check-circle" : "pause-circle"} 
                size={24} 
                color={profile?.is_available ? colors.success : colors.warning} 
              />
              <ResponsiveView marginLeft="sm">
                <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                  {profile?.is_available ? 'Available for Delivery' : 'Currently Unavailable'}
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  {profile?.is_available ? 'You will receive new orders' : 'You will not receive new orders'}
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
            <Button
              title={profile?.is_available ? 'Go Offline' : 'Go Online'}
              onPress={handleToggleAvailability}
              variant={profile?.is_available ? "outline" : "primary"}
              size="small"
            />
          </ResponsiveView>


          {/* Stats Cards */}
          <ResponsiveView style={styles.statsContainer}>
            <ResponsiveView style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <ResponsiveView style={styles.statHeader}>
                <MaterialIcons name="local-shipping" size={24} color={colors.primary} />
                <ResponsiveText size="sm" color={colors.textSecondary} weight="medium">
                  Delivered Today
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveText size="xxl" weight="bold" color={colors.text}>
                {todayDeliveredOrders.length || 0}
              </ResponsiveText>
              <ResponsiveText size="xs" color={colors.textSecondary}>
                ₱{((todayDeliveredOrders.length || 0) * 50).toFixed(0)} earned
              </ResponsiveText>
            </ResponsiveView>

            <ResponsiveView style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <ResponsiveView style={styles.statHeader}>
                <MaterialIcons name="pending-actions" size={24} color={colors.warning} />
                <ResponsiveText size="sm" color={colors.textSecondary} weight="medium">
                  Active Orders
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveText size="xxl" weight="bold" color={colors.text}>
                {assignedOrders.length || 0}
              </ResponsiveText>
              <ResponsiveText size="xs" color={colors.textSecondary}>
                In progress
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          <ResponsiveView style={styles.statsContainer}>
            <ResponsiveView style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <ResponsiveView style={styles.statHeader}>
                <MaterialIcons name="assignment" size={24} color={colors.info} />
                <ResponsiveText size="sm" color={colors.textSecondary} weight="medium">
                  Available Orders
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveText size="xxl" weight="bold" color={colors.text}>
                {availableOrders.filter((o: any) => (o as any).fulfillment_type === 'delivery').length || 0}
              </ResponsiveText>
              <ResponsiveText size="xs" color={colors.textSecondary}>
                Ready for delivery
              </ResponsiveText>
            </ResponsiveView>

            <ResponsiveView style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <ResponsiveView style={styles.statHeader}>
                <MaterialIcons name="attach-money" size={24} color={colors.success} />
                <ResponsiveText size="sm" color={colors.textSecondary} weight="medium">
                  Total Earnings
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveText size="xxl" weight="bold" color={colors.text}>
                ₱{(stats.totalEarnings || 0).toFixed(0)}
              </ResponsiveText>
              <ResponsiveText size="xs" color={colors.textSecondary}>
                All time
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          {/* Quick Actions */}
          <ResponsiveView style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.surface }]}
              onPress={onNavigateToOrders || (() => router.push('/(delivery)/orders' as any))}
            >
              <MaterialIcons name="assignment" size={24} color={colors.primary} />
              <ResponsiveView style={styles.actionText}>
                <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                  Manage Orders
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  View and manage delivery orders
                </ResponsiveText>
              </ResponsiveView>
              <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.surface }]}
              onPress={() => router.push('/(delivery)/orders/earnings' as any)}
            >
              <MaterialIcons name="trending-up" size={24} color={colors.success} />
              <ResponsiveView style={styles.actionText}>
                <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                  View Earnings
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Track your delivery earnings
                </ResponsiveText>
              </ResponsiveView>
              <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </ResponsiveView>

          {/* Available Orders */}
          {/* CRITICAL: Filter out pickup orders - only show delivery orders */}
          {(() => {
            const deliveryOrdersOnly = availableOrders.filter((order: any) => {
              const isDelivery = (order as any).fulfillment_type === 'delivery';
              if (!isDelivery) {
                console.warn('🚫 RiderDashboard: Filtering out pickup order from available orders:', order.id);
              }
              return isDelivery;
            });
            
            return deliveryOrdersOnly.length > 0 && (
              <ResponsiveView style={styles.section}>
                <ResponsiveView style={styles.sectionHeader}>
                  <ResponsiveView flexDirection="row" alignItems="center">
                    <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                      Available Orders
                    </ResponsiveText>
                    {deliveryOrdersOnly.some(order => {
                      const orderDate = new Date(order.created_at);
                      const now = new Date();
                      const minutesAgo = (now.getTime() - orderDate.getTime()) / (1000 * 60);
                      return minutesAgo <= 10;
                    }) && (
                      <ResponsiveView 
                        style={[styles.newIndicator, { backgroundColor: colors.primary }]}
                        marginLeft="xs"
                      >
                        <MaterialIcons name="fiber-new" size={16} color={colors.textInverse} />
                      </ResponsiveView>
                    )}
                  </ResponsiveView>
                  <Button
                    title="View All"
                    onPress={onNavigateToOrders || (() => router.push('/(delivery)/orders' as any))}
                    variant="text"
                    size="small"
                  />
                </ResponsiveView>

                <ResponsiveView style={styles.ordersList}>
                  {deliveryOrdersOnly.slice(0, 3).map((order) => {
                  // Check if order is new (created in last 10 minutes)
                  const orderDate = new Date(order.created_at);
                  const now = new Date();
                  const minutesAgo = (now.getTime() - orderDate.getTime()) / (1000 * 60);
                  const isNewOrder = minutesAgo <= 10;
                  
                  return (
                    <TouchableOpacity
                      key={order.id}
                      style={[
                        styles.orderCard, 
                        { backgroundColor: colors.surface },
                        isNewOrder && { borderWidth: 2, borderColor: colors.primary }
                      ]}
                      onPress={() => handleAcceptOrder(order.id)}
                    >
                      <ResponsiveView style={styles.orderHeader}>
                        <ResponsiveView flexDirection="row" alignItems="center" flex={1}>
                          <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                            {order.order_number || `#${order.id.slice(-6).toUpperCase()}`}
                          </ResponsiveText>
                          {isNewOrder && (
                            <ResponsiveView 
                              style={[styles.newBadge, { backgroundColor: colors.primary }]}
                              marginLeft="xs"
                            >
                              <ResponsiveText size="xs" color={colors.textInverse} weight="bold">
                                NEW
                              </ResponsiveText>
                            </ResponsiveView>
                          )}
                        </ResponsiveView>
                        <ResponsiveView style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
                          <MaterialIcons name="schedule" size={14} color={colors.primary} />
                          <ResponsiveView marginLeft="xs">
                            <ResponsiveText size="xs" color={colors.primary} weight="medium">
                              AVAILABLE
                            </ResponsiveText>
                          </ResponsiveView>
                        </ResponsiveView>
                      </ResponsiveView>
                       <ResponsiveText size="sm" color={colors.textSecondary}>
                         {(order as any).customer?.full_name || 'Customer'}
                       </ResponsiveText>
                      <ResponsiveText size="sm" color={colors.textSecondary}>
                        ₱{order.total_amount?.toFixed(2) || '0.00'}
                      </ResponsiveText>
                      <ResponsiveView marginTop="sm">
                        <Button
                          title="Accept Order"
                          onPress={() => handleAcceptOrder(order.id)}
                          variant="primary"
                          size="small"
                        />
                        </ResponsiveView>
                      </TouchableOpacity>
                    );
                  })}
                </ResponsiveView>
              </ResponsiveView>
            );
          })()}

          {/* My Orders (Assigned Orders) */}
          {assignedOrders.length > 0 && (
            <ResponsiveView style={styles.section}>
              <ResponsiveView style={styles.sectionHeader}>
                <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                  My Orders
                </ResponsiveText>
                <Button
                  title="View All"
                  onPress={onNavigateToOrders || (() => router.push('/(delivery)/orders' as any))}
                  variant="text"
                  size="small"
                />
              </ResponsiveView>

              <ResponsiveView style={styles.ordersList}>
                {assignedOrders.slice(0, 3).map((assignment) => (
                  <TouchableOpacity
                    key={assignment.id}
                    style={[styles.orderCard, { backgroundColor: colors.surface }]}
                    onPress={() => router.push(`/(delivery)/order/${assignment.order_id}` as any)}
                  >
                    <ResponsiveView style={styles.orderHeader}>
                      <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                        {assignment.order?.order_number || `#${assignment.order_id.slice(-6).toUpperCase()}`}
                      </ResponsiveText>
                      <ResponsiveView style={[styles.statusBadge, { 
                        backgroundColor: assignment.status === 'Delivered' ? colors.success + '20' : 
                                       assignment.status === 'Picked Up' ? colors.warning + '20' : colors.primary + '20' 
                      }]}>
                        <ResponsiveText size="xs" color={
                          assignment.status === 'Delivered' ? colors.success : 
                          assignment.status === 'Picked Up' ? colors.warning : colors.primary
                        } weight="medium">
                          {assignment.status?.toUpperCase()}
                        </ResponsiveText>
                      </ResponsiveView>
                    </ResponsiveView>
                     <ResponsiveText size="sm" color={colors.textSecondary}>
                       {(assignment.order as any)?.customer?.full_name || 'Customer'}
                     </ResponsiveText>
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      ₱{assignment.order?.total_amount?.toFixed(2) || '0.00'}
                    </ResponsiveText>
                  </TouchableOpacity>
                ))}
              </ResponsiveView>
            </ResponsiveView>
          )}

          {/* Recent Orders */}
          {recentOrders.length > 0 && (
            <ResponsiveView style={styles.section}>
              <ResponsiveView style={styles.sectionHeader}>
                <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                  Recent Orders
                </ResponsiveText>
                <Button
                  title="View All"
                  onPress={onNavigateToOrders || (() => router.push('/(delivery)/orders' as any))}
                  variant="text"
                  size="small"
                />
              </ResponsiveView>

              <ResponsiveView style={styles.ordersList}>
                {recentOrders.slice(0, 3).map((assignment) => (
                  <TouchableOpacity
                    key={assignment.id}
                    style={[styles.orderCard, { backgroundColor: colors.surface }]}
                    onPress={() => router.push(`/(delivery)/order/${assignment.order_id}` as any)}
                  >
                    <ResponsiveView style={styles.orderHeader}>
                      <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                        {assignment.order?.order_number || `#${assignment.order_id.slice(-6).toUpperCase()}`}
                      </ResponsiveText>
                      <ResponsiveView style={[styles.statusBadge, { 
                        backgroundColor: assignment.status === 'Delivered' ? colors.success + '20' : colors.primary + '20' 
                      }]}>
                        <ResponsiveText size="xs" color={assignment.status === 'Delivered' ? colors.success : colors.primary} weight="medium">
                          {assignment.status?.toUpperCase()}
                        </ResponsiveText>
                      </ResponsiveView>
                    </ResponsiveView>
                     <ResponsiveText size="sm" color={colors.textSecondary}>
                       {(assignment.order as any)?.customer?.full_name || 'Customer'}
                     </ResponsiveText>
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      ₱{assignment.order?.total_amount?.toFixed(2) || '0.00'}
                    </ResponsiveText>
                  </TouchableOpacity>
                ))}
              </ResponsiveView>
            </ResponsiveView>
          )}

          {/* Empty State */}
          {availableOrders.length === 0 && recentOrders.length === 0 && (
            <ResponsiveView style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <MaterialIcons name="assignment" size={48} color={colors.textSecondary} />
              <ResponsiveView marginTop="md">
                <ResponsiveText size="md" color={colors.textSecondary} align="center">
                  No orders available
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveView marginTop="sm">
                <ResponsiveText size="sm" color={colors.textSecondary} align="center">
                  Check back later for new delivery opportunities
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          )}
        </ResponsiveView>
      </ScrollView>
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
    marginBottom: ResponsiveSpacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ResponsiveSpacing.sm,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Layout.shadows.sm,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Layout.shadows.sm,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  availabilityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.lg,
    marginBottom: ResponsiveSpacing.lg,
    ...Layout.shadows.sm,
  },
  availabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: ResponsiveSpacing.md,
    marginBottom: ResponsiveSpacing.lg,
  },
  statCard: {
    flex: 1,
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.sm,
  },
  actionsContainer: {
    marginBottom: ResponsiveSpacing.lg,
    gap: ResponsiveSpacing.sm,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  actionText: {
    flex: 1,
    marginLeft: ResponsiveSpacing.md,
  },
  section: {
    marginBottom: ResponsiveSpacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.md,
  },
  ordersList: {
    gap: ResponsiveSpacing.sm,
  },
  orderCard: {
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ResponsiveSpacing.sm,
    paddingVertical: ResponsiveSpacing.xs,
    borderRadius: ResponsiveBorderRadius.sm,
  },
  newBadge: {
    paddingHorizontal: ResponsiveSpacing.xs,
    paddingVertical: 2,
    borderRadius: ResponsiveBorderRadius.xs,
  },
  newIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: ResponsiveSpacing.xl,
    borderRadius: ResponsiveBorderRadius.lg,
    alignItems: 'center',
    ...Layout.shadows.sm,
  },
});
