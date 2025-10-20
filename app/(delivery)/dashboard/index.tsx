import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing } from '../../../constants/Responsive';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { useDeliveryEarnings, useDeliveryOrders } from '../../../hooks/useDeliveryOrders';
import { useRiderProfile } from '../../../hooks/useRiderProfile';
import global from '../../../styles/global';

export default function RiderDashboard() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  // Use hooks for data fetching
  const { activeOrders, deliveredOrders, isLoading: ordersLoading, error: ordersError, refresh: refreshOrders } = useDeliveryOrders();
  const { earnings, isLoading: earningsLoading, error: earningsError } = useDeliveryEarnings();
  const { profile, stats, isLoading: profileLoading, error: profileError } = useRiderProfile();
  
  const loading = ordersLoading || earningsLoading || profileLoading;
  const error = ordersError || earningsError || profileError;

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshOrders()]);
    setRefreshing(false);
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
              onPress={() => router.push('/(delivery)/profile' as any)}
            >
              <MaterialIcons name="person" size={24} color={colors.primary} />
            </TouchableOpacity>
          </ResponsiveView>

          {/* Stats Cards */}
          <ResponsiveView style={styles.statsContainer}>
            <ResponsiveView style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <ResponsiveView style={styles.statHeader}>
                <MaterialIcons name="local-shipping" size={24} color={colors.primary} />
                <ResponsiveText size="sm" color={colors.textSecondary} weight="medium">
                  Delivered Orders
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveText size="xxl" weight="bold" color={colors.text}>
                {stats.completedDeliveries}
              </ResponsiveText>
              <ResponsiveText size="xs" color={colors.textSecondary}>
                {stats.totalDeliveries} total assigned
              </ResponsiveText>
            </ResponsiveView>

            <ResponsiveView style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <ResponsiveView style={styles.statHeader}>
                <MaterialIcons name="pending-actions" size={24} color={colors.warning} />
                <ResponsiveText size="sm" color={colors.textSecondary} weight="medium">
                  Pending Orders
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveText size="xxl" weight="bold" color={colors.text}>
                {stats.pendingDeliveries}
              </ResponsiveText>
              <ResponsiveText size="xs" color={colors.textSecondary}>
                Ready for pickup
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          {/* Quick Actions */}
          <ResponsiveView style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.surface }]}
              onPress={() => router.push('/(delivery)/orders' as any)}
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
          </ResponsiveView>

          {/* Recent Orders */}
          <ResponsiveView style={styles.section}>
            <ResponsiveView style={styles.sectionHeader}>
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Recent Orders
              </ResponsiveText>
              <Button
                title="View All"
                onPress={() => router.push('/(delivery)/orders' as any)}
                variant="text"
                size="small"
              />
            </ResponsiveView>

            {activeOrders.length > 0 ? (
              <ResponsiveView style={styles.ordersList}>
                {activeOrders.slice(0, 3).map((order) => (
                  <TouchableOpacity
                    key={order.id}
                    style={[styles.orderCard, { backgroundColor: colors.surface }]}
                    onPress={() => router.push(`/(delivery)/order/${order.id}` as any)}
                  >
                    <ResponsiveView style={styles.orderHeader}>
                      <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                        {order.order_number || `#${order.id.slice(-6).toUpperCase()}`}
                      </ResponsiveText>
                      <ResponsiveView style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
                        <ResponsiveText size="xs" color={colors.primary} weight="medium">
                          {order.status?.toUpperCase()}
                        </ResponsiveText>
                      </ResponsiveView>
                    </ResponsiveView>
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      {order.user?.full_name || 'Customer'}
                    </ResponsiveText>
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      ₱{order.total_amount?.toFixed(2) || '0.00'}
                    </ResponsiveText>
                  </TouchableOpacity>
                ))}
              </ResponsiveView>
            ) : (
              <ResponsiveView style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                <MaterialIcons name="assignment" size={48} color={colors.textSecondary} />
                <ResponsiveView marginTop="md">
                  <ResponsiveText size="md" color={colors.textSecondary} align="center">
                    No active orders
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            )}
          </ResponsiveView>

          {/* Recent Delivered */}
          <ResponsiveView style={styles.section}>
            <ResponsiveView style={styles.sectionHeader}>
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Recent Delivered
              </ResponsiveText>
            </ResponsiveView>

            {deliveredOrders.length > 0 ? (
              <ResponsiveView style={styles.ordersList}>
                {deliveredOrders.slice(0, 3).map((order) => (
                  <TouchableOpacity
                    key={order.id}
                    style={[styles.orderCard, { backgroundColor: colors.surface }]}
                    onPress={() => router.push(`/(delivery)/order/${order.id}` as any)}
                  >
                    <ResponsiveView style={styles.orderHeader}>
                      <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                        {order.order_number || `#${order.id.slice(-6).toUpperCase()}`}
                      </ResponsiveText>
                      <ResponsiveView style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                        <MaterialIcons name="check-circle" size={16} color={colors.success} />
                        <ResponsiveView marginLeft="xs">
                          <ResponsiveText size="xs" color={colors.success} weight="medium">
                            DELIVERED
                          </ResponsiveText>
                        </ResponsiveView>
                      </ResponsiveView>
                    </ResponsiveView>
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      {order.user?.full_name || 'Customer'}
                    </ResponsiveText>
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      ₱{order.total_amount?.toFixed(2) || '0.00'}
                    </ResponsiveText>
                  </TouchableOpacity>
                ))}
              </ResponsiveView>
            ) : (
              <ResponsiveView style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                <MaterialIcons name="local-shipping" size={48} color={colors.textSecondary} />
                <ResponsiveView marginTop="md">
                  <ResponsiveText size="md" color={colors.textSecondary} align="center">
                    No delivered orders yet
                  </ResponsiveText>
                </ResponsiveView>
                <ResponsiveView marginTop="sm">
                  <ResponsiveText size="sm" color={colors.textSecondary} align="center">
                    Your delivered orders will appear here
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            )}
          </ResponsiveView>
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
    marginBottom: ResponsiveSpacing.xl,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Layout.shadows.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: ResponsiveSpacing.md,
    marginBottom: ResponsiveSpacing.xl,
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
    marginBottom: ResponsiveSpacing.xl,
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
    marginBottom: ResponsiveSpacing.xl,
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