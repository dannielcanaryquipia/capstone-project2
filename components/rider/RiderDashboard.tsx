import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Layout from '../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing } from '../../constants/Responsive';
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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshProfile(), refreshOrders()]);
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
            <TouchableOpacity
              style={[styles.profileButton, { backgroundColor: colors.surface }]}
              onPress={onNavigateToProfile || (() => router.push('/(delivery)/profile' as any))}
            >
              <MaterialIcons name="person" size={24} color={colors.primary} />
            </TouchableOpacity>
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
                {deliveredOrders.length || 0}
              </ResponsiveText>
              <ResponsiveText size="xs" color={colors.textSecondary}>
                ₱{((deliveredOrders.length || 0) * 50).toFixed(0)} earned
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
                {availableOrders.length || 0}
              </ResponsiveText>
              <ResponsiveText size="xs" color={colors.textSecondary}>
                Ready for pickup
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
                ₱{((deliveredOrders.length || 0) * 50).toFixed(0)}
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
          {availableOrders.length > 0 && (
            <ResponsiveView style={styles.section}>
              <ResponsiveView style={styles.sectionHeader}>
                <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                  Available Orders
                </ResponsiveText>
                <Button
                  title="View All"
                  onPress={onNavigateToOrders || (() => router.push('/(delivery)/orders' as any))}
                  variant="text"
                  size="small"
                />
              </ResponsiveView>

              <ResponsiveView style={styles.ordersList}>
                {availableOrders.slice(0, 3).map((order) => (
                  <TouchableOpacity
                    key={order.id}
                    style={[styles.orderCard, { backgroundColor: colors.surface }]}
                    onPress={() => handleAcceptOrder(order.id)}
                  >
                    <ResponsiveView style={styles.orderHeader}>
                      <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                        {order.order_number || `#${order.id.slice(-6).toUpperCase()}`}
                      </ResponsiveText>
                      <ResponsiveView style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
                        <ResponsiveText size="xs" color={colors.primary} weight="medium">
                          AVAILABLE
                        </ResponsiveText>
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
                ))}
              </ResponsiveView>
            </ResponsiveView>
          )}

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
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Layout.shadows.sm,
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
  emptyState: {
    padding: ResponsiveSpacing.xl,
    borderRadius: ResponsiveBorderRadius.lg,
    alignItems: 'center',
    ...Layout.shadows.sm,
  },
});
