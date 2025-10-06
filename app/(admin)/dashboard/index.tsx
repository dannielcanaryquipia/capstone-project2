import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
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
import Responsive from '../../../constants/Responsive';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAdminOrders, useAdminStats, useAuth } from '../../../hooks';
import global from '../../../styles/global';

export default function AdminDashboard() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  
  // Use hooks for data fetching
  const { stats, isLoading: statsLoading, error: statsError, refresh: refreshStats } = useAdminStats();
  const { orders: recentOrders, isLoading: ordersLoading, error: ordersError, refresh: refreshOrders } = useAdminOrders({ 
    status: ['pending', 'preparing', 'out_for_delivery'] 
  });

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
      id: 'inventory',
      title: 'Products',
      description: 'Manage products',
      icon: 'inventory',
      color: colors.accent,
      onPress: () => router.push('/(admin)/products' as any)
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'App settings',
      icon: 'settings',
      color: colors.primary,
      onPress: () => router.push('/(customer)/profile/settings' as any)
    }
  ];

  if (loading) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <ResponsiveView style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="md" color={colors.textSecondary}>
              {Strings.loading}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveView padding="lg">
          {/* Welcome Header */}
          <ResponsiveView style={[styles.welcomeHeader, { backgroundColor: colors.surface }]}>
            <ResponsiveView style={styles.welcomeText}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Welcome back,
              </ResponsiveText>
              <ResponsiveText size="xl" weight="bold" color={colors.text}>
                {user?.user_metadata?.full_name || 'KitchenOneAdmin'}
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView style={styles.headerActions}>
              <Button
                title=""
                onPress={() => router.push('/(admin)/profile' as any)}
                variant="text"
                icon={<MaterialIcons name="person" size={24} color={colors.primary} />}
                style={styles.profileButton}
              />
              <Button
                title=""
                onPress={() => router.push('/(customer)/profile/settings' as any)}
                variant="text"
                icon={<MaterialIcons name="settings" size={24} color={colors.textSecondary} />}
                style={styles.profileButton}
              />
            </ResponsiveView>
          </ResponsiveView>

          {/* Key Metrics Cards */}
          <ResponsiveView style={styles.metricsContainer}>
            <ResponsiveView style={[styles.metricCard, { 
              backgroundColor: colors.surface,
              ...Layout.shadows.sm
            }]}>
              <ResponsiveView style={styles.metricHeader}>
                <ResponsiveView style={[styles.metricIcon, { backgroundColor: colors.primary + '20' }]}>
                  <MaterialIcons name="receipt" size={Responsive.responsiveValue(20, 22, 24, 28)} color={colors.primary} />
                </ResponsiveView>
                <ResponsiveText size="sm" color={colors.textSecondary} weight="medium">
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

            <ResponsiveView style={[styles.metricCard, { 
              backgroundColor: colors.surface,
              ...Layout.shadows.sm
            }]}>
              <ResponsiveView style={styles.metricHeader}>
                <ResponsiveView style={[styles.metricIcon, { backgroundColor: colors.secondary + '20' }]}>
                  <MaterialIcons name="attach-money" size={Responsive.responsiveValue(20, 22, 24, 28)} color={colors.secondary} />
                </ResponsiveView>
                <ResponsiveText size="sm" color={colors.textSecondary} weight="medium">
                  Revenue
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveText size="xxl" weight="bold" color={colors.text}>
                ₱{(stats?.total_revenue || 0).toFixed(2)}
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
                style={[styles.managementCard, { 
                  backgroundColor: colors.surface,
                  ...Layout.shadows.sm
                }]}
                onPress={section.onPress}
                activeOpacity={0.7}
              >
                <ResponsiveView style={[styles.managementIcon, { backgroundColor: section.color + '20' }]}>
                  <MaterialIcons 
                    name={section.icon as any} 
                    size={Responsive.responsiveValue(24, 26, 28, 32)} 
                    color={section.color} 
                  />
                </ResponsiveView>
                <ResponsiveView marginTop="sm">
                  <ResponsiveText size="md" weight="semiBold" color={colors.text}>
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
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Recent Orders
              </ResponsiveText>
              <Button
                title="View All"
                onPress={() => router.push('/(admin)/orders' as any)}
                variant="text"
                size="small"
              />
            </ResponsiveView>

            {recentOrders.length > 0 ? (
              <ResponsiveView style={styles.ordersList}>
                {recentOrders.slice(0, 3).map((order) => (
                  <TouchableOpacity
                    key={order.id}
                    style={[styles.orderCard, { 
                      backgroundColor: colors.surface,
                      ...Layout.shadows.sm
                    }]}
                    onPress={() => router.push(`/(admin)/orders/${order.id}` as any)}
                    activeOpacity={0.7}
                  >
                    <ResponsiveView style={styles.orderHeader}>
                      <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                        {order.order_number}
                      </ResponsiveText>
                      <ResponsiveView style={[styles.orderStatus, { 
                        backgroundColor: getStatusColor(order.status) + '20' 
                      }]}>
                        <MaterialIcons 
                          name={getStatusIcon(order.status)} 
                          size={16} 
                          color={getStatusColor(order.status)} 
                        />
                        <ResponsiveText 
                          size="xs" 
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
              <ResponsiveView style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                <ResponsiveView style={[styles.emptyIcon, { backgroundColor: colors.surfaceVariant }]}>
                  <MaterialIcons name="receipt-long" size={Responsive.responsiveValue(48, 56, 64, 72)} color={colors.primary} />
                </ResponsiveView>
                <ResponsiveView marginTop="md">
                  <ResponsiveText size="lg" weight="semiBold" color={colors.text} align="center">
                    No recent orders
                  </ResponsiveText>
                </ResponsiveView>
                <ResponsiveView marginTop="sm">
                  <ResponsiveText size="md" color={colors.textSecondary} align="center">
                    Orders will appear here once customers start placing them
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
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Responsive.ResponsiveSpacing.lg,
    padding: Responsive.ResponsiveSpacing.md,
    borderRadius: Responsive.ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  welcomeText: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Responsive.ResponsiveSpacing.sm,
  },
  profileButton: {
    padding: Responsive.ResponsiveSpacing.sm,
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: Responsive.ResponsiveSpacing.md,
    marginBottom: Responsive.ResponsiveSpacing.lg,
  },
  metricCard: {
    flex: 1,
    padding: Responsive.ResponsiveSpacing.lg,
    borderRadius: Responsive.ResponsiveBorderRadius.lg,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.ResponsiveSpacing.sm,
    gap: Responsive.ResponsiveSpacing.sm,
  },
  metricIcon: {
    width: Responsive.responsiveValue(40, 44, 48, 56),
    height: Responsive.responsiveValue(40, 44, 48, 56),
    borderRadius: Responsive.responsiveValue(20, 22, 24, 28),
    justifyContent: 'center',
    alignItems: 'center',
  },
  managementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Responsive.ResponsiveSpacing.xl,
  },
  managementCard: {
    width: '48%',
    padding: Responsive.ResponsiveSpacing.lg,
    borderRadius: Responsive.ResponsiveBorderRadius.lg,
    alignItems: 'center',
    marginBottom: Responsive.ResponsiveSpacing.md,
    minHeight: Responsive.responsiveValue(120, 130, 140, 150),
  },
  managementIcon: {
    width: Responsive.responsiveValue(48, 52, 56, 64),
    height: Responsive.responsiveValue(48, 52, 56, 64),
    borderRadius: Responsive.responsiveValue(24, 26, 28, 32),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Responsive.ResponsiveSpacing.sm,
  },
  recentOrdersSection: {
    marginBottom: Responsive.ResponsiveSpacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Responsive.ResponsiveSpacing.md,
  },
  ordersList: {
    gap: Responsive.ResponsiveSpacing.sm,
  },
  orderCard: {
    padding: Responsive.ResponsiveSpacing.md,
    borderRadius: Responsive.ResponsiveBorderRadius.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Responsive.ResponsiveSpacing.sm,
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Responsive.ResponsiveSpacing.sm,
    paddingVertical: Responsive.ResponsiveSpacing.xs,
    borderRadius: Responsive.ResponsiveBorderRadius.sm,
    gap: Responsive.ResponsiveSpacing.xs,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Responsive.ResponsiveSpacing.xxxl,
    paddingHorizontal: Responsive.ResponsiveSpacing.lg,
    borderRadius: Responsive.ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  emptyIcon: {
    width: Responsive.responsiveValue(80, 90, 100, 120),
    height: Responsive.responsiveValue(80, 90, 100, 120),
    borderRadius: Responsive.responsiveValue(40, 45, 50, 60),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Responsive.ResponsiveSpacing.md,
  },
});
