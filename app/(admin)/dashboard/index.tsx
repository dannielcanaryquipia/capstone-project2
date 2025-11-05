import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet
} from 'react-native';
import { AdminCard, AdminLayout, AdminMetricCard, AdminSection } from '../../../components/admin';
import Button from '../../../components/ui/Button';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import Responsive, { responsiveValue } from '../../../constants/Responsive';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAdminOrders, useAdminStats, useAuth } from '../../../hooks';

export default function AdminDashboard() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  
  // Use hooks for data fetching
  const { stats, isLoading: statsLoading, error: statsError, refresh: refreshStats } = useAdminStats();
  const { orders: recentOrders, isLoading: ordersLoading, error: ordersError, refresh: refreshOrders } = useAdminOrders({ 
    status: ['pending', 'preparing', 'ready_for_pickup', 'out_for_delivery'] 
  });

  const loading = statsLoading || ordersLoading;
  const error = statsError || ordersError;

  // Debug: Log stats to see what we're getting
  React.useEffect(() => {
    if (stats) {
      console.log('Admin dashboard stats received:', stats);
    }
  }, [stats]);

  const handleRefresh = async () => {
    await Promise.all([refreshStats(), refreshOrders()]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'preparing': return colors.info;
      case 'ready_for_pickup': return colors.secondary;
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
      case 'ready_for_pickup': return 'local-shipping';
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
      id: 'products',
      title: 'Products',
      description: 'Manage products',
      icon: 'inventory',
      color: colors.accent,
      onPress: () => router.push('/(admin)/products' as any)
    }
  ];

  if (loading) {
    return (
      <AdminLayout
        title="Dashboard"
        subtitle="Loading..."
        backgroundColor={colors.background}
      >
        <ResponsiveView style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="md" color={colors.textSecondary}>
              {Strings.loading}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Dashboard"
      subtitle={`Welcome back, ${user?.user_metadata?.full_name || 'KitchenOneAdmin'}`}
      headerActions={
        <>
          <Button
            title=""
            onPress={handleRefresh}
            variant="text"
            icon={<MaterialIcons name="refresh" size={24} color={colors.textSecondary} />}
            style={styles.profileButton}
          />
          <Button
            title=""
            onPress={() => router.push('/(admin)/profile' as any)}
            variant="text"
            icon={<MaterialIcons name="person" size={24} color={colors.primary} />}
            style={styles.profileButton}
          />
        </>
      }
      backgroundColor={colors.background}
    >
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >

          {/* Key Metrics Cards */}
          <ResponsiveView style={styles.metricsContainer}>
            <AdminMetricCard
              title="Total Orders"
              value={stats?.total_orders || 0}
              subtitle={`${stats?.pending_orders || 0} pending`}
              icon="receipt"
              iconColor={colors.primary}
              variant="outlined"
              size="medium"
            />
            <AdminMetricCard
              title="Income"
              value={`₱${(stats?.total_income || 0).toFixed(2)}`}
              subtitle={`Delivered orders`}
              icon="attach-money"
              iconColor={colors.secondary}
              variant="outlined"
              size="medium"
            />
          </ResponsiveView>

        {/* Cancelled Orders Income */}
        {(stats?.cancelled_income || 0) > 0 && (
          <AdminSection
            title="Cancelled Orders Income"
            subtitle="Revenue lost from cancelled orders"
            variant="card"
          >
            <ResponsiveView style={styles.cancelledIncomeContainer}>
              <ResponsiveView style={[
                styles.cancelledIncomeItem,
                { 
                  backgroundColor: colors.error + '10',
                  borderColor: colors.error + '30'
                }
              ]}>
                <ResponsiveView style={styles.cancelledIncomeHeader}>
                  <MaterialIcons 
                    name="cancel" 
                    size={responsiveValue(20, 22, 24, 28)} 
                    color={colors.error} 
                  />
                  <ResponsiveText size="md" color={colors.error} weight="semiBold">
                    Cancelled Orders Income
                  </ResponsiveText>
                </ResponsiveView>
                <ResponsiveText size="xl" weight="bold" color={colors.error}>
                  ₱{(stats?.cancelled_income || 0).toFixed(2)}
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  {stats?.cancelled_orders || 0} cancelled orders
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          </AdminSection>
        )}

        {/* Order Status Summary */}
        <AdminSection
          title="Order Status"
          headerAction={
            <Button
              title="Manage Orders"
              onPress={() => router.push('/(admin)/orders' as any)}
              variant="text"
              size="small"
            />
          }
          variant="card"
        >
          <ResponsiveView style={styles.statusSummaryGrid}>
            {[
              { key: 'pending', label: 'Pending', value: stats?.pending_orders || 0 },
              { key: 'preparing', label: 'Preparing', value: stats?.preparing_orders || 0 },
              { key: 'ready_for_pickup', label: 'Ready for Pickup', value: stats?.ready_for_pickup_orders || 0 },
              { key: 'out_for_delivery', label: 'Out for Delivery', value: stats?.out_for_delivery || 0 },
              { key: 'delivered', label: 'Delivered', value: stats?.delivered_orders || 0 },
              { key: 'cancelled', label: 'Cancelled', value: stats?.cancelled_orders || 0 },
            ].map((s) => (
              <ResponsiveView
                key={s.key}
                style={[
                  styles.statusSummaryItem,
                  { backgroundColor: (getStatusColor(s.key) + '20') as any },
                ]}
              >
                <ResponsiveView style={styles.statusSummaryHeader}>
                  <ResponsiveView style={[styles.statusSummaryIcon, { backgroundColor: (getStatusColor(s.key) + '1A') as any }] }>
                    <MaterialIcons name={getStatusIcon(s.key)} size={16} color={getStatusColor(s.key)} />
                  </ResponsiveView>
                  <ResponsiveText size="sm" color={getStatusColor(s.key)} weight="semiBold">
                    {s.label}
                  </ResponsiveText>
                </ResponsiveView>
                <ResponsiveText size="xl" weight="bold" color={colors.text}>
                  {s.value}
                </ResponsiveText>
              </ResponsiveView>
            ))}
          </ResponsiveView>
        </AdminSection>

          {/* Management Grid */}
          <ResponsiveView style={styles.managementGrid}>
            {managementSections.map((section) => (
              <AdminCard
                key={section.id}
                title={section.title}
                subtitle={section.description}
                icon={
                  <MaterialIcons 
                    name={section.icon as any} 
                    size={Responsive.responsiveValue(24, 26, 28, 32)} 
                    color={section.color} 
                  />
                }
                onPress={section.onPress}
                variant="elevated"
                style={styles.managementCard}
              >
                <ResponsiveView>{null}</ResponsiveView>
              </AdminCard>
            ))}
          </ResponsiveView>

          {/* Recent Orders */}
          <AdminSection
            title="Recent Orders"
            headerAction={
              <Button
                title="View All"
                onPress={() => router.push('/(admin)/orders' as any)}
                variant="text"
                size="small"
              />
            }
          >
            {recentOrders.length > 0 ? (
              <ResponsiveView style={styles.ordersList}>
                {recentOrders.slice(0, 3).map((order) => (
                  <AdminCard
                    key={order.id}
                    onPress={() => router.push(`/(admin)/orders/${order.id}` as any)}
                    variant="outlined"
                    style={styles.orderCard}
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
                  </AdminCard>
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
          </AdminSection>
        </ScrollView>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    padding: Responsive.ResponsiveSpacing.sm,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: Responsive.ResponsiveSpacing.lg,
    marginBottom: Responsive.ResponsiveSpacing.xl,
    paddingHorizontal: Responsive.ResponsiveSpacing.lg,
  },
  managementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Responsive.ResponsiveSpacing.xl,
  },
  managementCard: {
    width: '48%',
    alignItems: 'center',
    minHeight: Responsive.responsiveValue(120, 130, 140, 150),
  },
  statusSummaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Responsive.ResponsiveSpacing.sm,
  },
  statusSummaryItem: {
    width: '48%',
    borderRadius: Responsive.ResponsiveBorderRadius.md,
    padding: Responsive.ResponsiveSpacing.md,
  },
  statusSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Responsive.ResponsiveSpacing.xs,
    marginBottom: Responsive.ResponsiveSpacing.xs,
  },
  statusSummaryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ordersList: {
    gap: Responsive.ResponsiveSpacing.sm,
  },
  orderCard: {
    marginBottom: Responsive.ResponsiveSpacing.sm,
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
  cancelledIncomeContainer: {
    alignItems: 'center',
  },
  cancelledIncomeItem: {
    alignItems: 'center',
    padding: Responsive.ResponsiveSpacing.lg,
    borderRadius: Responsive.ResponsiveBorderRadius.lg,
    borderWidth: 1,
  },
  cancelledIncomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.ResponsiveSpacing.sm,
    gap: Responsive.ResponsiveSpacing.sm,
  },
});
