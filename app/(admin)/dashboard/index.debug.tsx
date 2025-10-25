import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DebugPanel } from '../../../components/debug/DebugPanel';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAdminOrders, useAdminStats } from '../../../hooks';
import { useAuth } from '../../../hooks/useAuth';
import { useDebugData } from '../../../hooks/useDebugData';

export default function AdminDashboard() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [showDebug, setShowDebug] = useState(false);
  
  // Use hooks for data fetching
  const { stats, isLoading: statsLoading, error: statsError, refresh: refreshStats } = useAdminStats();
  const { orders: recentOrders, isLoading: ordersLoading, error: ordersError, refresh: refreshOrders } = useAdminOrders({ 
    status: ['pending', 'preparing', 'out_for_delivery'] 
  });

  // Debug hook
  const { debugInfo } = useDebugData();

  const loading = statsLoading || ordersLoading;
  const error = statsError || ordersError;

  const handleRefresh = async () => {
    await Promise.all([refreshStats(), refreshOrders()]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'preparing': return colors.info;
      case 'out_for_delivery': return colors.primary;
      case 'delivered': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'schedule';
      case 'preparing': return 'restaurant';
      case 'out_for_delivery': return 'delivery-dining';
      case 'delivered': return 'check-circle';
      case 'cancelled': return 'cancel';
      default: return 'help';
    }
  };

  // Management sections data
  const managementSections = [
    {
      id: 'orders',
      title: 'Order Management',
      description: 'View and manage orders',
      icon: 'list-alt',
      color: colors.primary,
      onPress: () => router.push('/(admin)/orders' as any)
    },
    {
      id: 'products',
      title: 'Product Management',
      description: 'Manage menu items',
      icon: 'restaurant-menu',
      color: colors.secondary,
      onPress: () => router.push('/(admin)/menu' as any)
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage customers',
      icon: 'people',
      color: colors.accent,
      onPress: () => router.push('/(admin)/users' as any)
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      description: 'View business insights',
      icon: 'analytics',
      color: colors.warning,
      onPress: () => router.push('/(admin)/reports' as any)
    },
    {
      id: 'profile',
      title: 'Admin Profile',
      description: 'Edit your profile',
      icon: 'person',
      color: colors.primary,
      onPress: () => router.push('/(admin)/profile' as any)
    }
  ];

  // Show error state if there are critical errors
  if (error && debugInfo.connectionStatus === 'error') {
    return (
      <SafeAreaView 
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top', 'bottom', 'left', 'right']}
      >
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={64} color={colors.error} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="lg" weight="bold" color={colors.error}>
              Data Loading Error
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView marginTop="sm">
            <ResponsiveText size="md" color={colors.textSecondary} style={{ textAlign: 'center' }}>
              {error}
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView marginTop="lg">
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={handleRefresh}
            >
              <ResponsiveText size="md" weight="semiBold" color={colors.background}>
                Retry
              </ResponsiveText>
            </TouchableOpacity>
          </ResponsiveView>
        </View>
        <DebugPanel isVisible={showDebug} onToggle={() => setShowDebug(!showDebug)} />
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView 
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top', 'bottom', 'left', 'right']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="md" color={colors.textSecondary}>
              {Strings.loading}
            </ResponsiveText>
          </ResponsiveView>
          {debugInfo.connectionStatus === 'testing' && (
            <ResponsiveView marginTop="sm">
              <ResponsiveText size="sm" color={colors.warning}>
                Testing database connection...
              </ResponsiveText>
            </ResponsiveView>
          )}
        </View>
        <DebugPanel isVisible={showDebug} onToggle={() => setShowDebug(!showDebug)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      edges={['top', 'bottom', 'left', 'right']}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Debug Status Banner */}
        {debugInfo.connectionStatus === 'error' && (
          <ResponsiveView style={[styles.debugBanner, { backgroundColor: colors.error + '20' }]}>
            <MaterialIcons name="warning" size={16} color={colors.error} />
            <ResponsiveText size="sm" color={colors.error} weight="semiBold">
              Database connection issues detected. Check debug panel for details.
            </ResponsiveText>
          </ResponsiveView>
        )}

        {/* Welcome Header */}
        <ResponsiveView style={styles.welcomeHeader}>
          <ResponsiveView style={styles.welcomeText}>
            <ResponsiveText size="md" color={colors.textSecondary}>
              Welcome back,
            </ResponsiveText>
            <ResponsiveText size="xl" weight="bold" color={colors.text}>
              {user?.user_metadata?.full_name || 'KitchenOneAdmin'}
            </ResponsiveText>
          </ResponsiveView>
          <TouchableOpacity style={styles.profileButton}>
            <MaterialIcons name="person" size={24} color={colors.primary} />
          </TouchableOpacity>
        </ResponsiveView>

        {/* Key Metrics Cards */}
        <ResponsiveView style={styles.metricsContainer}>
          <ResponsiveView style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <ResponsiveView style={styles.metricHeader}>
              <MaterialIcons name="receipt" size={24} color={colors.primary} />
              <ResponsiveText size="sm" color={colors.textSecondary}>
                Total Orders
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveText size="xxl" weight="bold" color={colors.text}>
              {stats?.total_orders || 0}
            </ResponsiveText>
            <ResponsiveText size="xs" color={colors.textSecondary}>
              {stats?.pending_orders || 0} pending
            </ResponsiveText>
          </ResponsiveView>

          <ResponsiveView style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <ResponsiveView style={styles.metricHeader}>
              <MaterialIcons name="attach-money" size={24} color={colors.secondary} />
              <ResponsiveText size="sm" color={colors.textSecondary}>
                Revenue
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveText size="xxl" weight="bold" color={colors.text}>
              ₱{(stats?.total_income || 0).toFixed(2)}
            </ResponsiveText>
            <ResponsiveText size="xs" color={colors.textSecondary}>
              This month
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>

        {/* Management Grid */}
        <ResponsiveView style={styles.managementGrid}>
          {managementSections.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={[styles.managementCard, { backgroundColor: colors.card }]}
              onPress={section.onPress}
            >
              <MaterialIcons name={section.icon as any} size={32} color={section.color} />
              <ResponsiveView marginTop="sm">
                <ResponsiveText size="md" weight="bold" color={colors.text}>
                  {section.title}
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  {section.description}
                </ResponsiveText>
              </ResponsiveView>
            </TouchableOpacity>
          ))}
        </ResponsiveView>

        {/* Recent Orders */}
        <ResponsiveView style={styles.recentOrdersSection}>
          <ResponsiveView style={styles.sectionHeader}>
            <ResponsiveText size="lg" weight="bold" color={colors.text}>
              Recent Orders
            </ResponsiveText>
          </ResponsiveView>

          {recentOrders.length > 0 ? (
            <ResponsiveView style={styles.ordersList}>
              {recentOrders.slice(0, 3).map((order) => (
                <TouchableOpacity
                  key={order.id}
                  style={[styles.orderCard, { backgroundColor: colors.card }]}
                  onPress={() => router.push(`/(admin)/orders/${order.id}` as any)}
                >
                  <ResponsiveView style={styles.orderHeader}>
                    <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                      {order.order_number}
                    </ResponsiveText>
                    <ResponsiveView style={styles.orderStatus}>
                      <MaterialIcons 
                        name={getStatusIcon(order.status)} 
                        size={16} 
                        color={getStatusColor(order.status)} 
                      />
                      <ResponsiveText 
                        size="sm" 
                        color={getStatusColor(order.status)}
                        weight="semiBold"
                      >
                        {order.status.replace('_', ' ').toUpperCase()}
                      </ResponsiveText>
                    </ResponsiveView>
                  </ResponsiveView>
                  
                  <ResponsiveView style={styles.orderFooter}>
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </ResponsiveText>
                    <ResponsiveText size="md" weight="semiBold" color={colors.primary}>
                      ₱{(order.total_amount || 0).toFixed(2)}
                    </ResponsiveText>
                  </ResponsiveView>
                </TouchableOpacity>
              ))}
            </ResponsiveView>
          ) : (
            <ResponsiveView style={styles.emptyState}>
              <MaterialIcons name="receipt-long" size={48} color={colors.textSecondary} />
              <ResponsiveView marginTop="md">
                <ResponsiveText size="md" color={colors.textSecondary}>
                  No recent orders
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          )}
        </ResponsiveView>
      </ScrollView>

      {/* Debug Panel */}
      <DebugPanel isVisible={showDebug} onToggle={() => setShowDebug(!showDebug)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  debugBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    margin: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    gap: Layout.spacing.sm,
  },
  retryButton: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  welcomeText: {
    flex: 1,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6C547', // colors.primaryLight
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Layout.spacing.lg,
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  metricCard: {
    flex: 1,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    ...Layout.shadows.sm,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
    gap: Layout.spacing.sm,
  },
  managementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Layout.spacing.lg,
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.xl,
  },
  managementCard: {
    width: '48%',
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
    ...Layout.shadows.sm,
    marginBottom: Layout.spacing.md,
  },
  recentOrdersSection: {
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
  sectionHeader: {
    marginBottom: Layout.spacing.md,
  },
  ordersList: {
    gap: Layout.spacing.sm,
  },
  orderCard: {
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    ...Layout.shadows.xs,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },
});
